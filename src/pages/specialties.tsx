import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CalendarCheck2, ChevronDown, ChevronRight, Search, Stethoscope } from "lucide-react";
import { getSpecialty, specialties, toneStyle } from "@/data/specialties";
import { doctorsBySpecialty } from "@/data/doctors";
import { hospitals } from "@/data/hospitals";
import { articles } from "@/data/articles";
import { careJourneys } from "@/data/journeys";
import { SpecialtyImageCard } from "@/components/specialties/SpecialtyCard";
import { specialtyModules } from "@/components/specialties/modules";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { HospitalCard } from "@/components/health/HospitalCard";
import { ArticleCard } from "@/components/health/ArticleCard";
import { JourneyCard, JourneyTemplate } from "@/components/care-journey/CareJourney";
import { Disclaimer, EmptyState, IconTile, SearchBar, SectionHeader, SmartImage } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAppState } from "@/lib/store";
import { getIcon } from "@/lib/icons";
import { cn, formatINR } from "@/lib/utils";
import { NotFoundPage } from "./public";

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-small text-ink-500">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" aria-hidden="true" />}
            {it.to ? <Link to={it.to} className="inline-flex min-h-11 items-center rounded hover:text-primary-700 sm:min-h-0">{it.label}</Link> : <span aria-current="page" className="font-medium text-ink-800">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* =========================================================== Index page */
export function SpecialtiesPage() {
  useDocumentTitle("Specialties");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return specialties;
    return specialties.filter((x) => [x.name, x.description, ...x.conditions.map((c) => c.name), ...x.specialistTitles].join(" ").toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="t-eyebrow text-primary-700">Specialty-first care</p>
          <h1 className="t-h1 mt-2">Care designed for every part of you</h1>
          <p className="mt-3 max-w-2xl text-lead text-ink-600">Each specialty has its own tests, treatments, specialists and care journey — so you always know what comes next.</p>
        </div>
        <SearchBar value={q} onChange={setQ} placeholder="Search a specialty, condition or specialist…" label="Filter specialties" />
      </div>


      <p className="sr-only" aria-live="polite">{list.length} specialties shown</p>
      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => <SpecialtyImageCard key={s.slug} specialty={s} headingLevel="h2" />)}
        </div>
      ) : (
        <EmptyState icon={Search} title="No specialties match" description={`We couldn't find “${q}”. Try the symptom checker instead.`} action={<ButtonLink to="/symptoms">Check a symptom</ButtonLink>} />
      )}

      <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-white p-6 shadow-card sm:flex-row sm:items-center">
        <IconTile icon="Stethoscope" size="lg" />
        <div className="flex-1">
          <h2 className="t-h3">Not sure which specialty you need?</h2>
          <p className="text-small text-ink-500">Tell us your symptoms and we'll suggest a care pathway.</p>
        </div>
        <ButtonLink to="/symptoms">Find My Care <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
      </div>
    </div>
  );
}

