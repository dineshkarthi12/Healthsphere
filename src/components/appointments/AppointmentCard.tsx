import { Link } from "react-router-dom";
import { Building2, CalendarDays, Home, MapPin, Video } from "lucide-react";
import type { Appointment } from "@/types";
import { getDoctor } from "@/data/doctors";
import { getHospital } from "@/data/hospitals";
import { toneStyle } from "@/data/specialties";
import { Avatar, StatusBadge } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn, formatDate, formatTime, relativeDay } from "@/lib/utils";

const typeMeta = {
  "in-person": { label: "In-person", icon: Building2 },
  video: { label: "Video consult", icon: Video },
  "home-visit": { label: "Home visit", icon: Home },
};

export function AppointmentCard({
  appointment,
  compact = false,
  showJourneyLink = true,
  onReschedule,
  onCancel,
  className,
}: {
  appointment: Appointment;
  compact?: boolean;
  /** Hide the "View care journey" link (e.g. when already on that journey). */
  showJourneyLink?: boolean;
  onReschedule?: () => void;
  onCancel?: () => void;
  className?: string;
}) {
  const doctor = getDoctor(appointment.doctorId);
  const hospital = getHospital(appointment.hospitalId);
  if (!doctor) return null;
  const T = typeMeta[appointment.type];
  const upcoming = appointment.status === "upcoming";
  const isToday = relativeDay(appointment.date) === "Today";

  return (
    <article style={toneStyle(appointment.specialty)} className={cn("card p-4 sm:p-5", className)} aria-label={`${appointment.reason} with ${doctor.name}`}>
      <div className="flex items-start gap-3.5">
        <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={52} className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-ink-900">{doctor.name}</p>
              <p className="text-small text-ink-500">{doctor.title} · {hospital?.shortName}</p>
            </div>
            {!compact && <StatusBadge status={appointment.status === "upcoming" ? "scheduled" : appointment.status === "completed" ? "completed" : "cancelled"} label={appointment.status === "upcoming" ? (isToday ? "Today" : "Confirmed") : undefined} />}
          </div>
          <p className="mt-2 text-small font-medium text-ink-800">{appointment.reason}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-small text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 text-accent" aria-hidden="true" />
              <span><strong className="font-semibold text-ink-900">{relativeDay(appointment.date)}</strong>{relativeDay(appointment.date).includes(" ") ? "" : `, ${formatDate(appointment.date, { day: "numeric", month: "short" })}`} · {formatTime(appointment.date)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5"><T.icon className="size-4 text-ink-400" aria-hidden="true" />{T.label}</span>
            {appointment.type === "in-person" && hospital && !compact && (
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-ink-400" aria-hidden="true" />{hospital.area}</span>
            )}
          </div>
        </div>
      </div>

      {upcoming && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          {appointment.type === "video" ? (
            <ButtonLink to={`/consultation/${appointment.id}`} size="sm" variant={isToday ? "primary" : "secondary"}>
              <Video className="size-4" aria-hidden="true" /> {isToday ? "Join video call" : "Video details"}
            </ButtonLink>
          ) : (
            <ButtonLink to={appointment.journeyId && showJourneyLink ? `/care/journey/${appointment.journeyId}` : showJourneyLink ? `/doctors/${doctor.id}` : "/appointments"} size="sm" variant="secondary">
              {appointment.journeyId && showJourneyLink ? "View care journey" : showJourneyLink ? "View doctor" : "Manage appointment"}
            </ButtonLink>
          )}
          {onReschedule && <Button size="sm" variant="outline" onClick={onReschedule}>Reschedule</Button>}
          {onCancel && <Button size="sm" variant="ghost" className="text-danger-700 hover:bg-danger-50 hover:text-danger-700" onClick={onCancel}>Cancel</Button>}
        </div>
      )}
      {appointment.status === "completed" && !compact && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          <ButtonLink to="/records" size="sm" variant="outline">Notes & reports</ButtonLink>
          <ButtonLink to={`/appointments/book?doctor=${doctor.id}`} size="sm" variant="ghost">Book again</ButtonLink>
        </div>
      )}
    </article>
  );
}

export function NextAppointmentLink({ appointment }: { appointment: Appointment }) {
  const doctor = getDoctor(appointment.doctorId)!;
  return (
    <Link to="/appointments" className="flex items-center gap-3 rounded-xl p-2 hover:bg-subtle">
      <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={44} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-small font-semibold">{doctor.name}</span>
        <span className="block truncate text-caption text-ink-500">{relativeDay(appointment.date)} · {formatTime(appointment.date)}</span>
      </span>
    </Link>
  );
}

/** Prominent "next appointment" card for the patient home/dashboard. */
export function NextAppointmentCard({ appointment, className }: { appointment: Appointment; className?: string }) {
  const doctor = getDoctor(appointment.doctorId)!;
  const hospital = getHospital(appointment.hospitalId);
  const T = typeMeta[appointment.type];
  const when = relativeDay(appointment.date);
  const isToday = when === "Today";
  return (
    <section aria-labelledby="next-appt-title" className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white shadow-raised sm:p-6", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-white/10" />
      <p id="next-appt-title" className="t-eyebrow text-primary-100">Next appointment</p>
      <p className="mt-2 text-stat font-bold tracking-tight">
        {when}{when.includes(" ") ? "" : `, ${formatDate(appointment.date, { day: "numeric", month: "short" })}`} · {formatTime(appointment.date)}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={48} className="ring-2 ring-white/40" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{doctor.name}</p>
          <p className="truncate text-small text-primary-100">{doctor.title} · {appointment.reason}</p>
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-caption font-semibold">
        <T.icon className="size-3.5" aria-hidden="true" />
        {T.label}{appointment.type === "in-person" && hospital ? ` · ${hospital.shortName}` : ""}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {appointment.type === "video" ? (
          <ButtonLink to={`/consultation/${appointment.id}`} variant="white" size="sm">
            <Video className="size-4" aria-hidden="true" /> {isToday ? "Join video call" : "Video details"}
          </ButtonLink>
        ) : (
          <ButtonLink to={appointment.journeyId ? `/care/journey/${appointment.journeyId}` : "/appointments"} variant="white" size="sm">
            {appointment.journeyId ? "View care journey" : "View details"}
          </ButtonLink>
        )}
        <ButtonLink to="/appointments" size="sm" className="bg-white/15 text-white shadow-none hover:bg-white/25">
          Manage
        </ButtonLink>
      </div>
    </section>
  );
}
