import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, ClipboardList, Search } from "lucide-react";
import { careJourneys } from "@/data/journeys";
import { currentPatient, healthMetrics } from "@/data/patient";
import { RequireSession } from "@/components/layout/RequireSession";
import { useGlobalSearch } from "@/components/layout/GlobalSearch";
import { NextAppointmentCard } from "@/components/appointments/AppointmentCard";
import { JourneyCard } from "@/components/care-journey/CareJourney";
import { HealthMetricCard } from "@/components/health/HealthMetricCard";
import { EmptyState, SectionHeader, StatusBadge } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useAppState } from "@/lib/store";
import { formatDate, greeting, TODAY } from "@/lib/utils";
import { MobileHome, mobileIntents, quickActions } from "../home";

/** Patient home. Phones get the app home; larger screens a dashboard layout. */
export function DashboardPage() {
  useDocumentTitle("My health");
  const isDesktop = useIsDesktop();
  return <RequireSession title="Sign in to see your health home">{isDesktop ? <DesktopDashboard /> : <MobileHome />}</RequireSession>;
}

function DesktopDashboard() {
  const { appointments, records } = useAppState();
  const { openSearch } = useGlobalSearch();
  const next = appointments.filter((a) => a.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date))[0];
  const active = careJourneys.filter((j) => j.status === "active");
  const metrics = healthMetrics.filter((m) => m.id !== "spo2");
  const recent = [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div className="container-page py-8 lg:py-10">
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-small font-medium text-ink-500">{formatDate(TODAY.toISOString(), { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="t-h1 mt-1">
            {greeting(TODAY)}, {currentPatient.firstName} <span aria-hidden="true">👋</span>
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button onClick={() => openSearch()} className="flex h-12 min-w-0 items-center gap-3 rounded-full border border-line bg-white px-4 text-left text-ink-500 shadow-xs hover:border-line-strong sm:w-96">
            <Search className="size-5 shrink-0" aria-hidden="true" />
            <span className="truncate text-control">Search symptoms, doctors, specialties…</span>
          </button>
          <ButtonLink to="/appointments/book" size="lg"><CalendarPlus className="size-5" aria-hidden="true" />Book appointment</ButtonLink>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-8">
          {next ? (
            <NextAppointmentCard appointment={next} />
          ) : (
            <EmptyState title="No upcoming appointments" description="Book a consultation with a specialist in a few taps." action={<ButtonLink to="/appointments/book">Book appointment</ButtonLink>} />
          )}

          <section aria-labelledby="d-entry">
            <h2 id="d-entry" className="t-h3 mb-3">What would you like to do?</h2>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {mobileIntents.map(({ title, text, to, icon: Icon, tone }) => (
                <Link key={title} to={to} className="card card-interactive flex flex-col gap-4 p-4" style={{ "--accent": tone, "--accent-tint": `${tone}16` } as React.CSSProperties}>
                  <span className="accent-icon inline-flex size-10 items-center justify-center rounded-xl"><Icon className="size-5" aria-hidden="true" /></span>
                  <span>
                    <span className="block font-bold text-ink-900">{title}</span>
                    <span className="block text-caption text-ink-500">{text}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="d-care">
            <SectionHeader id="d-care" size="sm" title="My Care Journey" subtitle={`${active.length} active treatment journeys`} action={{ label: "All care", to: "/care" }} className="mb-3" />
            {active.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {active.map((j, i) => <JourneyCard key={j.id} journey={j} variant={i === 0 ? "default" : "compact"} className={i === 0 ? "xl:col-span-2" : undefined} />)}
              </div>
            ) : (
              <EmptyState title="No active care journeys" description="When you start treatment, every step — tests, results, procedures and follow-ups — appears here." action={<ButtonLink to="/specialties" variant="secondary">Explore specialties</ButtonLink>} />
            )}
          </section>
        </div>

        <aside className="space-y-8" aria-label="Health summary">
          <section aria-labelledby="d-health">
            <SectionHeader id="d-health" size="sm" title="Health overview" action={{ label: "Insights", to: "/insights" }} className="mb-3" />
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m, i) => <HealthMetricCard key={m.id} metric={m} compact className={i === metrics.length - 1 && metrics.length % 2 ? "col-span-2" : undefined} />)}
            </div>
          </section>

          <section aria-labelledby="d-quick">
            <h2 id="d-quick" className="t-h3 mb-3">Quick actions</h2>
            <ul className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, to, icon: Icon, tone }) => (
                <li key={label}>
                  <Link to={to} className="card card-interactive flex min-h-14 items-center gap-3 p-3 text-small font-semibold text-ink-800" style={{ "--accent": tone, "--accent-tint": `${tone}14` } as React.CSSProperties}>
                    <span className="accent-icon inline-flex size-9 items-center justify-center rounded-lg"><Icon className="size-4.5" aria-hidden="true" /></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="d-records" className="card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 id="d-records" className="font-bold">Recent records</h2>
              <Link to="/records" className="inline-flex min-h-9 items-center gap-1 text-small font-semibold text-primary-700 hover:underline">All <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
            </div>
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link to={`/records?open=${r.id}`} className="flex min-h-14 items-center gap-3 py-2 hover:text-primary-700">
                    <ClipboardList className="size-4.5 shrink-0 text-ink-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-small font-semibold">{r.title}</span>
                      <span className="block text-caption text-ink-500">{formatDate(r.date)}</span>
                    </span>
                    {r.status && <StatusBadge status={r.status} />}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
