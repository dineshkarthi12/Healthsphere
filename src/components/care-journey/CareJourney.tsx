import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock, FileText, MapPin, Sparkles } from "lucide-react";
import type { CareJourney as Journey, JourneyStage, JourneyTemplateStage } from "@/types";
import { getDoctor } from "@/data/doctors";
import { getHospital } from "@/data/hospitals";
import { specialtyMap, toneStyle } from "@/data/specialties";
import { Avatar, IconTile, ProgressBar, ProgressRing, StatusBadge } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

/* ----------------------------------------------------------- stage node */
function StageNode({ status, index, size = "md" }: { status: JourneyStage["status"] | "template"; index?: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "size-7" : "size-9";
  if (status === "completed")
    return (
      <span className={cn("relative z-10 inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_0_4px_white]", s)}>
        <Check className="size-4" strokeWidth={3} aria-hidden="true" />
      </span>
    );
  if (status === "current")
    return (
      <span className={cn("relative z-10 inline-flex shrink-0 items-center justify-center rounded-full border-2 border-accent bg-white shadow-[0_0_0_4px_white]", s)}>
        <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-20 motion-reduce:hidden" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-accent" />
      </span>
    );
  if (status === "scheduled")
    return (
      <span className={cn("relative z-10 inline-flex shrink-0 items-center justify-center rounded-full border-2 border-accent/50 bg-accent-tint text-accent shadow-[0_0_0_4px_white]", s)}>
        <Clock className="size-4" aria-hidden="true" />
      </span>
    );
  if (status === "template")
    return (
      <span className={cn("relative z-10 inline-flex shrink-0 items-center justify-center rounded-full bg-accent-tint text-small font-bold text-accent shadow-[0_0_0_4px_white]", s)}>
        {index !== undefined ? index + 1 : <Circle className="size-3" />}
      </span>
    );
  return <span className={cn("relative z-10 inline-flex shrink-0 rounded-full border-2 border-line-strong bg-white shadow-[0_0_0_4px_white]", s)} />;
}

const statusText: Record<JourneyStage["status"], string> = { completed: "Completed", current: "In progress", scheduled: "Scheduled", upcoming: "Upcoming" };

/* ----------------------------------------------------- horizontal stepper */
export function JourneyStepper({ stages, className, label }: { stages: (Pick<JourneyStage, "title" | "status">)[]; className?: string; label: string }) {
  return (
    <ol className={cn("flex items-start", className)} aria-label={label}>
      {stages.map((s, i) => (
        <li key={s.title} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
          {i > 0 && (
            <span
              className={cn("absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2", stages[i - 1].status === "completed" && s.status !== "upcoming" ? "bg-accent" : stages[i - 1].status === "completed" ? "bg-accent/40" : "bg-line-strong")}
              aria-hidden="true"
            />
          )}
          <StageNode status={s.status} size="sm" />
          <span className={cn("mt-2 px-0.5 text-[0.6875rem] leading-tight font-semibold sm:text-caption", s.status === "upcoming" ? "text-ink-500" : "text-ink-800")}>{s.title}</span>
          <span className="sr-only">: {statusText[s.status]}</span>
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------- summary card */
export function JourneyCard({ journey, className, variant = "default" }: { journey: Journey; className?: string; variant?: "default" | "compact" }) {
  const spec = specialtyMap[journey.specialty];
  const doctor = getDoctor(journey.leadDoctorId);
  return (
    <article style={toneStyle(journey.specialty)} className={cn("card flex flex-col p-4 sm:p-5", className)} aria-labelledby={`jt-${journey.id}`}>
      <div className="flex items-start gap-3.5">
        <IconTile icon={spec.icon} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-caption font-semibold text-accent">{spec.name}</p>
          <h3 id={`jt-${journey.id}`} className="text-[1.0625rem] font-bold text-ink-900">{journey.title}</h3>
          <p className="truncate text-small text-ink-500">{doctor?.name} · {journey.condition}</p>
        </div>
        <ProgressRing value={journey.progress} size={56} stroke={5} label={`${journey.title} progress`} />
      </div>

      {variant === "default" && <JourneyStepper stages={journey.stages} className="mt-5" label={`${journey.title} stages`} />}
      {variant === "compact" && <ProgressBar value={journey.progress} label={`${journey.title} progress`} className="mt-4" />}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent-tint/60 px-3.5 py-3">
        <div className="min-w-0">
          <p className="text-caption font-semibold text-ink-500">Next step</p>
          <p className="text-small font-bold text-ink-900">{journey.nextStep}</p>
          {journey.nextStepDate && <p className="text-caption text-ink-600">{formatDateTime(journey.nextStepDate)}</p>}
        </div>
        <ButtonLink to={`/care/journey/${journey.id}`} size="sm" variant="white" aria-label={`View details of ${journey.title}`}>
          View Details <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    </article>
  );
}

/* ----------------------------------------------------- vertical timeline */
export function JourneyTimeline({ journey }: { journey: Journey }) {
  const currentIdx = journey.stages.findIndex((s) => s.status === "current");
  const [open, setOpen] = useState<Set<string>>(() => new Set(journey.stages.filter((s, i) => s.status === "current" || i === currentIdx + 1).map((s) => s.id)));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ol className="relative" aria-label={`${journey.title} timeline`} style={toneStyle(journey.specialty)}>
      {journey.stages.map((stage, i) => {
        const doctor = getDoctor(stage.doctorId);
        const isOpen = open.has(stage.id);
        const last = i === journey.stages.length - 1;
        const panelId = `stage-${journey.id}-${stage.id}`;
        const hasDetail = !!(stage.summary || stage.documents.length || stage.checklist || stage.nextStep || doctor);
        return (
          <li key={stage.id} className="relative flex gap-4 pb-2">
            {!last && (
              <span
                className={cn("absolute top-9 bottom-0 left-[17px] w-0.5", stage.status === "completed" ? "bg-accent" : "bg-line-strong", stage.status === "completed" && journey.stages[i + 1].status !== "completed" && "bg-gradient-to-b from-[var(--accent)] to-[var(--color-line-strong)]")}
                aria-hidden="true"
              />
            )}
            <StageNode status={stage.status} />
            <div className={cn("mb-4 min-w-0 flex-1 rounded-xl transition-colors", stage.status === "current" && "border border-[color:var(--accent)]/30 bg-accent-tint/40 p-4 -mt-1", stage.status !== "current" && "pt-1")}>
              <button
                type="button"
                onClick={() => hasDetail && toggle(stage.id)}
                aria-expanded={hasDetail ? isOpen : undefined}
                aria-controls={hasDetail ? panelId : undefined}
                className={cn("flex w-full items-start justify-between gap-3 rounded-md text-left", !hasDetail && "cursor-default")}
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cn("font-bold", stage.status === "upcoming" ? "text-ink-600" : "text-ink-900")}>{stage.title}</span>
                    <StatusBadge status={stage.status} />
                  </span>
                  <span className="mt-0.5 block text-small text-ink-500">
                    {stage.date ? formatDateTime(stage.date) : "Date to be scheduled"}
                    {doctor && ` · ${doctor.name}`}
                  </span>
                </span>
                {hasDetail && <ChevronDown className={cn("mt-1 size-5 shrink-0 text-ink-400 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />}
              </button>

              {hasDetail && isOpen && (
                <div id={panelId} className="mt-3 animate-fade-in space-y-3">
                  {stage.summary && <p className="text-small text-ink-700">{stage.summary}</p>}
                  {(doctor || stage.location) && (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-ink-600">
                      {doctor && (
                        <Link to={`/doctors/${doctor.id}`} className="inline-flex items-center gap-2 rounded-md font-medium hover:text-primary-700">
                          <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={28} />
                          {doctor.name}
                        </Link>
                      )}
                      {stage.location && (
                        <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-ink-400" aria-hidden="true" />{stage.location}</span>
                      )}
                    </div>
                  )}
                  {stage.checklist && (
                    <ul className="space-y-1.5" aria-label="Preparation checklist">
                      {stage.checklist.map((c) => (
                        <li key={c.label} className="flex items-center gap-2 text-small">
                          {c.done ? <CheckCircle2 className="size-4.5 shrink-0 text-success-700" aria-hidden="true" /> : <Circle className="size-4.5 shrink-0 text-ink-300" aria-hidden="true" />}
                          <span className={c.done ? "text-ink-600" : "font-semibold text-ink-900"}>{c.label}</span>
                          <span className="sr-only">{c.done ? "(done)" : "(to do)"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {stage.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {stage.documents.map((d) => (
                        <Link key={d.title} to={d.recordId ? `/records?open=${d.recordId}` : "/records"} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-small font-medium text-ink-700 hover:border-primary-300 hover:text-primary-700">
                          <FileText className="size-4 text-accent" aria-hidden="true" /> {d.title}
                        </Link>
                      ))}
                    </div>
                  )}
                  {stage.nextStep && (
                    <p className="flex items-start gap-2 rounded-lg bg-white px-3 py-2.5 text-small font-semibold text-ink-900 shadow-xs">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" /> Next: {stage.nextStep}
                    </p>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------- template (specialty pages) */
export function JourneyTemplate({ stages, className }: { stages: JourneyTemplateStage[]; className?: string }) {
  return (
    <ol className={cn("grid gap-0 lg:grid-flow-col lg:auto-cols-fr", className)}>
      {stages.map((s, i) => (
        <li key={s.title} className="relative flex gap-4 pb-6 lg:flex-col lg:items-center lg:px-2 lg:pb-0 lg:text-center">
          {i < stages.length - 1 && (
            <>
              <span className="absolute top-9 bottom-0 left-[17px] w-0.5 bg-accent-tint lg:hidden" aria-hidden="true" />
              <span className="absolute top-[18px] left-1/2 hidden h-0.5 w-full bg-accent-tint lg:block" aria-hidden="true" />
            </>
          )}
          <StageNode status="template" index={i} />
          <div className="lg:mt-3">
            <p className="font-bold text-ink-900">{s.title}</p>
            <p className="mt-0.5 text-small text-ink-500">{s.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function journeyHospital(j: Journey) {
  return getHospital(j.hospitalId);
}

export function journeyStartedLabel(j: Journey) {
  return `Started ${formatDate(j.startedOn)}`;
}
