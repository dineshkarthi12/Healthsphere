import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  FileText,
  FlaskConical,
  HeartPulse,
  Pill,
  Plus,
  Save,
  Send,
  Stethoscope,
  Thermometer,
  Trash2,
  UserPlus,
  Video,
} from "lucide-react";
import {
  medicineCatalogue,
  portalMessages,
  portalPatients,
  portalPendingReports,
  portalStats,
  portalTodayAppointments,
  portalWeeklyVisits,
  testCatalogue,
  type PortalAppointment,
} from "@/data/portal";
import { DashHeader, DataTable, Panel, StatTile } from "@/components/dashboard/Dashboard";
import { ColumnChart } from "@/components/charts/HealthChart";
import { Avatar, Badge, EmptyState, Field, Input, SearchBar, Select, StatusBadge, Switch, Textarea } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from "@/components/ui/overlays";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn, formatDate, greeting, TODAY } from "@/lib/utils";
import type { PortalPatient } from "@/types";

const patientById = (id?: string) => portalPatients.find((p) => p.id === id);
const apptStatus: Record<PortalAppointment["status"], { label: string; tone: "success" | "primary" | "warning" | "info" | "neutral" }> = {
  completed: { label: "Completed", tone: "success" },
  "in-consultation": { label: "In consultation", tone: "primary" },
  "checked-in": { label: "Checked in", tone: "info" },
  waiting: { label: "Waiting", tone: "warning" },
  scheduled: { label: "Scheduled", tone: "neutral" },
};
const typeTone: Record<PortalAppointment["type"], string> = {
  Consultation: "bg-primary-50 text-primary-700",
  "Follow-up": "bg-success-50 text-success-700",
  Surgery: "bg-danger-50 text-danger-700",
  "Video consult": "bg-info-50 text-info-700",
  "Post-op": "bg-warning-50 text-warning-700",
};

