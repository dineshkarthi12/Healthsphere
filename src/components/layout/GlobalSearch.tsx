import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as RDialog from "@radix-ui/react-dialog";
import { ArrowRight, Building2, FileText, Search, Stethoscope, Thermometer, X } from "lucide-react";
import { specialties, toneStyle } from "@/data/specialties";
import { doctors } from "@/data/doctors";
import { hospitals } from "@/data/hospitals";
import { articles } from "@/data/articles";
import { symptoms } from "@/data/symptoms";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Result {
  id: string;
  group: "Symptoms" | "Specialties" | "Doctors" | "Hospitals" | "Health Library";
  title: string;
  subtitle: string;
  to: string;
  icon: React.ReactNode;
}

function score(text: string, q: string) {
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.includes(` ${q}`)) return 2;
  if (t.includes(q)) return 1;
  return 0;
}

export function useSearchResults(query: string, limitPerGroup = 4): Result[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: (Result & { s: number })[] = [];
    for (const s of symptoms) {
      const sc = Math.max(score(s.label, q), ...s.keywords.map((k) => score(k, q)));
      if (sc) out.push({ id: `sym-${s.id}`, group: "Symptoms", title: s.label, subtitle: `Care pathway · ${specialties.find((x) => x.slug === s.specialty)?.name}`, to: `/symptoms?s=${s.id}`, icon: <Thermometer className="size-4.5" />, s: sc });
    }
    for (const s of specialties) {
      const sc = Math.max(score(s.name, q), ...s.conditions.map((c) => score(c.name, q)), ...s.specialistTitles.map((t) => score(t, q)));
      if (sc) {
        const Icon = getIcon(s.icon);
        out.push({ id: `sp-${s.slug}`, group: "Specialties", title: s.name, subtitle: s.conditions.slice(0, 3).map((c) => c.name).join(" · "), to: `/specialties/${s.slug}`, icon: <span style={toneStyle(s.slug)} className="text-accent"><Icon className="size-4.5" /></span>, s: sc + 1 });
      }
    }
    for (const d of doctors) {
      const sc = Math.max(score(d.name.replace("Dr. ", ""), q), score(d.title, q), score(d.subSpecialty, q));
      if (sc) out.push({ id: `d-${d.id}`, group: "Doctors", title: d.name, subtitle: `${d.title} · ${d.subSpecialty}`, to: `/doctors/${d.id}`, icon: <Stethoscope className="size-4.5" />, s: sc });
    }
    for (const h of hospitals) {
      const sc = Math.max(score(h.name, q), score(h.city, q), score(h.area, q));
      if (sc) out.push({ id: `h-${h.id}`, group: "Hospitals", title: h.name, subtitle: `${h.area}, ${h.city}`, to: `/hospitals/${h.id}`, icon: <Building2 className="size-4.5" />, s: sc });
    }
    for (const a of articles) {
      const sc = Math.max(score(a.title, q), score(a.category, q));
      if (sc) out.push({ id: `a-${a.slug}`, group: "Health Library", title: a.title, subtitle: `${a.category} · ${a.readMinutes} min read`, to: `/health-library/${a.slug}`, icon: <FileText className="size-4.5" />, s: sc });
    }
    const groups: Result["group"][] = ["Symptoms", "Specialties", "Doctors", "Hospitals", "Health Library"];
    return groups.flatMap((g) => out.filter((r) => r.group === g).sort((a, b) => b.s - a.s).slice(0, limitPerGroup));
  }, [query, limitPerGroup]);
}

const suggestions = ["Chest pain", "LASIK", "Back pain", "Pregnancy", "Dr. Ananya", "Vaccination"];

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useSearchResults(query);
  const navigate = useNavigate();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active].to);
    }
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let lastGroup = "";
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-ink-900/35 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <RDialog.Content className="fixed inset-x-0 top-0 z-50 flex max-h-[100dvh] flex-col bg-white shadow-float focus:outline-none data-[state=open]:animate-fade-in sm:inset-x-auto sm:top-[10vh] sm:left-1/2 sm:max-h-[75vh] sm:w-[40rem] sm:-translate-x-1/2 sm:rounded-2xl">
          <RDialog.Title className="sr-only">Search HealthSphere</RDialog.Title>
          <RDialog.Description className="sr-only">Search symptoms, specialties, doctors, hospitals and health articles. Use arrow keys to move through results.</RDialog.Description>
          <div className="flex items-center gap-3 border-b border-line px-4 py-2">
            <Search className="size-5 shrink-0 text-ink-400" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search symptoms, doctors, specialties…"
              className="h-12 min-w-0 flex-1 bg-transparent text-body text-ink-900 placeholder:text-ink-400 focus:outline-none"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="global-search-results"
              aria-activedescendant={results[active] ? `gs-${results[active].id}` : undefined}
              aria-label="Search"
            />
            <RDialog.Close className="inline-flex size-11 items-center justify-center rounded-full text-ink-500 hover:bg-subtle" aria-label="Close search">
              <X className="size-5" aria-hidden="true" />
            </RDialog.Close>
          </div>
          <div className="overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <div className="p-3">
                <p className="t-eyebrow mb-3 text-ink-500">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => setQuery(s.replace("Dr. ", ""))} className="min-h-11 rounded-full border border-line bg-white px-4 text-small font-medium text-ink-700 hover:border-primary-300 hover:text-primary-700">
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={() => go("/symptoms")} className="mt-5 flex w-full items-center gap-3 rounded-xl bg-primary-25 p-4 text-left hover:bg-primary-50">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-white text-primary-600 shadow-xs">
                    <Thermometer className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink-900">Not sure where to start?</span>
                    <span className="block text-small text-ink-500">Use the symptom checker to find the right care pathway.</span>
                  </span>
                  <ArrowRight className="size-5 text-primary-600" aria-hidden="true" />
                </button>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center" role="status">
                <p className="font-semibold text-ink-900">No results for “{query}”</p>
                <p className="mt-1 text-small text-ink-500">Try a symptom like “headache” or a specialty like “heart”.</p>
              </div>
            ) : (
              <ul id="global-search-results" role="listbox" ref={listRef} aria-label="Search results">
                {results.map((r, i) => {
                  const header = r.group !== lastGroup ? r.group : null;
                  lastGroup = r.group;
                  return (
                    <li key={r.id} role="presentation">
                      {header && <p className="t-eyebrow px-3 pt-3 pb-1.5 text-ink-500" role="presentation">{header}</p>}
                      <div
                        id={`gs-${r.id}`}
                        role="option"
                        aria-selected={i === active}
                        data-index={i}
                        onClick={() => go(r.to)}
                        onMouseMove={() => setActive(i)}
                        className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 py-2", i === active ? "bg-primary-50" : "hover:bg-subtle")}
                      >
                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-600" aria-hidden="true">{r.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-ink-900">{r.title}</span>
                          <span className="block truncate text-small text-ink-500">{r.subtitle}</span>
                        </span>
                        {i === active && <ArrowRight className="size-4 text-primary-600" aria-hidden="true" />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

const SearchCtx = createContext<{ openSearch: () => void }>({ openSearch: () => {} });

/** Provides a single global search dialog that any component can open (⌘K / Ctrl+K too). */
export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const value = useMemo(() => ({ openSearch: () => setOpen(true) }), []);
  return (
    <SearchCtx.Provider value={value}>
      {children}
      <GlobalSearch open={open} onOpenChange={setOpen} />
    </SearchCtx.Provider>
  );
}

export const useGlobalSearch = () => useContext(SearchCtx);
