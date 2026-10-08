import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * HealthSphere mark: a heart formed around a human figure (open, embracing arms),
 * held inside an orbit ring — the "sphere" of continuous care.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9 shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="8" y1="8" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A74EC" />
          <stop offset="1" stopColor="#1A9BC4" />
        </linearGradient>
      </defs>
      <ellipse
        cx="20"
        cy="21"
        rx="17.5"
        ry="8"
        transform="rotate(-24 20 21)"
        fill="none"
        stroke="#7FD3C4"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="70 14"
      />
      <path
        d="M20 34s-12-7.1-12-15.4C8 13.9 11.2 11 14.8 11c2.3 0 4.1 1.1 5.2 2.9C21.1 12.1 22.9 11 25.2 11 28.8 11 32 13.9 32 18.6 32 26.9 20 34 20 34z"
        fill={`url(#${id}-g)`}
      />
      <circle cx="20" cy="6.6" r="3" fill="#2A74EC" />
      <path d="M13.8 19.6c2 1.9 4.1 2.8 6.2 2.8s4.2-.9 6.2-2.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 22.6v5.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {!compact && (
        <span className="text-h3 font-extrabold tracking-[-0.03em] text-ink-900">
          Health<span className="text-primary-600">Sphere</span>
        </span>
      )}
    </span>
  );
}
