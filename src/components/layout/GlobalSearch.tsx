import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** The dialog (and the search index data it needs) loads on first use. */
const SearchDialog = lazy(() => import("./SearchDialog"));

const SearchCtx = createContext<{ openSearch: (query?: string) => void }>({ openSearch: () => {} });

/** Provides a single global search dialog that any component can open (⌘K / Ctrl+K too). */
export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const openSearch = useCallback((q = "") => {
    setQuery(q);
    setLoaded(true);
    setOpen(true);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);
  const value = useMemo(() => ({ openSearch }), [openSearch]);
  return (
    <SearchCtx.Provider value={value}>
      {children}
      {loaded && (
        <Suspense fallback={null}>
          <SearchDialog open={open} onOpenChange={setOpen} initialQuery={query} />
        </Suspense>
      )}
    </SearchCtx.Provider>
  );
}

export const useGlobalSearch = () => useContext(SearchCtx);
