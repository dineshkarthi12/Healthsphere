#!/usr/bin/env python3
"""
HealthSphere image pipeline.

Reads the original uploads in assets/source/ and writes optimized, responsive
WebP derivatives to public/images/. Originals are never modified.

  python3 scripts/process_images.py

Steps
  1. Some uploads have a "transparency" checkerboard baked into the RGB pixels.
     Those are cleaned into real alpha (flood fill from the border over
     checkerboard-textured pixels) so they sit correctly on light surfaces.
  2. Images with alpha that are used full-bleed are flattened onto a soft
     clinical background so they read like the other specialty photography.
  3. Each image is exported at 640 / 1024 / 1536 px wide.
  4. Doctor portraits also get square, head-and-shoulders avatar crops.

Requires: Pillow (with WebP), numpy, scipy.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "source"
OUT = ROOT / "public" / "images"
WIDTHS = (640, 1024, 1536)
QUALITY = 78

# Uploads whose background is a baked-in grey/white checkerboard.
CHECKERBOARD = {
    "eye-care-specialty",
    "doctor-male-portrait",
    "family-portrait",
    "caring-hands",
    "doctor-patient-bedside",
}

# Used as full-bleed photography -> flatten alpha onto a soft clinical tone.
FLATTEN = {
    "eye-care-specialty": ((236, 245, 253), (250, 252, 255)),
    "heart-care-specialty": ((244, 248, 252), (250, 252, 255)),
}

# Portraits only ever shown as avatars — skip the full-size exports.
AVATAR_ONLY = {"doctor-female-portrait", "doctor-male-portrait"}

# Portraits that get square avatar crops (alpha kept).
AVATARS = {"doctor-profile-female", "doctor-profile-male", "doctor-female-portrait", "doctor-male-portrait"}


def remove_checkerboard(img: Image.Image, flatten_target: bool = False) -> Image.Image:
    rgb = np.asarray(img.convert("RGB")).astype(np.int16)
    v = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    neutral = sat <= 10
    white = neutral & (v >= 245)
    grey = neutral & (v >= 190) & (v <= 222)

    # A pixel belongs to the checkerboard when its neighbourhood holds both tones.
    k = 31
    white_share = ndimage.uniform_filter(white.astype(np.float32), size=k)
    grey_share = ndimage.uniform_filter(grey.astype(np.float32), size=k)
    textured = (white_share > 0.18) & (grey_share > 0.18) & (white_share + grey_share > 0.8)
    candidate = (white | grey) & textured

    # Keep regions connected to the border, plus large enclosed checkerboard gaps.
    labels, n = ndimage.label(candidate)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    sizes = ndimage.sum(np.ones_like(labels), labels, index=np.arange(n + 1))
    keep = np.zeros(n + 1, bool)
    keep[border] = True
    keep[sizes > 4000] = True
    keep[0] = False
    background = keep[labels]

    # Second, finer pass for small enclosed gaps (e.g. between equipment parts),
    # where the wide window above is diluted by the surrounding subject.
    k2 = 15
    w2 = ndimage.uniform_filter(white.astype(np.float32), size=k2)
    g2 = ndimage.uniform_filter(grey.astype(np.float32), size=k2)
    fine = (white | grey) & (w2 > 0.25) & (g2 > 0.25) & (w2 + g2 > 0.85)
    fl, fn = ndimage.label(fine)
    fsizes = ndimage.sum(np.ones_like(fl), fl, index=np.arange(fn + 1))
    background |= (fsizes > 350)[fl] & (fl > 0)

    # Grow into the fringe the texture window misses, but only over exact checker tones.
    exact = (sat <= 7) & ((v >= 246) | ((v >= 188) & (v <= 224)))
    background = ndimage.binary_dilation(background, iterations=26, mask=exact | background)

    # Residual squares trapped between hair strands etc.: within a band around the
    # background, neutral grey pixels are almost certainly checkerboard (hair is far
    # darker, coats far brighter). For images that get flattened onto a near-white
    # backdrop, leftover white squares can go too — the change is invisible.
    band = ndimage.binary_dilation(background, iterations=40) & ~background
    resid = band & (sat <= 8) & (v >= 186) & (v <= 228)
    if flatten_target:
        resid |= band & (sat <= 6) & (v >= 244)
    background |= ndimage.binary_dilation(resid, iterations=1) & band

    # Drop speckles: small foreground islands inside the background.
    fg_labels, fg_n = ndimage.label(~background)
    fg_sizes = ndimage.sum(np.ones_like(fg_labels), fg_labels, index=np.arange(fg_n + 1))
    background |= (fg_sizes < 2500)[fg_labels] & (fg_labels > 0)

    # Close pinholes and swallow the 1-2px anti-aliased fringe.
    # Pad with background so the operations don't erode along the image edges.
    padded = np.pad(background, 4, constant_values=True)
    padded = ndimage.binary_closing(padded, iterations=2)
    padded = ndimage.binary_dilation(padded, iterations=1)
    background = padded[4:-4, 4:-4] | (background & exact)

    alpha = Image.fromarray(np.where(background, 0, 255).astype(np.uint8))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
    out = img.convert("RGB")
    out.putalpha(alpha)
    return out


def flatten(img: Image.Image, top, bottom) -> Image.Image:
    w, h = img.size
    t = np.linspace(0, 1, h)[:, None, None]
    grad = (np.array(top)[None, None, :] * (1 - t) + np.array(bottom)[None, None, :] * t)
    bg = Image.fromarray(np.repeat(grad, w, axis=1).astype(np.uint8), "RGB")
    bg.paste(img, (0, 0), img)
    return bg


def avatar(img: Image.Image) -> Image.Image:
    """Square head-and-shoulders crop based on the subject's alpha bounds."""
    a = np.asarray(img.getchannel("A"))
    ys, xs = np.where(a > 128)
    top = ys.min()
    # Horizontal centre of the head: subject columns in the top 18% of the figure.
    head_rows = a[top : top + int((ys.max() - top) * 0.18)] > 128
    cx = int(np.where(head_rows.any(axis=0))[0].mean())
    side = int((ys.max() - top) * 0.62)
    left = max(0, min(img.width - side, cx - side // 2))
    upper = max(0, top - int(side * 0.06))
    return img.crop((left, upper, left + side, upper + side))


def save(img: Image.Image, name: str, widths=WIDTHS):
    for w in widths:
        h = round(img.height * w / img.width)
        im = img.resize((w, h), Image.LANCZOS) if w != img.width else img
        im.save(OUT / f"{name}-{w}.webp", "WEBP", quality=QUALITY, method=6)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    for path in sorted(SRC.glob("*.png")):
        name = path.stem
        if only and name not in only:
            continue
        img = Image.open(path)
        img = img.convert("RGBA") if img.mode in ("RGBA", "LA", "P") else img.convert("RGB")
        if name in CHECKERBOARD:
            img = remove_checkerboard(img, flatten_target=name in FLATTEN)
        if name in FLATTEN and img.mode == "RGBA":
            img = flatten(img, *FLATTEN[name])
        if name not in AVATAR_ONLY:
            save(img, name)
        if name in AVATARS:
            save(avatar(img), f"{name}-avatar", widths=(160, 320))
        print("✓", name, img.mode)


if __name__ == "__main__":
    main()
