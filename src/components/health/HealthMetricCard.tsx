import type { HealthMetric } from "@/types";
import { getIcon } from "@/lib/icons";
import { Sparkline } from "@/components/charts/HealthChart";
import { StatusBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const tones: Record<HealthMetric["id"], React.CSSProperties> = {
  "heart-rate": { "--accent": "#e5484d", "--accent-tint": "#fdeced", "--accent-ink": "#b42a33" } as React.CSSProperties,
  "blood-pressure": { "--accent": "#2a74ec", "--accent-tint": "#eaf2ff", "--accent-ink": "#154fb3" } as React.CSSProperties,
  steps: { "--accent": "#12a383", "--accent-tint": "#e7f7f2", "--accent-ink": "#0a7a62" } as React.CSSProperties,
  sleep: { "--accent": "#7c5cfc", "--accent-tint": "#f0ecff", "--accent-ink": "#5a3fd6" } as React.CSSProperties,
  weight: { "--accent": "#ee7a24", "--accent-tint": "#fef0e4", "--accent-ink": "#b2560f" } as React.CSSProperties,
  spo2: { "--accent": "#0a9fb5", "--accent-tint": "#e2f5f8", "--accent-ink": "#087889" } as React.CSSProperties,
};
export const metricTone = (id: HealthMetric["id"]) => tones[id];

export function HealthMetricCard({ metric, className, compact = false, onClick, selected }: { metric: HealthMetric; className?: string; compact?: boolean; onClick?: () => void; selected?: boolean }) {
  const Icon = getIcon(metric.icon);
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      style={tones[metric.id]}
      className={cn(
        "card flex w-full flex-col p-4 text-left",
        onClick && "card-interactive",
        selected && "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/20",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="accent-icon inline-flex size-8 items-center justify-center rounded-lg">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <span className="text-small font-semibold text-ink-700">{metric.label}</span>
      </div>
      <p className="mt-3 flex items-baseline gap-1">
        <span className="text-stat-lg leading-none font-bold tracking-tight text-ink-900 tabular-nums">{metric.value}</span>
        {metric.unit && <span className="text-small font-medium text-ink-500">{metric.unit}</span>}
      </p>
      {!compact && <Sparkline values={metric.trend} label={`${metric.label} trend, last 7 readings`} className="mt-2" />}
      <div className="mt-2 flex items-center justify-between gap-2">
        <StatusBadge status={metric.status === "attention" ? "attention" : "normal"} label={metric.statusLabel} />
        {!compact && <span className="text-caption text-ink-500">{metric.updated}</span>}
      </div>
    </Comp>
  );
}
