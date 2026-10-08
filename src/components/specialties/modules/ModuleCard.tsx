import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModuleGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 lg:grid-cols-2", className)}>{children}</div>;
}

export function ModuleCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; to: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card flex flex-col p-5 sm:p-6", className)} aria-label={title}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="t-h3">{title}</h3>
          {subtitle && <p className="mt-0.5 text-small text-ink-500">{subtitle}</p>}
        </div>
        {action && (
          <Link to={action.to} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-small font-semibold text-accent hover:underline">
            {action.label} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, className }: { label: string; value: string; hint?: string; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line bg-white p-3.5", className)}>
      <p className="text-caption font-semibold text-ink-500">{label}</p>
      <p className="mt-1 text-[1.375rem] leading-none font-bold tracking-tight text-ink-900">{value}</p>
      {hint && <p className="mt-1.5 text-caption text-ink-500">{hint}</p>}
    </div>
  );
}
