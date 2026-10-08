import { useState } from "react";
import { CheckCircle2, Phone, Plus, Wind } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/overlays";
import { LineChart } from "@/components/charts/HealthChart";
import { ModuleCard, ModuleGrid, Stat } from "./ModuleCard";
import { cn } from "@/lib/utils";

/* ========================================================= Brain & Neuro */
const beFast = [
  { letter: "B", word: "Balance", text: "Sudden loss of balance or coordination" },
  { letter: "E", word: "Eyes", text: "Sudden blurred, double or lost vision" },
  { letter: "F", word: "Face", text: "One side of the face droops" },
  { letter: "A", word: "Arms", text: "Weakness or numbness in one arm" },
  { letter: "S", word: "Speech", text: "Slurred or strange speech" },
  { letter: "T", word: "Time", text: "Call 108 immediately — note the time" },
];
const triggers = ["Poor sleep", "Skipped meal", "Stress", "Screen time", "Bright light", "Dehydration"];

export function NeuroAssessment() {
  const { toast } = useToast();
  const [severity, setSeverity] = useState(4);
  const [picked, setPicked] = useState<string[]>(["Poor sleep"]);
  const [log, setLog] = useState([
    { date: "Oct 5", severity: 6, triggers: ["Skipped meal", "Stress"] },
    { date: "Sep 28", severity: 3, triggers: ["Poor sleep"] },
  ]);
  return (
    <ModuleGrid>
      <ModuleCard title="Recognise a stroke: BE FAST" subtitle="Every minute matters. Know the signs.">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {beFast.map((b) => (
            <li key={b.letter} className={cn("rounded-xl border p-3", b.letter === "T" ? "border-danger-100 bg-danger-50" : "border-line bg-white")}>
              <p className="flex items-baseline gap-1.5"><span className="text-[1.5rem] leading-none font-extrabold text-accent">{b.letter}</span><span className="font-bold text-ink-900">{b.word}</span></p>
              <p className="mt-1 text-caption text-ink-600">{b.text}</p>
            </li>
          ))}
        </ul>
        <a href="tel:108" className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-danger-600 px-4 font-semibold text-white hover:bg-danger-700">
          <Phone className="size-4" aria-hidden="true" /> Call 108 now
        </a>
      </ModuleCard>

      <ModuleCard title="Headache diary" subtitle="Logging helps your neurologist find patterns and triggers.">
        <label htmlFor="sev" className="flex items-center justify-between text-small font-semibold text-ink-800">
          Today's severity <span className="text-[1.25rem] font-bold text-ink-900 tabular-nums">{severity}/10</span>
        </label>
        <input id="sev" type="range" min={0} max={10} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="mt-2 h-11 w-full accent-[var(--accent)]" aria-valuetext={`${severity} out of 10`} />
        <p className="mt-2 text-small font-semibold text-ink-800" id="trig">Possible triggers</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="trig">
          {triggers.map((t) => {
            const on = picked.includes(t);
            return (
              <button key={t} aria-pressed={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== t) : [...p, t]))} className={cn("min-h-9 rounded-full border px-3 text-small font-medium transition-colors", on ? "border-[color:var(--accent)] bg-accent-tint text-accent" : "border-line text-ink-600 hover:border-line-strong")}>
                {t}
              </button>
            );
          })}
        </div>
        <Button
          className="mt-4"
          size="sm"
          onClick={() => {
            setLog((l) => [{ date: "Today", severity, triggers: picked }, ...l]);
            toast({ title: "Headache logged", description: "Shared with Dr. Vikram Rao for your Oct 20 review." });
          }}
        >
          <Plus className="size-4" aria-hidden="true" /> Log entry
        </Button>
        <ul className="mt-4 divide-y divide-line border-t border-line" aria-label="Recent entries">
          {log.map((e, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-small">
              <span className="font-semibold text-ink-900">{e.date}</span>
              <span className="flex-1 truncate text-ink-500">{e.triggers.join(", ") || "No triggers"}</span>
              <span className="font-bold tabular-nums">{e.severity}/10</span>
            </li>
          ))}
        </ul>
      </ModuleCard>
    </ModuleGrid>
  );
}

