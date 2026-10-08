import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Ambulance,
  Award,
  BadgeCheck,
  Building2,
  CalendarCheck2,
  Clock,
  GraduationCap,
  Languages,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Stethoscope,
  Users,
  Video,
  X,
} from "lucide-react";
import { doctors, getDoctor, allLanguages } from "@/data/doctors";
import { getHospital, hospitals } from "@/data/hospitals";
import { specialties, specialtyMap, toneStyle } from "@/data/specialties";
import { DoctorCard, DoctorMiniCard, availabilityLabel } from "@/components/doctors/DoctorCard";
import { HospitalCard } from "@/components/health/HospitalCard";
import { SlotPicker } from "@/components/appointments/SlotPicker";
import { Avatar, EmptyState, ErrorState, LoadingState, Rating, SearchBar, SectionHeader, Select, SmartImage, IconTile } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { useSimulatedQuery } from "@/hooks/useSimulatedQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getIcon } from "@/lib/icons";
import { TODAY, cn, formatDate, formatINR, istDay } from "@/lib/utils";
import { Breadcrumbs } from "./specialties";
import { NotFoundPage } from "./public";
import type { ConsultationType, Doctor } from "@/types";

/* =========================================================================
   Doctor discovery
   ========================================================================= */

type SortKey = "relevance" | "rating" | "experience" | "fee" | "soonest";

function useDoctorFilters() {
  const [params, setParams] = useSearchParams();
  const get = (k: string) => params.get(k) ?? "";
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k === "specialty") next.delete("sub");
    setParams(next, { replace: true });
  };
  const clear = () => setParams(new URLSearchParams(params.get("q") ? { q: params.get("q")! } : {}), { replace: true });
  return { get, set, clear, params };
}

