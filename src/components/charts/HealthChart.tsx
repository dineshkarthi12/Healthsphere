import { useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Small, accessible SVG charts. Follows a few fixed rules:
 *  - one y-axis only, recessive hairline grid
 *  - 2px lines, ≥8px end markers with a surface ring
 *  - columns ≤24px wide with 4px rounded data-ends
 *  - text uses ink tokens, never series colour
 *  - hover/focus tooltip + a visually hidden data table
 */
export const SERIES = ["#2a78d6", "#eb6834", "#1baf7a"] as const;
const GRID = "#e8edf5";
const AXIS_TEXT = "#5b6b8c";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceTicks(min: number, max: number, count = 4) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) ?? step0;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(6));
  return ticks;
}

export interface Series {
  name: string;
  values: number[];
}

interface ChartProps {
  labels: string[];
  series: Series[];
  height?: number;
  format?: (v: number) => string;
  title: string;
  className?: string;
  /** y-axis baseline: "zero" for magnitudes, "auto" for vitals */
  baseline?: "zero" | "auto";
  goal?: { value: number; label: string };
}

function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null;
  return (
    <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-600" aria-hidden="true">
      {series.map((s, i) => (
        <li key={s.name} className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ background: SERIES[i] }} />
          {s.name}
        </li>
      ))}
    </ul>
  );
}

