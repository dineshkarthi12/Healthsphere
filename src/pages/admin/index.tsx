import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  CalendarCheck,
  Download,
  FileBarChart,
  FileText,
  Plus,
  Receipt,
  Siren,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { adminActivity, adminAppointmentsTrend, adminDepartments, adminDoctorsOnDuty, adminSpecialtyDemand, adminStats, portalPatients } from "@/data/portal";
import { doctors, getDoctor } from "@/data/doctors";
import { specialtyMap, toneStyle } from "@/data/specialties";
import { DashHeader, DataTable, Panel, StatTile } from "@/components/dashboard/Dashboard";
import { BarList, ColumnChart, LineChart } from "@/components/charts/HealthChart";
import { Avatar, Badge, EmptyState, Field, Input, ProgressBar, SearchBar, Select, StatusBadge, Switch } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Modal, useToast } from "@/components/ui/overlays";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getIcon } from "@/lib/icons";
import { cn, formatDate, formatINR, TODAY } from "@/lib/utils";

const tones = ["#2a74ec", "#12a383", "#7c5cfc", "#ee7a24"];
const kindIcon: Record<string, typeof Activity> = { appointment: CalendarCheck, report: FileText, doctor: Stethoscope, discharge: BedDouble, emergency: Siren, billing: Receipt };

