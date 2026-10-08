import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { BadgeCheck, BookOpen, CalendarCheck2, CheckCircle2, Clock, Share2 } from "lucide-react";
import { articleCategories, articles, getArticle } from "@/data/articles";
import { specialties } from "@/data/specialties";
import { ArticleCard } from "@/components/health/ArticleCard";
import { Disclaimer, EmptyState, SearchBar, SectionHeader, SmartImage } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/overlays";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn, formatDate } from "@/lib/utils";
import { Breadcrumbs } from "./specialties";
import { NotFoundPage } from "./public";

export function LibraryPage() {
  useDocumentTitle("Health Library");
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const cat = params.get("category") ?? "";
  const setCat = (c: string) => { const n = new URLSearchParams(params); if (c) n.set("category", c); else n.delete("category"); setParams(n, { replace: true }); };
  const list = useMemo(() => {
    const s = q.toLowerCase().trim();
    return articles.filter((a) => (!cat || a.category === cat) && (!s || `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(s)));
  }, [q, cat]);
  const featured = !cat && !q ? articles.find((a) => a.featured) : undefined;
  const rest = featured ? list.filter((a) => a.slug !== featured.slug) : list;

  return (
    <div>
      <section className="bg-gradient-to-b from-primary-25 to-canvas">
        <div className="container-page grid items-center gap-8 py-8 sm:py-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Health Library" }]} />
            <h1 className="t-h1">Trusted health information for a healthier tomorrow</h1>
            <p className="mt-3 max-w-xl text-lead text-ink-600">Clear, clinically reviewed articles on conditions, prevention and everyday wellbeing.</p>
            <SearchBar value={q} onChange={setQ} placeholder="Search health topics…" label="Search health topics" size="lg" className="mt-6 max-w-lg" onSubmit={() => {}} />
          </div>
          <div className="relative hidden aspect-[3/2] overflow-hidden rounded-3xl shadow-raised lg:block">
            <SmartImage image={{ name: "health-library-banner", alt: "Doctor reading at a desk surrounded by health library books and topics", focus: "40% 40%" }} priority sizes="50vw" className="absolute inset-0 size-full" />
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        <Disclaimer className="mb-6">Health Library content is educational information and not a personal diagnosis. Always consult a qualified doctor about your own health.</Disclaimer>
        <div className="scrollbar-none -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Categories">
          {["", ...articleCategories].map((c) => (
            <button key={c || "all"} aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("min-h-11 shrink-0 rounded-full border px-4 text-small font-semibold", cat === c ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-ink-700 hover:border-line-strong")}>{c || "All topics"}</button>
          ))}
        </div>

        {featured && (
          <Link to={`/health-library/${featured.slug}`} className="group card card-interactive mb-8 grid overflow-hidden md:grid-cols-2">
            <div className="relative aspect-[16/10] bg-subtle md:aspect-auto"><SmartImage image={featured.image} sizes="(min-width:768px) 50vw, 100vw" className="absolute inset-0 size-full" /></div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="t-eyebrow text-primary-700">Featured · {featured.category}</p>
              <h2 className="t-h2 mt-2 group-hover:text-primary-700">{featured.title}</h2>
              <p className="mt-2 text-ink-600">{featured.excerpt}</p>
              <p className="mt-4 flex items-center gap-1.5 text-small text-ink-500"><Clock className="size-4" aria-hidden="true" />{featured.readMinutes} min read · {formatDate(featured.date)}</p>
            </div>
          </Link>
        )}

        <p className="sr-only" aria-live="polite">{list.length} articles</p>
        {rest.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.map((a) => <ArticleCard key={a.slug} article={a} />)}</div>
        ) : (
          <EmptyState icon={BookOpen} title="No articles found" description="Try another topic or clear your search." action={<Button onClick={() => { setQ(""); setCat(""); }}>Show all articles</Button>} />
        )}
      </div>
    </div>
  );
}

const categoryToSpecialty: Record<string, string> = {
  Eye: "eye-care", Heart: "heart-care", Brain: "brain-neuro", Bone: "bone-spine", Skin: "skin-care", Children: "child-care", "Women's Health": "womens-health", Lungs: "lung-care", Kidney: "kidney-urology", Dental: "dental-care", Cancer: "cancer-care",
};

export function ArticlePage() {
  const { slug } = useParams();
  const a = getArticle(slug);
  useDocumentTitle(a?.title ?? "Article");
  const { toast } = useToast();
  if (!a) return <NotFoundPage />;
  const related = articles.filter((x) => x.slug !== a.slug && (x.category === a.category || x.featured)).slice(0, 3);
  const spec = specialties.find((s) => s.slug === categoryToSpecialty[a.category]);

  return (
    <article className="pb-16">
      <div className="container-page max-w-4xl pt-6">
        <Breadcrumbs items={[{ label: "Health Library", to: "/health-library" }, { label: a.category, to: `/health-library?category=${encodeURIComponent(a.category)}` }, { label: "Article" }]} />
        <p className="t-eyebrow text-primary-700">{a.category}</p>
        <h1 className="t-h1 mt-2">{a.title}</h1>
        <p className="mt-3 text-lead text-ink-600">{a.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-ink-500">
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden="true" />{a.readMinutes} min read</span>
          <span>{formatDate(a.date, { day: "numeric", month: "long", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-success-700"><BadgeCheck className="size-4" aria-hidden="true" />{a.reviewer}</span>
          <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); toast({ title: "Link copied", description: "Share it with family or friends." }); }}><Share2 className="size-4" aria-hidden="true" />Share</Button>
        </div>
        <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-3xl bg-subtle"><SmartImage image={a.image} priority sizes="(min-width:1024px) 900px, 100vw" className="absolute inset-0 size-full" /></div>
      </div>

      <div className="container-page mt-8 grid max-w-4xl gap-8">
        <aside className="rounded-2xl border border-primary-100 bg-primary-25 p-5" aria-labelledby="kt">
          <h2 id="kt" className="font-bold">Key takeaways</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">{a.keyTakeaways.map((k) => <li key={k} className="flex gap-2 text-small text-ink-800"><CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-success-700" aria-hidden="true" />{k}</li>)}</ul>
        </aside>
        <div className="max-w-[68ch] space-y-6 text-[1.0625rem] leading-relaxed text-ink-800">
          {a.body.map((sec, i) => (
            <section key={i}>
              {sec.heading && <h2 className="t-h3 mb-2">{sec.heading}</h2>}
              {sec.paragraphs.map((p) => <p key={p} className="mb-3">{p}</p>)}
              {sec.list && <ul className="list-disc space-y-1.5 pl-6">{sec.list.map((l) => <li key={l}>{l}</li>)}</ul>}
            </section>
          ))}
        </div>
        <Disclaimer>This article is educational information and not a personal diagnosis. If you have symptoms or concerns, please speak to a qualified doctor.</Disclaimer>
        {spec && (
          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex-1"><h2 className="t-h3">Talk to a {spec.specialistTitles[0].toLowerCase()}</h2><p className="text-small text-ink-500">Get personal advice from a {spec.name} specialist.</p></div>
            <ButtonLink to={`/appointments/book?specialty=${spec.slug}`}><CalendarCheck2 className="size-4" aria-hidden="true" />Book consultation</ButtonLink>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="container-page mt-14" aria-labelledby="rel">
          <SectionHeader id="rel" title="Keep reading" action={{ label: "All articles", to: "/health-library" }} />
          <div className="grid gap-5 md:grid-cols-3">{related.map((r) => <ArticleCard key={r.slug} article={r} />)}</div>
        </section>
      )}
    </article>
  );
}
