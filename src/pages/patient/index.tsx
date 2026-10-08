import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  CloudUpload,
  FileText,
  Fingerprint,
  KeyRound,
  Laptop,
  LogOut,
  Pill,
  Plus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
  UploadCloud,
  UserRound,
  Video,
} from "lucide-react";
import { currentPatient, healthMetrics } from "@/data/patient";
import { prescriptions } from "@/data/records";
import { getDoctor } from "@/data/doctors";
import { RequireSession } from "@/components/layout/RequireSession";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { SlotPicker } from "@/components/appointments/SlotPicker";
import { MedicalRecordCard, RecordViewer, ShareDialog } from "@/components/records/MedicalRecordCard";
import { HealthMetricCard, metricTone } from "@/components/health/HealthMetricCard";
import { ColumnChart, LineChart } from "@/components/charts/HealthChart";
import { Avatar, Disclaimer, EmptyState, ErrorState, Field, Input, LoadingState, SearchBar, Select, SmartImage, StatusBadge, Switch } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from "@/components/ui/overlays";
import { useSimulatedQuery } from "@/hooks/useSimulatedQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAppState } from "@/lib/store";
import { cn, formatDate, formatTime, TODAY } from "@/lib/utils";
import type { Appointment, HealthMetric, MedicalRecord } from "@/types";

