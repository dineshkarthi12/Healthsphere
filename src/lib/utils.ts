import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** tailwind-merge that knows our custom type scale (text-body etc. are font sizes, not colours). */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["caption", "small", "body", "lead", "h3", "h2", "h1", "display"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Demo "today" so mock data stays coherent regardless of the real date. */
export const TODAY = new Date("2026-10-08T09:00:00+05:30");

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatINR = (n: number) => inr.format(n);

const num = new Intl.NumberFormat("en-IN");
export const formatNumber = (n: number) => num.format(n);

export const compact = (n: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

/** All clinical times are shown in the hospitals' timezone (IST). */
export const TZ = "Asia/Kolkata";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(iso).toLocaleDateString("en-IN", { timeZone: TZ, ...opts });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
}

/** YYYY-MM-DD in IST */
export function istDay(d: Date | string) {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso, { weekday: "short", day: "numeric", month: "short" })} · ${formatTime(iso)}`;
}

export function relativeDay(iso: string) {
  const diff = Math.round((Date.parse(istDay(iso)) - Date.parse(istDay(TODAY))) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  return formatDate(iso, { day: "numeric", month: "short" });
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** srcset helper for images produced by scripts/process_images.py */
export function imageSrc(name: string, width: 640 | 1024 | 1536 = 1024) {
  return `/images/${name}-${width}.webp`;
}
export function imageSrcSet(name: string) {
  return `/images/${name}-640.webp 640w, /images/${name}-1024.webp 1024w, /images/${name}-1536.webp 1536w`;
}
export function avatarSrc(name: string, size: 160 | 320 = 160) {
  return `/images/${name}-avatar-${size}.webp`;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function pluralize(n: number, word: string, plural = `${word}s`) {
  return `${n} ${n === 1 ? word : plural}`;
}