/* =========================================================== Dashboard */
export function AdminDashboard() {
  useDocumentTitle("Hospital dashboard");
  return (
    <>
      <DashHeader
        title="Meridian Multispeciality Hospital"
        subtitle={`Chennai, Tamil Nadu · ${formatDate(TODAY.toISOString(), { weekday: "long", day: "numeric", month: "long" })}`}
        actions={<Button size="sm" variant="outline"><Download className="size-4" aria-hidden="true" />Export summary</Button>}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {adminStats.map((s, i) => (
          <StatTile key={s.label} label={s.label} icon={s.icon} tone={tones[i]} value={s.label === "Revenue" ? formatINR(s.value) : s.value.toLocaleString("en-IN")} delta={s.delta} hint={s.unit ? `${s.unit} vs last period` : "vs last month"} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Appointments — last 6 weeks">
          <LineChart title="Weekly appointments, in-person and video" labels={adminAppointmentsTrend.labels} series={[{ name: "In-person", values: adminAppointmentsTrend.inPerson }, { name: "Video", values: adminAppointmentsTrend.video }]} baseline="zero" height={240} />
        </Panel>
        <Panel title="Today's overview">
          <dl className="space-y-4">
            <div><dt className="mb-1 flex justify-between text-small"><span className="text-ink-600">Bed occupancy</span><span className="font-semibold">512 / 650 · 79%</span></dt><dd><ProgressBar value={79} label="Bed occupancy" tone="primary" /></dd></div>
            <div><dt className="mb-1 flex justify-between text-small"><span className="text-ink-600">ICU occupancy</span><span className="font-semibold">41 / 48 · 85%</span></dt><dd><ProgressBar value={85} label="ICU occupancy" tone="primary" /></dd></div>
            <div><dt className="mb-1 flex justify-between text-small"><span className="text-ink-600">OPD capacity used</span><span className="font-semibold">64%</span></dt><dd><ProgressBar value={64} label="OPD capacity" tone="success" /></dd></div>
          </dl>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-danger-50 p-3"><p className="flex items-center gap-1.5 text-caption font-semibold text-danger-700"><Siren className="size-3.5" aria-hidden="true" />Emergency</p><p className="text-[1.25rem] font-bold">7 active</p><p className="text-caption text-ink-600">Avg wait 12 min</p></div>
            <div className="rounded-xl bg-success-50 p-3"><p className="flex items-center gap-1.5 text-caption font-semibold text-success-700"><BedDouble className="size-3.5" aria-hidden="true" />Discharges</p><p className="text-[1.25rem] font-bold">23 today</p><p className="text-caption text-ink-600">18 before noon</p></div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Department-wise patients (this month)" action={{ label: "Departments", to: "/admin/departments" }}>
          <BarList title="Patients per department this month" items={adminDepartments.map((d) => ({ label: d.name, value: d.patients, hint: `· ${d.share}%` }))} />
        </Panel>
        <Panel title="Recent activity">
          <ul className="space-y-3">
            {adminActivity.map((a) => {
              const Icon = kindIcon[a.kind] ?? Activity;
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg", a.kind === "emergency" ? "bg-danger-50 text-danger-600" : "bg-primary-50 text-primary-600")}><Icon className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1 text-small"><span className="block text-ink-800">{a.text}</span><span className="text-caption text-ink-500">{a.time}</span></span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Specialty demand (searches, 30 days)" action={{ label: "Analytics", to: "/admin/analytics" }}>
          <BarList title="Specialty searches in the last 30 days" items={adminSpecialtyDemand.map((s) => ({ label: s.name, value: s.searches }))} />
        </Panel>
        <Panel title="Doctors on duty" action={{ label: "All doctors", to: "/admin/doctors" }}>
          <ul className="divide-y divide-line">
            {adminDoctorsOnDuty.map((x) => {
              const d = getDoctor(x.doctorId)!;
              return (
                <li key={x.doctorId} className="flex items-center gap-3 py-2.5">
                  <Avatar name={d.name} initials={d.initials} photo={d.photo} size={36} style={toneStyle(d.specialty)} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-small font-semibold">{d.name}</span><span className="block text-caption text-ink-500">{d.title} · {x.patientsToday} patients today</span></span>
                  <Badge tone={x.status === "On leave" ? "neutral" : x.status === "In surgery" ? "warning" : "success"}>{x.status}</Badge>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/* ============================================================== Doctors */
export function AdminDoctors() {
  useDocumentTitle("Doctors · Admin");
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [add, setAdd] = useState(false);
  const rows = doctors.filter((d) => !q || `${d.name} ${d.title} ${specialtyMap[d.specialty].name}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <DashHeader title="Doctors" subtitle={`${doctors.length} doctors on the HealthSphere network roster`} actions={<Button size="sm" onClick={() => setAdd(true)}><UserPlus className="size-4" aria-hidden="true" />Add doctor</Button>} />
      <SearchBar value={q} onChange={setQ} placeholder="Search doctors or departments…" label="Search doctors" className="mb-4 max-w-md" />
      <DataTable caption="Doctors" rows={rows} rowKey={(d) => d.id} empty={<EmptyState title="No doctors match" />} columns={[
        { key: "n", header: "Doctor", render: (d) => <span className="inline-flex items-center gap-3"><Avatar name={d.name} initials={d.initials} photo={d.photo} size={34} style={toneStyle(d.specialty)} /><span className="font-semibold">{d.name}</span></span> },
        { key: "s", header: "Department", render: (d) => specialtyMap[d.specialty].name },
        { key: "e", header: "Experience", render: (d) => `${d.experienceYears} yrs`, hideOnMobile: true },
        { key: "r", header: "Rating", render: (d) => `${d.rating} ★` },
        { key: "st", header: "Status", render: (d) => { const s = adminDoctorsOnDuty.find((x) => x.doctorId === d.id)?.status ?? "Available"; return <Badge tone={s === "On leave" ? "neutral" : s === "In surgery" ? "warning" : "success"}>{s}</Badge>; } },
      ]} />
      <Modal open={add} onOpenChange={setAdd} title="Add a doctor" description="Credentialing review is required before the profile goes live." footer={<><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={() => { setAdd(false); toast({ title: "Doctor added for credentialing", description: "The medical board will review documents within 48 hours." }); }}>Submit for review</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required className="sm:col-span-2">{(p) => <Input {...p} />}</Field>
          <Field label="Department">{(p) => <Select {...p}>{adminDepartments.filter((d) => d.slug !== "other").map((d) => <option key={d.slug}>{d.name}</option>)}</Select>}</Field>
          <Field label="Medical registration no." required>{(p) => <Input {...p} />}</Field>
        </div>
      </Modal>
    </>
  );
}

/* ============================================================= Patients */
export function AdminPatients() {
  useDocumentTitle("Patients · Admin");
  const [q, setQ] = useState("");
  const rows = portalPatients.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <DashHeader title="Patients" subtitle="12,480 registered · 512 admitted today" />
      <SearchBar value={q} onChange={setQ} placeholder="Search patients…" label="Search patients" className="mb-4 max-w-md" />
      <DataTable caption="Patients" rows={rows} rowKey={(p) => p.id} empty={<EmptyState title="No patients match" />} columns={[
        { key: "n", header: "Patient", render: (p) => <span className="inline-flex items-center gap-3"><Avatar name={p.name} initials={p.initials} size={34} /><span className="font-semibold">{p.name}</span></span> },
        { key: "a", header: "Age / Sex", render: (p) => `${p.age} · ${p.gender}` },
        { key: "c", header: "Department", render: () => "Ophthalmology", hideOnMobile: true },
        { key: "l", header: "Last visit", render: (p) => formatDate(p.lastVisit, { day: "numeric", month: "short" }) },
        { key: "s", header: "Status", render: (p) => <StatusBadge status={p.status === "critical" ? "critical" : p.status === "new" ? "new" : p.status === "follow-up" ? "follow-up" : "stable"} /> },
      ]} />
    </>
  );
}

/* ========================================================== Departments */
export function AdminDepartments() {
  useDocumentTitle("Departments · Admin");
  return (
    <>
      <DashHeader title="Departments" subtitle="Performance this month" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminDepartments.map((d) => {
          const spec = d.slug !== "other" ? specialtyMap[d.slug] : undefined;
          const Icon = getIcon(spec?.icon ?? "Hospital");
          return (
            <article key={d.slug} className="card p-5" style={toneStyle(spec?.slug)}>
              <div className="flex items-center gap-3"><span className="accent-icon inline-flex size-11 items-center justify-center rounded-xl"><Icon className="size-5" aria-hidden="true" /></span><h2 className="font-bold">{d.name}</h2></div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-small">
                <div><dt className="text-ink-500">Patients</dt><dd className="text-[1.25rem] font-bold">{d.patients.toLocaleString("en-IN")}</dd></div>
                <div><dt className="text-ink-500">Doctors</dt><dd className="text-[1.25rem] font-bold">{d.doctors}</dd></div>
                <div><dt className="text-ink-500">Satisfaction</dt><dd className="font-semibold">{d.satisfaction} / 5</dd></div>
                <div><dt className="text-ink-500">Avg OPD wait</dt><dd className={cn("font-semibold", d.waitMin > 18 && "text-warning-700")}>{d.waitMin} min{d.waitMin > 18 && <AlertTriangle className="ml-1 inline size-3.5" aria-label="above target" />}</dd></div>
              </dl>
              <ProgressBar value={d.share * 4} label={`${d.name} share of patients`} className="mt-4" />
              <p className="mt-1 text-caption text-ink-500">{d.share}% of all patients</p>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ========================================================= Appointments */
export function AdminAppointments() {
  useDocumentTitle("Appointments · Admin");
  const [status, setStatus] = useState("");
  const times = ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "2:00 PM", "2:30 PM", "3:00 PM"];
  const rows = doctors.slice(0, 12).map((d, i) => ({ id: `ad-${i}`, d, time: times[i], patient: portalPatients[i % portalPatients.length].name, type: i % 3 === 0 ? "Video" : "In-person", status: ["Completed", "Checked in", "Waiting", "Scheduled"][i % 4] }));
  const filtered = rows.filter((r) => !status || r.status === status);
  return (
    <>
      <DashHeader title="Appointments" subtitle="842 this week · 126 today" />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {["Completed", "Checked in", "Waiting", "Scheduled"].map((s) => (
          <button key={s} aria-pressed={status === s} onClick={() => setStatus(status === s ? "" : s)} className={cn("card p-4 text-left", status === s && "border-primary-500 ring-2 ring-primary-600/15")}>
            <p className="text-small text-ink-500">{s}</p><p className="text-[1.5rem] font-bold">{rows.filter((r) => r.status === s).length * 10 + 2}</p>
          </button>
        ))}
      </div>
      <DataTable caption="Today's appointments" rows={filtered} rowKey={(r) => r.id} columns={[
        { key: "t", header: "Time", render: (r) => <span className="font-semibold tabular-nums">{r.time}</span> },
        { key: "p", header: "Patient", render: (r) => r.patient },
        { key: "d", header: "Doctor", render: (r) => r.d.name, hideOnMobile: true },
        { key: "ty", header: "Type", render: (r) => r.type },
        { key: "s", header: "Status", render: (r) => <Badge tone={r.status === "Completed" ? "success" : r.status === "Waiting" ? "warning" : r.status === "Checked in" ? "info" : "neutral"}>{r.status}</Badge> },
      ]} />
    </>
  );
}

/* ============================================================== Reports */
export function AdminReports() {
  useDocumentTitle("Reports · Admin");
  const { toast } = useToast();
  const reports = [
    { t: "Monthly patient census", d: "September 2026 · PDF", i: FileBarChart },
    { t: "Revenue & billing summary", d: "September 2026 · XLSX", i: Receipt },
    { t: "NABH quality indicators", d: "Q3 2026 · PDF", i: FileText },
    { t: "Infection control report", d: "September 2026 · PDF", i: FileText },
    { t: "Doctor utilisation", d: "Last 30 days · XLSX", i: Stethoscope },
    { t: "Emergency response times", d: "Last 30 days · PDF", i: Siren },
  ];
  return (
    <>
      <DashHeader title="Reports" subtitle="Download operational and quality reports" actions={<Button size="sm" variant="outline" onClick={() => toast({ title: "Custom report scheduled", description: "You'll receive it by email at 7 AM." })}><Plus className="size-4" aria-hidden="true" />Schedule report</Button>} />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map(({ t, d, i: Icon }) => (
          <li key={t} className="card flex items-center gap-4 p-4">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="size-5" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">{t}</span><span className="block text-small text-ink-500">{d}</span></span>
            <Button size="icon" variant="ghost" aria-label={`Download ${t}`} onClick={() => toast({ title: "Download started", description: t })}><Download className="size-4.5" aria-hidden="true" /></Button>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ============================================================ Analytics */
export function AdminAnalytics() {
  useDocumentTitle("Analytics · Admin");
  return (
    <>
      <DashHeader title="Analytics" subtitle="Trends across patients, specialties and satisfaction" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="New patient registrations">
          <LineChart title="New patient registrations per month" labels={["May", "Jun", "Jul", "Aug", "Sep", "Oct"]} series={[{ name: "Registrations", values: [820, 910, 980, 1040, 1180, 1265] }]} baseline="zero" height={220} />
        </Panel>
        <Panel title="Video share of consultations">
          <ColumnChart title="Share of consultations by video, percent" labels={["May", "Jun", "Jul", "Aug", "Sep", "Oct"]} series={[{ name: "Video %", values: [18, 19, 21, 22, 24, 24] }]} format={(v) => `${v}%`} height={220} highlightLast />
        </Panel>
        <Panel title="Patient satisfaction by department">
          <BarList title="Average patient satisfaction by department" items={adminDepartments.filter((d) => d.slug !== "other").map((d) => ({ label: d.name, value: d.satisfaction, hint: "/ 5" }))} format={(v) => v.toFixed(1)} />
        </Panel>
        <Panel title="Specialty demand">
          <BarList title="Specialty searches in the last 30 days" items={adminSpecialtyDemand.map((s) => ({ label: s.name, value: s.searches }))} />
        </Panel>
      </div>
    </>
  );
}

/* ============================================================= Settings */
export function AdminSettings() {
  useDocumentTitle("Settings · Admin");
  const { toast } = useToast();
  const [s, setS] = useState({ online: true, video: true, lab: true, pharmacy: true, audit: true });
  const t = (k: keyof typeof s) => (v: boolean) => { setS({ ...s, [k]: v }); toast({ kind: "info", title: "Setting updated" }); };
  return (
    <>
      <DashHeader title="Settings" subtitle="Hospital profile, integrations and security" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Hospital profile">
          <div className="grid gap-4">
            <Field label="Hospital name">{(p) => <Input {...p} defaultValue="Meridian Multispeciality Hospital" />}</Field>
            <Field label="Emergency line">{(p) => <Input {...p} defaultValue="+91 44 4000 1066" />}</Field>
            <Button className="justify-self-start" onClick={() => toast({ title: "Profile saved" })}>Save changes</Button>
          </div>
        </Panel>
        <Panel title="Services & integrations" bodyClassName="divide-y divide-line">
          <Switch checked={s.online} onChange={t("online")} label="Online appointment booking" />
          <Switch checked={s.video} onChange={t("video")} label="Video consultations" />
          <Switch checked={s.lab} onChange={t("lab")} label="Lab results → patient records" description="Auto-publish reviewed results to HealthSphere." />
          <Switch checked={s.pharmacy} onChange={t("pharmacy")} label="ePrescription to in-house pharmacy" />
          <Switch checked={s.audit} onChange={t("audit")} label="Record access audit log" description="Required for compliance. Patients can see who viewed their records." disabled />
        </Panel>
      </div>
    </>
  );
}