function PageHead({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="t-eyebrow text-primary-700">{eyebrow}</p>
        <h1 className="t-h1 mt-1">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/* =========================================================================
   Appointments
   ========================================================================= */
export function AppointmentsPage() {
  useDocumentTitle("Appointments");
  return (
    <RequireSession title="Sign in to see your appointments">
      <Appointments />
    </RequireSession>
  );
}

function Appointments() {
  const { appointments, updateAppointment } = useAppState();
  const { toast } = useToast();
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [newSlot, setNewSlot] = useState<string>();
  const [cancel, setCancel] = useState<Appointment | null>(null);
  const q = useSimulatedQuery(() => true, [], 400);

  const groups = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date));
    return {
      upcoming: sorted.filter((a) => a.status === "upcoming"),
      past: sorted.filter((a) => a.status === "completed").reverse(),
      cancelled: sorted.filter((a) => a.status === "cancelled").reverse(),
    };
  }, [appointments]);

  return (
    <div className="container-page py-6 sm:py-10">
      <PageHead eyebrow="Appointments" title="Your appointments" subtitle="Join video consults, reschedule or cancel, and see notes from past visits." action={<ButtonLink to="/appointments/book"><Plus className="size-4" aria-hidden="true" />Book appointment</ButtonLink>} />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <Tabs defaultValue="upcoming">
          <TabsList aria-label="Appointment status" className="mb-5">
            <TabsTrigger value="upcoming">Upcoming ({groups.upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({groups.past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({groups.cancelled.length})</TabsTrigger>
          </TabsList>
          {(["upcoming", "past", "cancelled"] as const).map((k) => (
            <TabsContent key={k} value={k}>
              {q.status === "loading" ? <LoadingState label="Loading appointments" /> : q.status === "error" ? <ErrorState onRetry={q.retry} /> : groups[k].length === 0 ? (
                <EmptyState icon={CalendarDays} title={k === "upcoming" ? "No upcoming appointments" : k === "past" ? "No past visits yet" : "No cancelled appointments"} description={k === "upcoming" ? "Book a consultation with a specialist in a few taps." : undefined} action={k === "upcoming" ? <ButtonLink to="/appointments/book">Book appointment</ButtonLink> : undefined} />
              ) : (
                <div className="space-y-3">
                  {groups[k].map((a) => (
                    <AppointmentCard key={a.id} appointment={a} onReschedule={k === "upcoming" ? () => { setReschedule(a); setNewSlot(undefined); } : undefined} onCancel={k === "upcoming" ? () => setCancel(a) : undefined} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <aside className="space-y-4" aria-label="Video consultations">
          <div className="card overflow-hidden">
            <div className="relative aspect-[16/10] bg-subtle"><SmartImage image={{ name: "video-consultation", alt: "Patient on a video consultation with her doctor at home", focus: "15% 50%" }} sizes="320px" className="absolute inset-0 size-full" /></div>
            <div className="p-5">
              <h2 className="flex items-center gap-2 font-bold"><Video className="size-5 text-primary-600" aria-hidden="true" />Consult from home</h2>
              <p className="mt-1 text-small text-ink-500">Video consults with the same specialists — prescriptions and notes land straight in your records.</p>
              <ButtonLink to="/doctors?type=video" variant="secondary" size="sm" className="mt-3">Find video doctors</ButtonLink>
            </div>
          </div>
          <div className="card p-5 text-small text-ink-600">
            <p className="font-semibold text-ink-900">Cancellation policy</p>
            <p className="mt-1">Free cancellation or rescheduling up to 4 hours before your appointment.</p>
          </div>
        </aside>
      </div>

      <Modal
        open={!!reschedule}
        onOpenChange={(o) => !o && setReschedule(null)}
        title="Reschedule appointment"
        description={reschedule ? `${getDoctor(reschedule.doctorId)?.name} · currently ${formatDate(reschedule.date, { day: "numeric", month: "short" })}, ${formatTime(reschedule.date)}` : undefined}
        size="lg"
        variant="sheet"
        footer={
          <>
            <Button variant="outline" onClick={() => setReschedule(null)}>Keep current time</Button>
            <Button disabled={!newSlot} onClick={() => { updateAppointment(reschedule!.id, { date: newSlot! }); toast({ title: "Appointment rescheduled", description: `New time: ${formatDate(newSlot!, { weekday: "short", day: "numeric", month: "short" })}, ${formatTime(newSlot!)}` }); setReschedule(null); }}>
              <CalendarPlus className="size-4" aria-hidden="true" />Confirm new time
            </Button>
          </>
        }
      >
        {reschedule && <SlotPicker doctorId={reschedule.doctorId} value={newSlot} onChange={setNewSlot} />}
      </Modal>

      <Modal
        open={!!cancel}
        onOpenChange={(o) => !o && setCancel(null)}
        title="Cancel this appointment?"
        description={cancel ? `${cancel.reason} with ${getDoctor(cancel.doctorId)?.name}` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancel(null)}>Keep appointment</Button>
            <Button variant="danger" onClick={() => { updateAppointment(cancel!.id, { status: "cancelled" }); toast({ kind: "info", title: "Appointment cancelled", description: "A full refund will reach your account in 3–5 days." }); setCancel(null); }}>Cancel appointment</Button>
          </>
        }
      >
        <p className="text-small text-ink-600">You're within the free cancellation window. If this visit is part of a care journey, your next step will be moved to “to be scheduled”.</p>
      </Modal>
    </div>
  );
}

/* =========================================================================
   Health records
   ========================================================================= */
const recordTabs = [
  { value: "all", label: "All" },
  { value: "reports", label: "Reports", match: "Reports" },
  { value: "prescriptions", label: "Prescriptions", match: "Prescriptions" },
  { value: "documents", label: "Documents", match: "Documents" },
  { value: "history", label: "History", match: "History" },
];

export function RecordsPage() {
  useDocumentTitle("Health records");
  return (
    <RequireSession title="Sign in to see your health records">
      <Records />
    </RequireSession>
  );
}

function Records() {
  const { records, updateRecord } = useAppState();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "all";
  const [q, setQ] = useState("");
  const [upload, setUpload] = useState(false);
  const [share, setShare] = useState<MedicalRecord | null>(null);
  const openId = params.get("open");
  const viewing = records.find((r) => r.id === openId) ?? null;
  const query = useSimulatedQuery(() => true, [], 450);

  const setTab = (v: string) => { const n = new URLSearchParams(params); if (v === "all") n.delete("tab"); else n.set("tab", v); setParams(n, { replace: true }); };
  const setOpen = (id: string | null) => { const n = new URLSearchParams(params); if (id) n.set("open", id); else n.delete("open"); setParams(n, { replace: true }); };

  const filtered = (match?: string) => records.filter((r) => (!match || r.category === match) && (!q || `${r.title} ${r.summary}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="container-page py-6 sm:py-10">
      <PageHead
        eyebrow="Health records"
        title="Your medical records"
        subtitle="Reports, prescriptions and documents from every visit — encrypted and shared only with your consent."
        action={<Button onClick={() => setUpload(true)}><UploadCloud className="size-4" aria-hidden="true" />Upload</Button>}
      />
      <Tabs value={tab} onValueChange={setTab}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TabsList aria-label="Record categories">
          {recordTabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
        <SearchBar value={q} onChange={setQ} placeholder="Search records…" label="Search records" className="lg:w-80" />
      </div>

      {recordTabs.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          {t.value === tab && (
            <>
              <h2 className="sr-only">{t.label === "All" ? "All records" : t.label}</h2>
      {tab === "prescriptions" && (
        <section className="card mb-5 p-5" aria-labelledby="meds">
          <h2 id="meds" className="mb-3 flex items-center gap-2 font-bold"><Pill className="size-5 text-primary-600" aria-hidden="true" />Current medications</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {prescriptions.flatMap((p) => p.medications.map((m) => ({ ...m, doctor: getDoctor(p.doctorId)?.name }))).map((m) => (
              <li key={m.name} className="rounded-xl border border-line p-4">
                <p className="font-semibold">{m.name}</p>
                <p className="text-small text-ink-600">{m.dose} · {m.frequency} · {m.duration}</p>
                <p className="mt-1 text-caption text-ink-500">Prescribed by {m.doctor}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {query.status === "loading" ? <LoadingState label="Loading records" rows={4} /> : query.status === "error" ? <ErrorState onRetry={query.retry} /> : (() => {
        const list = filtered(recordTabs.find((t) => t.value === tab)?.match);
        return list.length === 0 ? (
          <EmptyState icon={ClipboardList} title={q ? `No records match “${q}”` : "Nothing here yet"} description="Upload a report or prescription, or they'll appear automatically after your visits." action={<Button onClick={() => setUpload(true)}><UploadCloud className="size-4" aria-hidden="true" />Upload a record</Button>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((r) => <MedicalRecordCard key={r.id} record={r} onView={() => setOpen(r.id)} onShare={() => setShare(r)} />)}
          </div>
        );
      })()}
            </>
          )}
        </TabsContent>
      ))}
      </Tabs>

      <Disclaimer className="mt-6">Records shown are mock data for this prototype. HealthSphere is not connected to any real medical record system.</Disclaimer>

      <RecordViewer record={viewing} onOpenChange={(o) => !o && setOpen(null)} />
      <ShareDialog
        record={share}
        onOpenChange={(o) => !o && setShare(null)}
        onShared={(r, who) => {
          updateRecord(r.id, { sharedWith: Array.from(new Set([...r.sharedWith, who])) });
          setShare(null);
          toast({ title: "Record shared securely", description: `${r.title} → ${who}. You can revoke access anytime.` });
        }}
      />
      <UploadDialog open={upload} onOpenChange={setUpload} />
    </div>
  );
}

function UploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addRecord } = useAppState();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MedicalRecord["category"]>("Reports");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setFile(null); setTitle(""); setProgress(null); setError(""); };
  const pick = (f?: File | null) => {
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { setError("That file is larger than 20 MB. Please choose a smaller file."); return; }
    setError("");
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  };
  const submit = () => {
    if (!file) { setError("Choose a file to upload."); return; }
    if (!title.trim()) { setError("Give your record a title."); return; }
    setProgress(0);
    const t = window.setInterval(() => {
      setProgress((p) => {
        const n = (p ?? 0) + 20;
        if (n >= 100) {
          window.clearInterval(t);
          addRecord({ id: `rec-up-${Date.now()}`, title: title.trim(), type: category === "Prescriptions" ? "prescription" : category === "History" ? "history" : category === "Documents" ? "document" : "report", category, date: new Date(TODAY).toISOString().slice(0, 10), summary: "Uploaded by you.", fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`, sharedWith: [] });
          toast({ title: "Upload complete", description: `${title.trim()} was added to ${category}.` });
          window.setTimeout(() => { onOpenChange(false); reset(); }, 400);
        }
        return Math.min(100, n);
      });
    }, 180);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}
      title="Upload a record"
      description="PDF or image, up to 20 MB. Stays private until you share it."
      variant="sheet"
      footer={<><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={progress !== null && progress < 100}><CloudUpload className="size-4" aria-hidden="true" />Upload</Button></>}
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={cn("flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors", drag ? "border-primary-500 bg-primary-25" : "border-line-strong hover:border-primary-300 hover:bg-primary-25")}
        >
          <UploadCloud className="size-8 text-primary-600" aria-hidden="true" />
          <span className="font-semibold text-ink-900">{file ? file.name : "Choose a file or drag it here"}</span>
          <span className="text-small text-ink-500">{file ? `${Math.round(file.size / 1024)} KB` : "From your device, camera or gallery"}</span>
        </button>
        <input ref={inputRef} type="file" accept=".pdf,image/*" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
        <Field label="Title" required>{(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. Thyroid test — Oct 2026" />}</Field>
        <Field label="Category">{(p) => <Select {...p} value={category} onChange={(e) => setCategory(e.target.value as MedicalRecord["category"])}>{["Reports", "Prescriptions", "Documents", "History"].map((c) => <option key={c}>{c}</option>)}</Select>}</Field>
        {error && <p role="alert" className="text-small font-medium text-danger-700">{error}</p>}
        {progress !== null && (
          <div aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress"><div className="h-full rounded-full bg-primary-600 transition-[width]" style={{ width: `${progress}%` }} /></div>
            <p className="mt-1.5 flex items-center gap-1.5 text-small text-ink-600">{progress >= 100 ? <><CheckCircle2 className="size-4 text-success-700" aria-hidden="true" />Uploaded & encrypted</> : `Uploading… ${progress}%`}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* =========================================================================
   Health insights
   ========================================================================= */
export function InsightsPage() {
  useDocumentTitle("Health insights");
  return (
    <RequireSession title="Sign in to see your health insights">
      <Insights />
    </RequireSession>
  );
}

function MetricChart({ m }: { m: HealthMetric }) {
  if (m.id === "steps") return <ColumnChart title="Daily steps, last 7 days" labels={m.trendLabels} series={[{ name: "Steps", values: m.trend }]} goal={{ value: m.goal!, label: "Goal 10,000" }} highlightLast format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `${v}`)} height={240} />;
  if (m.id === "sleep") return <ColumnChart title="Hours of sleep, last 7 nights" labels={m.trendLabels} series={[{ name: "Sleep (hours)", values: m.trend }]} goal={{ value: 8, label: "Goal 8 h" }} highlightLast format={(v) => `${Math.round(v * 10) / 10}h`} height={240} />;
  if (m.id === "blood-pressure") return <LineChart title="Blood pressure, last 7 readings (mmHg)" labels={m.trendLabels} series={[{ name: "Systolic", values: m.trend }, { name: "Diastolic", values: m.trend2! }]} height={240} />;
  return <LineChart title={`${m.label}, recent trend`} labels={m.trendLabels} series={[{ name: m.label, values: m.trend }]} height={240} format={(v) => `${Math.round(v * 10) / 10}`} />;
}

const insightCopy: Record<HealthMetric["id"], string> = {
  "heart-rate": "Your resting heart rate has stayed within a healthy 69–76 bpm range all week.",
  "blood-pressure": "Readings are consistently below 125/80. Keep measuring at the same time each morning.",
  steps: "You hit your 10,000-step goal on 2 of the last 7 days. A 15-minute evening walk would close the gap.",
  sleep: "You averaged 7h 15m. Your best sleep followed days with more than 9,000 steps.",
  weight: "A steady, gradual change of −0.8 kg over 6 months. BMI remains in the healthy range.",
  spo2: "Oxygen saturation is normal at 97–99%.",
};

function Insights() {
  const [sel, setSel] = useState<HealthMetric["id"]>("heart-rate");
  const [log, setLog] = useState(false);
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [err, setErr] = useState("");
  const { toast } = useToast();
  const m = healthMetrics.find((x) => x.id === sel)!;

  return (
    <div className="container-page py-6 sm:py-10">
      <PageHead eyebrow="Health insights" title="Your health at a glance" subtitle="Synced from your devices and visits. Simple trends — not a diagnosis." action={<Button variant="outline" onClick={() => setLog(true)}><Plus className="size-4" aria-hidden="true" />Log a reading</Button>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" role="group" aria-label="Choose a metric">
        {healthMetrics.map((x) => <HealthMetricCard key={x.id} metric={x} compact onClick={() => setSel(x.id)} selected={sel === x.id} />)}
      </div>
      <section className="card mt-6 p-5 sm:p-6" style={metricTone(m.id)} aria-labelledby="chart-title">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="chart-title" className="t-h3">{m.label}</h2>
            <p className="text-small text-ink-500">{m.range ?? (m.goal ? `Goal: ${m.goal.toLocaleString("en-IN")}${m.id === "sleep" ? " hours" : " steps"}` : "Last 7 months")}</p>
          </div>
          <p className="text-right"><span className="text-metric leading-none font-bold tabular-nums">{m.value}</span> <span className="text-small text-ink-500">{m.unit}</span></p>
        </div>
        <MetricChart m={m} />
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-subtle p-4 text-small text-ink-700"><CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-success-700" aria-hidden="true" />{insightCopy[m.id]}</p>
      </section>
      <Disclaimer className="mt-6">Insights are general wellness information, not a medical diagnosis. Talk to your doctor about readings that worry you.</Disclaimer>

      <Modal
        open={log}
        onOpenChange={(o) => { setLog(o); setErr(""); }}
        title="Log a blood pressure reading"
        size="sm"
        footer={<><Button variant="outline" onClick={() => setLog(false)}>Cancel</Button><Button onClick={() => {
          const s = +sys, d = +dia;
          if (!s || !d || s < 70 || s > 250 || d < 40 || d > 150 || d >= s) { setErr("Enter realistic values, e.g. 120 / 80 (systolic higher than diastolic)."); return; }
          setLog(false); setSys(""); setDia(""); setErr("");
          toast({ title: "Reading saved", description: `${s}/${d} mmHg logged for today.` });
          if (s >= 180 || d >= 120) toast({ kind: "warning", title: "Very high reading", description: "If you have chest pain, breathlessness or headache, call 108 now." });
        }}>Save reading</Button></>}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Systolic (top)">{(p) => <Input {...p} inputMode="numeric" value={sys} onChange={(e) => setSys(e.target.value)} placeholder="120" />}</Field>
          <Field label="Diastolic (bottom)">{(p) => <Input {...p} inputMode="numeric" value={dia} onChange={(e) => setDia(e.target.value)} placeholder="80" />}</Field>
        </div>
        {err && <p role="alert" className="mt-3 text-small font-medium text-danger-700">{err}</p>}
      </Modal>
    </div>
  );
}

/* =========================================================================
   Profile, privacy & security
   ========================================================================= */
export function ProfilePage() {
  useDocumentTitle("Profile");
  return (
    <RequireSession title="Sign in to manage your profile">
      <Profile />
    </RequireSession>
  );
}

const accessLog = [
  { who: "Dr. Ananya Sharma", what: "Viewed Eye Test Report", when: "Oct 7, 4:12 PM" },
  { who: "Harbour Diagnostics", what: "Uploaded Complete Blood Count", when: "Oct 7, 11:03 AM" },
  { who: "Dr. Arjun Mehta", what: "Viewed ECG Report", when: "Oct 3, 6:40 PM" },
  { who: "Arun Raman (family)", what: "Viewed Surgical Plan", when: "Sep 28, 9:15 PM" },
];

function Profile() {
  const { signOut, notifications, markNotificationsRead, resetDemo } = useAppState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const p = currentPatient;
  const [prefs, setPrefs] = useState({ autoShare: true, family: true, research: false, marketing: false, twoFactor: true, biometric: true, reminders: true, reportAlerts: true });
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const toggle = (k: keyof typeof prefs, msg: string) => (v: boolean) => { setPrefs((x) => ({ ...x, [k]: v })); toast({ kind: "info", title: `${msg} ${v ? "turned on" : "turned off"}` }); };

  useEffect(() => {
    if (hash) window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [hash]);

  const sectionNav = [["overview", "Overview"], ["notifications", "Notifications"], ["privacy", "Privacy & consent"], ["security", "Account security"]];

  return (
    <div className="container-page py-6 sm:py-10">
      <div className="card mb-6 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left" id="overview">
        <Avatar name={p.name} initials={p.initials} size={80} />
        <div className="flex-1">
          <h1 className="t-h2">{p.name}</h1>
          <p className="text-ink-500">{p.age} yrs · {p.gender === "female" ? "Female" : "Male"} · Blood group {p.bloodGroup} · {p.city}</p>
          <p className="text-small text-ink-500">{p.email} · {p.phone}</p>
        </div>
        <Button variant="outline" onClick={() => toast({ kind: "info", title: "Editing is disabled in the demo" })}><UserRound className="size-4" aria-hidden="true" />Edit profile</Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Profile sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1">
            {sectionNav.map(([id, l]) => <li key={id}><a href={`#${id}`} className="flex min-h-11 items-center rounded-lg px-3 text-small font-semibold text-ink-600 hover:bg-white hover:text-ink-900">{l}</a></li>)}
            <li className="pt-2"><Link to="/records" className="flex min-h-11 items-center rounded-lg px-3 text-small font-semibold text-ink-600 hover:bg-white">Health records</Link></li>
            <li><Link to="/insights" className="flex min-h-11 items-center rounded-lg px-3 text-small font-semibold text-ink-600 hover:bg-white">Health insights</Link></li>
          </ul>
        </nav>

        <div className="space-y-6">
          {/* quick links for phones */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <Link to="/records" className="card flex items-center gap-3 p-4 font-semibold"><ClipboardList className="size-5 text-primary-600" aria-hidden="true" />Records</Link>
            <Link to="/insights" className="card flex items-center gap-3 p-4 font-semibold"><FileText className="size-5 text-primary-600" aria-hidden="true" />Insights</Link>
          </div>

          <section className="card p-6" aria-labelledby="medical">
            <h2 id="medical" className="t-h3 mb-4">Medical summary</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div><dt className="text-small text-ink-500">Allergies</dt><dd className="mt-1 flex flex-wrap gap-1.5">{p.allergies.map((a) => <span key={a} className="rounded-full bg-danger-50 px-2.5 py-0.5 text-small font-semibold text-danger-700">{a}</span>)}</dd></div>
              <div><dt className="text-small text-ink-500">Conditions</dt><dd className="mt-1 text-small font-semibold">{p.conditions.join(" · ")}</dd></div>
              <div><dt className="text-small text-ink-500">Insurance</dt><dd className="mt-1 text-small font-semibold">{p.insurance.provider} · {p.insurance.policy}<br /><span className="font-normal text-ink-500">Valid till {formatDate(p.insurance.validTill)}</span></dd></div>
              <div><dt className="text-small text-ink-500">Emergency contacts</dt><dd className="mt-1 space-y-1 text-small">{p.emergencyContacts.map((c) => <p key={c.name}><span className="font-semibold">{c.name}</span> ({c.relation}) · <a className="text-primary-700 underline" href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a></p>)}</dd></div>
            </dl>
          </section>

          <section className="card p-6" id="notifications" aria-labelledby="notif-h">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="notif-h" className="t-h3 flex items-center gap-2"><Bell className="size-5 text-primary-600" aria-hidden="true" />Notifications</h2>
              <Button size="sm" variant="ghost" onClick={() => { markNotificationsRead(); toast({ title: "All caught up" }); }}>Mark all read</Button>
            </div>
            <ul className="divide-y divide-line">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link to={n.href ?? "#"} className="flex gap-3 py-3.5">
                    <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary-600")} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-small", n.read ? "font-medium text-ink-700" : "font-bold text-ink-900")}>{n.title}{!n.read && <span className="sr-only"> (unread)</span>}</span>
                      <span className="block text-small text-ink-500">{n.body}</span>
                    </span>
                    <span className="shrink-0 text-caption text-ink-500">{n.time}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-line">
              <Switch checked={prefs.reminders} onChange={toggle("reminders", "Appointment reminders")} label="Appointment & medicine reminders" description="SMS and push, 24 hours and 1 hour before." />
              <Switch checked={prefs.reportAlerts} onChange={toggle("reportAlerts", "Report alerts")} label="New report alerts" description="Notify me when results are added to my records." />
            </div>
          </section>

          <section className="card p-6" id="privacy" aria-labelledby="privacy-h">
            <h2 id="privacy-h" className="t-h3 flex items-center gap-2"><ShieldCheck className="size-5 text-success-700" aria-hidden="true" />Privacy & consent</h2>
            <p className="mt-1 text-small text-ink-500">You decide who sees your health information. Changes apply immediately.</p>
            <div className="mt-2 divide-y divide-line">
              <Switch checked={prefs.autoShare} onChange={toggle("autoShare", "Sharing with treating doctors")} label="Share records with my treating doctors" description="Doctors in an active care journey can view related records." />
              <Switch checked={prefs.family} onChange={toggle("family", "Family access")} label="Family access — Arun Raman" description="Can view appointments and documents you mark as shared." />
              <Switch checked={prefs.research} onChange={toggle("research", "Research consent")} label="Anonymised research" description="Allow de-identified data to support medical research." />
              <Switch checked={prefs.marketing} onChange={toggle("marketing", "Health tips")} label="Personalised health tips" description="Use my specialty interests to suggest Health Library articles." />
            </div>
            <h3 className="mt-6 mb-2 font-bold">Who accessed your records</h3>
            <div className="overflow-x-auto rounded-xl border border-line" tabIndex={0} role="region" aria-label="Record access log">
              <table className="w-full min-w-[30rem] text-left text-small">
                <caption className="sr-only">Record access log</caption>
                <thead className="bg-subtle text-ink-600"><tr><th scope="col" className="px-4 py-2.5 font-semibold">Who</th><th scope="col" className="px-4 py-2.5 font-semibold">Action</th><th scope="col" className="px-4 py-2.5 font-semibold">When</th></tr></thead>
                <tbody>{accessLog.map((a) => <tr key={a.what} className="border-t border-line"><td className="px-4 py-3 font-semibold">{a.who}</td><td className="px-4 py-3 text-ink-600">{a.what}</td><td className="px-4 py-3 text-ink-500">{a.when}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Data export requested", description: "We'll email a secure download link within 24 hours." })}>Download my data</Button>
              <Button variant="danger-soft" size="sm" onClick={() => toast({ kind: "warning", title: "Deletion request needs confirmation", description: "In the real app this requires OTP verification." })}><Trash2 className="size-4" aria-hidden="true" />Request account deletion</Button>
            </div>
          </section>

          <section className="card p-6" id="security" aria-labelledby="sec-h">
            <h2 id="sec-h" className="t-h3 flex items-center gap-2"><KeyRound className="size-5 text-primary-600" aria-hidden="true" />Account security</h2>
            <div className="mt-2 divide-y divide-line">
              <Switch checked={prefs.twoFactor} onChange={toggle("twoFactor", "Two-step verification")} label="Two-step verification" description="OTP to your phone when signing in on a new device." />
              <Switch checked={prefs.biometric} onChange={toggle("biometric", "Biometric unlock")} label="Biometric unlock" description="Use Face ID or fingerprint to open the app." />
            </div>
            <h3 className="mt-5 mb-2 font-bold">Active sessions</h3>
            <ul className="space-y-2">
              {[{ icon: Laptop, name: "Chrome on Windows · Chennai", when: "This device · active now", current: true }, { icon: Smartphone, name: "HealthSphere app · Pixel 8", when: "Last active 2 hours ago", current: false }, { icon: Fingerprint, name: "HealthSphere app · iPad", when: "Last active Sep 30", current: false }].map(({ icon: Icon, name, when, current }) => (
                <li key={name} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <Icon className="size-5 text-ink-500" aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className="block text-small font-semibold">{name}</span><span className="block text-caption text-ink-500">{when}</span></span>
                  {current ? <StatusBadge status="normal" label="Current" /> : <Button size="sm" variant="ghost" onClick={() => toast({ title: "Session signed out", description: name })}>Sign out</Button>}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setConfirmSignOut(true)}><LogOut className="size-4" aria-hidden="true" />Sign out</Button>
              <Button variant="ghost" onClick={() => { resetDemo(); toast({ title: "Demo data reset" }); navigate("/"); }}><RotateCcw className="size-4" aria-hidden="true" />Reset demo data</Button>
            </div>
          </section>
        </div>
      </div>

      <Modal open={confirmSignOut} onOpenChange={setConfirmSignOut} title="Sign out of HealthSphere?" size="sm" footer={<><Button variant="outline" onClick={() => setConfirmSignOut(false)}>Stay signed in</Button><Button onClick={() => { signOut(); navigate("/"); toast({ kind: "info", title: "You've been signed out", description: "For your privacy, records are hidden until you sign in again." }); }}>Sign out</Button></>}>
        <p className="text-small text-ink-600">You'll need to sign in again to see appointments and records on this device.</p>
      </Modal>
    </div>
  );
}
