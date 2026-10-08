import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import * as RDialog from "@radix-ui/react-dialog";
import { Bell, ExternalLink, Menu, Search, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "./PageSkeleton";
import { SkipLink } from "./AppLayout";
import { cn } from "@/lib/utils";

export interface ShellNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

/** Sidebar layout shared by the doctor portal and hospital admin portal. */
export function DashboardShell({
  nav,
  portalName,
  user,
  searchPlaceholder,
}: {
  nav: ShellNavItem[];
  portalName: string;
  user: { name: string; role: string; initials: string; photo?: string };
  searchPlaceholder: string;
}) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-5">
        <Link to="/" aria-label="HealthSphere home"><Logo /></Link>
      </div>
      <p className="t-eyebrow px-5 pt-2 pb-2 text-ink-500">{portalName}</p>
      <nav aria-label={portalName} className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {nav.map(({ to, label, icon: Icon, end, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 text-small font-semibold transition-colors",
                    isActive ? "bg-primary-50 text-primary-700" : "text-ink-600 hover:bg-subtle hover:text-ink-900",
                  )
                }
              >
                <Icon className="size-4.5" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {badge ? <span className="rounded-full bg-primary-600 px-2 py-0.5 text-caption font-bold text-white">{badge}<span className="sr-only"> new</span></span> : null}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-line p-3">
        <Link to="/" className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-small font-semibold text-ink-600 hover:bg-subtle hover:text-ink-900">
          <ExternalLink className="size-4" aria-hidden="true" /> Back to HealthSphere
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-canvas">
      <SkipLink />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">{sidebar}</aside>

      <RDialog.Root open={open} onOpenChange={setOpen}>
        <RDialog.Portal>
          <RDialog.Overlay className="fixed inset-0 z-50 bg-ink-900/35 data-[state=open]:animate-fade-in lg:hidden" />
          <RDialog.Content className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-float focus:outline-none lg:hidden">
            <RDialog.Title className="sr-only">{portalName} navigation</RDialog.Title>
            <RDialog.Description className="sr-only">Portal sections</RDialog.Description>
            <RDialog.Close className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full hover:bg-subtle" aria-label="Close menu">
              <X className="size-5" aria-hidden="true" />
            </RDialog.Close>
            {sidebar}
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="size-5.5" aria-hidden="true" />
          </Button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <label htmlFor="portal-search" className="sr-only">Search</label>
            <input id="portal-search" type="search" placeholder={searchPlaceholder} className="h-10 w-full rounded-full border border-line bg-canvas pr-4 pl-10 text-small placeholder:text-ink-400 focus:border-primary-400 focus:bg-white focus:shadow-focus focus:outline-none" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications, 3 unread">
              <Bell className="size-5" aria-hidden="true" />
              <span className="absolute top-2 right-2 size-2.5 rounded-full bg-danger-500 ring-2 ring-white" aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-2.5">
              <Avatar name={user.name} initials={user.initials} photo={user.photo} size={38} />
              <div className="hidden leading-tight sm:block">
                <p className="text-small font-semibold text-ink-900">{user.name}</p>
                <p className="text-caption text-ink-500">{user.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="focus:outline-none">
          <Suspense fallback={<PageSkeleton />}>
            <div key={pathname} className="animate-fade-up px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
      <ScrollRestoration />
    </div>
  );
}
