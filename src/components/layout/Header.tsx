import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import * as DM from "@radix-ui/react-dropdown-menu";
import * as RDialog from "@radix-ui/react-dialog";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FolderHeart,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Search,
  Siren,
  Stethoscope,
  UserRound,
  X,
  Building2,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/primitives";
import { useGlobalSearch } from "./GlobalSearch";
import { specialties, toneStyle } from "@/data/specialties";
import { currentPatient } from "@/data/patient";
import { getIcon } from "@/lib/icons";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

const primaryNav = [
  { to: "/", label: "Home", end: true },
  { to: "/specialties", label: "Specialties", menu: true },
  { to: "/doctors", label: "Doctors" },
  { to: "/hospitals", label: "Hospitals" },
  { to: "/health-library", label: "Health Library" },
  { to: "/about", label: "About" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative inline-flex h-11 items-center whitespace-nowrap rounded-md px-2.5 text-small font-semibold transition-colors xl:px-3",
    isActive ? "text-primary-700 after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-primary-600" : "text-ink-700 hover:text-ink-900",
  );

export function Header() {
  const { openSearch } = useGlobalSearch();
  const [menuOpen, setMenuOpen] = useState(false);
  const { signedIn, notifications } = useAppState();
  const location = useLocation();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="container-page flex h-16 items-center gap-3 lg:h-[4.5rem]">
        <Link to="/" className="mr-2 rounded-md" aria-label="HealthSphere home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center gap-0.5 lg:flex">
          {primaryNav.map((item) =>
            item.menu ? <SpecialtiesMenu key={item.to} /> : (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => openSearch()}
            className="hidden h-11 items-center gap-2 rounded-full border border-line bg-canvas pr-2 pl-3.5 text-small text-ink-500 transition-colors hover:border-line-strong hover:text-ink-700 xl:inline-flex"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="w-24 text-left">Search…</span>
            <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans text-caption text-ink-500">⌘K</kbd>
          </button>
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => openSearch()} aria-label="Search">
            <Search className="size-5" aria-hidden="true" />
          </Button>

          <ButtonLink to="/emergency" variant="danger-soft" size="sm" className="hidden h-10 rounded-full px-3.5 md:inline-flex" aria-label="Emergency help">
            <Siren className="size-4" aria-hidden="true" />
            <span className="hidden xl:inline">Emergency</span>
          </ButtonLink>

          {signedIn ? (
            <>
              <ButtonLink to="/profile#notifications" variant="ghost" size="icon" className="relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
                <Bell className="size-5" aria-hidden="true" />
                {unread > 0 && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-danger-500 ring-2 ring-white" aria-hidden="true" />}
              </ButtonLink>
              <AccountMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <ButtonLink to="/login" variant="outline" size="sm" className="h-10 rounded-full px-4">
                Login
              </ButtonLink>
              <ButtonLink to="/signup" size="sm" className="h-10 rounded-full px-4">
                Sign Up
              </ButtonLink>
            </div>
          )}

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu className="size-5.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}

function SpecialtiesMenu() {
  const { pathname } = useLocation();
  const active = pathname.startsWith("/specialties");
  const navigate = useNavigate();
  return (
    <DM.Root modal={false}>
      <DM.Trigger className={cn(navLinkClass({ isActive: active }), "gap-1 data-[state=open]:text-primary-700")}>
        Specialties
        <ChevronDown className="size-4 transition-transform [[data-state=open]>&]:rotate-180" aria-hidden="true" />
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="start" sideOffset={14} className="z-50 w-[42rem] animate-scale-in rounded-2xl border border-line bg-white p-3 shadow-float">
          <div className="grid grid-cols-3 gap-1">
            {specialties.map((s) => {
              const Icon = getIcon(s.icon);
              return (
                <DM.Item key={s.slug} asChild onSelect={() => navigate(`/specialties/${s.slug}`)}>
                  <Link to={`/specialties/${s.slug}`} style={toneStyle(s.slug)} className="flex items-center gap-3 rounded-xl p-2.5 outline-none data-[highlighted]:bg-subtle">
                    <span className="accent-icon inline-flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-small font-semibold text-ink-900">{s.name}</span>
                      <span className="block text-caption text-ink-500">{s.tagline}</span>
                    </span>
                  </Link>
                </DM.Item>
              );
            })}
            <DM.Item asChild onSelect={() => navigate("/specialties")}>
              <Link to="/specialties" className="flex items-center gap-3 rounded-xl p-2.5 outline-none data-[highlighted]:bg-subtle">
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <ClipboardList className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-small font-semibold text-primary-700">All specialties</span>
                  <span className="block text-caption text-ink-500">50+ areas of care</span>
                </span>
              </Link>
            </DM.Item>
          </div>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

function AccountMenu() {
  const { signOut } = useAppState();
  const navigate = useNavigate();
  const items = [
    { to: "/", label: "My health home", icon: LayoutDashboard },
    { to: "/care", label: "My Care Journey", icon: FolderHeart },
    { to: "/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/records", label: "Health records", icon: ClipboardList },
    { to: "/insights", label: "Health insights", icon: LineChart },
    { to: "/profile", label: "Profile & privacy", icon: UserRound },
  ];
  return (
    <DM.Root modal={false}>
      <DM.Trigger className="hidden rounded-full p-0.5 md:inline-flex" aria-label="Account menu">
        <Avatar name={currentPatient.name} initials={currentPatient.initials} size={40} />
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={10} className="z-50 w-64 animate-scale-in rounded-2xl border border-line bg-white p-2 shadow-float">
          <div className="flex items-center gap-3 px-2.5 py-2">
            <Avatar name={currentPatient.name} initials={currentPatient.initials} size={40} />
            <div>
              <p className="text-small font-semibold text-ink-900">{currentPatient.name}</p>
              <p className="text-caption text-ink-500">Demo patient account</p>
            </div>
          </div>
          <DM.Separator className="my-1.5 h-px bg-line" />
          {items.map(({ to, label, icon: Icon }) => (
            <DM.Item key={to} onSelect={() => navigate(to)} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-small font-medium text-ink-700 outline-none data-[highlighted]:bg-subtle data-[highlighted]:text-ink-900">
              <Icon className="size-4.5 text-ink-500" aria-hidden="true" />
              {label}
            </DM.Item>
          ))}
          <DM.Separator className="my-1.5 h-px bg-line" />
          <DM.Item
            onSelect={() => {
              signOut();
              navigate("/");
            }}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-small font-medium text-danger-700 outline-none data-[highlighted]:bg-danger-50"
          >
            <LogOut className="size-4.5" aria-hidden="true" />
            Sign out
          </DM.Item>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { signedIn, signOut } = useAppState();
  const extra = [
    { to: "/symptoms", label: "Symptom checker", icon: Search },
    { to: "/emergency", label: "Emergency help", icon: Siren },
    { to: "/contact", label: "Contact us", icon: UserRound },
    { to: "/doctor", label: "Doctor portal", icon: Stethoscope },
    { to: "/admin", label: "Hospital admin", icon: Building2 },
  ];
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-ink-900/35 data-[state=open]:animate-fade-in lg:hidden" />
        <RDialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col bg-white shadow-float focus:outline-none data-[state=open]:animate-fade-in lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <RDialog.Title asChild>
              <span><Logo /></span>
            </RDialog.Title>
            <RDialog.Description className="sr-only">Site navigation</RDialog.Description>
            <RDialog.Close className="inline-flex size-11 items-center justify-center rounded-full hover:bg-subtle" aria-label="Close menu">
              <X className="size-5" aria-hidden="true" />
            </RDialog.Close>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-0.5">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => cn("flex min-h-12 items-center rounded-lg px-3 font-semibold", isActive ? "bg-primary-50 text-primary-700" : "text-ink-800 hover:bg-subtle")}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="my-3 h-px bg-line" />
            <ul className="space-y-0.5">
              {extra.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => cn("flex min-h-12 items-center gap-3 rounded-lg px-3 text-small font-semibold", isActive ? "bg-primary-50 text-primary-700" : "text-ink-700 hover:bg-subtle", to === "/emergency" && "text-danger-700")}>
                    <Icon className="size-4.5" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="safe-bottom border-t border-line p-4">
            {signedIn ? (
              <Button variant="outline" block onClick={() => { signOut(); onOpenChange(false); }}>
                <LogOut className="size-4" aria-hidden="true" /> Sign out
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink to="/login" variant="outline">Login</ButtonLink>
                <ButtonLink to="/signup">Sign Up</ButtonLink>
              </div>
            )}
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
