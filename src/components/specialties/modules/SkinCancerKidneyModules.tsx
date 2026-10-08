import { useState } from "react";
import { Droplet, GlassWater, Minus, Moon, Plus, Sun } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { ModuleCard, ModuleGrid } from "./ModuleCard";
import { cn } from "@/lib/utils";

/* ============================================================== Skin care */
const skinTypes = ["Oily", "Dry", "Combination", "Sensitive"] as const;
const concerns = ["Acne", "Pigmentation", "Dullness", "Redness", "Fine lines"] as const;
const routines: Record<(typeof skinTypes)[number], { am: string[]; pm: string[] }> = {
  Oily: { am: ["Gel cleanser", "Niacinamide serum", "Oil-free moisturiser", "SPF 50 gel sunscreen"], pm: ["Gel cleanser", "Salicylic acid (2–3×/week)", "Light moisturiser"] },
  Dry: { am: ["Cream cleanser", "Hyaluronic serum", "Ceramide moisturiser", "SPF 50 cream sunscreen"], pm: ["Cream cleanser", "Rich ceramide cream"] },
  Combination: { am: ["Gentle foaming cleanser", "Vitamin C serum", "Light moisturiser", "SPF 50 sunscreen"], pm: ["Gentle cleanser", "Retinoid (start 2×/week)", "Moisturiser"] },
  Sensitive: { am: ["Soap-free cleanser", "Fragrance-free moisturiser", "Mineral SPF 50"], pm: ["Soap-free cleanser", "Barrier repair cream"] },
};

export function SkinProfile() {
  const [type, setType] = useState<(typeof skinTypes)[number]>("Combination");
  const [picked, setPicked] = useState<string[]>(["Pigmentation"]);
  const r = routines[type];
  return (
    <ModuleGrid>
      <ModuleCard title="Your skin profile" subtitle="Build a gentle, dermatologist-style starting routine.">
        <p className="text-small font-semibold text-ink-800" id="stype">Skin type</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-labelledby="stype">
          {skinTypes.map((t) => (
            <button key={t} role="radio" aria-checked={type === t} onClick={() => setType(t)} className={cn("min-h-11 rounded-lg border text-small font-semibold", type === t ? "border-[color:var(--accent)] bg-accent-tint text-accent" : "border-line text-ink-600 hover:border-line-strong")}>{t}</button>
          ))}
        </div>
        <p className="mt-4 text-small font-semibold text-ink-800" id="sconc">Main concerns</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="sconc">
          {concerns.map((c) => {
            const on = picked.includes(c);
            return (
              <button key={c} aria-pressed={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== c) : [...p, c]))} className={cn("min-h-9 rounded-full border px-3 text-small font-medium", on ? "border-[color:var(--accent)] bg-accent-tint text-accent" : "border-line text-ink-600")}>{c}</button>
            );
          })}
        </div>
      </ModuleCard>
      <ModuleCard title={`${type} skin routine`} subtitle={picked.length ? `With extra care for ${picked.join(", ").toLowerCase()}` : "Basic routine"}>
        <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
          {[{ k: "Morning", i: Sun, items: r.am }, { k: "Evening", i: Moon, items: r.pm }].map(({ k, i: Icon, items }) => (
            <div key={k} className="rounded-xl border border-line p-4">
              <p className="flex items-center gap-2 font-bold"><Icon className="size-4.5 text-accent" aria-hidden="true" />{k}</p>
              <ol className="mt-2 space-y-1.5 text-small text-ink-700">
                {items.map((x, n) => <li key={x} className="flex gap-2"><span className="font-bold text-accent">{n + 1}.</span>{x}</li>)}
              </ol>
            </div>
          ))}
        </div>
        <p className="mt-3 text-caption text-ink-500">General guidance only. Patch-test new products. Persistent acne or pigmentation deserves a dermatologist's review.</p>
        <ButtonLink to={`/appointments/book?specialty=skin-care&reason=${encodeURIComponent(picked[0] ?? "Skin examination")}`} size="sm" className="mt-3 self-start">Book skin examination</ButtonLink>
      </ModuleCard>
    </ModuleGrid>
  );
}

/* ============================================================ Cancer care */
const modalities = [
  { id: "chemo", label: "Chemotherapy", what: "Medicines that destroy or slow cancer cells, usually given as day-care infusions in cycles every 2–3 weeks.", expect: ["Each session takes 2–6 hours in a comfortable day-care suite", "Blood tests before every cycle", "Nausea is well controlled with modern medicines", "Your care navigator coordinates every cycle"] },
  { id: "radiation", label: "Radiation", what: "Precisely targeted high-energy beams that treat cancer while sparing healthy tissue (IMRT, IGRT, SRS).", expect: ["Short daily sessions (10–20 min), Monday to Friday", "Painless — like an X-ray", "Skin care and fatigue support provided", "Weekly review with your radiation oncologist"] },
  { id: "surgery", label: "Surgery", what: "Removal of the tumour, often with minimally invasive or robotic techniques and organ-preserving approaches.", expect: ["Pre-surgery planning at the tumour board", "Enhanced recovery protocols", "Pathology report guides next steps", "Rehabilitation from day one"] },
  { id: "immuno", label: "Immunotherapy", what: "Treatments that help your own immune system recognise and fight cancer cells, for selected cancers.", expect: ["Given as infusions every 3–6 weeks", "Biomarker testing decides suitability", "Side-effects differ from chemotherapy", "Close monitoring by your oncologist"] },
];
const screenings = [
  { test: "Cervical (Pap / HPV)", who: "Women 25–65", how: "Every 3–5 years" },
  { test: "Breast (mammogram)", who: "Women from 40", how: "Every 1–2 years" },
  { test: "Colorectal (FIT / colonoscopy)", who: "Adults from 45", how: "FIT yearly or colonoscopy every 10 years" },
  { test: "Oral cancer check", who: "Tobacco users", how: "Yearly" },
  { test: "Lung (low-dose CT)", who: "Heavy smokers 50–80", how: "Yearly, after discussion" },
];

