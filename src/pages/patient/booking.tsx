import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, CalendarPlus, CheckCircle2, CreditCard, Home, Landmark, Lock, ShieldCheck, Smartphone, UserRound, Users, Video, X } from "lucide-react";
import { doctors, getDoctor } from "@/data/doctors";
import { getHospital } from "@/data/hospitals";
import { specialtyMap, toneStyle } from "@/data/specialties";
import { currentPatient } from "@/data/patient";
import { BookingStepper } from "@/components/appointments/BookingStepper";
import { SlotPicker } from "@/components/appointments/SlotPicker";
import { RequireSession } from "@/components/layout/RequireSession";
import { Avatar, Field, Input, Rating, SearchBar, Select, Textarea } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/overlays";
import { useAppState } from "@/lib/store";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn, formatDate, formatINR, formatTime } from "@/lib/utils";
import type { Appointment, ConsultationType, SpecialtySlug } from "@/types";

const STEPS = ["Doctor", "Date & Time", "Patient Details", "Consultation Type", "Payment", "Confirmation"];

interface Draft {
  doctorId?: string;
  slot?: string;
  patient: "self" | "family";
  familyName: string;
  familyAge: string;
  familyRelation: string;
  reason: string;
  symptoms: string;
  phone: string;
  type: ConsultationType;
  payment: "upi" | "card" | "hospital" | "insurance";
  upi: string;
  consent: boolean;
}

export function BookingPage() {
  useDocumentTitle("Book an appointment");
  return (
    <RequireSession title="Sign in to book an appointment">
      <BookingFlow />
    </RequireSession>
  );
}

