import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

/**
 * Specialty icons Lucide does not ship, drawn on the same 24px grid with
 * 2px round strokes so they sit seamlessly next to Lucide icons.
 */
function make(displayName: string, children: React.ReactNode) {
  const Icon = forwardRef<SVGSVGElement, LucideProps>(
    ({ size = 24, strokeWidth = 2, color = "currentColor", absoluteStrokeWidth, className, ...rest }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        {children}
      </svg>
    ),
  );
  Icon.displayName = displayName;
  return Icon;
}

export const Lungs = make(
  "Lungs",
  <>
    <path d="M12 3v8" />
    <path d="M12 11c-.8 1.3-1.8 2-3 2.2" />
    <path d="M12 11c.8 1.3 1.8 2 3 2.2" />
    <path d="M8.6 7.2C6 8 4.2 11.4 3.7 15c-.4 2.8.5 5 2.6 5 2.4 0 3.4-1.6 3.4-4.2V9.2c0-1.3-.4-2.1-1.1-2z" />
    <path d="M15.4 7.2c2.6.8 4.4 4.2 4.9 7.8.4 2.8-.5 5-2.6 5-2.4 0-3.4-1.6-3.4-4.2V9.2c0-1.3.4-2.1 1.1-2z" />
  </>,
);

export const Kidney = make(
  "Kidney",
  <>
    <path d="M9.5 3.5C6 3.5 4 7 4 11.2S5.6 20 9.4 20c2.3 0 3-1.8 2.3-3.4-.7-1.5-.7-3.3.4-4.3 1.1-1 1.4-2.6.9-4.1-.7-2.3-1.6-4.7-3.5-4.7z" />
    <path d="M12.6 11.8h1.9c1.6 0 2.8 1.2 2.8 2.8V21" />
    <path d="M17.3 6.5c1.6.6 2.7 2.4 2.7 4.5" />
  </>,
);

export const Tooth = make(
  "Tooth",
  <path d="M7.2 3C5 3 3.6 4.8 3.6 7.2c0 2 .8 3.4 1.3 5 .6 2 .7 4 1.2 6.2.3 1.4.9 2.6 1.9 2.6 1.3 0 1.6-1.6 1.9-3.3.3-1.7.7-3.2 2.1-3.2s1.8 1.5 2.1 3.2c.3 1.7.6 3.3 1.9 3.3 1 0 1.6-1.2 1.9-2.6.5-2.2.6-4.2 1.2-6.2.5-1.6 1.3-3 1.3-5C20.4 4.8 19 3 16.8 3c-1.8 0-2.8 1-4.8 1S9 3 7.2 3z" />,
);

export const Venus = make(
  "Venus",
  <>
    <circle cx="12" cy="9" r="5.5" />
    <path d="M12 14.5V22" />
    <path d="M8.5 18.5h7" />
  </>,
);

export const SkinLayers = make(
  "SkinLayers",
  <>
    <path d="M3 9c2 1.2 4 1.2 6 0s4-1.2 6 0 4 1.2 6 0" />
    <path d="M3 14c2 1.2 4 1.2 6 0s4-1.2 6 0 4 1.2 6 0" />
    <path d="M3 19c2 1.2 4 1.2 6 0s4-1.2 6 0 4 1.2 6 0" />
    <circle cx="8" cy="4.5" r="1" />
    <circle cx="15" cy="4" r="1" />
  </>,
);