export function OncologyPlan() {
  return (
    <ModuleGrid>
      <ModuleCard title="Understanding treatment" subtitle="Your plan is agreed by a multidisciplinary tumour board.">
        <Tabs defaultValue="chemo">
          <TabsList aria-label="Treatment types" className="mb-4">
            {modalities.map((m) => <TabsTrigger key={m.id} value={m.id} className="data-[state=active]:bg-accent-ink">{m.label}</TabsTrigger>)}
          </TabsList>
          {modalities.map((m) => (
            <TabsContent key={m.id} value={m.id}>
              <p className="text-small text-ink-700">{m.what}</p>
              <p className="mt-3 text-small font-semibold text-ink-900">What to expect</p>
              <ul className="mt-1.5 space-y-1.5 text-small text-ink-700">
                {m.expect.map((e) => <li key={e} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />{e}</li>)}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </ModuleCard>
      <ModuleCard title="Screening guide" subtitle="Early detection makes treatment simpler. Discuss timing with your doctor.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-small">
            <caption className="sr-only">Recommended cancer screenings</caption>
            <thead><tr className="text-ink-500"><th scope="col" className="pb-2 font-semibold">Screening</th><th scope="col" className="pb-2 font-semibold">Who</th><th scope="col" className="pb-2 font-semibold">How often</th></tr></thead>
            <tbody>
              {screenings.map((s) => (
                <tr key={s.test} className="border-t border-line"><th scope="row" className="py-2.5 pr-3 font-semibold text-ink-900">{s.test}</th><td className="py-2.5 pr-3 text-ink-600">{s.who}</td><td className="py-2.5 text-ink-600">{s.how}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <ButtonLink to="/appointments/book?specialty=cancer-care&reason=Cancer%20screening" size="sm" variant="secondary" className="mt-4 self-start">Book a screening consult</ButtonLink>
      </ModuleCard>
    </ModuleGrid>
  );
}

/* ======================================================== Kidney & Urology */
const stages = [
  { s: "1", range: "≥ 90", label: "Normal" },
  { s: "2", range: "60–89", label: "Mild" },
  { s: "3", range: "30–59", label: "Moderate" },
  { s: "4", range: "15–29", label: "Severe" },
  { s: "5", range: "< 15", label: "Kidney failure" },
];
export function KidneyFunction() {
  const [glasses, setGlasses] = useState(5);
  const goal = 10;
  const egfr = 96;
  return (
    <ModuleGrid>
      <ModuleCard title="Kidney function (eGFR)" subtitle="Example result · higher is better">
        <p className="flex items-baseline gap-2"><span className="text-[2.5rem] leading-none font-bold tracking-tight">{egfr}</span><span className="text-small text-ink-500">mL/min/1.73m² · Stage 1 (normal)</span></p>
        <ol className="mt-5 grid grid-cols-5 gap-1" aria-label="CKD stages">
          {stages.map((st, i) => (
            <li key={st.s} className="text-center">
              <div className={cn("h-2.5 rounded-full", i === 0 ? "bg-accent" : "bg-accent-tint")} aria-hidden="true" />
              <p className={cn("mt-1.5 text-caption font-bold", i === 0 ? "text-accent" : "text-ink-600")}>Stage {st.s}{i === 0 && <span className="sr-only"> (your result)</span>}</p>
              <p className="text-[0.6875rem] text-ink-500">{st.range}</p>
              <p className="text-[0.6875rem] text-ink-500">{st.label}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-small text-ink-600">Creatinine 0.8 mg/dL · Urine albumin normal. Diabetes and high BP are the top causes of kidney disease — yearly tests are recommended if you have either.</p>
      </ModuleCard>
      <ModuleCard title="Hydration tracker" subtitle="Helps prevent kidney stones (unless your doctor advised fluid limits).">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setGlasses((g) => Math.max(0, g - 1))} aria-label="Remove a glass"><Minus className="size-5" aria-hidden="true" /></Button>
          <div className="flex-1 text-center" aria-live="polite">
            <p className="text-[2rem] leading-none font-bold tabular-nums">{glasses}<span className="text-body font-medium text-ink-500"> / {goal}</span></p>
            <p className="text-small text-ink-500">glasses today (~{(glasses * 0.25).toFixed(1)} L)</p>
          </div>
          <Button size="icon" onClick={() => setGlasses((g) => Math.min(20, g + 1))} aria-label="Add a glass" variant="accent"><Plus className="size-5" aria-hidden="true" /></Button>
        </div>
        <div className="mt-5 grid grid-cols-10 gap-1.5" aria-hidden="true">
          {Array.from({ length: goal }).map((_, i) => (
            <GlassWater key={i} className={cn("size-full max-h-8 transition-colors", i < glasses ? "text-accent" : "text-ink-300")} strokeWidth={1.75} />
          ))}
        </div>
        {glasses >= goal && <p className="mt-3 flex items-center gap-2 text-small font-semibold text-success-700"><Droplet className="size-4" aria-hidden="true" />Daily goal reached — great job!</p>}
      </ModuleCard>
    </ModuleGrid>
  );
}
