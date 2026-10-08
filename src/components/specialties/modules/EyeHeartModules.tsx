import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, HeartPulse, ShieldCheck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/primitives";
import { ModuleCard, ModuleGrid, Stat } from "./ModuleCard";
import { cn } from "@/lib/utils";

/* =============================================================== Eye care */
export function VisionProfile() {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  return (
    <ModuleGrid>
      <ModuleCard title="Your Vision Profile" subtitle="From your last eye test · Sep 15, 2026" action={{ label: "View report", to: "/records?open=rec-eye-test" }}>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Right eye" value="6/6" hint="With correction" />
          <Stat label="Left eye" value="6/9" hint="With correction" />
          <Stat label="Eye pressure" value="14 / 15" hint="mmHg · normal 10–21" />
          <Stat label="Corneal thickness" value="548 µm" hint="Suitable for LASIK" />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-accent-tint/60 p-3.5">
          <ProgressRing value={68} size={48} stroke={5} label="LASIK journey" />
          <div className="flex-1">
            <p className="text-small font-bold text-ink-900">LASIK journey in progress</p>
            <p className="text-caption text-ink-600">Next: Pre-surgery assessment · Oct 14</p>
          </div>
          <ButtonLink to="/care/journey/j-lasik" size="sm" variant="white">Open</ButtonLink>
        </div>
      </ModuleCard>

      <ModuleCard title="Amsler grid self-check" subtitle="A quick screen for central vision changes. Takes 30 seconds.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <svg viewBox="0 0 200 200" className="mx-auto w-44 shrink-0 rounded-lg border border-line bg-white sm:mx-0" role="img" aria-label="Amsler grid: a square grid of lines with a dot in the centre">
            {Array.from({ length: 21 }).map((_, i) => (
              <g key={i}>
                <line x1={i * 10} x2={i * 10} y1={0} y2={200} stroke="#0b1b3f" strokeWidth={0.6} />
                <line y1={i * 10} y2={i * 10} x1={0} x2={200} stroke="#0b1b3f" strokeWidth={0.6} />
              </g>
            ))}
            <circle cx={100} cy={100} r={3.5} fill="#0b1b3f" />
          </svg>
          <div className="flex-1">
            <ol className="list-decimal space-y-1 pl-5 text-small text-ink-700">
              <li>Hold the screen at reading distance with your glasses on.</li>
              <li>Cover one eye and look at the centre dot.</li>
              <li>Repeat with the other eye.</li>
            </ol>
            <p className="mt-3 text-small font-semibold text-ink-900" id="amsler-q">Do any lines look wavy, blurred or missing?</p>
            <div className="mt-2 flex gap-2" role="group" aria-labelledby="amsler-q">
              <Button size="sm" variant={answer === "no" ? "primary" : "outline"} aria-pressed={answer === "no"} onClick={() => setAnswer("no")}>No, all straight</Button>
              <Button size="sm" variant={answer === "yes" ? "primary" : "outline"} aria-pressed={answer === "yes"} onClick={() => setAnswer("yes")}>Yes, some lines</Button>
            </div>
            <div aria-live="polite">
              {answer === "no" && <p className="mt-3 flex items-start gap-2 text-small text-success-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Looks reassuring. Keep up yearly eye exams.</p>}
              {answer === "yes" && (
                <div className="mt-3 rounded-lg bg-warning-50 p-3 text-small text-warning-700">
                  <p className="flex items-start gap-2 font-semibold"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Please book a retina check soon.</p>
                  <p className="mt-1 text-ink-700">Distortion can have many causes. A specialist can check your macula with an OCT scan.</p>
                  <ButtonLink to="/appointments/book?specialty=eye-care&reason=Retina%20check" size="sm" className="mt-2">Book retina check</ButtonLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModuleCard>
    </ModuleGrid>
  );
}

/* ============================================================= Heart care */
const riskFactors = [
  { id: "age", label: "Age over 45 (men) or 55 (women)" },
  { id: "smoke", label: "Smoke or use tobacco" },
  { id: "bp", label: "High blood pressure" },
  { id: "diabetes", label: "Diabetes" },
  { id: "chol", label: "High cholesterol" },
  { id: "family", label: "Heart disease in a parent or sibling before 60" },
  { id: "inactive", label: "Less than 150 min exercise a week" },
];

export function HeartOverview() {
  const [checked, setChecked] = useState<Set<string>>(new Set(["inactive"]));
  const count = checked.size;
  const risk = useMemo(() => (count <= 1 ? { level: "Low", tone: "success" } : count <= 3 ? { level: "Moderate", tone: "warning" } : { level: "Higher", tone: "danger" }), [count]);
  const toggle = (id: string) => setChecked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return (
    <ModuleGrid>
      <ModuleCard title="Heart Health Overview" subtitle="Synced from your BP monitor · Today 8:40 AM" action={{ label: "Insights", to: "/insights" }}>
        <div className="flex items-center gap-5">
          <ProgressRing value={72} size={104} stroke={8} label="Resting heart rate 72 of 100 bpm">
            <span className="text-center leading-tight"><span className="block text-stat-lg font-bold">72</span><span className="block text-caption font-medium text-ink-500">bpm</span></span>
          </ProgressRing>
          <div className="grid flex-1 grid-cols-1 gap-3 xs:grid-cols-2">
            <Stat label="Blood pressure" value="118/76" hint="mmHg · normal" />
            <Stat label="Last ECG" value="Normal" hint="Sinus rhythm · Sep 26" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[{ k: "ECG", v: "Done" }, { k: "Echo", v: "EF 62%" }, { k: "Lipids", v: "LDL 112" }].map((x) => (
            <div key={x.k} className="rounded-lg bg-subtle px-2 py-2.5"><p className="text-caption text-ink-500">{x.k}</p><p className="text-small font-bold text-ink-900">{x.v}</p></div>
          ))}
        </div>
      </ModuleCard>

      <ModuleCard title="Heart risk check" subtitle="Tick what applies to you. Educational estimate — not a diagnosis.">
        <fieldset>
          <legend className="sr-only">Risk factors</legend>
          <ul className="grid gap-1.5">
            {riskFactors.map((f) => (
              <li key={f.id}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-subtle">
                  <input type="checkbox" checked={checked.has(f.id)} onChange={() => toggle(f.id)} className="size-4.5 accent-[var(--accent)]" />
                  <span className="text-small text-ink-800">{f.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <div aria-live="polite" className={cn("mt-3 flex items-center gap-3 rounded-xl p-3.5", risk.tone === "success" ? "bg-success-50" : risk.tone === "warning" ? "bg-warning-50" : "bg-danger-50")}>
          {risk.tone === "success" ? <ShieldCheck className="size-6 text-success-700" aria-hidden="true" /> : <HeartPulse className={cn("size-6", risk.tone === "warning" ? "text-warning-700" : "text-danger-700")} aria-hidden="true" />}
          <div className="flex-1">
            <p className="font-bold text-ink-900">{risk.level} risk · {count} factor{count === 1 ? "" : "s"}</p>
            <p className="text-small text-ink-600">{risk.level === "Low" ? "Keep moving and check BP yearly." : "A preventive cardiology check is a good next step."}</p>
          </div>
          {risk.level !== "Low" && <ButtonLink to="/appointments/book?specialty=heart-care&reason=Preventive%20heart%20check" size="sm">Book</ButtonLink>}
        </div>
      </ModuleCard>
    </ModuleGrid>
  );
}

