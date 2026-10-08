import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Multi-step progress indicator. Desktop: labelled steps. Phone: "Step x of n" + bar. */
export function BookingStepper({ steps, current, onStepClick }: { steps: string[]; current: number; onStepClick?: (i: number) => void }) {
  return (
    <nav aria-label="Booking progress">
      <div className="md:hidden">
        <p className="text-small font-semibold text-ink-600">
          Step {current + 1} of {steps.length} · <span className="text-ink-900">{steps[current]}</span>
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-subtle" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current + 1} aria-label="Booking progress">
          <div className="h-full rounded-full bg-primary-600 transition-[width] duration-500" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="hidden items-center md:flex">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = done && onStepClick;
          return (
            <li key={s} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(i)}
                aria-current={active ? "step" : undefined}
                className={cn("flex items-center gap-2.5 rounded-full py-1 pr-3 text-small font-semibold", clickable && "hover:bg-subtle", !clickable && "cursor-default")}
              >
                <span className={cn("inline-flex size-8 items-center justify-center rounded-full border-2 text-small font-bold transition-colors", done ? "border-primary-600 bg-primary-600 text-white" : active ? "border-primary-600 bg-white text-primary-700" : "border-line-strong bg-white text-ink-400")}>
                  {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn("whitespace-nowrap", active ? "text-ink-900" : done ? "text-ink-700" : "text-ink-500", !active && "sr-only xl:not-sr-only")}>
                  {s}
                  {done && <span className="sr-only"> (completed)</span>}
                </span>
              </button>
              {i < steps.length - 1 && <span className={cn("mx-2 h-0.5 min-w-4 flex-1 rounded-full", done ? "bg-primary-600" : "bg-line-strong")} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
