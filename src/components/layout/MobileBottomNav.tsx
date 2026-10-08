import { NavLink, useLocation } from "react-router-dom";
import { CalendarDays, FolderHeart, Home, ClipboardList, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { to: "/care", label: "Care", icon: FolderHeart, match: (p: string) => p.startsWith("/care") || p.startsWith("/specialties") || p.startsWith("/symptoms") },
  { to: "/appointments", label: "Appointments", icon: CalendarDays, match: (p: string) => p.startsWith("/appointments") || p.startsWith("/doctors") },
  { to: "/records", label: "Records", icon: ClipboardList, match: (p: string) => p.startsWith("/records") || p.startsWith("/insights") },
  { to: "/profile", label: "Profile", icon: UserRound, match: (p: string) => p.startsWith("/profile") },
];

/** Patient app navigation for phones (hidden from md up). */
export function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="App" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md md:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {items.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={to}>
              <NavLink
                to={to}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors", active ? "text-primary-700" : "text-ink-500 hover:text-ink-800")}
              >
                <span className={cn("inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-primary-50")}>
                  <Icon className="size-5.5" strokeWidth={active ? 2.3 : 2} aria-hidden="true" />
                </span>
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
