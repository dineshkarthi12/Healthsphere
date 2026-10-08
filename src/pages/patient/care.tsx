import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  FileText,
  FlaskConical,
  HeartHandshake,
  Home as HomeIcon,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Syringe,
  UserRoundCheck,
  Wind,
  Eye,
  PersonStanding,
} from "lucide-react";
import { careJourneys, getJourney } from "@/data/journeys";
import { specialties, specialtyMap, toneStyle } from "@/data/specialties";
import { symptoms } from "@/data/symptoms";
import { getDoctor } from "@/data/doctors";
import { getHospital } from "@/data/hospitals";
import { JourneyCard, JourneyTimeline } from "@/components/care-journey/CareJourney";
import { SpecialtyTile } from "@/components/specialties/SpecialtyCard";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { RequireSession } from "@/components/layout/RequireSession";
import { Avatar, IconTile, ProgressRing, SectionHeader, StatusBadge } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/overlays";
import { useAppState } from "@/lib/store";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn, formatDate, formatDateTime, formatINR } from "@/lib/utils";
import { Breadcrumbs } from "../specialties";
import { NotFoundPage } from "../public";

const preventive = [
  { title: "Annual health check", detail: "Last done Oct 2025", status: "Due this month", icon: ShieldCheck, due: true, to: "/appointments/book?reason=Annual%20health%20check" },
  { title: "Flu vaccination", detail: "2026–27 season", status: "Due now", icon: Syringe, due: true, to: "/appointments/book?reason=Flu%20vaccine" },
  { title: "Cervical screening", detail: "Last done Jan 2024", status: "Due Jan 2027", icon: HeartHandshake, due: false, to: "/specialties/womens-health" },
  { title: "Dental check-up", detail: "Last done Aug 2026", status: "Due Feb 2027", icon: Sparkles, due: false, to: "/specialties/dental-care" },
];

const diagnostics = [
  { name: "Complete blood count", price: 450, tat: "Same day" },
  { name: "Thyroid profile (TSH)", price: 550, tat: "Same day" },
  { name: "HbA1c", price: 600, tat: "24 hours" },
  { name: "Lipid profile", price: 700, tat: "Same day" },
];

const rehab = [
  { title: "Physiotherapy program", text: "Back, joint and post-surgery recovery", icon: PersonStanding, to: "/specialties/bone-spine", slug: "bone-spine" as const },
  { title: "Cardiac rehabilitation", text: "12-week supervised heart program", icon: Activity, to: "/specialties/heart-care", slug: "heart-care" as const },
  { title: "Pulmonary rehabilitation", text: "Breathing and endurance training", icon: Wind, to: "/specialties/lung-care", slug: "lung-care" as const },
  { title: "Vision therapy", text: "Eye exercises and low-vision support", icon: Eye, to: "/specialties/eye-care", slug: "eye-care" as const },
];

/* =========================================================================
   Care screen
   ========================================================================= */
