import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { LineChart } from "@/components/charts/HealthChart";
import { ModuleCard, ModuleGrid, Stat } from "./ModuleCard";
import { cn, formatDate } from "@/lib/utils";

/* ============================================================ Dental care */
type ToothState = "healthy" | "filled" | "cavity" | "watch";
const toothStyle: Record<ToothState, { label: string; cls: string; pattern?: string }> = {
  healthy: { label: "Healthy", cls: "bg-white border-line-strong text-ink-600" },
  filled: { label: "Filled", cls: "bg-accent-tint border-[color:var(--accent)] text-accent" },
  cavity: { label: "Cavity — treat", cls: "bg-warning-50 border-warning-500 text-warning-700" },
  watch: { label: "Watch", cls: "bg-info-50 border-info-700/40 text-info-700 border-dashed" },
};
const upper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const lower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const chart: Record<number, { state: ToothState; note: string }> = {
  16: { state: "filled", note: "Composite filling, Aug 2025. Intact." },
  26: { state: "cavity", note: "Early decay on biting surface. Filling recommended." },
  36: { state: "filled", note: "Root canal treated + crown, 2023." },
  47: { state: "watch", note: "Deep groove — sealant suggested, review in 6 months." },
  18: { state: "watch", note: "Partially erupted wisdom tooth. Monitor." },
};
const toothName = (n: number) => {
  const q = ["", "Upper right", "Upper left", "Lower left", "Lower right"][Math.floor(n / 10)];
  const p = n % 10;
  const t = p <= 2 ? "incisor" : p === 3 ? "canine" : p <= 5 ? "premolar" : p === 8 ? "wisdom tooth" : "molar";
  return `${q} ${t} (${n})`;
};

