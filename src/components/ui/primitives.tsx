import { forwardRef, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock,
  Info,
  RefreshCw,
  Search,
  Star,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { avatarSrc, cn, imageSrc, imageSrcSet } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import type { ImageAsset } from "@/types";
import { Button } from "./Button";

/* ------------------------------------------------------------------ Card */
export function Card({ className, as: As = "div", ...props }: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return <As className={cn("card", className)} {...props} />;
}

/* ----------------------------------------------------------- Section head */
export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  action,
  id,
  className,
  as: As = "h2",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  action?: { label: string; to: string };
  id?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4 sm:mb-6", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="t-eyebrow mb-2 text-primary-700">{eyebrow}</p>}
        <As id={id} className={As === "h3" ? "t-h3" : "t-h2"}>
          {title}
        </As>
        {subtitle && <p className="mt-1.5 max-w-2xl text-small text-ink-500 sm:text-body">{subtitle}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md px-1 text-small font-semibold text-primary-700 hover:text-primary-800"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Badges */
type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info" | "accent";
const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-subtle text-ink-700",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  info: "bg-info-50 text-info-700",
  accent: "bg-accent-tint text-accent",
};

export function Badge({ tone = "neutral", className, children, icon: Icon }: { tone?: BadgeTone; className?: string; children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-semibold", badgeTones[tone], className)}>
      {Icon && <Icon className="size-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Status badge — icon + label, never colour alone. */
export type Status = "completed" | "current" | "upcoming" | "scheduled" | "normal" | "attention" | "pending" | "cancelled" | "critical" | "stable" | "new" | "follow-up" | "good";
const statusConfig: Record<Status, { tone: BadgeTone; icon: LucideIcon; label: string }> = {
  completed: { tone: "success", icon: CheckCircle2, label: "Completed" },
  current: { tone: "primary", icon: CircleDashed, label: "In progress" },
  upcoming: { tone: "neutral", icon: Clock, label: "Upcoming" },
  scheduled: { tone: "info", icon: Clock, label: "Scheduled" },
  normal: { tone: "success", icon: CheckCircle2, label: "Normal" },
  good: { tone: "success", icon: CheckCircle2, label: "Good" },
  attention: { tone: "warning", icon: AlertTriangle, label: "Needs attention" },
  pending: { tone: "info", icon: Clock, label: "Awaiting review" },
  cancelled: { tone: "neutral", icon: XCircle, label: "Cancelled" },
  critical: { tone: "danger", icon: AlertTriangle, label: "Urgent" },
  stable: { tone: "success", icon: CheckCircle2, label: "Stable" },
  new: { tone: "info", icon: Info, label: "New" },
  "follow-up": { tone: "warning", icon: Clock, label: "Follow-up" },
};
export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const c = statusConfig[status];
  return (
    <Badge tone={c.tone} icon={c.icon} className={className}>
      {label ?? c.label}
    </Badge>
  );
}

/* ------------------------------------------------------------ Icon tile */
export function IconTile({
  icon,
  size = "md",
  className,
  style,
}: {
  icon: string | LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = typeof icon === "string" ? getIcon(icon) : icon;
  const s = { sm: "size-9 rounded-md [&_svg]:size-4.5", md: "size-11 rounded-lg [&_svg]:size-5", lg: "size-14 rounded-xl [&_svg]:size-6.5", xl: "size-16 rounded-2xl [&_svg]:size-7.5" }[size];
  return (
    <span className={cn("accent-icon inline-flex shrink-0 items-center justify-center", s, className)} style={style} aria-hidden="true">
      <Icon strokeWidth={2} />
    </span>
  );
}

/* --------------------------------------------------------------- Avatar */
export function Avatar({
  initials,
  photo,
  size = 48,
  className,
  style,
  ring = false,
  label,
}: {
  /** Accessible name when the avatar stands alone; omit when the name is shown next to it. */
  label?: string;
  name: string;
  initials: string;
  photo?: ImageAsset | string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  ring?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = typeof photo === "string" ? photo : photo ? avatarSrc(photo.name, size > 80 ? 320 : 160) : undefined;
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-tint font-bold text-accent",
        ring && "ring-2 ring-white shadow-xs",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.34), ...style }}
    >
      {src && !failed ? (
        <img src={src} alt={label ?? ""} width={size} height={size} loading="lazy" decoding="async" className="size-full bg-gradient-to-b from-primary-50 to-primary-100 object-cover object-top" onError={() => setFailed(true)} />
      ) : (
        <span {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>{initials}</span>
      )}
    </span>
  );
}

/* ---------------------------------------------------------------- Image */
export function SmartImage({
  image,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
  priority = false,
  width = 1536,
  height = 1024,
}: {
  image: ImageAsset;
  sizes?: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={imageSrc(image.name, 1024)}
      srcSet={imageSrcSet(image.name)}
      sizes={sizes}
      alt={image.alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // @ts-expect-error fetchpriority is valid HTML but not yet typed in React 18
      fetchpriority={priority ? "high" : undefined}
      onLoad={() => setLoaded(true)}
      className={cn("object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0", className)}
      style={{ objectPosition: image.focus }}
    />
  );
}

/* --------------------------------------------------------------- Rating */
export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-small", className)}>
      <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-semibold text-ink-900">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-ink-500">({count.toLocaleString("en-IN")} reviews)</span>}
      <span className="sr-only">out of 5 stars</span>
    </span>
  );
}

