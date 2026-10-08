import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function DashHeader({ title, subtitle, actions }: { title: React.ReactNode; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="t-h2">{title}</h1>
        {subtitle && <p className="mt-1 text-small text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** KPI tile: label · value · optional delta (direction + whether up is good). */
export function StatTile({ label, value, icon, delta, deltaGood = true, hint, tone = "#2a74ec" }: { label: string; value: string; icon: string; delta?: number; deltaGood?: boolean; hint?: string; tone?: string }) {
  const Icon = getIcon(icon);
  const up = (delta ?? 0) >= 0;
  const good = up === deltaGood;
  return (
    <div className="card p-4 sm:p-5" style={{ "--accent": tone, "--accent-tint": `${tone}14` } as React.CSSProperties}>
      <div className="flex items-center gap-2.5">
        <span className="accent-icon inline-flex size-9 items-center justify-center rounded-lg"><Icon className="size-4.5" aria-hidden="true" /></span>
        <p className="text-small font-semibold text-ink-600">{label}</p>
      </div>
      <p className="mt-3 text-[1.75rem] leading-none font-bold tracking-tight text-ink-900 tabular-nums">{value}</p>
      <div className="mt-2 flex items-center gap-1.5 text-caption">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-semibold", good ? "text-success-700" : "text-danger-700")}>
            {up ? <TrendingUp className="size-3.5" aria-hidden="true" /> : <TrendingDown className="size-3.5" aria-hidden="true" />}
            {up ? "+" : ""}{delta}%<span className="sr-only">{up ? " increase" : " decrease"}</span>
          </span>
        )}
        {hint && <span className="text-ink-500">{hint}</span>}
      </div>
    </div>
  );
}

export function Panel({ title, action, children, className, bodyClassName }: { title: string; action?: { label: string; to: string }; children: React.ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("card flex flex-col", className)} aria-label={title}>
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
        <h2 className="font-bold text-ink-900">{title}</h2>
        {action && <Link to={action.to} className="inline-flex min-h-9 items-center gap-1 text-small font-semibold text-primary-700 hover:underline">{action.label}<ArrowRight className="size-3.5" aria-hidden="true" /></Link>}
      </div>
      <div className={cn("flex-1 px-5 pb-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Accessible table that becomes stacked cards on phones. */
export function DataTable<T>({ caption, columns, rows, rowKey, onRowClick, empty }: {
  caption: string;
  columns: { key: string; header: string; render: (row: T) => React.ReactNode; className?: string; hideOnMobile?: boolean }[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
}) {
  if (!rows.length) return <>{empty}</>;
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left text-small">
        <caption className="sr-only">{caption}</caption>
        <thead className="hidden bg-subtle text-ink-600 md:table-header-group">
          <tr>{columns.map((c) => <th key={c.key} scope="col" className={cn("px-4 py-3 font-semibold", c.className)}>{c.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr
              key={rowKey(r)}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={cn("block p-4 md:table-row md:p-0", onRowClick && "cursor-pointer hover:bg-primary-25")}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("flex items-center justify-between gap-3 py-1 md:table-cell md:px-4 md:py-3", c.hideOnMobile && "hidden md:table-cell", c.className)}>
                  <span className="text-caption font-semibold text-ink-500 md:hidden" aria-hidden="true">{c.header}</span>
                  <span className="min-w-0 text-right md:text-left">{c.render(r)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