function BookingFlow() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addAppointment } = useAppState();
  const pre = getDoctor(params.get("doctor") ?? undefined);
  const specialty = (params.get("specialty") as SpecialtySlug | null) ?? pre?.specialty ?? null;
  const [step, setStep] = useState(pre ? (params.get("slot") ? 2 : 1) : 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [booked, setBooked] = useState<Appointment | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [d, setD] = useState<Draft>({
    doctorId: pre?.id,
    slot: params.get("slot") ?? undefined,
    patient: "self",
    familyName: "",
    familyAge: "",
    familyRelation: "Child",
    reason: params.get("reason") ?? "",
    symptoms: "",
    phone: currentPatient.phone,
    type: (params.get("type") as ConsultationType) || "in-person",
    payment: "upi",
    upi: "priya.raman@okbank",
    consent: false,
  });
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const doctor = getDoctor(d.doctorId);
  const hospital = doctor ? getHospital(params.get("hospital") ?? doctor.hospitalId) ?? getHospital(doctor.hospitalId) : undefined;
  const fee = doctor ? (d.type === "video" ? doctor.fee.video : d.type === "home-visit" ? doctor.fee.homeVisit ?? doctor.fee.inPerson : doctor.fee.inPerson) : 0;
  const platform = 49;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0 && !d.doctorId) e.doctorId = "Please choose a doctor to continue.";
    if (step === 1 && !d.slot) e.slot = "Please choose an available time slot.";
    if (step === 2) {
      if (!d.reason.trim()) e.reason = "Tell us briefly why you're visiting — it helps the doctor prepare.";
      if (!/^\+?[\d\s-]{10,15}$/.test(d.phone.trim())) e.phone = "Enter a valid 10-digit mobile number.";
      if (d.patient === "family") {
        if (!d.familyName.trim()) e.familyName = "Enter the patient's full name.";
        if (!d.familyAge || +d.familyAge < 0 || +d.familyAge > 120) e.familyAge = "Enter an age between 0 and 120.";
      }
    }
    if (step === 3 && !doctor?.consultationTypes.includes(d.type)) e.type = "This doctor doesn't offer that consultation type.";
    if (step === 4) {
      if (d.payment === "upi" && !/^[\w.-]+@[\w]+$/.test(d.upi)) e.upi = "Enter a valid UPI ID, e.g. name@bank.";
      if (!d.consent) e.consent = "Please accept the booking and cancellation terms.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => headingRef.current?.focus(), 50);
  };
  const next = () => {
    if (!validate()) return;
    if (step === 4) {
      setPaying(true);
      window.setTimeout(() => {
        const appt: Appointment = {
          id: `apt-${Math.floor(2000 + Math.random() * 7000)}`,
          doctorId: doctor!.id,
          patientId: currentPatient.id,
          specialty: doctor!.specialty,
          date: d.slot!,
          type: d.type,
          status: "upcoming",
          reason: d.reason,
          hospitalId: hospital!.id,
          token: `${doctor!.specialty.slice(0, 1).toUpperCase()}-${Math.floor(10 + Math.random() * 80)}`,
        };
        addAppointment(appt);
        setBooked(appt);
        setPaying(false);
        toast({ title: "Appointment confirmed", description: `${doctor!.name} · ${formatDate(d.slot!, { day: "numeric", month: "short" })}, ${formatTime(d.slot!)}` });
        go(5);
      }, 1100);
      return;
    }
    go(step + 1);
  };

  return (
    <div className="min-h-dvh bg-canvas md:min-h-0" style={toneStyle(doctor?.specialty ?? specialty ?? undefined)}>
      {/* phone top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-white px-2 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => (step > 0 && step < 5 ? go(step - 1) : navigate(-1))} aria-label={step > 0 && step < 5 ? "Previous step" : "Close booking"}>
          {step > 0 && step < 5 ? <ArrowLeft className="size-5" aria-hidden="true" /> : <X className="size-5" aria-hidden="true" />}
        </Button>
        <p className="font-bold">Book appointment</p>
      </div>

      <div className="container-page max-w-5xl py-5 md:py-10">
        <BookingStepper steps={STEPS} current={step} onStepClick={step < 5 ? go : undefined} />

        <div className={cn("mt-6 grid gap-6", step < 5 && "lg:grid-cols-[1fr_20rem]")}>
          <section className={cn("card p-5 sm:p-7", step === 5 && "mx-auto w-full max-w-2xl text-center")} aria-labelledby="step-title">
            <h1 id="step-title" ref={headingRef} tabIndex={-1} className="t-h2 focus:outline-none">
              {["Choose your doctor", "Pick a date & time", "Patient details", "How would you like to consult?", "Review & pay", "You're all set!"][step]}
            </h1>

            <div className="mt-5">
              {step === 0 && <StepDoctor specialty={specialty} hospitalId={params.get("hospital")} value={d.doctorId} onChange={(id) => set("doctorId", id)} error={errors.doctorId} />}
              {step === 1 && doctor && (
                <>
                  <SlotPicker doctorId={doctor.id} value={d.slot} onChange={(iso) => set("slot", iso)} />
                  {errors.slot && <p role="alert" className="mt-3 text-small font-medium text-danger-700">{errors.slot}</p>}
                </>
              )}
              {step === 2 && (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="mb-2 text-small font-semibold text-ink-800">Who is this appointment for?</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {([["self", `Myself (${currentPatient.name})`, UserRound], ["family", "A family member", Users]] as const).map(([v, l, Icon]) => (
                        <label key={v} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3.5", d.patient === v ? "border-primary-600 bg-primary-25" : "border-line hover:border-line-strong")}>
                          <input type="radio" name="patient" checked={d.patient === v} onChange={() => set("patient", v)} className="size-4.5 accent-primary-600" />
                          <Icon className="size-5 text-ink-500" aria-hidden="true" />
                          <span className="text-small font-semibold">{l}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {d.patient === "family" && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Full name" required error={errors.familyName} className="sm:col-span-3">{(p) => <Input {...p} value={d.familyName} onChange={(e) => set("familyName", e.target.value)} autoComplete="name" />}</Field>
                      <Field label="Age" required error={errors.familyAge}>{(p) => <Input {...p} type="number" inputMode="numeric" value={d.familyAge} onChange={(e) => set("familyAge", e.target.value)} />}</Field>
                      <Field label="Relationship" className="sm:col-span-2">{(p) => <Select {...p} value={d.familyRelation} onChange={(e) => set("familyRelation", e.target.value)}>{["Child", "Spouse", "Parent", "Sibling", "Other"].map((r) => <option key={r}>{r}</option>)}</Select>}</Field>
                    </div>
                  )}
                  <Field label="Reason for visit" required error={errors.reason} hint="E.g. “LASIK consultation” or “Follow-up for back pain”">{(p) => <Input {...p} value={d.reason} onChange={(e) => set("reason", e.target.value)} />}</Field>
                  <Field label="Symptoms or notes for the doctor" hint="Optional. Shared only with your doctor.">{(p) => <Textarea {...p} value={d.symptoms} onChange={(e) => set("symptoms", e.target.value)} rows={3} />}</Field>
                  <Field label="Mobile number" required error={errors.phone} hint="We'll send reminders here">{(p) => <Input {...p} type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />}</Field>
                </div>
              )}
              {step === 3 && doctor && (
                <fieldset>
                  <legend className="sr-only">Consultation type</legend>
                  <div className="grid gap-3">
                    {([
                      ["in-person", "In-person visit", `At ${hospital?.name}`, Building2, doctor.fee.inPerson],
                      ["video", "Video consultation", "From home, on your phone or laptop", Video, doctor.fee.video],
                      ["home-visit", "Home visit", "The doctor visits you (selected areas)", Home, doctor.fee.homeVisit],
                    ] as const).map(([v, l, sub, Icon, price]) => {
                      const offered = doctor.consultationTypes.includes(v);
                      return (
                        <label key={v} className={cn("flex min-h-16 items-center gap-4 rounded-xl border p-4", !offered ? "cursor-not-allowed border-dashed opacity-55" : "cursor-pointer", d.type === v ? "border-primary-600 bg-primary-25 ring-2 ring-primary-600/15" : "border-line hover:border-line-strong")}>
                          <input type="radio" name="ctype" value={v} disabled={!offered} checked={d.type === v} onChange={() => set("type", v)} className="size-4.5 accent-primary-600" />
                          <span className="accent-icon inline-flex size-11 items-center justify-center rounded-xl"><Icon className="size-5" aria-hidden="true" /></span>
                          <span className="flex-1">
                            <span className="block font-bold text-ink-900">{l}</span>
                            <span className="block text-small text-ink-500">{offered ? sub : "Not offered by this doctor"}</span>
                          </span>
                          <span className="font-bold text-ink-900">{offered && price ? formatINR(price) : "—"}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.type && <p role="alert" className="mt-3 text-small font-medium text-danger-700">{errors.type}</p>}
                  {d.type === "video" && <p className="mt-4 rounded-lg bg-info-50 px-4 py-3 text-small text-info-700">You'll get a secure link. Join from the Appointments tab 10 minutes before your slot.</p>}
                </fieldset>
              )}
              {step === 4 && (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="mb-2 text-small font-semibold text-ink-800">Payment method</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {([["upi", "UPI", Smartphone], ["card", "Credit / debit card", CreditCard], ["insurance", "Insurance (cashless)", ShieldCheck], ["hospital", "Pay at hospital", Landmark]] as const).map(([v, l, Icon]) => (
                        <label key={v} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3.5", d.payment === v ? "border-primary-600 bg-primary-25" : "border-line hover:border-line-strong", v === "hospital" && d.type === "video" && "hidden")}>
                          <input type="radio" name="pay" checked={d.payment === v} onChange={() => set("payment", v)} className="size-4.5 accent-primary-600" />
                          <Icon className="size-5 text-ink-500" aria-hidden="true" />
                          <span className="text-small font-semibold">{l}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {d.payment === "upi" && <Field label="UPI ID" required error={errors.upi}>{(p) => <Input {...p} value={d.upi} onChange={(e) => set("upi", e.target.value)} />}</Field>}
                  {d.payment === "card" && <p className="rounded-lg bg-subtle px-4 py-3 text-small text-ink-600">You'll enter card details on the secure payment page (demo — nothing is charged).</p>}
                  {d.payment === "insurance" && <p className="rounded-lg bg-subtle px-4 py-3 text-small text-ink-600">{currentPatient.insurance.provider} · Policy {currentPatient.insurance.policy}. Consultation fees may not be covered; the hospital will confirm.</p>}
                  <label className="flex items-start gap-3 rounded-xl bg-subtle p-3.5">
                    <input type="checkbox" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5 size-4.5 shrink-0 accent-primary-600" aria-describedby={errors.consent ? "consent-err" : undefined} aria-invalid={!!errors.consent || undefined} />
                    <span className="text-small text-ink-700">I agree to the booking terms. Free cancellation up to 4 hours before the appointment. I consent to share my details with the doctor for this visit.</span>
                  </label>
                  {errors.consent && <p id="consent-err" role="alert" className="text-small font-medium text-danger-700">{errors.consent}</p>}
                  <p className="flex items-center gap-2 text-caption text-ink-500"><Lock className="size-3.5" aria-hidden="true" />Prototype checkout — no real payment is processed.</p>
                </div>
              )}
              {step === 5 && booked && doctor && <Confirmation appointment={booked} />}
            </div>

            {step < 5 && (
              <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-white p-3 md:static md:mt-8 md:border-0 md:p-0">
                {step > 0 && (
                  <Button variant="outline" size="lg" onClick={() => go(step - 1)} className="hidden md:inline-flex">
                    <ArrowLeft className="size-4" aria-hidden="true" /> Back
                  </Button>
                )}
                <Button size="lg" className="flex-1 md:ml-auto md:flex-none" onClick={next} loading={paying}>
                  {step === 4 ? (paying ? "Confirming…" : `Pay ${formatINR(fee + platform)} & confirm`) : "Continue"}
                  {step < 4 && <ArrowRight className="size-4" aria-hidden="true" />}
                </Button>
              </div>
            )}
          </section>

          {/* summary */}
          {doctor && step < 5 && (
            <aside className="card h-fit p-5 lg:sticky lg:top-24" aria-label="Booking summary">
              <h2 className="t-eyebrow text-ink-500">Your booking</h2>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={52} className="rounded-xl" />
                <div className="min-w-0">
                  <p className="truncate font-bold">{doctor.name}</p>
                  <p className="truncate text-small text-accent">{doctor.title}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-small">
                <div className="flex justify-between gap-2"><dt className="text-ink-500">When</dt><dd className="text-right font-semibold">{d.slot ? `${formatDate(d.slot, { weekday: "short", day: "numeric", month: "short" })}, ${formatTime(d.slot)}` : "—"}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-ink-500">Where</dt><dd className="text-right font-semibold">{d.type === "video" ? "Video call" : d.type === "home-visit" ? "Your home" : hospital?.shortName}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-ink-500">Patient</dt><dd className="text-right font-semibold">{d.patient === "self" ? currentPatient.name : d.familyName || "Family member"}</dd></div>
                <div className="flex justify-between gap-2 border-t border-line pt-2.5"><dt className="text-ink-500">Consultation</dt><dd className="font-semibold">{formatINR(fee)}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-ink-500">Platform fee</dt><dd className="font-semibold">{formatINR(platform)}</dd></div>
                <div className="flex justify-between gap-2 text-body"><dt className="font-bold">Total</dt><dd className="font-bold">{formatINR(fee + platform)}</dd></div>
              </dl>
            </aside>
          )}
        </div>
      </div>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}

