import { Suspense, useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { PageSkeleton } from "./PageSkeleton";
import { GlobalSearchProvider } from "./GlobalSearch";
import { cn } from "@/lib/utils";

/** Routes that run full-screen on phones (own sticky actions, no tab bar). */
const immersive = ["/consultation", "/appointments/book"];

export function SkipLink() {
  return (
    <a href="#main" className="sr-only z-[100] rounded-md bg-primary-600 px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
      Skip to main content
    </a>
  );
}

/** Public + patient shell: header, content, footer and phone tab bar. */
export function AppLayout() {
  const { pathname } = useLocation();
  const isImmersive = immersive.some((p) => pathname.startsWith(p));

  useEffect(() => {
    // Move focus to main content on route change for screen-reader users.
    const main = document.getElementById("main");
    main?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <GlobalSearchProvider>
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <div className={cn(isImmersive && "hidden md:block")}>
        <Header />
      </div>
      <main id="main" tabIndex={-1} className={cn("flex-1 focus:outline-none", !isImmersive && "pb-20 md:pb-0")}>
        <Suspense fallback={<PageSkeleton />}>
          <div key={pathname} className="animate-fade-up">
            <Outlet />
          </div>
        </Suspense>
      </main>
      {!isImmersive && <Footer />}
      {!isImmersive && <MobileBottomNav />}
      <ScrollRestoration />
    </div>
    </GlobalSearchProvider>
  );
}