/* ============================================================ Bone & Spine */
const regions = ["Lower back", "Neck", "Shoulder", "Knee", "Hip", "Wrist"];
export function PainTracker() {
  const { toast } = useToast();
  const [region, setRegion] = useState("Lower back");
  const [pain, setPain] = useState(3);
  const [trend, setTrend] = useState([7, 6, 6, 5, 4, 4, 3]);
  return (
    <ModuleGrid>
      <ModuleCard title="Pain tracker" subtitle="Track pain weekly — it guides your physiotherapy plan.">
        <p className="text-small font-semibold text-ink-800" id="region">Where does it hurt?</p>
        <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="region">
          {regions.map((r) => (
            <button key={r} role="radio" aria-checked={region === r} onClick={() => setRegion(r)} className={cn("min-h-11 rounded-lg border text-small font-semibold transition-colors", region === r ? "border-[color:var(--accent)] bg-accent-tint text-accent" : "border-line text-ink-600 hover:border-line-strong")}>
              {r}
            </button>
          ))}
        </div>
        <label htmlFor="pain" className="mt-4 flex items-center justify-between text-small font-semibold text-ink-800">
          Pain right now <span className="text-[1.25rem] font-bold tabular-nums">{pain}/10</span>
        </label>
        <input id="pain" type="range" min={0} max={10} value={pain} onChange={(e) => setPain(+e.target.value)} className="mt-1 h-11 w-full accent-[var(--accent)]" aria-valuetext={`${pain} out of 10, ${pain <= 3 ? "mild" : pain <= 6 ? "moderate" : "severe"}`} />
        <div className="flex justify-between text-caption text-ink-500"><span>No pain</span><span>Moderate</span><span>Worst</span></div>
        <Button className="mt-4" size="sm" onClick={() => { setTrend((t) => [...t.slice(1), pain]); toast({ title: "Pain score saved", description: `${region}: ${pain}/10 added to your Back Pain Rehab journey.` }); }}>
          Save today's score
        </Button>
      </ModuleCard>
      <ModuleCard title="Your recovery trend" subtitle={`${region} pain · last 7 weeks`} action={{ label: "Rehab journey", to: "/care/journey/j-back" }}>
        <LineChart title="Weekly pain score" labels={["W1", "W2", "W3", "W4", "W5", "W6", "Now"]} series={[{ name: "Pain score", values: trend }]} baseline="zero" height={190} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Stat label="Physio sessions" value="4 of 12" hint="Next: Oct 10, 7:30 AM" />
          <Stat label="Pain change" value={`${trend[trend.length - 1] - trend[0] > 0 ? "+" : ""}${trend[trend.length - 1] - trend[0]}`} hint="Since you started" />
        </div>
      </ModuleCard>
    </ModuleGrid>
  );
}

/* ============================================================== Lung care */
export function LungFunction() {
  const [best, setBest] = useState(450);
  const [today, setToday] = useState(410);
  const pct = Math.round((today / best) * 100);
  const zone = pct >= 80 ? { name: "Green zone", text: "Breathing well. Continue your usual inhaler plan.", cls: "bg-success-50 text-success-700" } : pct >= 50 ? { name: "Yellow zone", text: "Caution. Use your reliever and follow your action plan; contact your doctor if it doesn't improve.", cls: "bg-warning-50 text-warning-700" } : { name: "Red zone", text: "Medical alert. Use your reliever and seek emergency care now — call 108.", cls: "bg-danger-50 text-danger-700" };
  return (
    <ModuleGrid>
      <ModuleCard title="Peak flow zone check" subtitle="Compare today's reading with your personal best.">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-small font-semibold text-ink-800">Personal best (L/min)</span>
            <input type="number" inputMode="numeric" min={100} max={800} value={best} onChange={(e) => setBest(Math.max(1, +e.target.value || 1))} className="mt-1.5 h-11 w-full rounded-md border border-line-strong px-3 focus:border-primary-500 focus:shadow-focus focus:outline-none" />
          </label>
          <label className="block">
            <span className="text-small font-semibold text-ink-800">Today (L/min)</span>
            <input type="number" inputMode="numeric" min={0} max={800} value={today} onChange={(e) => setToday(+e.target.value || 0)} className="mt-1.5 h-11 w-full rounded-md border border-line-strong px-3 focus:border-primary-500 focus:shadow-focus focus:outline-none" />
          </label>
        </div>
        <div className="relative mt-5 h-3 overflow-hidden rounded-full" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-danger-100" />
          <div className="absolute inset-y-0 left-1/2 w-[30%] bg-warning-50" style={{ background: "#ffe8b8" }} />
          <div className="absolute inset-y-0 left-[80%] w-[20%] bg-success-50" style={{ background: "#c8eedf" }} />
          <div className="absolute top-0 h-3 w-1 -translate-x-1/2 rounded-full bg-ink-900" style={{ left: `${Math.min(100, pct)}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-caption text-ink-500"><span>0%</span><span>50%</span><span>80%</span><span>100%</span></div>
        <div aria-live="polite" className={cn("mt-4 rounded-xl p-3.5", zone.cls)}>
          <p className="flex items-center gap-2 font-bold"><Wind className="size-4.5" aria-hidden="true" />{zone.name} · {pct}% of best</p>
          <p className="mt-1 text-small text-ink-700">{zone.text}</p>
        </div>
      </ModuleCard>
      <ModuleCard title="Lung function snapshot" subtitle="Typical spirometry measures explained">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="FEV1" value="2.9 L" hint="Air out in 1 second" />
          <Stat label="FVC" value="3.5 L" hint="Total air breathed out" />
          <Stat label="FEV1/FVC" value="83%" hint="Normal above 70%" />
          <Stat label="SpO₂" value="98%" hint="Oxygen saturation" />
        </div>
        <p className="mt-4 flex items-start gap-2 text-small text-ink-600"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-700" aria-hidden="true" />Example values for illustration. Book a pulmonary function test for your own results.</p>
        <ButtonLink to="/appointments/book?specialty=lung-care&reason=Pulmonary%20function%20test" size="sm" variant="secondary" className="mt-3 self-start">Book lung function test</ButtonLink>
      </ModuleCard>
    </ModuleGrid>
  );
}