function StepDoctor({ specialty, hospitalId, value, onChange, error }: { specialty: SpecialtySlug | null; hospitalId: string | null; value?: string; onChange: (id: string) => void; error?: string }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => doctors.filter((x) => (!specialty || x.specialty === specialty) && (!hospitalId || x.hospitalId === hospitalId) && (!q || `${x.name} ${x.title} ${x.subSpecialty}`.toLowerCase().includes(q.toLowerCase()))), [q, specialty, hospitalId]);
  return (
    <div>
      {hospitalId && <p className="mb-3 text-small text-ink-600">Doctors at <strong className="text-ink-900">{getHospital(hospitalId)?.name}</strong> · <Link to="/appointments/book" className="font-semibold text-primary-700 underline">show all</Link></p>}
      {specialty && <p className="mb-3 text-small text-ink-600">Showing <strong className="text-accent">{specialtyMap[specialty].name}</strong> specialists · <Link to="/appointments/book" className="font-semibold text-primary-700 underline">show all</Link></p>}
      <SearchBar value={q} onChange={setQ} placeholder="Search doctors…" label="Search doctors" />
      {error && <p role="alert" className="mt-3 text-small font-medium text-danger-700">{error}</p>}
      <div role="radiogroup" aria-label="Doctors" className="mt-4 grid gap-2">
        {list.map((x) => (
          <label key={x.id} style={toneStyle(x.specialty)} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3", value === x.id ? "border-primary-600 bg-primary-25 ring-2 ring-primary-600/15" : "border-line hover:border-line-strong")}>
            <input type="radio" name="doctor" checked={value === x.id} onChange={() => onChange(x.id)} className="size-4.5 accent-primary-600" />
            <Avatar name={x.name} initials={x.initials} photo={x.photo} size={48} className="rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{x.name}</span>
              <span className="block truncate text-small text-accent">{x.title} · {x.subSpecialty}</span>
              <Rating value={x.rating} className="text-caption" />
            </span>
            <span className="hidden text-right text-small sm:block"><span className="block font-bold">{formatINR(x.fee.inPerson)}</span><span className="text-ink-500">{x.experienceYears} yrs</span></span>
          </label>
        ))}
        {list.length === 0 && <p className="py-6 text-center text-small text-ink-500">No doctors match “{q}”.</p>}
      </div>
    </div>
  );
}

