import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, Stethoscope } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
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

/** Rich specialty card — specialties index ("Specialty Experience"). */
export function SpecialtyImageCard({ specialty, headingLevel = "h3" }: { specialty: Specialty; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article style={toneStyle(specialty.slug)} className="group card card-interactive relative flex flex-col overflow-hidden" aria-labelledby={`spec-card-${specialty.slug}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-accent-tint">
        <SmartImage image={specialty.image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="size-full transition-transform duration-500 group-hover:scale-[1.03]" />
        <span className="absolute top-3 left-3">
          <IconTile icon={specialty.icon} size="md" className="bg-white shadow-card" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <H id={`spec-card-${specialty.slug}`} className="t-h3">
          <Link to={`/specialties/${specialty.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {specialty.name}
          </Link>
        </H>
        <p className="mt-1.5 text-small text-ink-600">{specialty.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${specialty.name} services and conditions`}>
          {specialty.highlights.map((h) => (
            <li key={h} className="rounded-full bg-accent-tint px-2.5 py-1 text-caption font-semibold text-accent">{h}</li>
          ))}
        </ul>
        <p className="mt-4 mb-4 flex items-start gap-2 text-small text-ink-600">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
          <span><span className="sr-only">Specialists: </span>{specialty.specialistTitles.slice(0, 2).join(" · ")}</span>
        </p>
        <div className="pointer-events-none relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="inline-flex items-center gap-1 text-small font-semibold text-accent" aria-hidden="true">
            Explore {specialty.name} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
          <ButtonLink to={`/appointments/book?specialty=${specialty.slug}`} size="sm" variant="accent" className="pointer-events-auto" aria-label={`Book a ${specialty.name} consultation`}>
            Book
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