/* ========================================================= Detail page */
export function SpecialtyPage() {
  const { slug } = useParams();
  const spec = getSpecialty(slug);
  useDocumentTitle(spec?.name ?? "Specialty");
  const { signedIn } = useAppState();
  if (!spec) return <NotFoundPage />;

  const docs = doctorsBySpecialty(spec.slug);
  const hosp = hospitals.filter((h) => h.departments.includes(spec.slug)).slice(0, 3);
  const related = articles.filter((a) => a.category === spec.libraryCategory).slice(0, 3);
  const journey = careJourneys.find((j) => j.specialty === spec.slug);
  const Module = specialtyModules[spec.module];
  const kinds = ["test", "treatment", "procedure", "program"] as const;
  const kindLabel = { test: "Tests & diagnostics", treatment: "Treatments", procedure: "Procedures", program: "Programs" };
  const presentKinds = kinds.filter((k) => spec.services.some((s) => s.kind === k));

  return (
    <div style={toneStyle(spec.slug)}>
      {/* ------------------------------------------------------- Hero */}
      <section className="bg-gradient-to-b from-[var(--accent-tint)] to-canvas" aria-labelledby="spec-h1">
        <div className="container-page pt-6 pb-10 sm:pt-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Specialties", to: "/specialties" }, { label: spec.name }]} />
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3">
                <IconTile icon={spec.icon} size="lg" className="bg-white shadow-card" />
                <p className="t-eyebrow text-accent">{spec.name}</p>
              </div>
              <h1 id="spec-h1" className="t-h1 mt-4">{spec.headline}</h1>
              <p className="mt-3 max-w-xl text-lead text-ink-600">{spec.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink to={`/appointments/book?specialty=${spec.slug}`} size="lg" variant="accent">
                  <CalendarCheck2 className="size-5" aria-hidden="true" /> Book Consultation
                </ButtonLink>
                <ButtonLink to={`/doctors?specialty=${spec.slug}`} size="lg" variant="outline">
                  <Stethoscope className="size-5" aria-hidden="true" /> Find a specialist
                </ButtonLink>
              </div>
              <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4">
                {spec.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-caption text-ink-500">{s.label}</dt>
                    <dd className="text-stat font-bold tracking-tight text-ink-900">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="order-1 overflow-hidden rounded-3xl bg-white shadow-raised lg:order-2">
              <SmartImage image={spec.image} priority sizes="(min-width: 1024px) 55vw, 100vw" className="aspect-[3/2] w-full" />
            </div>
          </div>

          {/* quick actions */}
          <ul className="scrollbar-none -mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0" aria-label={`${spec.name} quick actions`}>
            {spec.quickActions.map((a) => {
              const Icon = getIcon(a.icon);
              return (
                <li key={a.label} className="shrink-0">
                  <Link to={`/appointments/book?specialty=${spec.slug}&reason=${encodeURIComponent(a.label)}`} className="card card-interactive flex w-28 flex-col items-center gap-2 p-4 text-center sm:w-auto">
                    <span className="accent-icon inline-flex size-11 items-center justify-center rounded-full"><Icon className="size-5" aria-hidden="true" /></span>
                    <span className="text-small font-semibold text-ink-800">{a.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="container-page space-y-16 py-12">
        {/* ------------------------------------------- Specialty module */}
        <section aria-labelledby="mod-title">
          <SectionHeader id="mod-title" title={Module.title} subtitle="Interactive tools built for this specialty. Educational guidance — not a diagnosis." />
          <Module.component />
        </section>

        {/* ------------------------------------------------- Journey */}
        <section aria-labelledby="jr-title">
          <SectionHeader id="jr-title" title={`Your ${spec.name} journey`} subtitle="What to expect, step by step — HealthSphere coordinates every stage." />
          <div className="card p-5 sm:p-8">
            <JourneyTemplate stages={spec.journey} />
          </div>
          {journey && signedIn ? (
            <div className="mt-4">
              <p className="mb-2 text-small font-semibold text-ink-600">You're on this journey</p>
              <JourneyCard journey={journey} className="lg:max-w-3xl" />
            </div>
          ) : (
            <div className="card mt-4 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex-1">
                <h3 className="t-h3">Start your journey</h3>
                <p className="mt-1 text-small text-ink-500">Book a consultation and we'll build your personal care journey — tests, results, treatment and follow-ups in one timeline.</p>
              </div>
              <ButtonLink to={`/appointments/book?specialty=${spec.slug}`} variant="accent">Book consultation</ButtonLink>
            </div>
          )}
        </section>

        {/* ---------------------------------------------- Conditions */}
        <section aria-labelledby="cond-title">
          <SectionHeader id="cond-title" title="Conditions we treat" />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {spec.conditions.map((c) => (
              <li key={c.name} className="card flex gap-4 p-5">
                <IconTile icon={c.icon} />
                <div>
                  <h3 className="font-bold text-ink-900">{c.name}</h3>
                  <p className="mt-1 text-small text-ink-500">{c.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------ Services */}
        <section aria-labelledby="svc-title">
          <SectionHeader id="svc-title" title="Tests, treatments & procedures" subtitle="Indicative starting prices at partner hospitals. Your doctor will confirm what you need." />
          <Tabs defaultValue="all">
            <TabsList aria-label="Filter services" className="mb-5">
              <TabsTrigger value="all" className="data-[state=active]:bg-accent-ink">All</TabsTrigger>
              {presentKinds.map((k) => <TabsTrigger key={k} value={k} className="data-[state=active]:bg-accent-ink">{kindLabel[k]}</TabsTrigger>)}
            </TabsList>
            {["all", ...presentKinds].map((k) => (
              <TabsContent key={k} value={k}>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {spec.services.filter((s) => k === "all" || s.kind === k).map((s) => (
                    <li key={s.name} className="card flex flex-col p-5">
                      <div className="flex items-start gap-3">
                        <IconTile icon={s.icon} size="sm" />
                        <div className="flex-1">
                          <h3 className="font-bold text-ink-900">{s.name}</h3>
                          <p className="mt-0.5 text-small text-ink-500">{s.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-small">
                        <span className="text-ink-500">{s.duration ?? kindLabel[s.kind].replace(/s$/, "")}</span>
                        <span className="font-semibold text-ink-900">{s.priceFrom === undefined ? "On consultation" : s.priceFrom === 0 ? "Included" : `From ${formatINR(s.priceFrom)}`}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* -------------------------------------------- Specialists */}
        <section aria-labelledby="sp-title">
          <SectionHeader id="sp-title" title={`${spec.name} specialists`} subtitle={spec.specialistTitles.join(" · ")} action={{ label: "View all", to: `/doctors?specialty=${spec.slug}` }} />
          <div className="grid gap-4 md:grid-cols-2">
            {docs.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        </section>

        {/* ---------------------------------------------- Hospitals */}
        {hosp.length > 0 && (
          <section aria-labelledby="h-title">
            <SectionHeader id="h-title" title="Where to get care" action={{ label: "All hospitals", to: "/hospitals" }} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{hosp.map((h) => <HospitalCard key={h.id} hospital={h} />)}</div>
          </section>
        )}

        {/* ------------------------------------------------- FAQs */}
        <section aria-labelledby="faq-title" className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 id="faq-title" className="t-h2">Common questions</h2>
            <p className="mt-2 text-ink-500">Answers reviewed by our {spec.specialistTitles[0].toLowerCase()}s.</p>
          </div>
          <div className="space-y-3">
            {spec.faqs.map((f) => (
              <details key={f.q} className="group card p-0 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink-900">
                  {f.q}
                  <ChevronDown className="size-5 shrink-0 text-ink-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-5 pb-5 text-ink-600">{f.a}</p>
              </details>
            ))}
            <Disclaimer />
          </div>
        </section>

        {/* ---------------------------------------------- Articles */}
        {related.length > 0 && (
          <section aria-labelledby="ar-title">
            <SectionHeader id="ar-title" title="Learn more" action={{ label: "Health Library", to: "/health-library" }} />
            <div className="grid gap-5 md:grid-cols-3">{related.map((a) => <ArticleCard key={a.slug} article={a} />)}</div>
          </section>
        )}

        {/* --------------------------------------- Other specialties */}
        <section aria-labelledby="os-title">
          <h2 id="os-title" className="t-h3 mb-4">Other specialties</h2>
          <ul className="flex flex-wrap gap-2">
            {specialties.filter((s) => s.slug !== spec.slug).map((s) => {
              const Icon = getIcon(s.icon);
              return (
                <li key={s.slug}>
                  <Link to={`/specialties/${s.slug}`} style={toneStyle(s.slug)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-small font-semibold text-ink-700 hover:border-[color:var(--accent)] hover:text-accent">
                    <Icon className="size-4 text-accent" aria-hidden="true" /> {s.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* sticky phone CTA */}
      <div className={cn("safe-bottom fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden")}>
        <ButtonLink to={`/appointments/book?specialty=${spec.slug}`} block size="lg" variant="accent">
          Book {spec.name} Consultation
        </ButtonLink>
      </div>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
