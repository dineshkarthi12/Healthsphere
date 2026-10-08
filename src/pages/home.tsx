import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Activity,
  Ambulance,
  ArrowRight,
  ChevronRight,
  BookOpen,
  CalendarCheck2,
  Clock,
  FileText,
  FolderHeart,
  Headphones,
  HeartPulse,
  MapPin,
  Phone,
  Pill,
  Quote,
  Search,
  ShieldCheck,
  Siren,
  Stethoscope,
  Thermometer,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { specialties, toneStyle } from "@/data/specialties";
import { doctors } from "@/data/doctors";
import { hospitals } from "@/data/hospitals";
import { articles } from "@/data/articles";
import { careJourneys } from "@/data/journeys";
import { currentPatient, healthMetrics } from "@/data/patient";
import { SpecialtyTile, MoreSpecialtiesTile } from "@/components/specialties/SpecialtyCard";
import { DoctorMiniCard } from "@/components/doctors/DoctorCard";
import { HospitalCard } from "@/components/health/HospitalCard";
import { NextAppointmentCard } from "@/components/appointments/AppointmentCard";
import { JourneyCard } from "@/components/care-journey/CareJourney";
import { HealthMetricCard } from "@/components/health/HealthMetricCard";
import { ArticleCard } from "@/components/health/ArticleCard";
import { StoreBadges } from "@/components/health/StoreBadges";
import { Avatar, IconTile, SearchBar, SectionHeader, SmartImage } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useGlobalSearch } from "@/components/layout/GlobalSearch";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAppState } from "@/lib/store";
import { getIcon } from "@/lib/icons";
import { formatTime, greeting, imageSrc, imageSrcSet, relativeDay } from "@/lib/utils";

export function HomePage() {
  useDocumentTitle("");
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopHome /> : <MobileHome />;
}

/* =========================================================================
   Shared content
   ========================================================================= */

const intents: { title: string; text: string; to: string; icon: LucideIcon; tone: string }[] = [
  { title: "Check a Symptom", text: "Find the right care pathway for how you feel.", to: "/symptoms", icon: Thermometer, tone: "#12a383" },
  { title: "Find a Specialist", text: "500+ experts across 50+ specialties.", to: "/doctors", icon: Stethoscope, tone: "#2a74ec" },
  { title: "Manage My Care", text: "Follow every step of your treatment journey.", to: "/care", icon: FolderHeart, tone: "#7c5cfc" },
  { title: "Access Health Records", text: "Reports, prescriptions and history in one place.", to: "/records", icon: FileText, tone: "#ee7a24" },
];

const trust = [
  { value: "1M+", label: "Patients cared for", icon: Users },
  { value: "500+", label: "Expert doctors", icon: Stethoscope },
  { value: "50+", label: "Specialties", icon: Activity },
  { value: "24/7", label: "Support & emergency", icon: Headphones },
];

const journeyStages = [
  { title: "Consultation", text: "Meet the right specialist", icon: Stethoscope },
  { title: "Tests", text: "Diagnostics, booked for you", icon: Activity },
  { title: "Diagnosis", text: "Clear, plain-language results", icon: FileText },
  { title: "Treatment", text: "A plan you understand", icon: Pill },
  { title: "Recovery", text: "Guided day-by-day support", icon: ShieldCheck },
  { title: "Follow-up", text: "Reminders that keep you on track", icon: CalendarCheck2 },
  { title: "Long-term Care", text: "Ongoing monitoring & prevention", icon: HeartPulse },
];

const stories = [
  { name: "Meera V.", city: "Chennai", specialty: "Eye Care", quote: "From my first eye test to my LASIK follow-up, I always knew what came next. It felt like someone was walking beside me." },
  { name: "Ramesh I.", city: "Bengaluru", specialty: "Heart Care", quote: "My ECG and echo reports were in the app before I got home. My daughter in Pune could follow every step of my angioplasty." },
  { name: "Sneha P.", city: "Hyderabad", specialty: "Women's Health", quote: "One place for my pregnancy scans, then my baby's vaccines. The reminders genuinely made life easier." },
];