function icsFor(a: Appointment) {
  const doc = getDoctor(a.doctorId)!;
  const h = getHospital(a.hospitalId)!;
  const start = new Date(a.date);
  const end = new Date(start.getTime() + 30 * 60000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//HealthSphere//Prototype//EN", "BEGIN:VEVENT",
    `UID:${a.id}@healthsphere.example`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:${a.reason} — ${doc.name}`, `LOCATION:${a.type === "video" ? "HealthSphere video consultation" : h.address}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

function Confirmation({ appointment }: { appointment: Appointment }) {
  const doc = getDoctor(appointment.doctorId)!;
  const h = getHospital(appointment.hospitalId)!;
  const download = () => {
    const url = URL.createObjectURL(new Blob([icsFor(appointment)], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "healthsphere-appointment.ics";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="text-center" role="status">
      <span className="mx-auto inline-flex size-20 animate-pop items-center justify-center rounded-full bg-success-50 text-success-700">
        <CheckCircle2 className="size-11" aria-hidden="true" />
      </span>
      <p className="mt-4 text-ink-600">Your appointment with <strong className="text-ink-900">{doc.name}</strong> is confirmed. A confirmation has been sent to your phone.</p>
      <dl className="mx-auto mt-6 grid max-w-lg gap-3 rounded-2xl border border-line bg-canvas p-5 text-left text-small sm:grid-cols-2">
        <div><dt className="text-ink-500">Date & time</dt><dd className="font-bold">{formatDate(appointment.date, { weekday: "long", day: "numeric", month: "long" })}, {formatTime(appointment.date)}</dd></div>
        <div><dt className="text-ink-500">Consultation</dt><dd className="font-bold">{appointment.type === "video" ? "Video call" : appointment.type === "home-visit" ? "Home visit" : "In-person"}</dd></div>
        <div><dt className="text-ink-500">{appointment.type === "video" ? "Join from" : "Location"}</dt><dd className="font-bold">{appointment.type === "video" ? "Appointments tab" : h.name}</dd></div>
        <div><dt className="text-ink-500">Booking ID · Token</dt><dd className="font-bold">{appointment.id.toUpperCase()} · {appointment.token}</dd></div>
      </dl>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <ButtonLink to="/appointments" size="lg"><CalendarDays className="size-5" aria-hidden="true" />View appointments</ButtonLink>
        <Button size="lg" variant="outline" onClick={download}><CalendarPlus className="size-5" aria-hidden="true" />Add to calendar</Button>
      </div>
      <p className="mt-5 text-small text-ink-500">This visit will appear in <Link to="/care" className="font-semibold text-primary-700 underline">My Care Journey</Link> once the doctor starts your care plan.</p>
    </div>
  );
}