function FilterFields({ f }: { f: ReturnType<typeof useDoctorFilters> }) {
  const spec = f.get("specialty");
  const subs = Array.from(new Set(doctors.filter((d) => !spec || d.specialty === spec).map((d) => d.subSpecialty))).sort();
  const field = "flex flex-col gap-1.5";
  const lbl = "text-small font-semibold text-ink-800";
  return (
    <div className="space-y-5">
      <label className={field}>
        <span className={lbl}>Specialty</span>
        <Select value={spec} onChange={(e) => f.set("specialty", e.target.value)}>
          <option value="">All specialties</option>
          {specialties.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </Select>
      </label>
      <label className={field}>
        <span className={lbl}>Sub-specialty</span>
        <Select value={f.get("sub")} onChange={(e) => f.set("sub", e.target.value)}>
          <option value="">Any</option>
          {subs.map((s) => <option key={s}>{s}</option>)}
        </Select>
      </label>
      <fieldset>
        <legend className={cn(lbl, "mb-2")}>Experience</legend>
        <div className="grid grid-cols-4 gap-1.5">
          {[["", "Any"], ["5", "5+"], ["10", "10+"], ["15", "15+"]].map(([v, l]) => (
            <button key={l} type="button" aria-pressed={f.get("exp") === v} onClick={() => f.set("exp", v)} className={cn("h-10 rounded-lg border text-small font-semibold", f.get("exp") === v ? "border-primary-600 bg-primary-50 text-primary-700" : "border-line text-ink-600 hover:border-line-strong")}>{l}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={cn(lbl, "mb-2")}>Consultation type</legend>
        <div className="space-y-1">
          {([["", "Any"], ["in-person", "In-person"], ["video", "Video consultation"], ["home-visit", "Home visit"]] as const).map(([v, l]) => (
            <label key={l} className="flex min-h-10 cursor-pointer items-center gap-2.5 text-small text-ink-700">
              <input type="radio" name="ctype" checked={f.get("type") === v} onChange={() => f.set("type", v)} className="size-4.5 accent-primary-600" /> {l}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={cn(lbl, "mb-2")}>Availability</legend>
        <div className="grid grid-cols-3 gap-1.5">
          {[["", "Any"], ["today", "Today"], ["tomorrow", "Tomorrow"]].map(([v, l]) => (
            <button key={l} type="button" aria-pressed={f.get("avail") === v} onClick={() => f.set("avail", v)} className={cn("h-10 rounded-lg border text-small font-semibold", f.get("avail") === v ? "border-primary-600 bg-primary-50 text-primary-700" : "border-line text-ink-600 hover:border-line-strong")}>{l}</button>
          ))}
        </div>
      </fieldset>
      <label className={field}>
        <span className={lbl}>Language</span>
        <Select value={f.get("lang")} onChange={(e) => f.set("lang", e.target.value)}>
          <option value="">Any language</option>
          {allLanguages.map((l) => <option key={l}>{l}</option>)}
        </Select>
      </label>
      <label className={field}>
        <span className={lbl}>Hospital</span>
        <Select value={f.get("hospital")} onChange={(e) => f.set("hospital", e.target.value)}>
          <option value="">Any hospital</option>
          {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </Select>
      </label>
      <label className={field}>
        <span className={lbl}>Doctor's gender</span>
        <Select value={f.get("gender")} onChange={(e) => f.set("gender", e.target.value)}>
          <option value="">No preference</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </Select>
      </label>
    </div>
  );
}

export function DoctorsPage() {
  useDocumentTitle("Find a doctor");
  const f = useDoctorFilters();
  const [sheet, setSheet] = useState(false);
  const q = f.get("q");
  const sort = (f.get("sort") || "relevance") as SortKey;
  const key = f.params.toString();

  const { status, data, retry } = useSimulatedQuery(() => filterDoctors(f.params), [key], 350);
  const activeCount = ["specialty", "sub", "exp", "type", "avail", "lang", "hospital", "gender"].filter((k) => f.get(k)).length;
  const spec = specialtyMap[f.get("specialty") as keyof typeof specialtyMap];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Doctors" }]} />
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="t-h1">{spec ? `${spec.name} specialists` : "Find the right specialist"}</h1>
          <p className="mt-2 text-ink-500">Compare experience, languages, availability and fees. Ratings come from patients after completed visits.</p>
        </div>
        <SearchBar value={q} onChange={(v) => f.set("q", v)} placeholder="Search by name, condition or specialty…" label="Search doctors" className="w-full lg:w-96" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="card sticky top-24 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Filters</h2>
              {activeCount > 0 && <button onClick={f.clear} className="min-h-9 text-small font-semibold text-primary-700 hover:underline">Clear all</button>}
            </div>
            <FilterFields f={f} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-small text-ink-600" aria-live="polite">
              {status === "success" ? <><strong className="text-ink-900">{data!.length}</strong> doctors found</> : "Searching…"}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSheet(true)}>
                <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters{activeCount ? ` (${activeCount})` : ""}
              </Button>
              <label className="flex items-center gap-2 text-small text-ink-600">
                <span className="hidden sm:inline">Sort by</span>
                <Select value={sort} onChange={(e) => f.set("sort", e.target.value === "relevance" ? "" : e.target.value)} className="h-9 w-auto py-0 text-small" aria-label="Sort doctors">
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest rated</option>
                  <option value="experience">Most experienced</option>
                  <option value="fee">Lowest fee</option>
                  <option value="soonest">Soonest available</option>
                </Select>
              </label>
            </div>
          </div>

          {activeCount > 0 && (
            <ul className="mb-4 flex flex-wrap gap-2" aria-label="Active filters">
              {["specialty", "sub", "exp", "type", "avail", "lang", "hospital", "gender"].filter((k) => f.get(k)).map((k) => (
                <li key={k}>
                  <button onClick={() => f.set(k, "")} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary-50 px-3 text-small font-semibold text-primary-700 hover:bg-primary-100" aria-label={`Remove filter ${chipLabel(k, f.get(k))}`}>
                    {chipLabel(k, f.get(k))} <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {status === "loading" && <LoadingState label="Finding doctors" rows={4} />}
          {status === "error" && <ErrorState onRetry={retry} />}
          {status === "success" && data!.length === 0 && (
            <EmptyState icon={Stethoscope} title="No doctors match these filters" description="Try removing a filter or searching a different specialty." action={<Button onClick={f.clear}>Clear filters</Button>} />
          )}
          {status === "success" && data!.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {data!.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          )}
          <p className="mt-6 text-caption text-ink-500">Doctor profiles are fictional for this prototype. Fees and availability are indicative.</p>
        </div>
      </div>

      <Modal open={sheet} onOpenChange={setSheet} title="Filters" variant="sheet" footer={<><Button variant="outline" onClick={f.clear}>Clear all</Button><Button onClick={() => setSheet(false)}>Show {data?.length ?? ""} doctors</Button></>}>
        <FilterFields f={f} />
      </Modal>
    </div>
  );
}

function chipLabel(k: string, v: string) {
  if (k === "specialty") return specialtyMap[v as keyof typeof specialtyMap]?.name ?? v;
  if (k === "hospital") return getHospital(v)?.shortName ?? v;
  if (k === "exp") return `${v}+ years`;
  if (k === "type") return { "in-person": "In-person", video: "Video", "home-visit": "Home visit" }[v] ?? v;
  if (k === "avail") return v === "today" ? "Available today" : "Available tomorrow";
  if (k === "gender") return v === "female" ? "Female doctor" : "Male doctor";
  return v;
}

function filterDoctors(p: URLSearchParams): Doctor[] {
  const q = (p.get("q") ?? "").toLowerCase().trim();
  const today = istDay(TODAY);
  const tomorrow = istDay(new Date(TODAY.getTime() + 86400000));
  let list = doctors.filter((d) => {
    if (p.get("specialty") && d.specialty !== p.get("specialty")) return false;
    if (p.get("sub") && d.subSpecialty !== p.get("sub")) return false;
    if (p.get("exp") && d.experienceYears < Number(p.get("exp"))) return false;
    if (p.get("type") && !d.consultationTypes.includes(p.get("type") as ConsultationType)) return false;
    if (p.get("lang") && !d.languages.includes(p.get("lang")!)) return false;
    if (p.get("hospital") && d.hospitalId !== p.get("hospital")) return false;
    if (p.get("gender") && d.gender !== p.get("gender")) return false;
    const day = istDay(d.nextAvailable);
    if (p.get("avail") === "today" && day !== today) return false;
    if (p.get("avail") === "tomorrow" && day > tomorrow) return false;
    if (q) {
      const s = specialtyMap[d.specialty];
      const hay = [d.name, d.title, d.subSpecialty, s.name, ...s.conditions.map((c) => c.name), ...d.specializations].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const sort = p.get("sort");
  if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
  if (sort === "experience") list = [...list].sort((a, b) => b.experienceYears - a.experienceYears);
  if (sort === "fee") list = [...list].sort((a, b) => a.fee.inPerson - b.fee.inPerson);
  if (sort === "soonest") list = [...list].sort((a, b) => a.nextAvailable.localeCompare(b.nextAvailable));
  return list;
}

/* =========================================================================
   Doctor profile
   ========================================================================= */

export function DoctorProfilePage() {
  const { id } = useParams();
  const doctor = getDoctor(id);
  useDocumentTitle(doctor?.name ?? "Doctor");
  const [slot, setSlot] = useState<string>();
  if (!doctor) return <NotFoundPage />;
  const spec = specialtyMap[doctor.specialty];
  const hospital = getHospital(doctor.hospitalId)!;
  const similar = doctors.filter((d) => d.specialty === doctor.specialty && d.id !== doctor.id).slice(0, 3);
  const ratingDist = [78, 16, 4, 1, 1];

  return (
    <div style={toneStyle(doctor.specialty)}>
      <section className="bg-gradient-to-b from-[var(--accent-tint)] to-canvas">
        <div className="container-page pt-6 pb-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Doctors", to: "/doctors" }, { label: doctor.name }]} />
          <div className="card flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center">
            <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={136} className="mx-auto rounded-3xl md:mx-0" />
            <div className="min-w-0 flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 className="t-h1">{doctor.name}</h1>
                {doctor.rating >= 4.8 && <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-caption font-semibold text-success-700"><BadgeCheck className="size-4" aria-hidden="true" />Top rated by patients</span>}
              </div>
              <p className="mt-1 text-lead font-semibold text-accent">{doctor.title} · {spec.name}</p>
              <p className="text-ink-600">{doctor.subSpecialty}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-small text-ink-600 md:justify-start">
                <span className="inline-flex items-center gap-1.5"><Building2 className="size-4 text-ink-400" aria-hidden="true" />{hospital.name}, {hospital.city}</span>
                <span className="inline-flex items-center gap-1.5"><Languages className="size-4 text-ink-400" aria-hidden="true" />{doctor.languages.join(", ")}</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { k: "Experience", v: `${doctor.experienceYears}+ yrs`, i: Clock },
                  { k: "Patients", v: `${(doctor.patientsTreated / 1000).toFixed(1)}k+`, i: Users },
                  { k: "Rating", v: `${doctor.rating} / 5`, i: Star },
                  { k: "Reviews", v: doctor.reviewCount.toLocaleString("en-IN"), i: BadgeCheck },
                ].map(({ k, v, i: Icon }) => (
                  <div key={k} className="rounded-xl bg-subtle px-3 py-2.5 text-left">
                    <dt className="flex items-center gap-1.5 text-caption text-ink-500"><Icon className="size-3.5" aria-hidden="true" />{k}</dt>
                    <dd className="text-[1.125rem] font-bold text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex flex-col gap-2 md:w-60">
              <ButtonLink to={`/appointments/book?doctor=${doctor.id}`} size="lg" variant="accent">
                <CalendarCheck2 className="size-5" aria-hidden="true" /> Book Appointment
              </ButtonLink>
              {doctor.consultationTypes.includes("video") && (
                <ButtonLink to={`/appointments/book?doctor=${doctor.id}&type=video`} size="lg" variant="outline">
                  <Video className="size-5" aria-hidden="true" /> Video Consultation
                </ButtonLink>
              )}
              <p className="text-center text-caption text-ink-500">Next available: {availabilityLabel(doctor.nextAvailable)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 pb-16 lg:grid-cols-[1fr_20rem]">
        <Tabs defaultValue="about">
          <TabsList aria-label="Doctor profile sections" className="mb-6 border-b border-line">
            {["About", "Experience", "Specializations", "Reviews", "Availability"].map((t) => (
              <TabsTrigger key={t} value={t.toLowerCase()} variant="underline">{t}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <section className="card p-6">
              <h2 className="t-h3">About {doctor.name}</h2>
              <p className="mt-3 text-ink-700">{doctor.about}</p>
            </section>
            <section className="card p-6">
              <h2 className="t-h3 mb-4">Consultation fees</h2>
              <ul className="grid grid-cols-3 gap-2 sm:gap-3">
                <li className="rounded-xl border border-line p-3 sm:p-4"><Building2 className="size-5 text-accent" aria-hidden="true" /><p className="mt-2 text-small text-ink-500">In-person</p><p className="text-[1.25rem] font-bold">{formatINR(doctor.fee.inPerson)}</p></li>
                <li className="rounded-xl border border-line p-3 sm:p-4"><Video className="size-5 text-accent" aria-hidden="true" /><p className="mt-2 text-small text-ink-500">Video</p><p className="text-[1.25rem] font-bold">{formatINR(doctor.fee.video)}</p></li>
                <li className={cn("rounded-xl border border-line p-3 sm:p-4", !doctor.fee.homeVisit && "opacity-60")}><MapPin className="size-5 text-accent" aria-hidden="true" /><p className="mt-2 text-small text-ink-500">Home visit</p><p className="text-[1.25rem] font-bold">{doctor.fee.homeVisit ? formatINR(doctor.fee.homeVisit) : "Not offered"}</p></li>
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <section className="card p-6">
              <h2 className="t-h3 mb-4 flex items-center gap-2"><Stethoscope className="size-5 text-accent" aria-hidden="true" />Experience</h2>
              <ol className="space-y-4 border-l-2 border-accent-tint pl-5">
                {doctor.experience.map((e) => (
                  <li key={e.role + e.period} className="relative">
                    <span className="absolute top-1.5 -left-[27px] size-3 rounded-full bg-accent ring-4 ring-white" aria-hidden="true" />
                    <p className="font-bold text-ink-900">{e.role}</p>
                    <p className="text-small text-ink-600">{e.place}</p>
                    <p className="text-caption text-ink-500">{e.period}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section className="card p-6">
              <h2 className="t-h3 mb-4 flex items-center gap-2"><GraduationCap className="size-5 text-accent" aria-hidden="true" />Education</h2>
              <ul className="space-y-3">
                {doctor.education.map((e) => (
                  <li key={e.degree} className="flex justify-between gap-4"><span><span className="block font-semibold text-ink-900">{e.degree}</span><span className="text-small text-ink-500">{e.institution}</span></span><span className="text-small text-ink-500">{e.year}</span></li>
                ))}
              </ul>
              {doctor.awards && (
                <p className="mt-5 flex items-center gap-2 text-small text-ink-700"><Award className="size-4.5 text-warning-500" aria-hidden="true" />{doctor.awards.join(" · ")}</p>
              )}
            </section>
          </TabsContent>

          <TabsContent value="specializations">
            <section className="card p-6">
              <h2 className="t-h3 mb-4">Areas of expertise</h2>
              <ul className="flex flex-wrap gap-2">
                {doctor.specializations.map((s) => <li key={s} className="rounded-full bg-accent-tint px-4 py-2 text-small font-semibold text-accent">{s}</li>)}
              </ul>
              <h3 className="mt-6 mb-3 font-bold">Conditions commonly treated</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {spec.conditions.map((c) => (
                  <li key={c.name} className="flex items-center gap-3 rounded-xl border border-line p-3"><IconTile icon={c.icon} size="sm" /><span className="text-small font-semibold">{c.name}</span></li>
                ))}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="reviews">
            <section className="card p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="text-center sm:w-40">
                  <p className="text-[3rem] leading-none font-bold">{doctor.rating}</p>
                  <Rating value={doctor.rating} className="justify-center" />
                  <p className="mt-1 text-caption text-ink-500">{doctor.reviewCount.toLocaleString("en-IN")} reviews</p>
                </div>
                <ul className="flex-1 space-y-1.5" aria-label="Rating distribution">
                  {ratingDist.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-small">
                      <span className="w-10 text-ink-600">{5 - i} star</span>
                      <span className="h-2 flex-1 rounded-full bg-subtle" aria-hidden="true"><span className="block h-full rounded-full bg-amber-400" style={{ width: `${p}%` }} /></span>
                      <span className="w-10 text-right font-semibold tabular-nums">{p}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="mt-6 divide-y divide-line border-t border-line">
                {doctor.reviews.map((r) => (
                  <li key={r.id} className="py-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-ink-900">{r.author}</p>
                      <span className="text-caption text-ink-500">{formatDate(r.date)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("size-4", i < r.rating ? "fill-amber-400 text-amber-400" : "text-ink-300")} aria-hidden="true" />)}</span>
                      {r.verifiedVisit && <span className="text-caption font-semibold text-success-700">Completed visit</span>}
                    </div>
                    <p className="mt-2 text-ink-700">{r.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="availability">
            <section className="card p-5 sm:p-6">
              <h2 className="t-h3 mb-4">Choose a time</h2>
              <SlotPicker doctorId={doctor.id} value={slot} onChange={setSlot} />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-small text-ink-600" aria-live="polite">{slot ? <>Selected: <strong className="text-ink-900">{formatDate(slot, { weekday: "long", day: "numeric", month: "short" })}, {new Date(slot).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}</strong></> : "Select a time slot to continue"}</p>
                <ButtonLink to={`/appointments/book?doctor=${doctor.id}${slot ? `&slot=${encodeURIComponent(slot)}` : ""}`} aria-disabled={!slot} variant="accent" onClick={(e) => !slot && e.preventDefault()}>
                  Continue booking
                </ButtonLink>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <aside className="space-y-4 lg:pt-[4.25rem]" aria-label="Practice details">
          <Link to={`/hospitals/${hospital.id}`} className="card card-interactive block overflow-hidden">
            <div className="relative aspect-[16/9] bg-subtle"><SmartImage image={hospital.image} sizes="320px" className="absolute inset-0 size-full" /></div>
            <div className="p-4">
              <p className="text-caption font-semibold text-ink-500">Practices at</p>
              <p className="font-bold text-ink-900">{hospital.name}</p>
              <p className="mt-1 flex items-start gap-1.5 text-small text-ink-500"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{hospital.address}</p>
            </div>
          </Link>
          <div className="card p-4 text-small text-ink-600">
            <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-success-700" aria-hidden="true" />Credentials shown as provided by the practitioner. Ratings come only from patients with completed visits.</p>
          </div>
          {similar.length > 0 && (
            <div>
              <h2 className="mb-3 font-bold">Similar specialists</h2>
              <div className="space-y-3">{similar.map((d) => <DoctorMiniCard key={d.id} doctor={d} />)}</div>
            </div>
          )}
        </aside>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-16 z-30 grid grid-cols-2 gap-2 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
        <ButtonLink to={`/appointments/book?doctor=${doctor.id}&type=video`} variant="outline"><Video className="size-4" aria-hidden="true" />Video</ButtonLink>
        <ButtonLink to={`/appointments/book?doctor=${doctor.id}`} variant="accent">Book</ButtonLink>
      </div>
      <div className="h-16 md:hidden" aria-hidden="true" />
    </div>
  );
}

/* =========================================================================
   Hospitals
   ========================================================================= */

export function HospitalsPage() {
  useDocumentTitle("Hospitals");
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [er, setEr] = useState(false);
  const [sort, setSort] = useState<"distance" | "rating">("distance");
  const cities = Array.from(new Set(hospitals.map((h) => h.city)));
  const list = useMemo(() => {
    const s = q.toLowerCase();
    return hospitals
      .filter((h) => (!city || h.city === city) && (!er || h.emergency24x7) && (!s || [h.name, h.area, h.city, h.type, ...h.departments.map((d) => specialtyMap[d].name)].join(" ").toLowerCase().includes(s)))
      .sort((a, b) => (sort === "distance" ? a.distanceKm - b.distanceKm : b.rating - a.rating));
  }, [q, city, er, sort]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-white">
        <div className="container-page grid items-center gap-6 py-8 sm:py-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Hospitals" }]} />
            <h1 className="t-h1">Better care. Brighter future.</h1>
            <p className="mt-3 max-w-xl text-lead text-ink-600">Accredited partner hospitals, diagnostic centres and rehab clinics — connected to your HealthSphere records and care journeys.</p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small font-semibold text-ink-700">
              {["Expert doctors", "Advanced technology", "Personalised care", "24/7 support"].map((x) => <li key={x} className="flex items-center gap-2"><BadgeCheck className="size-4.5 text-primary-600" aria-hidden="true" />{x}</li>)}
            </ul>
          </div>
          <div className="relative hidden aspect-[3/2] overflow-hidden rounded-3xl bg-gradient-to-b from-primary-100 to-primary-50 lg:block">
            <SmartImage image={{ name: "doctor-patient-bedside", alt: "Doctor caring for an elderly patient in hospital", focus: "50% 20%" }} priority sizes="45vw" className="absolute inset-0 size-full" />
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="card mb-6 flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <SearchBar value={q} onChange={setQ} placeholder="Search hospital, area or department…" label="Search hospitals" className="flex-1" />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City" className="w-auto">
              <option value="">All cities</option>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value as "distance" | "rating")} aria-label="Sort" className="w-auto">
              <option value="distance">Nearest first</option>
              <option value="rating">Highest rated</option>
            </Select>
            <button aria-pressed={er} onClick={() => setEr((v) => !v)} className={cn("inline-flex h-11 items-center gap-2 rounded-md border px-3.5 text-small font-semibold", er ? "border-danger-500 bg-danger-50 text-danger-700" : "border-line-strong text-ink-700 hover:bg-subtle")}>
              <Ambulance className="size-4" aria-hidden="true" /> 24/7 emergency
            </button>
          </div>
        </div>
        <p className="mb-4 text-small text-ink-600" aria-live="polite"><strong className="text-ink-900">{list.length}</strong> facilities</p>
        {list.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((h) => <HospitalCard key={h.id} hospital={h} />)}</div>
        ) : (
          <EmptyState icon={Building2} title="No hospitals found" description="Try another city or clear the emergency filter." action={<Button onClick={() => { setQ(""); setCity(""); setEr(false); }}>Reset filters</Button>} />
        )}
      </div>
    </div>
  );
}

export function HospitalPage() {
  const { id } = useParams();
  const h = getHospital(id);
  useDocumentTitle(h?.name ?? "Hospital");
  if (!h) return <NotFoundPage />;
  const docs = doctors.filter((d) => d.hospitalId === h.id);

  return (
    <div>
      <section className="container-page pt-6 pb-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Hospitals", to: "/hospitals" }, { label: h.shortName }]} />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-b from-primary-50 to-primary-100 shadow-card">
            <SmartImage image={h.image} priority sizes="(min-width: 1024px) 60vw, 100vw" className="absolute inset-0 size-full" />
            {h.emergency24x7 && <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-small font-bold text-danger-700 shadow-card"><Ambulance className="size-4" aria-hidden="true" />24/7 Emergency · ~{h.erWaitMinutes} min wait</span>}
          </div>
          <div className="card flex flex-col p-6">
            <p className="text-small font-semibold text-ink-500">{h.type}</p>
            <h1 className="t-h1 mt-1">{h.name}</h1>
            <p className="mt-2 flex items-start gap-2 text-ink-600"><MapPin className="mt-1 size-4.5 shrink-0 text-ink-400" aria-hidden="true" />{h.address}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-small text-ink-600">
              <Rating value={h.rating} count={h.reviewCount} />
              <span className="inline-flex items-center gap-1"><Navigation className="size-4 text-ink-400" aria-hidden="true" />{h.distanceKm} km away</span>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">{h.accreditations.map((a) => <li key={a} className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-caption font-semibold text-success-700"><ShieldCheck className="size-3.5" aria-hidden="true" />{a}</li>)}</ul>
            <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2">
              <ButtonLink to={`/appointments/book?hospital=${h.id}`} size="lg"><CalendarCheck2 className="size-5" aria-hidden="true" />Book Appointment</ButtonLink>
              <ButtonLink to={`/doctors?hospital=${h.id}`} size="lg" variant="outline"><Stethoscope className="size-5" aria-hidden="true" />View Doctors</ButtonLink>
              <a href={`tel:${h.phone.replace(/\s/g, "")}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md text-small font-semibold text-primary-700 hover:bg-primary-50"><Phone className="size-4" aria-hidden="true" />{h.phone}</a>
              {h.emergency24x7 && <a href={`tel:${h.emergencyPhone.replace(/\s/g, "")}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md text-small font-semibold text-danger-700 hover:bg-danger-50"><Ambulance className="size-4" aria-hidden="true" />Emergency line</a>}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 pb-16 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          <section aria-labelledby="h-about"><h2 id="h-about" className="t-h2 mb-3">About</h2><p className="text-ink-700">{h.about}</p></section>
          <section aria-labelledby="h-dep">
            <SectionHeader id="h-dep" title="Departments" />
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {h.departments.map((d) => {
                const s = specialtyMap[d];
                const Icon = getIcon(s.icon);
                return (
                  <li key={d}>
                    <Link to={`/specialties/${d}`} style={toneStyle(d)} className="card card-interactive flex items-center gap-3 p-3.5">
                      <span className="accent-icon inline-flex size-10 items-center justify-center rounded-lg"><Icon className="size-5" aria-hidden="true" /></span>
                      <span className="text-small font-semibold">{s.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          {docs.length > 0 && (
            <section aria-labelledby="h-docs">
              <SectionHeader id="h-docs" title="Doctors at this hospital" action={{ label: "View all", to: `/doctors?hospital=${h.id}` }} />
              <div className="grid gap-3 sm:grid-cols-2">{docs.map((d) => <DoctorMiniCard key={d.id} doctor={d} />)}</div>
            </section>
          )}
          <section aria-labelledby="h-fac">
            <SectionHeader id="h-fac" title="Facilities" />
            <ul className="grid gap-2 sm:grid-cols-2">{h.facilities.map((f) => <li key={f} className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-3 text-small font-medium"><BadgeCheck className="size-4.5 text-primary-600" aria-hidden="true" />{f}</li>)}</ul>
          </section>
          <section aria-labelledby="h-rev">
            <SectionHeader id="h-rev" title="Patient reviews" />
            <ul className="space-y-3">
              {h.reviews.map((r) => (
                <li key={r.id} className="card p-5">
                  <div className="flex items-center justify-between"><p className="font-semibold">{r.author}</p><span className="text-caption text-ink-500">{formatDate(r.date)}</span></div>
                  <span className="mt-1 flex" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("size-4", i < r.rating ? "fill-amber-400 text-amber-400" : "text-ink-300")} aria-hidden="true" />)}</span>
                  <p className="mt-2 text-ink-700">{r.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="space-y-4" aria-label="Visit information">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><Clock className="size-4.5 text-primary-600" aria-hidden="true" />Operating hours</h2>
            <dl className="space-y-2 text-small">{h.hours.map((x) => <div key={x.label} className="flex justify-between gap-3"><dt className="text-ink-500">{x.label}</dt><dd className="text-right font-semibold text-ink-900">{x.value}</dd></div>)}</dl>
          </div>
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><ShieldCheck className="size-4.5 text-primary-600" aria-hidden="true" />Insurance accepted</h2>
            <ul className="flex flex-wrap gap-2">{h.insurance.map((i) => <li key={i} className="rounded-full bg-subtle px-3 py-1 text-caption font-semibold text-ink-700">{i}</li>)}</ul>
          </div>
          <div className="card overflow-hidden">
            <div className="relative h-40 bg-[linear-gradient(90deg,#eef4fc_1px,transparent_1px),linear-gradient(#eef4fc_1px,transparent_1px)] bg-[size:24px_24px]" role="img" aria-label={`Map showing ${h.name}`}>
              <span className="absolute top-1/2 left-1/2 inline-flex size-10 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-primary-600 text-white shadow-raised"><MapPin className="size-5" aria-hidden="true" /></span>
            </div>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(h.address)}`} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 text-small font-semibold text-primary-700 hover:bg-primary-25">
              <Navigation className="size-4" aria-hidden="true" /> Get directions <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