/* ------------------------------------------------------------- Progress */
export function ProgressBar({ value, label, className, showValue = false, tone = "accent" }: { value: number; label: string; className?: string; showValue?: boolean; tone?: "accent" | "primary" | "success" }) {
  const bar = { accent: "bg-accent", primary: "bg-primary-600", success: "bg-success-500" }[tone];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-subtle"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full origin-left animate-grow rounded-full transition-[width] duration-700 ease-out", bar)} style={{ width: `${value}%` }} />
      </div>
      {showValue && <span className="w-10 text-right text-small font-semibold tabular-nums text-ink-900">{value}%</span>}
    </div>
  );
}

export function ProgressRing({ value, size = 64, stroke = 6, label, children }: { value: number; size?: number; stroke?: number; label: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value}%`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent-tint)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-small font-bold text-ink-900">{children ?? `${value}%`}</span>
    </div>
  );
}

/* ---------------------------------------------------------- Form fields */
export function Field({
  label,
  hint,
  error,
  children,
  className,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean; required?: boolean }) => React.ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-small font-semibold text-ink-800">
        {label}
        {required && <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>}
      </label>
      {children({ id, "aria-describedby": [hintId, errId].filter(Boolean).join(" ") || undefined, "aria-invalid": error ? true : undefined, required })}
      {hint && !error && (
        <p id={hintId} className="text-caption text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="flex items-center gap-1 text-caption font-medium text-danger-700" role="alert">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "w-full rounded-md border border-line-strong bg-white px-3.5 text-body text-ink-900 placeholder:text-ink-400 transition-[border-color,box-shadow] hover:border-ink-300 focus:border-primary-500 focus:shadow-focus focus:outline-none aria-[invalid=true]:border-danger-500 disabled:bg-subtle disabled:text-ink-500";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(inputBase, "h-11", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(inputBase, "min-h-24 py-2.5", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      inputBase,
      "h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%235b6b8c%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

/* ------------------------------------------------------------ SearchBar */
export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search symptoms, doctors, specialties…",
  label = "Search",
  className,
  size = "md",
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  size?: "md" | "lg";
  autoFocus?: boolean;
}) {
  const id = useId();
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className={cn("pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-400", size === "lg" ? "size-5" : "size-4.5")} aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-full border border-line bg-white text-ink-900 shadow-xs placeholder:text-ink-400 focus:border-primary-400 focus:shadow-focus focus:outline-none",
          size === "lg" ? "h-14 pr-16 pl-12 text-body" : "h-11 pr-4 pl-11 text-control",
        )}
      />
      {size === "lg" && onSubmit && (
        <button
          type="submit"
          aria-label="Search"
          className="absolute top-1/2 right-1.5 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700"
        >
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}

/* --------------------------------------------------------------- States */
export function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
  className,
  headingLevel = "h3",
}: {
  headingLevel?: "h1" | "h2" | "h3";
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-white/60 px-6 py-12 text-center", className)}>
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Icon className="size-6.5" aria-hidden="true" />
      </span>
      {(() => {
        const H = headingLevel;
        return <H className="t-h3">{title}</H>;
      })()}
      {description && <p className="mt-1.5 max-w-sm text-small text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description = "We couldn't load this right now. Your data is safe — please try again.", onRetry, className }: { title?: string; description?: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-xl border border-danger-100 bg-danger-50/60 px-6 py-10 text-center", className)}>
      <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-white text-danger-600 shadow-xs">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="t-h3">{title}</h3>
      <p className="mt-1 max-w-sm text-small text-ink-600">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}

export function LoadingState({ label = "Loading", rows = 3, className }: { label?: string; rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-live="polite">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4 p-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------ Medical disclaimer */
export function Disclaimer({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-lg bg-info-50 px-4 py-3 text-small text-info-700", className)}>
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children ?? "This content is educational information and not a personal diagnosis. Always consult a qualified doctor about your health."}</span>
    </p>
  );
}

/* --------------------------------------------------------------- Switch */
export function Switch({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p id={`${id}-l`} className="font-semibold text-ink-900">{label}</p>
        {description && <p id={`${id}-d`} className="mt-0.5 text-small text-ink-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={description ? `${id}-d` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="group -my-2 -mr-1 inline-flex size-11 w-14 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
      >
        <span className={cn("relative inline-flex h-7 w-12 items-center rounded-full transition-colors", checked ? "bg-primary-600" : "bg-ink-400")}>
          <span className={cn("inline-block size-5.5 rounded-full bg-white shadow-xs transition-transform", checked ? "translate-x-[1.375rem]" : "translate-x-[0.1875rem]")} />
        </span>
      </button>
    </div>
  );
}
