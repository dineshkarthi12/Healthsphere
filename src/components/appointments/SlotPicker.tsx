import { useMemo, useState } from "react";
import { Moon, Sun, Sunrise } from "lucide-react";
import { getSlotDays } from "@/lib/slots";
import { cn } from "@/lib/utils";

/** Day strip + time grid. Days and times are radio groups for screen readers. */
export function SlotPicker({ doctorId, value, onChange }: { doctorId: string; value?: string; onChange: (iso: string) => void }) {
  const days = useMemo(() => getSlotDays(doctorId, 10), [doctorId]);
  const initial = value ? days.findIndex((d) => value.startsWith(d.key)) : days.findIndex((d) => d.availableCount > 0);
  const [dayIdx, setDayIdx] = useState(Math.max(0, initial));
  const day = days[dayIdx];
  const groups = [
    { key: "morning", label: "Morning", icon: Sunrise },
    { key: "afternoon", label: "Afternoon", icon: Sun },
    { key: "evening", label: "Evening", icon: Moon },
  ] as const;

  return (
    <div>
      <div role="radiogroup" aria-label="Choose a day" className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {days.map((d, i) => {
          const selected = i === dayIdx;
          const disabled = d.availableCount === 0;
          return (
            <button
              key={d.key}
              role="radio"
              aria-checked={selected}
              aria-label={`${d.weekday} ${d.day} ${d.month}, ${disabled ? "no slots" : `${d.availableCount} slots`}`}
              disabled={disabled}
              onClick={() => setDayIdx(i)}
              className={cn(
                "flex min-h-[4.5rem] w-16 shrink-0 flex-col items-center justify-center rounded-xl border text-center transition-colors",
                selected ? "border-primary-600 bg-primary-600 text-white shadow-[0_6px_14px_-8px_rgb(26_99_220/0.8)]" : "border-line bg-white text-ink-800 hover:border-primary-300",
                disabled && "border-dashed text-ink-400 opacity-60",
              )}
            >
              <span className={cn("text-caption font-semibold", selected ? "text-primary-50" : "text-ink-500")}>{i === 0 ? "Today" : d.weekday}</span>
              <span className="text-lead leading-tight font-bold">{d.day}</span>
              <span className={cn("text-micro", selected ? "text-primary-50" : "text-ink-500")}>{disabled ? "Full" : `${d.availableCount} slots`}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-4">
        {groups.map(({ key, label, icon: Icon }) => {
          const slots = day.slots[key];
          return (
            <fieldset key={key}>
              <legend className="mb-2 flex items-center gap-1.5 text-small font-semibold text-ink-700">
                <Icon className="size-4 text-ink-400" aria-hidden="true" /> {label}
              </legend>
              <div role="radiogroup" aria-label={`${label} times`} className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {slots.map((s) => {
                  const selected = value === s.iso;
                  return (
                    <button
                      key={s.iso}
                      role="radio"
                      aria-checked={selected}
                      disabled={!s.available}
                      onClick={() => onChange(s.iso)}
                      className={cn(
                        "h-11 rounded-lg border text-small font-semibold tabular-nums transition-colors",
                        selected ? "border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-600/20" : "border-line bg-white text-ink-800 hover:border-primary-300",
                        !s.available && "cursor-not-allowed border-transparent bg-subtle text-ink-400 line-through decoration-ink-300",
                      )}
                    >
                      {s.label}
                      {!s.available && <span className="sr-only"> (booked)</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