export function DentalChart() {
  const [sel, setSel] = useState<number>(26);
  const info = chart[sel] ?? { state: "healthy" as ToothState, note: "No issues recorded at your last check-up." };
  const Row = ({ teeth }: { teeth: number[] }) => (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-16 sm:gap-1">
      {teeth.map((n) => {
        const st = chart[n]?.state ?? "healthy";
        return (
          <button
            key={n}
            onClick={() => setSel(n)}
            aria-pressed={sel === n}
            aria-label={`${toothName(n)}: ${toothStyle[st].label}`}
            className={cn("flex h-11 items-center justify-center rounded-md border text-caption font-bold transition-transform sm:h-12", toothStyle[st].cls, sel === n && "ring-2 ring-[color:var(--accent)] ring-offset-1 scale-105")}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
  return (
    <ModuleGrid>
      <ModuleCard title="Your tooth chart" subtitle="From your Aug 12 check-up · tap a tooth">
        <div className="space-y-2">
          <p className="text-caption font-semibold text-ink-500">Upper</p>
          <Row teeth={upper} />
          <Row teeth={lower} />
          <p className="text-right text-caption font-semibold text-ink-500">Lower</p>
        </div>
        <ul className="mt-3 flex flex-wrap gap-3 text-caption text-ink-600" aria-label="Legend">
          {(Object.keys(toothStyle) as ToothState[]).map((k) => (
            <li key={k} className="inline-flex items-center gap-1.5"><span className={cn("size-3.5 rounded border", toothStyle[k].cls)} aria-hidden="true" />{toothStyle[k].label}</li>
          ))}
        </ul>
      </ModuleCard>
      <ModuleCard title={toothName(sel)} subtitle={toothStyle[info.state].label}>
        <p className="text-ink-700" aria-live="polite">{info.note}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Last cleaning" value="Aug 12" hint="Scaling & polishing" />
          <Stat label="Next recall" value="Feb 2027" hint="6-monthly check-up" />
        </div>
        {info.state === "cavity" && <ButtonLink to="/appointments/book?specialty=dental-care&reason=Filling" size="sm" className="mt-4 self-start">Book filling</ButtonLink>}
      </ModuleCard>
    </ModuleGrid>
  );
}

/* ========================================================= Women's health */
const babySize = [
  { w: 8, size: "a raspberry", cm: "1.6 cm" },
  { w: 12, size: "a lime", cm: "5.4 cm" },
  { w: 16, size: "an avocado", cm: "11.6 cm" },
  { w: 20, size: "a banana", cm: "25 cm" },
  { w: 24, size: "an ear of corn", cm: "30 cm" },
  { w: 28, size: "an aubergine", cm: "37.6 cm" },
  { w: 32, size: "a squash", cm: "42.4 cm" },
  { w: 36, size: "a papaya", cm: "47.4 cm" },
  { w: 40, size: "a small watermelon", cm: "51 cm" },
];
const checkups = (w: number) => (w < 14 ? ["Dating scan (6–9 wks)", "NT scan (11–14 wks)", "Blood group & thyroid"] : w < 28 ? ["Anomaly scan (18–20 wks)", "Glucose test (24–28 wks)", "Tdap vaccine (27–36 wks)"] : ["Growth scan", "Fortnightly visits from 28 wks", "Birth plan discussion"]);

export function WomensTracker() {
  const [lastPeriod, setLastPeriod] = useState("2026-09-24");
  const [cycle, setCycle] = useState(28);
  const [week, setWeek] = useState(20);
  const days = useMemo(() => {
    const start = new Date(lastPeriod + "T00:00:00");
    return Array.from({ length: 35 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayInCycle = i % cycle;
      const kind = dayInCycle < 5 ? "period" : dayInCycle >= cycle - 19 && dayInCycle <= cycle - 12 ? "fertile" : "none";
      return { d, kind, ovulation: dayInCycle === cycle - 14 };
    });
  }, [lastPeriod, cycle]);
  const nextPeriod = new Date(new Date(lastPeriod + "T00:00:00").getTime() + cycle * 86400000);
  const size = babySize.reduce((a, b) => (Math.abs(b.w - week) < Math.abs(a.w - week) ? b : a));

  return (
    <div className="card p-5 sm:p-6">
      <Tabs defaultValue="cycle">
        <TabsList aria-label="Tracker type" className="mb-5">
          <TabsTrigger value="cycle" className="data-[state=active]:bg-accent-ink">Cycle health</TabsTrigger>
          <TabsTrigger value="pregnancy" className="data-[state=active]:bg-accent-ink">Pregnancy</TabsTrigger>
        </TabsList>
        <TabsContent value="cycle">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-4">
              <label className="block">
                <span className="text-small font-semibold text-ink-800">First day of last period</span>
                <input type="date" value={lastPeriod} onChange={(e) => e.target.value && setLastPeriod(e.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-line-strong px-3 focus:border-primary-500 focus:shadow-focus focus:outline-none" />
              </label>
              <label className="block">
                <span className="flex justify-between text-small font-semibold text-ink-800">Cycle length <span>{cycle} days</span></span>
                <input type="range" min={21} max={40} value={cycle} onChange={(e) => setCycle(+e.target.value)} className="mt-1 h-11 w-full accent-[var(--accent)]" />
              </label>
              <Stat label="Next period expected" value={formatDate(nextPeriod.toISOString(), { day: "numeric", month: "short" })} hint="Estimates vary — cycles of 21–35 days are normal" />
            </div>
            <div>
              <div className="grid grid-cols-7 gap-1.5" role="list" aria-label="Cycle calendar, next 35 days">
                {days.map(({ d, kind, ovulation }) => (
                  <div key={d.toISOString()} role="listitem" aria-label={`${d.toDateString()}${kind === "period" ? ", period" : kind === "fertile" ? ", fertile window" : ""}${ovulation ? ", likely ovulation" : ""}`} className={cn("flex aspect-square flex-col items-center justify-center rounded-lg text-caption font-semibold", kind === "period" ? "bg-accent-ink text-white" : kind === "fertile" ? "bg-accent-tint text-accent" : "bg-subtle text-ink-600", ovulation && "ring-2 ring-[color:var(--accent)]")}>
                    {d.getDate()}
                  </div>
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-4 text-caption text-ink-600" aria-hidden="true">
                <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-accent-ink" />Period</li>
                <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-accent-tint" />Fertile window</li>
                <li className="flex items-center gap-1.5"><span className="size-3 rounded ring-2 ring-[color:var(--accent)]" />Likely ovulation</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="pregnancy">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="block">
                <span className="flex justify-between text-small font-semibold text-ink-800">Week of pregnancy <span>Week {week}</span></span>
                <input type="range" min={4} max={40} value={week} onChange={(e) => setWeek(+e.target.value)} className="mt-1 h-11 w-full accent-[var(--accent)]" />
              </label>
              <div className="mt-3 rounded-xl bg-accent-tint/60 p-4" aria-live="polite">
                <p className="text-small text-ink-600">Trimester {week < 14 ? 1 : week < 28 ? 2 : 3}</p>
                <p className="mt-1 text-h3 font-bold">Your baby is about the size of {size.size}</p>
                <p className="text-small text-ink-600">Approx. {size.cm}</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-ink-900">Check-ups for this stage</p>
              <ul className="mt-2 space-y-2">
                {checkups(week).map((c) => <li key={c} className="flex items-center gap-2 text-small text-ink-700"><Clock className="size-4 text-accent" aria-hidden="true" />{c}</li>)}
              </ul>
              <ButtonLink to="/appointments/book?specialty=womens-health&reason=Antenatal%20visit" size="sm" className="mt-4">Book antenatal visit</ButtonLink>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============================================================= Child care */
const vaccines = [
  { age: "Birth", items: ["BCG", "OPV-0", "Hepatitis B-1"], status: "done" },
  { age: "6 weeks", items: ["DTwP/DTaP-1", "IPV-1", "Hib-1", "Rotavirus-1", "PCV-1"], status: "done" },
  { age: "10 weeks", items: ["DTwP/DTaP-2", "IPV-2", "Hib-2", "Rotavirus-2"], status: "done" },
  { age: "14 weeks", items: ["DTwP/DTaP-3", "IPV-3", "Hib-3", "PCV-2"], status: "done" },
  { age: "9 months", items: ["MMR-1", "Typhoid conjugate"], status: "done" },
  { age: "12 months", items: ["Hepatitis A-1", "PCV booster"], status: "due" },
  { age: "15 months", items: ["MMR-2", "Varicella-1"], status: "upcoming" },
  { age: "18 months", items: ["DTwP/DTaP booster-1", "Hib booster", "IPV booster"], status: "upcoming" },
] as const;

export function ChildGrowth() {
  const months = ["Birth", "2m", "4m", "6m", "9m", "12m"];
  return (
    <ModuleGrid>
      <ModuleCard title="Vaccination schedule" subtitle="Aarav · 12 months · based on IAP recommendations">
        <ol className="space-y-2">
          {vaccines.map((v) => (
            <li key={v.age} className={cn("flex items-start gap-3 rounded-xl border p-3", v.status === "due" ? "border-[color:var(--accent)] bg-accent-tint/50" : "border-line")}>
              {v.status === "done" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success-700" aria-hidden="true" /> : v.status === "due" ? <Clock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" /> : <Circle className="mt-0.5 size-5 shrink-0 text-ink-300" aria-hidden="true" />}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">{v.age}<span className={cn("rounded-full px-2 py-0.5 text-caption", v.status === "done" ? "bg-success-50 text-success-700" : v.status === "due" ? "bg-accent text-white" : "bg-subtle text-ink-600")}>{v.status === "done" ? "Given" : v.status === "due" ? "Due now" : "Upcoming"}</span></p>
                <p className="text-small text-ink-600">{v.items.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ol>
        <ButtonLink to="/appointments/book?specialty=child-care&reason=Vaccination%20(12%20months)" size="sm" className="mt-4 self-start">Book 12-month vaccines</ButtonLink>
      </ModuleCard>
      <ModuleCard title="Growth tracking" subtitle="Weight-for-age · plotted against the WHO median">
        <LineChart
          title="Child weight in kilograms compared with WHO median"
          labels={months}
          series={[
            { name: "Aarav", values: [3.2, 5.4, 6.9, 7.8, 8.7, 9.5] },
            { name: "WHO median", values: [3.3, 5.6, 7.0, 7.9, 8.9, 9.6] },
          ]}
          format={(v) => `${v} kg`}
          height={200}
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Weight" value="9.5 kg" hint="48th percentile" />
          <Stat label="Height" value="75 cm" hint="52nd percentile" />
          <Stat label="Head" value="46 cm" hint="On track" />
        </div>
      </ModuleCard>
    </ModuleGrid>
  );
}
