import { Link } from "react-router-dom";
import { BadgeCheck, Building2, CalendarClock, Clock, Home, Languages, MapPin, Video } from "lucide-react";
import type { Doctor } from "@/types";
import { specialtyMap, toneStyle } from "@/data/specialties";
import { getHospital } from "@/data/hospitals";
import { Avatar, Rating } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { cn, formatINR, relativeDay, formatTime } from "@/lib/utils";

export function availabilityLabel(iso: string) {
  return `${relativeDay(iso)}, ${formatTime(iso)}`;
}

/** Full doctor card for discovery lists. */
export function DoctorCard({ doctor, className }: { doctor: Doctor; className?: string }) {
  const hospital = getHospital(doctor.hospitalId);
  const spec = specialtyMap[doctor.specialty];
  return (
    <article style={toneStyle(doctor.specialty)} className={cn("card relative flex flex-col gap-4 p-4 sm:p-5", className)} aria-labelledby={`doc-${doctor.id}`}>
      <div className="flex gap-4">
        <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={76} className="rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 id={`doc-${doctor.id}`} className="text-[1.0625rem] font-bold text-ink-900">
              <Link to={`/doctors/${doctor.id}`} className="hover:text-primary-700 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                {doctor.name}
              </Link>
            </h3>
            {doctor.rating >= 4.8 && (
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-success-700" title="Top rated by verified patients">
                <BadgeCheck className="size-4" aria-hidden="true" /> Top rated
              </span>
            )}
          </div>
          <p className="text-small font-semibold text-accent">{doctor.title} · {spec.name}</p>
          <p className="text-small text-ink-500">{doctor.subSpecialty}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Rating value={doctor.rating} count={doctor.reviewCount} />
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-small text-ink-600 sm:grid-cols-2">
        <div className="flex items-center gap-2"><dt className="sr-only">Experience</dt><Clock className="size-4 shrink-0 text-ink-400" aria-hidden="true" /><dd>{doctor.experienceYears} years experience</dd></div>
        <div className="flex items-center gap-2"><dt className="sr-only">Hospital</dt><Building2 className="size-4 shrink-0 text-ink-400" aria-hidden="true" /><dd className="truncate">{hospital?.shortName}</dd></div>
        <div className="flex items-center gap-2"><dt className="sr-only">Location</dt><MapPin className="size-4 shrink-0 text-ink-400" aria-hidden="true" /><dd>{hospital?.area}, {hospital?.city}</dd></div>
        <div className="flex items-center gap-2"><dt className="sr-only">Languages</dt><Languages className="size-4 shrink-0 text-ink-400" aria-hidden="true" /><dd className="truncate">{doctor.languages.join(", ")}</dd></div>
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        {doctor.consultationTypes.includes("video") && <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-1 text-caption font-semibold text-ink-700"><Video className="size-3.5" aria-hidden="true" /> Video</span>}
        {doctor.consultationTypes.includes("home-visit") && <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-1 text-caption font-semibold text-ink-700"><Home className="size-3.5" aria-hidden="true" /> Home visit</span>}
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-caption font-semibold text-success-700">
          <CalendarClock className="size-3.5" aria-hidden="true" /> Next: {availabilityLabel(doctor.nextAvailable)}
        </span>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-small text-ink-500">
          <span className="text-body font-bold text-ink-900">{formatINR(doctor.fee.inPerson)}</span> consultation
        </p>
        <div className="flex gap-2">
          <ButtonLink to={`/doctors/${doctor.id}`} variant="outline" size="sm" className="hidden sm:inline-flex">
            Profile
          </ButtonLink>
          <ButtonLink to={`/appointments/book?doctor=${doctor.id}`} size="sm">
            Book
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

/** Compact card for carousels and specialty pages. */
export function DoctorMiniCard({ doctor, className }: { doctor: Doctor; className?: string }) {
  const hospital = getHospital(doctor.hospitalId);
  return (
    <Link
      to={`/doctors/${doctor.id}`}
      style={toneStyle(doctor.specialty)}
      className={cn("group card card-interactive flex items-center gap-3.5 p-4", className)}
    >
      <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={60} className="rounded-xl" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-ink-900 group-hover:text-primary-700">{doctor.name}</span>
        <span className="block truncate text-small font-medium text-accent">{doctor.title}</span>
        <span className="block truncate text-caption text-ink-500">{doctor.experienceYears} yrs · {hospital?.shortName}</span>
        <Rating value={doctor.rating} className="mt-1 text-caption" />
      </span>
    </Link>
  );
}
