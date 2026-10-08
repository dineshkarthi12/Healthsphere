import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { specialties } from "@/data/specialties";
import { StoreBadges } from "@/components/health/StoreBadges";

const columns = [
  {
    title: "Patients",
    links: [
      { to: "/symptoms", label: "Symptom checker" },
      { to: "/doctors", label: "Find a doctor" },
      { to: "/appointments", label: "Appointments" },
      { to: "/care", label: "My Care Journey" },
      { to: "/records", label: "Health records" },
      { to: "/emergency", label: "Emergency help" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About HealthSphere" },
      { to: "/hospitals", label: "Partner hospitals" },
      { to: "/health-library", label: "Health Library" },
      { to: "/contact", label: "Contact" },
      { to: "/doctor", label: "For doctors" },
      { to: "/admin", label: "For hospitals" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white pb-24 md:pb-0">
      <div className="container-page grid gap-10 py-12 md:grid-cols-12 lg:py-16">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-4 max-w-xs text-small text-ink-500">Specialized Care. For Every Part of You. Advanced care, expert specialists — personalised for you.</p>
          <ul className="mt-5 space-y-2 text-small text-ink-600">
            <li className="flex items-center gap-2"><Phone className="size-4 text-ink-400" aria-hidden="true" /> 1800 123 4567 (toll-free)</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-ink-400" aria-hidden="true" /> care@healthsphere.example</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-ink-400" aria-hidden="true" /> Chennai · Bengaluru · Hyderabad · Mumbai</li>
          </ul>
        </div>

        <nav aria-label="Specialties" className="md:col-span-3">
          <h2 className="t-eyebrow mb-3 text-ink-500">Specialties</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-1">
            {specialties.slice(0, 8).map((s) => (
              <li key={s.slug}>
                <Link to={`/specialties/${s.slug}`} className="inline-flex min-h-11 sm:min-h-9 items-center text-small text-ink-700 hover:text-primary-700">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title} className="md:col-span-2">
            <h2 className="t-eyebrow mb-3 text-ink-500">{c.title}</h2>
            <ul className="space-y-1">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="inline-flex min-h-11 sm:min-h-9 items-center text-small text-ink-700 hover:text-primary-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="md:col-span-1 md:hidden">
          <h2 className="t-eyebrow mb-3 text-ink-500">Get the app</h2>
          <StoreBadges />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-6 text-caption text-ink-500 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 HealthSphere. Prototype with mock data — not for real medical use. In an emergency call <strong className="text-ink-700">108</strong> or <strong className="text-ink-700">112</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link to="/about#privacy" className="hover:text-primary-700">Privacy</Link>
            <Link to="/about#terms" className="hover:text-primary-700">Terms</Link>
            <Link to="/about#accessibility" className="hover:text-primary-700">Accessibility</Link>
            <span className="flex items-center gap-1" aria-label="Social media">
              {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" onClick={(e) => e.preventDefault()} className="inline-flex size-9 items-center justify-center rounded-full text-ink-500 hover:bg-subtle hover:text-primary-700" aria-label={["Facebook", "Instagram", "LinkedIn", "YouTube"][i]}>
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