function DataTable({ labels, series, format, title }: { labels: string[]; series: Series[]; format: (v: number) => string; title: string }) {
  return (
    <table className="sr-only">
      <caption>{title}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          {series.map((s) => <th key={s.name} scope="col">{s.name}</th>)}
        </tr>
      </thead>
      <tbody>
        {labels.map((l, i) => (
          <tr key={l + i}>
            <th scope="row">{l}</th>
            {series.map((s) => <td key={s.name}>{format(s.values[i])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Tooltip({ x, y, width, label, rows }: { x: number; y: number; width: number; label: string; rows: { name: string; value: string; color: string }[] }) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-white px-3 py-2 text-caption shadow-raised" style={{ left, top: y - 10 }}>
      <p className="font-semibold text-ink-900">{label}</p>
      {rows.map((r) => (
        <p key={r.name} className="flex items-center gap-1.5 whitespace-nowrap text-ink-600">
          <span className="size-2 rounded-full" style={{ background: r.color }} />
          {r.name}: <span className="font-semibold text-ink-900">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ================================================================ Line */
export function LineChart({ labels, series, height = 200, format = (v) => v.toLocaleString("en-IN"), title, className, baseline = "auto", goal }: ChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();
  const pad = { t: 12, r: 16, b: 26, l: 40 };
  const all = series.flatMap((s) => s.values).concat(goal ? [goal.value] : []);
  const min = baseline === "zero" ? 0 : Math.min(...all);
  const max = Math.max(...all);
  const ticks = niceTicks(baseline === "zero" ? 0 : min - (max - min) * 0.15, max + (max - min) * 0.1);
  const y0 = ticks[0];
  const y1 = ticks[ticks.length - 1];
  const iw = Math.max(0, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length === 1 ? iw / 2 : (i / (labels.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - ((v - y0) / (y1 - y0 || 1)) * ih;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.round(rel * (labels.length - 1)));
  };

  return (
    <figure className={cn("relative", className)} ref={ref}>
      <Legend series={series} />
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={title} onPointerLeave={() => setHover(null)}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={SERIES[0]} stopOpacity="0.14" />
              <stop offset="1" stopColor={SERIES[0]} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={AXIS_TEXT}>{format(t)}</text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={l + i} x={x(i)} y={height - 6} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>{l}</text>
          ))}
          {goal && (
            <g>
              <line x1={pad.l} x2={width - pad.r} y1={y(goal.value)} y2={y(goal.value)} stroke="#9aa6bd" strokeWidth={1} strokeDasharray="4 4" />
              <text x={width - pad.r} y={y(goal.value) - 6} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>{goal.label}</text>
            </g>
          )}
          {series.length === 1 && (
            <path d={`M${x(0)},${y(series[0].values[0])} ${series[0].values.map((v, i) => `L${x(i)},${y(v)}`).join(" ")} L${x(labels.length - 1)},${pad.t + ih} L${x(0)},${pad.t + ih}Z`} fill={`url(#${gradId})`} />
          )}
          {series.map((s, si) => (
            <path key={s.name} d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")} fill="none" stroke={SERIES[si]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="#c3cde0" strokeWidth={1} />}
          {series.map((s, si) => {
            const i = hover ?? s.values.length - 1;
            return <circle key={s.name} cx={x(i)} cy={y(s.values[i])} r={4.5} fill={SERIES[si]} stroke="#fff" strokeWidth={2} />;
          })}
          <rect x={pad.l} y={pad.t} width={iw} height={ih} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} style={{ touchAction: "pan-y" }} />
        </svg>
      )}
      {hover !== null && width > 0 && (
        <Tooltip x={x(hover)} y={Math.min(...series.map((s) => y(s.values[hover])))} width={width} label={labels[hover]} rows={series.map((s, i) => ({ name: s.name, value: format(s.values[hover]), color: SERIES[i] }))} />
      )}
      <DataTable labels={labels} series={series} format={format} title={title} />
    </figure>
  );
}

/* ============================================================== Columns */
export function ColumnChart({ labels, series, height = 200, format = (v) => v.toLocaleString("en-IN"), title, className, goal, highlightLast = false }: Omit<ChartProps, "baseline"> & { highlightLast?: boolean }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { t: 12, r: 8, b: 26, l: 44 };
  const values = series[0].values;
  const ticks = niceTicks(0, Math.max(...values, goal?.value ?? 0) * 1.05);
  const y1 = ticks[ticks.length - 1];
  const iw = Math.max(0, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const band = iw / labels.length;
  const bw = Math.min(24, band * 0.6);
  const y = (v: number) => pad.t + ih - (v / y1) * ih;
  const r = 4;

  return (
    <figure className={cn("relative", className)} ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={title} onPointerLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={AXIS_TEXT}>{format(t)}</text>
            </g>
          ))}
          {goal && (
            <g>
              <line x1={pad.l} x2={width - pad.r} y1={y(goal.value)} y2={y(goal.value)} stroke="#9aa6bd" strokeWidth={1} strokeDasharray="4 4" />
              <text x={width - pad.r} y={y(goal.value) - 6} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>{goal.label}</text>
            </g>
          )}
          {values.map((v, i) => {
            const cx = pad.l + band * i + band / 2;
            const top = y(v);
            const h = pad.t + ih - top;
            const rr = Math.min(r, h);
            const d = `M${cx - bw / 2},${pad.t + ih} V${top + rr} Q${cx - bw / 2},${top} ${cx - bw / 2 + rr},${top} H${cx + bw / 2 - rr} Q${cx + bw / 2},${top} ${cx + bw / 2},${top + rr} V${pad.t + ih} Z`;
            const dim = highlightLast && i !== values.length - 1;
            return (
              <g key={i} onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)}>
                <rect x={pad.l + band * i} y={pad.t} width={band} height={ih} fill="transparent" />
                <path d={d} fill={SERIES[0]} opacity={hover === null ? (dim ? 0.45 : 1) : hover === i ? 1 : 0.45} />
                <text x={cx} y={height - 6} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>{labels[i]}</text>
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && width > 0 && (
        <Tooltip x={pad.l + band * hover + band / 2} y={y(values[hover])} width={width} label={labels[hover]} rows={[{ name: series[0].name, value: format(values[hover]), color: SERIES[0] }]} />
      )}
      <DataTable labels={labels} series={series} format={format} title={title} />
    </figure>
  );
}

/* ========================================================= Horizontal bars */
export function BarList({ items, format = (v) => v.toLocaleString("en-IN"), title, className }: { items: { label: string; value: number; hint?: string }[]; format?: (v: number) => string; title: string; className?: string }) {
  const max = Math.max(...items.map((i) => i.value));
  return (
    <figure className={className}>
      <figcaption className="sr-only">{title}</figcaption>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.label} className="group">
            <div className="mb-1 flex items-baseline justify-between gap-3 text-small">
              <span className="font-medium text-ink-800">{it.label}</span>
              <span className="font-semibold tabular-nums text-ink-900">{format(it.value)}{it.hint && <span className="ml-1 font-normal text-ink-500">{it.hint}</span>}</span>
            </div>
            <div className="h-2.5 rounded-full bg-subtle" aria-hidden="true">
              <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(it.value / max) * 100}%`, background: SERIES[0] }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/* ============================================================= Sparkline */
export function Sparkline({ values, className, color = "var(--accent)", label }: { values: number[]; className?: string; color?: string; label: string }) {
  const w = 120;
  const h = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => (i / (values.length - 1)) * (w - 8) + 4;
  const y = (v: number) => h - 4 - ((v - min) / (max - min || 1)) * (h - 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-9 w-full", className)} role="img" aria-label={label} preserveAspectRatio="none">
      <path d={values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={3.5} fill={color} stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}