/* =========================================================================
   Desktop / tablet landing
   ========================================================================= */

const pathway: { label: string; icon: LucideIcon }[] = [
  { label: "Specialty", icon: Activity },
  { label: "Specialist", icon: Stethoscope },
  { label: "Diagnosis", icon: FileText },
  { label: "Treatment", icon: Pill },
  { label: "Recovery", icon: ShieldCheck },
];

function DesktopHome() {
  const { openSearch } = useGlobalSearch();
  const { signedIn, appointments } = useAppState();
  const next = appointments.filter((a) => a.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date))[0];
  const [q, setQ] = useState("");
  const featured = doctors.filter((d) => ["ananya-sharma", "arjun-mehta", "divya-raman", "vikram-rao"].includes(d.id));

  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-primary-25 to-canvas" aria-labelledby="hero-title">
        <div aria-hidden="true" className="pointer-events-none absolute -top-48 right-[-12%] size-[48rem] rounded-full bg-[radial-gradient(circle_at_center,#dbe9ff_0%,transparent_65%)]" />
        <div className="container-page relative grid items-center gap-8 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-12">
          <div className="max-w-2xl pb-12 lg:pb-16">
            {signedIn && next ? (
              <Link to="/dashboard" className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-100 bg-white py-1.5 pr-3 pl-1.5 text-small font-semibold text-ink-800 shadow-xs hover:border-primary-300">
                <Avatar initials={currentPatient.initials} name={currentPatient.name} size={28} />
                Welcome back, {currentPatient.firstName} · <span className="font-medium text-ink-600">{relativeDay(next.date)}, {formatTime(next.date)}</span>
                <ArrowRight className="size-4 text-primary-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ) : (
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-3 py-1.5 text-small font-semibold text-primary-700 shadow-xs">
                <span className="size-2 rounded-full bg-success-500" aria-hidden="true" />
                Specialized Care. For Every Part of You.
              </p>
            )}
            <h1 id="hero-title" className="t-display mt-5 max-w-xl">
              Advanced Care for a <span className="text-primary-600">Healthier You.</span>
            </h1>
            <p className="mt-4 text-lead font-medium text-ink-700">Advanced care. Expert specialists. Personalized for you.</p>

            <ol className="mt-6 flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label="How care works on HealthSphere">
              {pathway.map(({ label, icon: Icon }, i) => (
                <li key={label} className="flex items-center gap-1.5 text-caption font-semibold text-ink-700 sm:text-small">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary-50 text-primary-600" aria-hidden="true">
                    <Icon className="size-3.5" />
                  </span>
                  {label}
                  {i < pathway.length - 1 && <ChevronRight className="size-3.5 text-ink-400" aria-hidden="true" />}
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink to="/symptoms" size="lg">
                Find My Care <ArrowRight className="size-5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/specialties" size="lg" variant="outline">
                Explore Specialties
              </ButtonLink>
            </div>

            <div className="mt-8 max-w-lg">
              <SearchBar
                value={q}
                onChange={setQ}
                onSubmit={(v) => openSearch(v.trim())}
                placeholder="Search symptoms, doctors, specialties…"
                label="What brings you here today?"
                size="lg"
              />
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Popular specialties">
                {specialties.slice(0, 4).map((s) => {
                  const Icon = getIcon(s.icon);
                  return (
                    <li key={s.slug}>
                      <Link to={`/specialties/${s.slug}`} style={toneStyle(s.slug)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-caption font-semibold text-ink-700 shadow-xs hover:border-[color:var(--accent)] hover:text-accent sm:min-h-9">
                        <Icon className="size-3.5 text-accent" aria-hidden="true" /> {s.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="relative hidden self-end lg:block">
            <div aria-hidden="true" className="absolute inset-x-[8%] bottom-0 top-[12%] rounded-t-[12rem] bg-gradient-to-b from-primary-100 to-primary-50" />
            <img
              src={imageSrc("doctor-hero-right", 1024)}
              srcSet={imageSrcSet("doctor-hero-right")}
              sizes="45vw"
              alt="Smiling HealthSphere doctor welcoming you"
              width={1536}
              height={1024}
              // @ts-expect-error fetchpriority is valid HTML
              fetchpriority="high"
              className="relative mx-auto aspect-[4/3.4] w-full max-w-[38rem] object-cover object-[30%_0%]"
            />
            <div className="absolute bottom-[14%] left-0 flex animate-fade-up items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 pr-4 shadow-raised backdrop-blur">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-success-50 text-success-700" aria-hidden="true"><ShieldCheck className="size-5" /></span>
              <div>
                <p className="text-caption text-ink-500">Rated by patients after real visits</p>
                <p className="text-small font-bold text-ink-900">★ 4.9 average · 1M+ patients</p>
              </div>
            </div>
            <div className="absolute right-0 bottom-[34%] w-60 animate-fade-up rounded-2xl border border-line bg-white/95 p-4 shadow-raised backdrop-blur" style={{ animationDelay: "120ms" }}>
              <p className="flex items-center gap-1.5 text-caption font-semibold text-ink-500"><FolderHeart className="size-3.5 text-primary-600" aria-hidden="true" />My Care Journey</p>
              <p className="mt-0.5 flex items-baseline justify-between text-small font-bold text-ink-900">LASIK Surgery <span className="text-primary-700">68%</span></p>
              <div className="mt-2 h-1.5 rounded-full bg-primary-50"><div className="h-full w-[68%] origin-left animate-grow rounded-full bg-primary-600" /></div>
              <p className="mt-2 text-caption text-ink-600">Next: Pre-surgery assessment</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Trust metrics */}
      <section aria-label="HealthSphere in numbers" className="container-page -mt-2 lg:-mt-6">
        <ul className="card relative grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {trust.map(({ value, label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-4 p-5 lg:justify-center">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-stat-lg leading-none font-extrabold tracking-tight text-ink-900">{value}</span>
                <span className="mt-1 block text-small text-ink-500">{label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------- Intents */}
      <section className="container-page py-16" aria-labelledby="intents-title">
        <SectionHeader id="intents-title" title="What brings you here today?" subtitle="Start with what matters to you — we'll guide you to the right care." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {intents.map(({ title, text, to, icon: Icon, tone }) => (
            <Link key={title} to={to} className="group card card-interactive relative overflow-hidden p-6" style={{ "--accent": tone, "--accent-tint": `${tone}14` } as React.CSSProperties}>
              <span className="accent-icon inline-flex size-12 items-center justify-center rounded-xl"><Icon className="size-6" aria-hidden="true" /></span>
              <h3 className="mt-5 t-h3">{title}</h3>
              <p className="mt-1.5 text-small text-ink-500">{text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-small font-semibold text-primary-700">
                Get started <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ Specialties */}
      <section className="bg-white py-16" aria-labelledby="spec-title">
        <div className="container-page">
          <SectionHeader id="spec-title" eyebrow="Specialty-first care" title="Explore Specialized Care" subtitle="Every specialty has its own journey, tests and experts — designed around how that care actually works." action={{ label: "View all specialties", to: "/specialties" }} />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {specialties.map((s) => <SpecialtyTile key={s.slug} specialty={s} />)}
            <MoreSpecialtiesTile />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Care journey */}
      <section className="container-page py-16" aria-labelledby="journey-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="t-eyebrow text-primary-700">Signature experience</p>
            <h2 id="journey-title" className="t-h1 mt-2">Your Care Journey</h2>
            <p className="mt-3 max-w-lg text-lead text-ink-600">
              You're not just booking a doctor. HealthSphere understands your entire care journey — and walks it with you, step by step.
            </p>
            <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {journeyStages.map(({ title, text, icon: Icon }, i) => (
                <li key={title} className="flex gap-3">
                  <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon className="size-5" aria-hidden="true" />
                    <span className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary-600 text-micro font-bold text-white" aria-hidden="true">{i + 1}</span>
                  </span>
                  <span>
                    <span className="block font-bold text-ink-900">{title}</span>
                    <span className="block text-small text-ink-500">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <ButtonLink to="/care" variant="secondary" className="mt-8">
              See how it works <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary-50 to-[#e8f6fb]" />
            <div className="relative space-y-4">
              <JourneyCard journey={careJourneys[0]} />
              <JourneyCard journey={careJourneys[1]} variant="compact" className="ml-auto max-w-md" />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Doctors */}
      <section className="bg-white py-16" aria-labelledby="docs-title">
        <div className="container-page">
          <SectionHeader id="docs-title" title="Meet our specialists" subtitle="Experienced doctors, rated by patients after real visits." action={{ label: "Find a doctor", to: "/doctors" }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((d) => <DoctorMiniCard key={d.id} doctor={d} />)}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Hospitals */}
      <section className="container-page py-16" aria-labelledby="hosp-title">
        <SectionHeader id="hosp-title" title="Partner hospitals near you" subtitle="NABH-accredited hospitals and centres, connected to your HealthSphere records." action={{ label: "All hospitals", to: "/hospitals" }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.slice(0, 3).map((h) => <HospitalCard key={h.id} hospital={h} />)}
        </div>
      </section>

      {/* --------------------------------------------------- Health library */}
      <section className="bg-white py-16" aria-labelledby="lib-title">
        <div className="container-page">
          <SectionHeader id="lib-title" eyebrow="Health Library" title="Trusted health information" subtitle="Clinically reviewed articles to help you understand your health." action={{ label: "Visit the library", to: "/health-library" }} />
          <div className="grid gap-5 md:grid-cols-3">
            {articles.filter((a) => a.featured).slice(0, 3).map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Stories */}
      <section className="container-page py-16" aria-labelledby="stories-title">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary-50 to-primary-100">
            <img src={imageSrc("family-portrait", 1024)} srcSet={imageSrcSet("family-portrait")} sizes="(min-width: 1024px) 40vw, 100vw" alt="A smiling family embracing" width={1536} height={1024} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover object-top" />
          </div>
          <div>
            <h2 id="stories-title" className="t-h1">Patient stories</h2>
            <p className="mt-2 text-ink-500">Real journeys shared by HealthSphere patients (names shortened for privacy).</p>
            <ul className="mt-6 space-y-4">
              {stories.map((s) => (
                <li key={s.name} className="card p-5">
                  <Quote className="size-5 text-primary-300" aria-hidden="true" />
                  <blockquote className="mt-2 text-ink-800">“{s.quote}”</blockquote>
                  <p className="mt-3 text-small text-ink-500"><strong className="font-semibold text-ink-900">{s.name}</strong> · {s.city} · {s.specialty}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Emergency */}
      <EmergencyBand />

      {/* ------------------------------------------------------- App promo */}
      <AppPromo />
    </>
  );
}

export function EmergencyBand() {
  return (
    <section className="container-page py-8" aria-labelledby="em-title">
      <div className="flex flex-col gap-6 rounded-3xl border border-danger-100 bg-gradient-to-r from-danger-50 to-white p-6 sm:p-8 lg:flex-row lg:items-center">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-danger-600 shadow-card">
          <Siren className="size-7" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 id="em-title" className="t-h2">Need urgent help?</h2>
          <p className="mt-1 text-ink-600">Our emergency teams are ready 24/7. If someone's life is at risk, call an ambulance right away.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="tel:108" className="inline-flex h-13 items-center gap-2 rounded-lg bg-danger-600 px-6 font-semibold text-white shadow-[0_6px_16px_-6px_rgb(201_47_60/0.5)] hover:bg-danger-700">
            <Phone className="size-5" aria-hidden="true" /> Call 108 Ambulance
          </a>
          <ButtonLink to="/emergency" size="lg" variant="outline">
            <MapPin className="size-5" aria-hidden="true" /> Nearest emergency
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function AppPromo() {
  const features = [
    { icon: CalendarCheck2, label: "Book & manage appointments" },
    { icon: FileText, label: "All records in one place" },
    { icon: Video, label: "Video consultations" },
    { icon: BookOpen, label: "Trusted health library" },
  ];
  return (
    <section className="container-page py-16" aria-labelledby="app-title">
      <div className="grid overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-[#1a8fc4] text-white lg:grid-cols-2">
        <div className="p-8 sm:p-10 lg:p-12">
          <p className="t-eyebrow text-primary-100">HealthSphere app</p>
          <h2 id="app-title" className="t-h1 mt-2 text-white">Your health, in your hands.</h2>
          <p className="mt-3 max-w-md text-primary-50">Manage appointments, records, doctors and your care journey on the go — with reminders that keep you on track.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-small font-medium">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/15"><Icon className="size-4.5" aria-hidden="true" /></span>
                {label}
              </li>
            ))}
          </ul>
          <StoreBadges className="mt-8" />
        </div>
        <div className="relative min-h-64 bg-white/10">
          <SmartImage image={{ name: "healthsphere-app-promotion", alt: "Woman using the HealthSphere app on her phone, with the app's home screen shown", focus: "35% 50%" }} sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0 size-full" />
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   Phone home — an app experience, not a squeezed landing page
   ========================================================================= */

export const mobileIntents = [
  { title: "Check a Symptom", text: "Find the right care", to: "/symptoms", icon: Thermometer, tone: "#12a383" },
  { title: "Find a Specialist", text: "500+ experts", to: "/doctors", icon: Stethoscope, tone: "#2a74ec" },
  { title: "Manage My Care", text: "Track your treatment", to: "/care", icon: FolderHeart, tone: "#7c5cfc" },
  { title: "Access Health Records", text: "Reports & prescriptions", to: "/records", icon: FileText, tone: "#d96612" },
];

export const quickActions = [
  { label: "Emergency", to: "/emergency", icon: Ambulance, tone: "#c92f3c" },
  { label: "Nearby Hospitals", to: "/hospitals", icon: MapPin, tone: "#2a74ec" },
  { label: "Health Tips", to: "/health-library", icon: BookOpen, tone: "#12a383" },
  { label: "Medicines", to: "/records?tab=prescriptions", icon: Pill, tone: "#7c5cfc" },
];

export function MobileHome() {
  const { signedIn, signIn, appointments, notifications } = useAppState();
  const { openSearch } = useGlobalSearch();
  const next = appointments.filter((a) => a.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date))[0];
  const metrics = healthMetrics.filter((m) => m.id !== "spo2");
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-7 px-4 pt-5 pb-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-stat leading-tight font-bold tracking-tight">
            {greeting()}{signedIn ? `, ${currentPatient.firstName}` : ""} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-0.5 text-small text-ink-500">Your health journey matters.</p>
        </div>
        {signedIn ? (
          <Link to="/profile" className="relative rounded-full" aria-label={`Profile${unread ? `, ${unread} unread notifications` : ""}`}>
            <Avatar name={currentPatient.name} initials={currentPatient.initials} size={44} />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 inline-flex size-4.5 items-center justify-center rounded-full bg-danger-500 text-micro font-bold text-white ring-2 ring-white" aria-hidden="true">{unread}</span>}
          </Link>
        ) : (
          <ButtonLink to="/login" size="sm" variant="secondary">Login</ButtonLink>
        )}
      </header>

      <button onClick={() => openSearch()} aria-label="Search symptoms, doctors, specialties" className="flex h-12 w-full items-center gap-3 rounded-full border border-line bg-white px-4 text-left text-ink-500 shadow-xs">
        <Search className="size-5" aria-hidden="true" />
        <span className="min-w-0 truncate text-control">Search symptoms, doctors, specialties…</span>
      </button>

      {signedIn && next && <NextAppointmentCard appointment={next} />}

      <section aria-labelledby="m-intents">
        <h2 id="m-intents" className="t-h3 mb-3">What brings you here today?</h2>
        <div className="grid grid-cols-2 gap-3">
          {mobileIntents.map(({ title, text, to, icon: Icon, tone }) => (
            <Link key={title} to={to} className="card flex min-h-[7.5rem] flex-col justify-between p-4 active:scale-[0.98]" style={{ "--accent": tone, "--accent-tint": `${tone}16` } as React.CSSProperties}>
              <span className="accent-icon inline-flex size-10 items-center justify-center rounded-xl"><Icon className="size-5" aria-hidden="true" /></span>
              <span>
                <span className="block font-bold text-ink-900">{title}</span>
                <span className="block text-caption text-ink-500">{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {signedIn ? (
        <>
          <section aria-labelledby="m-journey">
            <SectionHeader id="m-journey" size="sm" title="My active care" action={{ label: "See all", to: "/care" }} className="mb-3" />
            <JourneyCard journey={careJourneys[0]} variant="compact" />
          </section>

          <section aria-labelledby="m-health">
            <SectionHeader id="m-health" size="sm" title="Health overview" action={{ label: "Insights", to: "/insights" }} className="mb-3" />
            <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1" tabIndex={0} role="region" aria-label="Health metrics, scroll for more">
              {metrics.map((m) => (
                <HealthMetricCard key={m.id} metric={m} compact className="w-40 shrink-0 snap-start" />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="card flex items-center gap-4 p-4" aria-label="Sign in">
          <IconTile icon="ShieldCheck" />
          <div className="flex-1">
            <p className="font-bold">See your appointments & care</p>
            <p className="text-small text-ink-500">Sign in to personalise HealthSphere.</p>
          </div>
          <Button size="sm" onClick={signIn}>Demo</Button>
        </section>
      )}

      <section aria-labelledby="m-quick">
        <h2 id="m-quick" className="t-h3 mb-3">Quick actions</h2>
        <ul className="grid grid-cols-4 gap-2">
          {quickActions.map(({ label, to, icon: Icon, tone }) => (
            <li key={label}>
              <Link to={to} className="flex flex-col items-center gap-2 rounded-xl py-2 text-center" style={{ "--accent": tone, "--accent-tint": `${tone}14` } as React.CSSProperties}>
                <span className="accent-icon inline-flex size-13 items-center justify-center rounded-2xl"><Icon className="size-6" aria-hidden="true" /></span>
                <span className="text-caption leading-tight font-semibold text-ink-700">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="m-spec">
        <SectionHeader id="m-spec" size="sm" title="Explore specialties" action={{ label: "All", to: "/specialties" }} className="mb-3" />
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {specialties.map((s) => (
            <SpecialtyTile key={s.slug} specialty={s} className="w-28 shrink-0 snap-start px-2" />
          ))}
        </div>
      </section>

      <section aria-labelledby="m-tip">
        <SectionHeader id="m-tip" size="sm" title="Health tip for you" action={{ label: "Library", to: "/health-library" }} className="mb-3" />
        <ArticleCard article={articles[1]} horizontal />
      </section>

      <Link to="/emergency" className="flex items-center gap-3 rounded-2xl border border-danger-100 bg-danger-50 p-4">
        <Siren className="size-6 text-danger-600" aria-hidden="true" />
        <span className="flex-1">
          <span className="block font-bold text-danger-700">Emergency help</span>
          <span className="block text-small text-ink-600">Call an ambulance, share location</span>
        </span>
        <ArrowRight className="size-5 text-danger-600" aria-hidden="true" />
      </Link>

      <p className="flex items-center justify-center gap-1.5 text-caption text-ink-500">
        <Clock className="size-3.5" aria-hidden="true" /> Demo data · Not for real medical use
      </p>
    </div>
  );
}
