import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Baby,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  HeartHandshake,
  HeartPulse,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Share2,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { symptoms, symptomAreas, type SymptomEntry } from "@/data/symptoms";
import { specialtyMap, toneStyle } from "@/data/specialties";
import { doctorsBySpecialty } from "@/data/doctors";
import { hospitals } from "@/data/hospitals";
import { currentPatient } from "@/data/patient";
import { DoctorMiniCard } from "@/components/doctors/DoctorCard";
import { Disclaimer, EmptyState, Field, IconTile, Input, SearchBar, SectionHeader, Select, SmartImage, Textarea } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/overlays";
import { Logo } from "@/components/ui/Logo";
import { useAppState } from "@/lib/store";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn, imageSrc, imageSrcSet } from "@/lib/utils";

/* =========================================================================
   Symptom checker → care pathway
   ========================================================================= */
const durations = ["Today", "A few days", "1–4 weeks", "Over a month"];
const SAME_DAY = ["chest-pain", "breathless", "dizziness", "child-fever"];

export function SymptomsPage() {
  useDocumentTitle("Find my care");
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [area, setArea] = useState<string>("");
  const [selected, setSelected] = useState<string[]>(() => (params.get("s") ? [params.get("s")!] : []));
  const [duration, setDuration] = useState("A few days");
  const [severity, setSeverity] = useState(4);

  const list = useMemo(() => {
    const s = q.toLowerCase().trim();
    return symptoms.filter((x) => (!area || x.area === area) && (!s || x.label.toLowerCase().includes(s) || x.keywords.some((k) => k.includes(s) || s.includes(k))));
  }, [q, area]);
  const picked = symptoms.filter((s) => selected.includes(s.id));
  const result = useMemo(() => {
    if (!picked.length) return null;
    const counts = new Map<string, number>();
    picked.forEach((p) => counts.set(p.specialty, (counts.get(p.specialty) ?? 0) + 1));
    const slug = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0] as SymptomEntry["specialty"];
    const flags = picked.flatMap((p) => p.redFlags ?? []);
    // Time-sensitive symptoms are never graded "routine", whatever the slider says.
    const sameDay = picked.some((p) => SAME_DAY.includes(p.id));
    const urgency = severity >= 8 || sameDay ? "urgent" : severity >= 5 || duration === "Over a month" || flags.length > 0 ? "soon" : "routine";
    return { spec: specialtyMap[slug], pathway: picked.find((p) => p.specialty === slug)!.pathway, flags, urgency };
  }, [picked, severity, duration]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-8 max-w-3xl">
        <p className="t-eyebrow text-primary-700">Find my care</p>
        <h1 className="t-h1 mt-1">What brings you here today?</h1>
        <p className="mt-2 text-lead text-ink-600">Choose what you're experiencing. We'll suggest the right specialty and care pathway — then you decide what to do next.</p>
      </header>

      <div className="mb-6 rounded-2xl border border-danger-100 bg-danger-50 p-4 sm:flex sm:items-center sm:gap-4">
        <Siren className="mb-2 size-6 shrink-0 text-danger-600 sm:mb-0" aria-hidden="true" />
        <p className="flex-1 text-small text-ink-700"><strong className="text-danger-700">Emergency?</strong> Chest pain, trouble breathing, stroke signs, severe bleeding or loss of consciousness — don't wait. Call 108 now.</p>
        <a href="tel:108" className="mt-3 inline-flex h-11 items-center gap-2 rounded-md bg-danger-600 px-4 font-semibold text-white hover:bg-danger-700 sm:mt-0"><Phone className="size-4" aria-hidden="true" />Call 108</a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="card p-5 sm:p-6" aria-labelledby="pick">
          <h2 id="pick" className="t-h3">1. Select your symptoms</h2>
          <SearchBar value={q} onChange={setQ} placeholder="Type a symptom, e.g. back pain" label="Search symptoms" className="mt-4" />
          <div className="scrollbar-none -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Body area">
            {["", ...symptomAreas].map((a) => (
              <button key={a || "all"} aria-pressed={area === a} onClick={() => setArea(a)} className={cn("min-h-9 shrink-0 rounded-full border px-3.5 text-small font-semibold", area === a ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-600 hover:border-line-strong")}>{a || "All areas"}</button>
            ))}
          </div>
          {list.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Symptoms">
              {list.map((s) => {
                const on = selected.includes(s.id);
                return (
                  <li key={s.id}>
                    <label style={toneStyle(s.specialty)} className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5", on ? "border-[color:var(--accent)] bg-accent-tint" : "border-line hover:border-line-strong")}>
                      <input type="checkbox" checked={on} onChange={() => toggle(s.id)} className="size-4.5 accent-[var(--accent)]" />
                      <span className="min-w-0"><span className="block text-small font-semibold text-ink-900">{s.label}</span><span className="block text-caption text-ink-500">{s.area}</span></span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState className="mt-4" title="We couldn't match that" description="Try a simpler word, or browse by body area. You can also speak to a general physician." action={<ButtonLink to="/doctors" variant="secondary">Talk to a doctor</ButtonLink>} />
          )}

          <h2 className="t-h3 mt-8">2. Tell us a little more</h2>
          <fieldset className="mt-3">
            <legend className="mb-2 text-small font-semibold text-ink-800">How long has this been going on?</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {durations.map((d) => <button key={d} aria-pressed={duration === d} onClick={() => setDuration(d)} className={cn("min-h-11 rounded-lg border text-small font-semibold", duration === d ? "border-primary-600 bg-primary-50 text-primary-700" : "border-line text-ink-600 hover:border-line-strong")}>{d}</button>)}
            </div>
          </fieldset>
          <label className="mt-4 block">
            <span className="flex justify-between text-small font-semibold text-ink-800">How much is it affecting you? <span className="tabular-nums">{severity}/10</span></span>
            <input type="range" min={0} max={10} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="mt-1 h-11 w-full accent-primary-600" aria-valuetext={`${severity} out of 10`} />
          </label>
        </section>

        <section className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="result" aria-live="polite">
          {!result ? (
            <div className="card flex flex-col items-center p-8 text-center">
              <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"><Compass className="size-7" aria-hidden="true" /></span>
              <h2 id="result" className="t-h3 mt-4">Your care pathway will appear here</h2>
              <p className="mt-1 text-small text-ink-500">Select one or more symptoms to get started.</p>
            </div>
          ) : (
            <div className="card overflow-hidden" style={toneStyle(result.spec.slug)}>
              <div className="bg-accent-tint/70 p-5 sm:p-6">
                <p className="text-small font-semibold text-ink-600">Suggested care</p>
                <h2 id="result" className="mt-1 flex items-center gap-3 t-h2"><IconTile icon={result.spec.icon} className="bg-white" />{result.spec.name}</h2>
                <p className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-small font-semibold", result.urgency === "urgent" ? "bg-danger-50 text-danger-700" : result.urgency === "soon" ? "bg-warning-50 text-warning-700" : "bg-success-50 text-success-700")}>
                  <Clock className="size-4" aria-hidden="true" />{result.urgency === "urgent" ? "Get care today" : result.urgency === "soon" ? "See a specialist within a few days" : "Book a routine consultation"}
                </p>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                {result.flags.length > 0 && (
                  <div className="rounded-xl border border-danger-100 bg-danger-50 p-4">
                    <p className="flex items-center gap-2 font-bold text-danger-700"><AlertTriangle className="size-4.5" aria-hidden="true" />Seek emergency care if you have:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-small text-ink-700">{result.flags.map((f) => <li key={f}>{f}</li>)}</ul>
                  </div>
                )}
                <div>
                  <p className="mb-3 font-bold">Your care pathway</p>
                  <ol className="space-y-3">
                    {result.pathway.map((p, i) => (
                      <li key={p} className="flex items-center gap-3"><span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-tint text-small font-bold text-accent">{i + 1}</span><span className="text-small font-semibold text-ink-800">{p}</span></li>
                    ))}
                  </ol>
                </div>
                <div className="space-y-2">
                  {doctorsBySpecialty(result.spec.slug).slice(0, 2).map((d) => <DoctorMiniCard key={d.id} doctor={d} />)}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ButtonLink to={`/appointments/book?specialty=${result.spec.slug}&reason=${encodeURIComponent(picked.map((p) => p.label).join(", "))}`} variant="accent">Book consultation</ButtonLink>
                  <ButtonLink to={`/specialties/${result.spec.slug}`} variant="outline">Explore {result.spec.shortName} care</ButtonLink>
                </div>
                <Disclaimer>This tool offers general guidance, not a diagnosis. If you feel very unwell, seek medical care immediately.</Disclaimer>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================================
   Emergency
   ========================================================================= */
const departments = [
  { name: "Chest pain unit", text: "Heart attack & cardiac emergencies", icon: HeartPulse },
  { name: "Stroke unit", text: "Clot-busting care within the golden hour", icon: Brain },
  { name: "Trauma & accident", text: "Injuries, fractures and burns", icon: Ambulance },
  { name: "Paediatric emergency", text: "Child-friendly 24/7 care", icon: Baby },
  { name: "Maternity emergency", text: "Pregnancy bleeding or pain", icon: HeartHandshake },
  { name: "Poison & allergy", text: "Severe reactions and overdoses", icon: AlertTriangle },
];
const firstAid = [
  { q: "Chest pain", a: "Call 108. Help the person sit down and stay calm. If they are not allergic and a doctor has not advised against it, they may chew one regular aspirin (300 mg). Do not let them walk around." },
  { q: "Stroke (BE FAST)", a: "Note the time symptoms started. Call 108 immediately. Do not give food, drink or medication. Keep them comfortable and lying on their side if drowsy." },
  { q: "Heavy bleeding", a: "Press firmly on the wound with a clean cloth and keep pressure. Raise the injured part if possible. Call 108 if bleeding doesn't stop." },
  { q: "Burns", a: "Cool the burn under cool (not icy) running water for 20 minutes. Remove jewellery nearby. Cover loosely with cling film. Don't apply butter or toothpaste." },
];

export function EmergencyPage() {
  useDocumentTitle("Emergency help");
  const { toast } = useToast();
  const [locating, setLocating] = useState(false);
  const erHospitals = hospitals.filter((h) => h.emergency24x7).sort((a, b) => a.distanceKm - b.distanceKm);

  const shareLocation = () => {
    setLocating(true);
    const done = (text: string) => { setLocating(false); toast({ title: "Location shared", description: text }); };
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => done(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} sent to ${currentPatient.emergencyContacts[0].name} (demo).`),
        () => done(`Approximate location (Chennai) sent to ${currentPatient.emergencyContacts[0].name} (demo).`),
        { timeout: 4000 },
      );
    } else done("Approximate location sent (demo).");
  };

  return (
    <div>
      <section className="bg-gradient-to-b from-danger-50 to-canvas" aria-labelledby="em-h">
        <div className="container-page py-8 sm:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-small font-semibold text-danger-700 shadow-xs"><Siren className="size-4" aria-hidden="true" />Emergency Help · 24/7</p>
              <h1 id="em-h" className="t-h1 mt-4">Help is on the way. Stay calm.</h1>
              <p className="mt-2 max-w-xl text-lead text-ink-600">If someone's life is in danger, call an ambulance first. Then share your location so family and the hospital can find you.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a href="tel:108" className="flex min-h-16 items-center gap-3 rounded-2xl bg-danger-600 px-5 text-white shadow-[0_10px_24px_-10px_rgb(201_47_60/0.6)] hover:bg-danger-700">
                  <Ambulance className="size-7" aria-hidden="true" />
                  <span><span className="block text-lead font-bold">Call Emergency 108</span><span className="block text-small text-danger-100">Ambulance · free · 24/7</span></span>
                </a>
                <a href="tel:112" className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-danger-500 bg-white px-5 text-danger-700 hover:bg-danger-50">
                  <Phone className="size-6" aria-hidden="true" />
                  <span><span className="block text-lead font-bold">Call 112</span><span className="block text-small text-ink-600">National emergency number</span></span>
                </a>
              </div>
              <Button variant="outline" size="lg" className="mt-3 w-full sm:w-auto" onClick={shareLocation} loading={locating}>
                <Share2 className="size-5" aria-hidden="true" />Share my location
              </Button>
            </div>
            <div className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-b from-white to-danger-50 lg:block">
              <img src={imageSrc("caring-hands", 1024)} srcSet={imageSrcSet("caring-hands")} sizes="40vw" alt="A doctor holding a patient's hand reassuringly" width={1536} height={1024} className="absolute inset-0 size-full object-cover object-[60%_60%]" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page space-y-12 py-10">
        <section aria-labelledby="near">
          <SectionHeader id="near" title="Nearby hospitals with emergency care" subtitle="Sorted by distance. Wait times are live estimates (demo)." />
          <ul className="grid gap-3 md:grid-cols-2">
            {erHospitals.map((h) => (
              <li key={h.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <Link to={`/hospitals/${h.id}`} className="font-bold text-ink-900 hover:text-primary-700">{h.name}</Link>
                  <p className="text-small text-ink-500">{h.area}, {h.city} · {h.distanceKm} km</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-small font-semibold text-success-700"><Clock className="size-4" aria-hidden="true" />ER wait ~{h.erWaitMinutes} min</p>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${h.emergencyPhone.replace(/\s/g, "")}`} className="inline-flex h-11 items-center gap-1.5 rounded-md bg-danger-50 px-3.5 text-small font-semibold text-danger-700 hover:bg-danger-100"><Phone className="size-4" aria-hidden="true" />Call ER</a>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(h.address)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-1.5 rounded-md border border-line-strong px-3.5 text-small font-semibold text-ink-800 hover:bg-subtle"><Navigation className="size-4" aria-hidden="true" />Directions<span className="sr-only"> (opens in new tab)</span></a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="depts">
            <SectionHeader id="depts" title="Emergency departments" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {departments.map(({ name, text, icon: Icon }) => (
                <li key={name} className="card flex gap-3 p-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-600"><Icon className="size-5" aria-hidden="true" /></span>
                  <span><span className="block font-semibold">{name}</span><span className="block text-small text-ink-500">{text}</span></span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="contacts">
            <SectionHeader id="contacts" title="Emergency contacts" action={{ label: "Manage", to: "/profile" }} />
            <ul className="space-y-3">
              {currentPatient.emergencyContacts.map((c) => (
                <li key={c.name} className="card flex items-center gap-3 p-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary-50 font-bold text-primary-700" aria-hidden="true">{c.name.split(" ").map((x) => x[0]).join("")}</span>
                  <span className="flex-1"><span className="block font-semibold">{c.name}</span><span className="block text-small text-ink-500">{c.relation} · {c.phone}</span></span>
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex size-11 items-center justify-center rounded-full bg-success-50 text-success-700 hover:bg-success-500 hover:text-white" aria-label={`Call ${c.name}`}><Phone className="size-5" aria-hidden="true" /></a>
                </li>
              ))}
            </ul>
            <div className="card mt-4 p-4 text-small">
              <p className="font-semibold">Medical ID</p>
              <p className="mt-1 text-ink-600">Blood group <strong>{currentPatient.bloodGroup}</strong> · Allergies: <strong className="text-danger-700">{currentPatient.allergies.join(", ")}</strong></p>
            </div>
          </section>
        </div>

        <section aria-labelledby="fa">
          <SectionHeader id="fa" title="First aid while you wait" subtitle="Basic guidance. Always follow instructions from emergency services." />
          <div className="grid gap-3 md:grid-cols-2">
            {firstAid.map((f) => (
              <details key={f.q} className="group card [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold">{f.q}<ChevronDown className="size-5 text-ink-400 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
                <p className="px-5 pb-5 text-ink-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================================
   About
   ========================================================================= */
export function AboutPage() {
  useDocumentTitle("About");
  const values = [
    { icon: Compass, title: "Specialty-first", text: "Care organised around how each specialty actually works — its tests, treatments and journey." },
    { icon: Activity, title: "The whole journey", text: "From first symptom to long-term follow-up, every step lives in one timeline." },
    { icon: ShieldCheck, title: "Private by design", text: "You control who sees your records. Every access is logged and visible to you." },
    { icon: Users, title: "Human first", text: "Care navigators, clear language and accessible design for every patient." },
  ];
  return (
    <div>
      <section className="bg-gradient-to-b from-primary-25 to-canvas">
        <div className="container-page grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-2">
          <div>
            <p className="t-eyebrow text-primary-700">About HealthSphere</p>
            <h1 className="t-display mt-2">Specialized Care. For Every Part of You.</h1>
            <p className="mt-4 max-w-xl text-lead text-ink-600">We started HealthSphere because finding care shouldn't feel like navigating a maze. Patients deserve to understand their whole journey — not just book the next appointment.</p>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl shadow-raised">
            <SmartImage image={{ name: "family-healthcare-patient-care", alt: "A doctor caring for a family with a young child", focus: "30% 40%" }} priority sizes="(min-width:1024px) 50vw, 100vw" className="absolute inset-0 size-full" />
          </div>
        </div>
      </section>
      <div className="container-page space-y-16 py-12">
        <section aria-labelledby="vals">
          <SectionHeader id="vals" title="What we believe" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card p-6"><span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="size-6" aria-hidden="true" /></span><h3 className="mt-4 t-h3">{title}</h3><p className="mt-1 text-small text-ink-500">{text}</p></li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="team" className="grid items-center gap-8 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            {[{ n: "doctor-male-portrait", name: "Dr. Arjun Mehta", role: "Chief Medical Officer" }, { n: "doctor-female-portrait", name: "Dr. Ananya Sharma", role: "Head of Clinical Experience" }].map((t) => (
              <figure key={t.n} className="card overflow-hidden">
                <div className="aspect-square bg-gradient-to-b from-primary-50 to-primary-100"><img src={`/images/${t.n}-avatar-320.webp`} alt={t.name} width={320} height={320} loading="lazy" className="size-full object-cover object-top" /></div>
                <figcaption className="p-4"><p className="font-bold">{t.name}</p><p className="text-small text-ink-500">{t.role}</p></figcaption>
              </figure>
            ))}
          </div>
          <div>
            <h2 id="team" className="t-h1">Led by clinicians</h2>
            <p className="mt-3 text-ink-600">Our clinical leadership reviews every care pathway, specialty module and Health Library article. Technology serves the doctor–patient relationship, never replaces it.</p>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              {[["1M+", "Patients"], ["500+", "Doctors"], ["50+", "Specialties"], ["120", "Partner hospitals"]].map(([v, l]) => <div key={l} className="card p-4"><dt className="text-small text-ink-500">{l}</dt><dd className="text-[1.75rem] font-bold">{v}</dd></div>)}
            </dl>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3" aria-label="Policies">
          {[{ id: "privacy", icon: Lock, t: "Privacy", d: "Health data is encrypted in transit and at rest, never sold, and shared only with your explicit consent. This prototype uses mock data only." }, { id: "terms", icon: Sparkles, t: "Terms", d: "HealthSphere helps you find and coordinate care. It does not replace professional medical advice, diagnosis or emergency services." }, { id: "accessibility", icon: CheckCircle2, t: "Accessibility", d: "We design to WCAG 2.2 AA: keyboard navigation, screen-reader labels, readable type, sufficient contrast and reduced-motion support." }].map(({ id, icon: Icon, t, d }) => (
            <article key={id} id={id} className="card scroll-mt-24 p-6"><Icon className="size-6 text-primary-600" aria-hidden="true" /><h2 className="mt-3 t-h3">{t}</h2><p className="mt-1 text-small text-ink-600">{d}</p></article>
          ))}
        </section>
      </div>
    </div>
  );
}

/* =========================================================================
   Contact
   ========================================================================= */
export function ContactPage() {
  useDocumentTitle("Contact");
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "Appointments", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: "" })); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Enter a valid email address, e.g. name@example.com.";
    if (form.message.trim().length < 10) er.message = "Please write at least 10 characters so we can help.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSending(true);
    window.setTimeout(() => { setSending(false); setSent(true); }, 900);
  };
  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-8 max-w-2xl"><p className="t-eyebrow text-primary-700">Contact</p><h1 className="t-h1 mt-1">We're here to help</h1><p className="mt-2 text-lead text-ink-600">Questions about appointments, records or your care journey? Our care team usually replies within 2 hours.</p></header>
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="card p-5 sm:p-7" aria-labelledby="form-h">
          <h2 id="form-h" className="t-h3 mb-5">Send us a message</h2>
          {sent ? (
            <div className="py-8 text-center" role="status">
              <span className="mx-auto inline-flex size-16 animate-pop items-center justify-center rounded-full bg-success-50 text-success-700"><CheckCircle2 className="size-9" aria-hidden="true" /></span>
              <p className="mt-4 t-h3">Message received</p>
              <p className="mt-1 text-ink-600">Thanks, {form.name.split(" ")[0]}. Ticket #HS-{Math.floor(10000 + Math.random() * 89999)} — we'll reply to {form.email}.</p>
              <Button variant="outline" className="mt-5" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", topic: "Appointments", message: "" }); }}>Send another</Button>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.name}>{(p) => <Input {...p} value={form.name} onChange={set("name")} autoComplete="name" />}</Field>
              <Field label="Email" required error={errors.email}>{(p) => <Input {...p} type="email" value={form.email} onChange={set("email")} autoComplete="email" />}</Field>
              <Field label="Phone" hint="Optional">{(p) => <Input {...p} type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />}</Field>
              <Field label="Topic">{(p) => <Select {...p} value={form.topic} onChange={set("topic")}>{["Appointments", "Health records", "Billing & insurance", "Technical help", "Feedback", "Partnerships"].map((t) => <option key={t}>{t}</option>)}</Select>}</Field>
              <Field label="Message" required error={errors.message} className="sm:col-span-2" hint="Please don't include detailed medical information here.">{(p) => <Textarea {...p} rows={5} value={form.message} onChange={set("message")} />}</Field>
              <div className="sm:col-span-2"><Button type="submit" size="lg" loading={sending}>Send message</Button></div>
            </form>
          )}
        </section>
        <aside className="space-y-3" aria-label="Other ways to reach us">
          {[{ icon: Phone, t: "Care helpline", d: "1800 123 4567 · toll-free, 24/7", href: "tel:18001234567" }, { icon: Mail, t: "Email", d: "care@healthsphere.example", href: "mailto:care@healthsphere.example" }, { icon: MessageSquare, t: "WhatsApp", d: "+91 90000 12345 · 8 AM – 10 PM", href: "#" }, { icon: MapPin, t: "Head office", d: "Greams Road, Chennai 600006", href: "#" }].map(({ icon: Icon, t, d, href }) => (
            <a key={t} href={href} onClick={(e) => href === "#" && e.preventDefault()} className="card card-interactive flex items-center gap-4 p-4"><span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="size-5" aria-hidden="true" /></span><span><span className="block font-semibold">{t}</span><span className="block text-small text-ink-500">{d}</span></span></a>
          ))}
          <Link to="/emergency" className="flex items-center gap-4 rounded-xl border border-danger-100 bg-danger-50 p-4"><Siren className="size-6 text-danger-600" aria-hidden="true" /><span className="flex-1"><span className="block font-semibold text-danger-700">Medical emergency?</span><span className="block text-small text-ink-600">Don't wait for a reply — get emergency help.</span></span><ArrowRight className="size-5 text-danger-600" aria-hidden="true" /></Link>
        </aside>
      </div>
    </div>
  );
}

/* =========================================================================
   Auth (prototype)
   ========================================================================= */
function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-page grid min-h-[75vh] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <Logo className="mb-6" />
        <h1 className="t-h1">{title}</h1>
        <p className="mt-2 text-ink-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="relative hidden aspect-[4/3.2] overflow-hidden rounded-3xl bg-gradient-to-b from-primary-50 to-primary-100 lg:block">
        <img src={imageSrc("doctor-health-app", 1024)} srcSet={imageSrcSet("doctor-health-app")} sizes="45vw" alt="A doctor showing the HealthSphere app on her phone" width={1536} height={1024} className="absolute inset-0 size-full object-cover object-[55%_20%]" />
      </div>
    </div>
  );
}

export function LoginPage() {
  useDocumentTitle("Login");
  const { signIn } = useAppState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [id, setId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const finish = () => { signIn(); toast({ title: "Welcome back, Priya", description: "Signed in to the demo account." }); navigate(params.get("next") ?? "/"); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (!/^(\+?\d[\d\s]{9,14}|\S+@\S+\.\S+)$/.test(id.trim())) { setError("Enter a valid mobile number or email."); return; }
      setLoading(true);
      window.setTimeout(() => { setLoading(false); setOtpSent(true); setError(""); toast({ kind: "info", title: "OTP sent", description: "Demo: use any 6 digits." }); }, 700);
    } else {
      if (!/^\d{6}$/.test(otp)) { setError("Enter the 6-digit code."); return; }
      setLoading(true);
      window.setTimeout(finish, 600);
    }
  };
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your appointments, records and care journeys.">
      <form noValidate onSubmit={submit} className="space-y-4">
        <Field label="Mobile number or email" required error={!otpSent ? error : undefined}>{(p) => <Input {...p} value={id} onChange={(e) => { setId(e.target.value); setError(""); }} autoComplete="username" disabled={otpSent} />}</Field>
        {otpSent && <Field label="One-time code" required error={error} hint={`Sent to ${id}`}>{(p) => <Input {...p} value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} inputMode="numeric" autoComplete="one-time-code" autoFocus />}</Field>}
        <Button type="submit" size="lg" block loading={loading}>{otpSent ? "Verify & sign in" : "Send OTP"}</Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-caption text-ink-500"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <Button variant="outline" size="lg" block onClick={finish}>Continue with demo account</Button>
      <p className="mt-6 text-center text-small text-ink-600">New to HealthSphere? <Link to="/signup" className="font-semibold text-primary-700 underline">Create an account</Link></p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-caption text-ink-500"><Lock className="size-3.5" aria-hidden="true" />Prototype — no real accounts or data.</p>
    </AuthShell>
  );
}

export function SignupPage() {
  useDocumentTitle("Sign up");
  const { signIn } = useAppState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", phone: "", email: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Enter your full name.";
    if (!/^\+?\d[\d\s]{9,14}$/.test(f.phone.trim())) er.phone = "Enter a valid 10-digit mobile number.";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email or leave it blank.";
    if (!f.consent) er.consent = "Please accept the terms and privacy policy to continue.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    window.setTimeout(() => { signIn(); toast({ title: "Account created", description: "For this demo you're signed in to Priya's sample account." }); navigate("/"); }, 800);
  };
  return (
    <AuthShell title="Create your account" subtitle="One place for your specialists, records and care journeys.">
      <form noValidate onSubmit={submit} className="space-y-4">
        <Field label="Full name" required error={errors.name}>{(p) => <Input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />}</Field>
        <Field label="Mobile number" required error={errors.phone}>{(p) => <Input {...p} type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />}</Field>
        <Field label="Email" hint="Optional — for reports and receipts" error={errors.email}>{(p) => <Input {...p} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />}</Field>
        <label className="flex items-start gap-3 rounded-xl bg-subtle p-3.5">
          <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-0.5 size-4.5 shrink-0 accent-primary-600" aria-invalid={!!errors.consent || undefined} aria-describedby={errors.consent ? "consent-error" : undefined} />
          <span className="text-small text-ink-700">I agree to the <Link to="/about#terms" className="font-semibold text-primary-700 underline">Terms</Link> and <Link to="/about#privacy" className="font-semibold text-primary-700 underline">Privacy policy</Link>, and consent to HealthSphere storing my health information securely.</span>
        </label>
        {errors.consent && <p id="consent-error" role="alert" className="text-small font-medium text-danger-700">{errors.consent}</p>}
        <Button type="submit" size="lg" block loading={loading}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-small text-ink-600">Already have an account? <Link to="/login" className="font-semibold text-primary-700 underline">Login</Link></p>
    </AuthShell>
  );
}

/* =========================================================================
   404
   ========================================================================= */
export function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="container-page py-16">
      <EmptyState headingLevel="h1" icon={Stethoscope} title="We couldn't find that page" description="The link may be broken or the page may have moved." action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink to="/">Go home</ButtonLink><ButtonLink to="/symptoms" variant="outline">Find my care</ButtonLink></div>} />
    </div>
  );
}
