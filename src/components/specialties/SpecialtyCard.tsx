import { Link } from "react-router-dom";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import type { Specialty } from "@/types";
import { toneStyle } from "@/data/specialties";
import { IconTile, SmartImage } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/** Compact icon card — homepage grid and mobile horizontal scroller. */
export function SpecialtyTile({ specialty, className }: { specialty: Specialty; className?: string }) {
  return (
    <Link
      to={`/specialties/${specialty.slug}`}
      style={toneStyle(specialty.slug)}
      className={cn(
        "group card card-interactive flex flex-col items-center gap-3 px-3 pt-5 pb-4 text-center hover:border-[color:var(--accent)]/40",
        className,
      )}
    >
      <IconTile icon={specialty.icon} size="lg" className="transition-transform duration-300 group-hover:scale-105" />
      <span>
        <span className="block text-small font-bold text-ink-900">{specialty.name}</span>
        <span className="mt-0.5 block text-caption text-ink-500">{specialty.tagline}</span>
      </span>
    </Link>
  );
}

export function MoreSpecialtiesTile({ className }: { className?: string }) {
  return (
    <Link to="/specialties" className={cn("group card card-interactive flex flex-col items-center gap-3 px-3 pt-5 pb-4 text-center", className)}>
      <span className="inline-flex size-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <LayoutGrid className="size-6.5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-small font-bold text-primary-700">More Specialties</span>
        <span className="mt-0.5 block text-caption text-ink-500">50+ areas of care</span>
      </span>
    </Link>
  );
}

/** Image card — specialties index. */
export function SpecialtyImageCard({ specialty }: { specialty: Specialty }) {
  return (
    <Link to={`/specialties/${specialty.slug}`} style={toneStyle(specialty.slug)} className="group card card-interactive flex flex-col overflow-hidden">
      <div className="relative aspect-[3/2] overflow-hidden bg-accent-tint">
        <SmartImage image={specialty.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        <span className="absolute top-3 left-3">
          <IconTile icon={specialty.icon} size="md" className="bg-white shadow-card" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="t-h3">{specialty.name}</h3>
          <ArrowUpRight className="size-5 shrink-0 text-ink-400 transition-colors group-hover:text-accent" aria-hidden="true" />
        </div>
        <p className="mt-1.5 line-clamp-2 text-small text-ink-500">{specialty.description}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Common conditions">
          {specialty.conditions.slice(0, 3).map((c) => (
            <li key={c.name} className="rounded-full bg-accent-tint px-2.5 py-1 text-caption font-semibold text-accent">
              {c.name}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