function AppointmentRows({ rows, compact = false }: { rows: PortalAppointment[]; compact?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((a) => {
        const p = patientById(a.patientId)!;
        const s = apptStatus[a.status];
        return (
          <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
            <span className="w-[4.5rem] shrink-0 text-small font-semibold text-ink-700 tabular-nums">{a.time}</span>
            <Avatar name={p.name} initials={p.initials} size={36} />
            <span className="min-w-0 flex-1">
              <Link to={`/doctor/patients/${p.id}`} className="block truncate py-1 text-small font-semibold text-ink-900 hover:text-primary-700">{p.name}</Link>
              <span className="block truncate text-caption text-ink-500">{a.reason}</span>
            </span>
            <span className={cn("hidden rounded-full px-2.5 py-0.5 text-caption font-semibold sm:inline", typeTone[a.type])}>{a.type}</span>
            {!compact && <Badge tone={s.tone}>{s.label}</Badge>}
            {a.status !== "completed" && (
              <ButtonLink to={`/doctor/consult/${p.id}`} size="sm" variant={a.status === "in-consultation" || a.status === "checked-in" ? "primary" : "outline"} aria-label={`Start consultation with ${p.name}`}>
                {a.type === "Video consult" ? <Video className="size-4" aria-hidden="true" /> : <Stethoscope className="size-4" aria-hidden="true" />}
                <span className="hidden lg:inline">{a.status === "in-consultation" ? "Resume" : "Start"}</span>
              </ButtonLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* =========================================================== Dashboard */
export function DoctorDashboard() {
  useDocumentTitle("Doctor dashboard");
  const tones = ["#2a74ec", "#12a383", "#e59a0b", "#7c5cfc", "#0a9fb5"];
  return (
    <>
      <DashHeader
        title={`${greeting(TODAY)}, Dr. Sharma`}
        subtitle={`${formatDate(TODAY.toISOString(), { weekday: "long", day: "numeric", month: "long" })} · ClearSight Eye Institute · Here's your overview for today.`}
        actions={<><ButtonLink to="/doctor/appointments" variant="outline" size="sm">View schedule</ButtonLink><ButtonLink to="/doctor/consult/pp-2" size="sm"><Stethoscope className="size-4" aria-hidden="true" />Resume consultation</ButtonLink></>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {portalStats.map((s, i) => <StatTile key={s.label} label={s.label} value={String(s.value)} icon={s.icon} hint={s.delta} tone={tones[i]} />)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Today's appointments" action={{ label: "View all", to: "/doctor/appointments" }}>
          <AppointmentRows rows={portalTodayAppointments.slice(0, 6)} />
        </Panel>
        <div className="grid gap-6">
          <Panel title="Patient visits this week">
            <ColumnChart title="Patient visits per day this week" labels={portalWeeklyVisits.labels} series={[{ name: "Visits", values: portalWeeklyVisits.values }]} height={170} />
            <div className="mt-3 flex items-center justify-between rounded-xl bg-subtle px-4 py-3">
              <span className="text-small text-ink-600">Patient satisfaction</span>
              <span className="text-h3 font-bold">4.9<span className="text-small font-medium text-ink-500"> / 5</span></span>
            </div>
          </Panel>
          <Panel title="Quick actions">
            <div className="grid grid-cols-2 gap-2">
              {[{ l: "Add patient", i: UserPlus, to: "/doctor/patients" }, { l: "ePrescription", i: FilePlus2, to: "/doctor/consult/pp-3" }, { l: "Request tests", i: FlaskConical, to: "/doctor/consult/pp-3" }, { l: "Messages", i: Send, to: "/doctor/messages" }].map(({ l, i: Icon, to }) => (
                <Link key={l} to={to} className="flex min-h-12 items-center gap-2.5 rounded-xl border border-line px-3 text-small font-semibold text-ink-800 hover:border-primary-300 hover:bg-primary-25"><Icon className="size-4.5 text-primary-600" aria-hidden="true" />{l}</Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Pending reports" action={{ label: "All reports", to: "/doctor/reports" }}>
          <ul className="divide-y divide-line">
            {portalPendingReports.map((r) => {
              const p = patientById(r.patientId)!;
              return (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <FileText className={cn("size-5", r.urgent ? "text-danger-600" : "text-ink-400")} aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-small font-semibold">{r.title}</span><span className="block text-caption text-ink-500">{p.name} · Due {r.due}</span></span>
                  {r.urgent && <Badge tone="danger" icon={AlertTriangle}>Urgent</Badge>}
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Messages" action={{ label: "Inbox", to: "/doctor/messages" }}>
          <ul className="divide-y divide-line">
            {portalMessages.map((m) => (
              <li key={m.id} className="flex items-start gap-3 py-3">
                <Avatar name={m.from} initials={m.initials} size={36} />
                <span className="min-w-0 flex-1"><span className={cn("block text-small", m.unread ? "font-bold" : "font-semibold")}>{m.from}{m.unread && <span className="sr-only"> (unread)</span>}</span><span className="block truncate text-small text-ink-500">{m.preview}</span></span>
                <span className="shrink-0 text-caption text-ink-500">{m.time}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/* ======================================================== Appointments */
export function DoctorAppointments() {
  useDocumentTitle("Appointments · Doctor portal");
  const [filter, setFilter] = useState<"all" | PortalAppointment["status"]>("all");
  const rows = portalTodayAppointments.filter((a) => filter === "all" || a.status === filter);
  return (
    <>
      <DashHeader title="Appointments" subtitle="Today · 8 booked · 4 slots open this afternoon" actions={<Button size="sm" variant="outline"><CalendarClock className="size-4" aria-hidden="true" />Block time</Button>} />
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList aria-label="Filter by status" className="mb-4">
          <TabsTrigger value="all">All ({portalTodayAppointments.length})</TabsTrigger>
          {(["checked-in", "waiting", "scheduled", "completed"] as const).map((s) => <TabsTrigger key={s} value={s}>{apptStatus[s].label} ({portalTodayAppointments.filter((a) => a.status === s).length})</TabsTrigger>)}
        </TabsList>
        {(["all", "checked-in", "waiting", "scheduled", "completed"] as const).map((v) => (
          <TabsContent key={v} value={v}>
            {v === filter && (
              <div className="card px-5 py-2">
                {rows.length ? <AppointmentRows rows={rows} /> : <EmptyState className="my-4 border-0" icon={CalendarClock} title="No appointments with this status" />}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

/* ============================================================ Patients */
const statusMap: Record<PortalPatient["status"], "stable" | "follow-up" | "critical" | "new"> = { stable: "stable", "follow-up": "follow-up", critical: "critical", new: "new" };

export function DoctorPatients() {
  useDocumentTitle("Patients · Doctor portal");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [add, setAdd] = useState(false);
  const rows = portalPatients.filter((p) => (!status || p.status === status) && (!q || `${p.name} ${p.condition}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <DashHeader title="Patients" subtitle={`${portalPatients.length} active patients under your care`} actions={<Button size="sm" onClick={() => setAdd(true)}><UserPlus className="size-4" aria-hidden="true" />Add patient</Button>} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchBar value={q} onChange={setQ} placeholder="Search by name or condition…" label="Search patients" className="flex-1" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="sm:w-48">
          <option value="">All statuses</option><option value="critical">Urgent</option><option value="follow-up">Follow-up</option><option value="new">New</option><option value="stable">Stable</option>
        </Select>
      </div>
      <DataTable
        caption="Patients"
        rows={rows}
        rowKey={(p) => p.id}
        onRowClick={(p) => navigate(`/doctor/patients/${p.id}`)}
        empty={<EmptyState title="No patients match" description="Try a different name or status." />}
        columns={[
          { key: "name", header: "Patient", render: (p) => <span className="inline-flex items-center gap-3"><Avatar name={p.name} initials={p.initials} size={34} /><Link to={`/doctor/patients/${p.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-ink-900 hover:text-primary-700">{p.name}</Link></span> },
          { key: "age", header: "Age / Sex", render: (p) => `${p.age} · ${p.gender}`, hideOnMobile: true },
          { key: "cond", header: "Condition", render: (p) => p.condition },
          { key: "last", header: "Last visit", render: (p) => formatDate(p.lastVisit, { day: "numeric", month: "short" }) },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={statusMap[p.status]} /> },
        ]}
      />
      <Modal open={add} onOpenChange={setAdd} title="Add patient" description="Creates a record and sends the patient a HealthSphere invite." footer={<><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={() => { setAdd(false); toast({ title: "Patient invited", description: "They'll receive an SMS to complete their profile." }); }}>Add patient</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required className="sm:col-span-2">{(p) => <Input {...p} />}</Field>
          <Field label="Mobile number" required>{(p) => <Input {...p} type="tel" />}</Field>
          <Field label="Age">{(p) => <Input {...p} inputMode="numeric" />}</Field>
          <Field label="Reason for referral" className="sm:col-span-2">{(p) => <Textarea {...p} rows={3} />}</Field>
        </div>
      </Modal>
    </>
  );
}

function VitalsGrid({ p }: { p: PortalPatient }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {[{ k: "Blood pressure", v: p.vitals.bp, i: HeartPulse }, { k: "Heart rate", v: `${p.vitals.hr} bpm`, i: HeartPulse }, { k: "SpO₂", v: `${p.vitals.spo2}%`, i: Thermometer }, { k: "Temperature", v: p.vitals.temp, i: Thermometer }].map(({ k, v }) => (
        <div key={k} className="rounded-xl bg-subtle px-3 py-2.5"><dt className="text-caption text-ink-500">{k}</dt><dd className="font-bold tabular-nums">{v}</dd></div>
      ))}
    </dl>
  );
}

export function DoctorPatientDetail() {
  const { id } = useParams();
  const p = patientById(id);
  useDocumentTitle(p ? `${p.name} · Patient` : "Patient");
  if (!p) return <EmptyState title="Patient not found" action={<ButtonLink to="/doctor/patients">Back to patients</ButtonLink>} />;
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-small text-ink-500"><Link to="/doctor/patients" className="hover:text-primary-700">Patients</Link> / <span className="text-ink-800">{p.name}</span></nav>
      <div className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar name={p.name} initials={p.initials} size={64} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2"><h1 className="t-h2">{p.name}</h1><StatusBadge status={statusMap[p.status]} /></div>
          <p className="text-ink-500">{p.age} yrs · {p.gender === "F" ? "Female" : "Male"} · {p.phone}</p>
          <p className="text-small font-semibold text-ink-700">{p.condition}</p>
        </div>
        <div className="flex gap-2"><ButtonLink to={`/doctor/consult/${p.id}`}><Stethoscope className="size-4" aria-hidden="true" />Start consultation</ButtonLink></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Latest vitals"><VitalsGrid p={p} /></Panel>
        <Panel title="Allergies & alerts">
          {p.allergies.length ? <ul className="flex flex-wrap gap-2">{p.allergies.map((a) => <li key={a}><Badge tone="danger" icon={AlertTriangle}>{a}</Badge></li>)}</ul> : <p className="text-small text-ink-500">No known allergies.</p>}
        </Panel>
        <Panel title="Medical history">
          {p.history.length ? <ul className="space-y-2 text-small">{p.history.map((h) => <li key={h} className="flex gap-2"><ClipboardList className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />{h}</li>)}</ul> : <p className="text-small text-ink-500">No history recorded.</p>}
        </Panel>
      </div>
      <Panel title="Recent records" className="mt-6">
        <ul className="divide-y divide-line text-small">
          {["Corneal topography", "OCT macula", "Consultation notes"].map((r, i) => <li key={r} className="flex items-center justify-between py-3"><span className="flex items-center gap-2 font-semibold"><FileText className="size-4.5 text-primary-600" aria-hidden="true" />{r}</span><span className="text-ink-500">{formatDate(new Date(TODAY.getTime() - (i + 1) * 9 * 86400000).toISOString())}</span></li>)}
        </ul>
      </Panel>
    </>
  );
}

/* =================================================== Consult workspace */
interface RxRow { id: number; name: string; dose: string; frequency: string; duration: string }
const allergyClasses: Record<string, string[]> = { ciprofloxacin: ["moxifloxacin", "ciprofloxacin", "levofloxacin"], penicillin: ["amoxicillin", "penicillin"], "sulfa drugs": ["sulfa", "sulfamethoxazole"] };

export function ConsultWorkspace() {
  const { id } = useParams();
  const p = patientById(id) ?? portalPatients[1];
  useDocumentTitle(`Consultation · ${p.name}`);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState({ complaint: p.condition, exam: "", assessment: "", plan: "" });
  const [rx, setRx] = useState<RxRow[]>([{ id: 1, name: medicineCatalogue[1], dose: "1 drop both eyes", frequency: "4 times a day", duration: "4 weeks" }]);
  const [tests, setTests] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState("2 weeks");
  const [sending, setSending] = useState(false);

  const warnings = useMemo(() => {
    const out: string[] = [];
    for (const a of p.allergies) {
      const cls = allergyClasses[a.toLowerCase()] ?? [a.toLowerCase()];
      rx.forEach((r) => { if (cls.some((c) => r.name.toLowerCase().includes(c))) out.push(`${r.name} may cross-react with the patient's ${a} allergy.`); });
    }
    return out;
  }, [rx, p.allergies]);

  const updateRx = (rid: number, k: keyof RxRow, v: string) => setRx((xs) => xs.map((x) => (x.id === rid ? { ...x, [k]: v } : x)));

  return (
    <>
      <DashHeader title={<span className="flex items-center gap-3"><Avatar name={p.name} initials={p.initials} size={44} />Consultation · {p.name}</span>} subtitle={`${p.age} yrs · ${p.gender} · ${p.condition}`} actions={<><Button size="sm" variant="outline" onClick={() => toast({ title: "Draft saved" })}><Save className="size-4" aria-hidden="true" />Save draft</Button></>} />
      {p.allergies.length > 0 && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-small font-semibold text-danger-700"><AlertTriangle className="size-4.5 shrink-0" aria-hidden="true" />Allergies: {p.allergies.join(", ")}</p>
      )}
      <div className="grid gap-6 xl:grid-cols-[18rem_1fr]">
        <aside className="space-y-4" aria-label="Patient summary">
          <Panel title="Vitals (today)"><VitalsGrid p={p} /></Panel>
          <Panel title="History">{p.history.length ? <ul className="space-y-1.5 text-small">{p.history.map((h) => <li key={h}>• {h}</li>)}</ul> : <p className="text-small text-ink-500">None recorded.</p>}</Panel>
        </aside>
        <div className="card p-5">
          <Tabs defaultValue="notes">
            <TabsList aria-label="Consultation sections" className="mb-5">
              <TabsTrigger value="notes"><ClipboardList className="size-4" aria-hidden="true" />Notes</TabsTrigger>
              <TabsTrigger value="rx"><Pill className="size-4" aria-hidden="true" />Prescription ({rx.length})</TabsTrigger>
              <TabsTrigger value="tests"><FlaskConical className="size-4" aria-hidden="true" />Tests ({tests.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="grid gap-4 md:grid-cols-2">
              {([["complaint", "Chief complaint"], ["exam", "Examination findings"], ["assessment", "Assessment / diagnosis"], ["plan", "Plan & advice"]] as const).map(([k, l]) => (
                <Field key={k} label={l}>{(fp) => <Textarea {...fp} rows={4} value={notes[k]} onChange={(e) => setNotes({ ...notes, [k]: e.target.value })} />}</Field>
              ))}
            </TabsContent>
            <TabsContent value="rx">
              {warnings.map((w) => <p key={w} role="alert" className="mb-3 flex items-start gap-2 rounded-xl bg-warning-50 px-4 py-3 text-small font-semibold text-warning-700"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{w}</p>)}
              <ul className="space-y-3">
                {rx.map((r, i) => (
                  <li key={r.id} className="grid gap-3 rounded-xl border border-line p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end">
                    <Field label={`Medicine ${i + 1}`}>{(fp) => <Select {...fp} value={r.name} onChange={(e) => updateRx(r.id, "name", e.target.value)}>{medicineCatalogue.map((m) => <option key={m}>{m}</option>)}</Select>}</Field>
                    <Field label="Dose">{(fp) => <Input {...fp} value={r.dose} onChange={(e) => updateRx(r.id, "dose", e.target.value)} />}</Field>
                    <Field label="Frequency">{(fp) => <Select {...fp} value={r.frequency} onChange={(e) => updateRx(r.id, "frequency", e.target.value)}>{["Once a day", "Twice a day", "3 times a day", "4 times a day", "Every 2 hours", "At bedtime", "As needed"].map((f) => <option key={f}>{f}</option>)}</Select>}</Field>
                    <Field label="Duration">{(fp) => <Input {...fp} value={r.duration} onChange={(e) => updateRx(r.id, "duration", e.target.value)} />}</Field>
                    <Button variant="ghost" size="icon" onClick={() => setRx((xs) => xs.filter((x) => x.id !== r.id))} aria-label={`Remove ${r.name}`}><Trash2 className="size-4.5" aria-hidden="true" /></Button>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => setRx((xs) => [...xs, { id: Date.now(), name: medicineCatalogue[0], dose: "1 drop", frequency: "4 times a day", duration: "1 week" }])}><Plus className="size-4" aria-hidden="true" />Add medicine</Button>
            </TabsContent>
            <TabsContent value="tests">
              <fieldset>
                <legend className="mb-3 text-small font-semibold text-ink-800">Recommend tests</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {testCatalogue.map((t) => (
                    <label key={t} className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5", tests.includes(t) ? "border-primary-500 bg-primary-25" : "border-line")}>
                      <input type="checkbox" checked={tests.includes(t)} onChange={() => setTests((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))} className="size-4.5 accent-primary-600" />
                      <span className="text-small font-medium">{t}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label="Follow-up in" className="mt-5 max-w-xs">{(fp) => <Select {...fp} value={followUp} onChange={(e) => setFollowUp(e.target.value)}>{["1 week", "2 weeks", "1 month", "3 months", "As needed"].map((f) => <option key={f}>{f}</option>)}</Select>}</Field>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => navigate("/doctor")}>Close</Button>
            <Button
              loading={sending}
              onClick={() => {
                if (!notes.assessment.trim()) { toast({ kind: "error", title: "Add an assessment", description: "An assessment is required before completing the consultation." }); return; }
                setSending(true);
                window.setTimeout(() => { setSending(false); toast({ title: "Consultation completed", description: `Notes, ${rx.length} medicine(s) and ${tests.length} test(s) sent to ${p.name}.` }); navigate("/doctor"); }, 800);
              }}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />Complete & send to patient
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================ Messages */
export function DoctorMessages() {
  useDocumentTitle("Messages · Doctor portal");
  const [active, setActive] = useState(portalMessages[0].id);
  const [reply, setReply] = useState("");
  const [thread, setThread] = useState<Record<string, string[]>>({});
  const m = portalMessages.find((x) => x.id === active)!;
  return (
    <>
      <DashHeader title="Messages" subtitle="Secure messages with patients and your care team" />
      <div className="card grid min-h-[28rem] overflow-hidden md:grid-cols-[18rem_1fr]">
        <ul className="divide-y divide-line border-b border-line md:border-r md:border-b-0" aria-label="Conversations">
          {portalMessages.map((x) => (
            <li key={x.id}>
              <button onClick={() => setActive(x.id)} aria-current={active === x.id} className={cn("flex w-full items-start gap-3 p-4 text-left", active === x.id ? "bg-primary-25" : "hover:bg-subtle")}>
                <Avatar name={x.from} initials={x.initials} size={36} />
                <span className="min-w-0 flex-1"><span className={cn("block truncate text-small", x.unread ? "font-bold" : "font-semibold")}>{x.from}</span><span className="block truncate text-caption text-ink-500">{x.preview}</span></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col p-5">
          <p className="font-bold">{m.from}</p>
          <div className="mt-4 flex-1 space-y-3" aria-live="polite">
            <p className="max-w-md rounded-2xl rounded-bl-md bg-subtle px-4 py-3 text-small">{m.preview}</p>
            {(thread[m.id] ?? []).map((t, i) => <p key={i} className="ml-auto max-w-md rounded-2xl rounded-br-md bg-primary-600 px-4 py-3 text-small text-white">{t}</p>)}
          </div>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; setThread((t) => ({ ...t, [m.id]: [...(t[m.id] ?? []), reply.trim()] })); setReply(""); }}>
            <label htmlFor="reply" className="sr-only">Reply</label>
            <input id="reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" className="h-11 min-w-0 flex-1 rounded-full border border-line-strong px-4 text-small focus:border-primary-500 focus:shadow-focus focus:outline-none" />
            <Button type="submit"><Send className="size-4" aria-hidden="true" />Send</Button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ===================================================== Records & reports */
export function DoctorRecords() {
  useDocumentTitle("Medical records · Doctor portal");
  const rows = portalPatients.flatMap((p, i) => [{ id: `${p.id}-a`, p, title: ["OCT macula", "Corneal topography", "A-scan biometry", "Visual field"][i % 4], date: new Date(TODAY.getTime() - i * 2 * 86400000).toISOString() }]);
  return (
    <>
      <DashHeader title="Medical records" subtitle="Recent diagnostics and documents for your patients" />
      <DataTable caption="Recent records" rows={rows} rowKey={(r) => r.id} columns={[
        { key: "t", header: "Record", render: (r) => <span className="inline-flex items-center gap-2 font-semibold"><FileText className="size-4.5 text-primary-600" aria-hidden="true" />{r.title}</span> },
        { key: "p", header: "Patient", render: (r) => <Link to={`/doctor/patients/${r.p.id}`} className="hover:text-primary-700">{r.p.name}</Link> },
        { key: "d", header: "Date", render: (r) => formatDate(r.date, { day: "numeric", month: "short" }) },
        { key: "s", header: "Status", render: (_r) => <StatusBadge status="normal" label="Reviewed" /> },
      ]} />
    </>
  );
}

export function DoctorPrescriptions() {
  useDocumentTitle("Prescriptions · Doctor portal");
  const rows = portalPatients.slice(0, 6).map((p, i) => ({ id: `rx-${i}`, p, meds: [medicineCatalogue[i % medicineCatalogue.length], medicineCatalogue[(i + 3) % medicineCatalogue.length]], date: new Date(TODAY.getTime() - i * 3 * 86400000).toISOString() }));
  return (
    <>
      <DashHeader title="Prescriptions" subtitle="ePrescriptions issued in the last 30 days" actions={<ButtonLink to="/doctor/consult/pp-3" size="sm"><FilePlus2 className="size-4" aria-hidden="true" />New prescription</ButtonLink>} />
      <DataTable caption="Prescriptions" rows={rows} rowKey={(r) => r.id} columns={[
        { key: "p", header: "Patient", render: (r) => <span className="font-semibold">{r.p.name}</span> },
        { key: "m", header: "Medicines", render: (r) => r.meds.join(", ") },
        { key: "d", header: "Issued", render: (r) => formatDate(r.date, { day: "numeric", month: "short" }) },
        { key: "s", header: "Delivery", render: (r) => <Badge tone={r.id === "rx-0" ? "warning" : "success"}>{r.id === "rx-0" ? "Pending pickup" : "Sent to pharmacy"}</Badge> },
      ]} />
    </>
  );
}

export function DoctorReports() {
  useDocumentTitle("Reports · Doctor portal");
  const { toast } = useToast();
  const [reviewed, setReviewed] = useState<string[]>([]);
  return (
    <>
      <DashHeader title="Reports" subtitle="Results awaiting your review" />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card px-5 py-2">
          <ul className="divide-y divide-line">
            {portalPendingReports.map((r) => {
              const p = patientById(r.patientId)!;
              const done = reviewed.includes(r.id);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <FileText className={cn("size-5", r.urgent && !done ? "text-danger-600" : "text-ink-400")} aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className="block font-semibold">{r.title}</span><span className="block text-small text-ink-500">{p.name} · Due {r.due}</span></span>
                  {done ? <StatusBadge status="completed" label="Reviewed" /> : <Button size="sm" variant={r.urgent ? "primary" : "outline"} onClick={() => { setReviewed((x) => [...x, r.id]); toast({ title: "Report reviewed", description: `${r.title} · ${p.name} has been notified.` }); }}>Mark reviewed</Button>}
                </li>
              );
            })}
          </ul>
        </div>
        <Panel title="Consultation mix (this month)">
          <ColumnChart title="Consultations by type this month" labels={["In-person", "Video", "Follow-up", "Post-op"]} series={[{ name: "Consultations", values: [142, 48, 96, 31] }]} height={200} />
        </Panel>
      </div>
    </>
  );
}

export function DoctorSettings() {
  useDocumentTitle("Settings · Doctor portal");
  const { toast } = useToast();
  const [s, setS] = useState({ video: true, home: false, autoAccept: true, sms: true });
  const t = (k: keyof typeof s) => (v: boolean) => { setS({ ...s, [k]: v }); toast({ kind: "info", title: "Preference saved" }); };
  return (
    <>
      <DashHeader title="Settings" subtitle="Availability, consultation preferences and notifications" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Consultation preferences" bodyClassName="divide-y divide-line">
          <Switch checked={s.video} onChange={t("video")} label="Offer video consultations" description="Patients can book video slots in the evening." />
          <Switch checked={s.home} onChange={t("home")} label="Offer home visits" description="Within 5 km of the clinic." />
          <Switch checked={s.autoAccept} onChange={t("autoAccept")} label="Auto-accept follow-ups" description="For patients already in an active care journey." />
        </Panel>
        <Panel title="Schedule">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slot duration">{(p) => <Select {...p} defaultValue="15 minutes"><option>10 minutes</option><option>15 minutes</option><option>20 minutes</option><option>30 minutes</option></Select>}</Field>
            <Field label="Daily patient limit">{(p) => <Input {...p} type="number" defaultValue={24} />}</Field>
          </div>
          <div className="mt-2 divide-y divide-line"><Switch checked={s.sms} onChange={t("sms")} label="SMS alerts for urgent reports" /></div>
          <Button className="mt-4" onClick={() => toast({ title: "Schedule updated" })}>Save schedule</Button>
        </Panel>
      </div>
    </>
  );
}