export function CarePage() {
  useDocumentTitle("My Care");
  const { signedIn, signIn } = useAppState();
  const { toast } = useToast();
  const active = careJourneys.filter((j) => j.status === "active");

  return (
    <div className="container-page space-y-12 py-6 sm:py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-eyebrow text-primary-700">My Care</p>
          <h1 className="t-h1 mt-1">Everything about your care, in one place</h1>
          <p className="mt-2 max-w-2xl text-ink-500">Follow active treatments, explore specialties, stay on top of preventive care and book diagnostics.</p>
        </div>
        <ButtonLink to="/symptoms" variant="secondary">Check a symptom <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
      </header>

      {/* ----------------------------------------------- My Active Care */}
      <section aria-labelledby="active-care">
        <SectionHeader id="active-care" title="My Active Care" subtitle={signedIn ? `${active.length} active care journeys` : undefined} />
        {signedIn ? (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="card flex items-center gap-4 p-4">
                <IconTile icon="Activity" />
                <div><p className="text-stat leading-none font-bold">{active.length}</p><p className="text-small text-ink-500">Active journeys</p></div>
              </div>
              <div className="card flex items-center gap-4 p-4">
                <IconTile icon="CalendarClock" />
                <div className="min-w-0"><p className="truncate font-bold">{careJourneys[1].nextStep}</p><p className="text-small text-ink-500">Next step · Today 6:30 PM</p></div>
              </div>
              <div className="card flex items-center gap-4 p-4">
                <IconTile icon="FileText" />
                <div><p className="text-stat leading-none font-bold">9</p><p className="text-small text-ink-500">Documents in your journeys</p></div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {active.map((j, i) => <JourneyCard key={j.id} journey={j} variant={i < 2 ? "default" : "compact"} />)}
            </div>
          </>
        ) : (
          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <IconTile icon="ShieldCheck" size="lg" />
            <div className="flex-1">
              <h3 className="t-h3">Your care journeys are private</h3>
              <p className="text-small text-ink-500">Sign in to see your treatment timelines, next steps and documents.</p>
            </div>
            <Button onClick={signIn}>Continue with demo account</Button>
          </div>
        )}
      </section>

      {/* ------------------------------------------ Explore Specialties */}
      <section aria-labelledby="explore">
        <SectionHeader id="explore" title="Explore Specialties" action={{ label: "All specialties", to: "/specialties" }} />
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-6">
          {specialties.map((s) => <SpecialtyTile key={s.slug} specialty={s} className="w-28 shrink-0 snap-start sm:w-auto" />)}
        </div>
      </section>

      {/* ------------------------------------------ Symptoms & Concerns */}
      <section aria-labelledby="symptoms">
        <SectionHeader id="symptoms" title="Symptoms & Concerns" subtitle="Start from how you feel — we'll suggest a care pathway." action={{ label: "Symptom checker", to: "/symptoms" }} />
        <ul className="flex flex-wrap gap-2">
          {symptoms.slice(0, 12).map((s) => (
            <li key={s.id}>
              <Link to={`/symptoms?s=${s.id}`} style={toneStyle(s.specialty)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-small font-semibold text-ink-700 shadow-xs hover:border-[color:var(--accent)] hover:text-accent">
                <span className="size-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />{s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
        {/* ------------------------------------------ Preventive Care */}
        <section aria-labelledby="prev">
          <SectionHeader id="prev" title="Preventive Care" subtitle="Personalised for a 29-year-old woman" />
          <ul className="space-y-3">
            {preventive.map(({ title, detail, status, icon: Icon, due, to }) => (
              <li key={title}>
                <Link to={to} className="card card-interactive flex items-center gap-4 p-4">
                  <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", due ? "bg-warning-50 text-warning-700" : "bg-success-50 text-success-700")}><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink-900">{title}</span>
                    <span className="block text-small text-ink-500">{detail}</span>
                  </span>
                  <StatusBadge status={due ? "attention" : "scheduled"} label={status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------ Diagnostics */}
        <section aria-labelledby="diag">
          <SectionHeader id="diag" title="Diagnostics" subtitle="Home sample collection · NABL-accredited partner labs" />
          <ul className="card divide-y divide-line">
            {diagnostics.map((t) => (
              <li key={t.name} className="flex items-center gap-4 p-4">
                <IconTile icon="FlaskConical" size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink-900">{t.name}</span>
                  <span className="block text-small text-ink-500">{formatINR(t.price)} · Report {t.tat.toLowerCase()}</span>
                </span>
                <Button size="sm" variant="secondary" onClick={() => toast({ title: "Home collection requested", description: `${t.name} · A phlebotomist will call to confirm a slot.` })}>
                  <HomeIcon className="size-4" aria-hidden="true" /> Book
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---------------------------------------------- Rehabilitation */}
      <section aria-labelledby="rehab">
        <SectionHeader id="rehab" title="Rehabilitation" subtitle="Guided programs that track your recovery week by week." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rehab.map(({ title, text, icon: Icon, to, slug }) => (
            <Link key={title} to={to} style={toneStyle(slug)} className="card card-interactive p-5">
              <span className="accent-icon inline-flex size-11 items-center justify-center rounded-xl"><Icon className="size-5" aria-hidden="true" /></span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-small text-ink-500">{text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   My Care Journey — detail
   ========================================================================= */
export function JourneyPage() {
  const { id } = useParams();
  const j = getJourney(id);
  useDocumentTitle(j ? `${j.title} journey` : "Care journey");
  if (!j) return <NotFoundPage />;
  return (
    <RequireSession title="Sign in to view your care journey">
      <JourneyDetail id={j.id} />
    </RequireSession>
  );
}

function JourneyDetail({ id }: { id: string }) {
  const j = getJourney(id)!;
  const { appointments } = useAppState();
  const { toast } = useToast();
  const spec = specialtyMap[j.specialty];
  const lead = getDoctor(j.leadDoctorId)!;
  const hospital = getHospital(j.hospitalId)!;
  const docs = j.stages.flatMap((s) => s.documents.map((d) => ({ ...d, stage: s.title })));
  const upcoming = appointments.filter((a) => a.journeyId === j.id && a.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const done = j.stages.filter((s) => s.status === "completed").length;

  return (
    <div style={toneStyle(j.specialty)}>
      <section className="bg-gradient-to-b from-[var(--accent-tint)] to-canvas">
        <div className="container-page pt-6 pb-8">
          <Breadcrumbs items={[{ label: "My Care", to: "/care" }, { label: j.title }]} />
          <div className="card flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center">
            <ProgressRing value={j.progress} size={112} stroke={9} label={`${j.title} progress`}>
              <span className="text-center leading-tight"><span className="block text-stat-lg font-bold">{j.progress}%</span><span className="block text-caption text-ink-500">complete</span></span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-small font-semibold text-accent"><IconTile icon={spec.icon} size="sm" />{spec.name} · My Care Journey</p>
              <h1 className="t-h1 mt-2">{j.title} <span className="text-ink-500">— {j.progress}% complete</span></h1>
              <p className="mt-1 text-ink-600">{j.condition}</p>
              <p className="mt-1 text-small text-ink-500">{done} of {j.stages.length} stages complete · Started {formatDate(j.startedOn)} · {hospital.name}</p>
            </div>
            <div className="rounded-2xl bg-accent-tint/70 p-4 md:w-72">
              <p className="text-caption font-semibold text-ink-500">Next step</p>
              <p className="font-bold text-ink-900">{j.nextStep}</p>
              {j.nextStepDate && <p className="text-small text-ink-600">{formatDateTime(j.nextStepDate)}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="accent" onClick={() => toast({ title: "Added to your calendar", description: `${j.nextStep} — reminder set for the day before.` })}><CalendarPlus className="size-4" aria-hidden="true" />Remind me</Button>
                <ButtonLink to="/appointments" size="sm" variant="white"><CalendarClock className="size-4" aria-hidden="true" />Reschedule</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 pb-16 lg:grid-cols-[1fr_21rem]">
        <section aria-labelledby="timeline" className="card p-5 sm:p-7">
          <h2 id="timeline" className="t-h2 mb-6">Your journey timeline</h2>
          <JourneyTimeline journey={j} />
        </section>

        <aside className="space-y-4" aria-label="Journey details">
          <div className="card p-5">
            <h2 className="mb-3 font-bold">Care team</h2>
            <Link to={`/doctors/${lead.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-subtle">
              <Avatar name={lead.name} initials={lead.initials} photo={lead.photo} size={48} />
              <span className="min-w-0"><span className="block font-semibold">{lead.name}</span><span className="block text-small text-ink-500">Lead · {lead.title}</span></span>
            </Link>
            <div className="mt-1 flex items-center gap-3 p-2">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700"><UserRoundCheck className="size-5.5" aria-hidden="true" /></span>
              <span><span className="block font-semibold">Revathi K.</span><span className="block text-small text-ink-500">Care navigator</span></span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Message sent to your care team", description: "Typical reply time: under 2 hours." })}><MessageCircle className="size-4" aria-hidden="true" />Message</Button>
              <a href={`tel:${hospital.phone.replace(/\s/g, "")}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line-strong text-small font-semibold text-ink-800 hover:bg-subtle"><Phone className="size-4" aria-hidden="true" />Call</a>
            </div>
          </div>

          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-2 font-bold">Upcoming visits</h2>
              <div className="space-y-3">{upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} compact />)}</div>
            </div>
          )}

          <div className="card p-5">
            <h2 className="mb-3 font-bold">Documents</h2>
            {docs.length ? (
              <ul className="space-y-1">
                {docs.map((d) => (
                  <li key={d.title + d.stage}>
                    <Link to={d.recordId ? `/records?open=${d.recordId}` : "/records"} className="flex min-h-12 items-center gap-3 rounded-lg px-2 hover:bg-subtle">
                      <FileText className="size-4.5 text-accent" aria-hidden="true" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-small font-semibold">{d.title}</span><span className="block text-caption text-ink-500">{d.stage}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-small text-ink-500">Documents will appear here as your journey progresses.</p>}
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 text-small text-ink-600">
            <p className="flex items-start gap-2"><FlaskConical className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />Each stage updates automatically when results arrive or your doctor adds notes.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
