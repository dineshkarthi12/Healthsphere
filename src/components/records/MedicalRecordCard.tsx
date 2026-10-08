import { useState } from "react";
import { Download, Eye, FileHeart, FileText, FlaskConical, History, Pill, ScanLine, Share2, ShieldCheck, Users } from "lucide-react";
import type { MedicalRecord, RecordType } from "@/types";
import { getDoctor } from "@/data/doctors";
import { getHospital } from "@/data/hospitals";
import { toneStyle } from "@/data/specialties";
import { Button } from "@/components/ui/Button";
import { Modal, useToast } from "@/components/ui/overlays";
import { StatusBadge } from "@/components/ui/primitives";
import { cn, formatDate } from "@/lib/utils";

const typeIcon: Record<RecordType, typeof FileText> = {
  report: FileHeart,
  lab: FlaskConical,
  imaging: ScanLine,
  prescription: Pill,
  document: FileText,
  history: History,
};

export function MedicalRecordCard({ record, onView, onShare }: { record: MedicalRecord; onView: () => void; onShare: () => void }) {
  const Icon = typeIcon[record.type];
  const doctor = getDoctor(record.doctorId);
  const { toast } = useToast();
  return (
    <article style={toneStyle(record.specialty)} className="card flex flex-col p-4" aria-labelledby={`rec-${record.id}`}>
      <div className="flex items-start gap-3">
        <span className="accent-icon inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={`rec-${record.id}`} className="font-bold text-ink-900">{record.title}</h3>
          <p className="text-small text-ink-500">
            {formatDate(record.date)}
            {doctor ? ` · ${doctor.name}` : ""}
          </p>
        </div>
        {record.status && <StatusBadge status={record.status} className="hidden xs:inline-flex" />}
      </div>
      <p className="mt-3 line-clamp-2 text-small text-ink-700">{record.summary}</p>
      <div className="mt-3 flex items-center gap-2 text-caption text-ink-500">
        <span>{record.fileSize}{record.pages ? ` · ${record.pages} page${record.pages > 1 ? "s" : ""}` : ""}</span>
        {record.sharedWith.length > 0 && (
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden="true" /> Shared with {record.sharedWith.length}</span>
        )}
      </div>
      <div className="mt-4 flex gap-2 border-t border-line pt-3">
        <Button size="sm" variant="secondary" onClick={onView} className="flex-1 sm:flex-none" aria-label={`View ${record.title}`}>
          <Eye className="size-4" aria-hidden="true" /> View
        </Button>
        <Button size="sm" variant="ghost" onClick={() => toast({ title: "Download started", description: `${record.title}.pdf (${record.fileSize}) — demo file.` })} aria-label={`Download ${record.title}`}>
          <Download className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">Download</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={onShare} aria-label={`Share ${record.title}`}>
          <Share2 className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">Share</span>
        </Button>
      </div>
    </article>
  );
}

export function RecordViewer({ record, onOpenChange }: { record: MedicalRecord | null; onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  if (!record) return null;
  const doctor = getDoctor(record.doctorId);
  const hospital = getHospital(record.hospitalId);
  return (
    <Modal
      open={!!record}
      onOpenChange={onOpenChange}
      title={record.title}
      description={`${formatDate(record.date)}${hospital ? ` · ${hospital.name}` : ""}`}
      variant="sheet"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={() => toast({ title: "Download started", description: `${record.title}.pdf — demo file.` })}>
            <Download className="size-4" aria-hidden="true" /> Download PDF
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {record.status && <StatusBadge status={record.status} />}
        <p className="text-body text-ink-800">{record.summary}</p>
        {record.findings && (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-small">
              <caption className="sr-only">Results for {record.title}</caption>
              <thead className="bg-subtle text-ink-600">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Test</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Result</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Reference</th>
                </tr>
              </thead>
              <tbody>
                {record.findings.map((f) => (
                  <tr key={f.label} className="border-t border-line">
                    <th scope="row" className="px-4 py-3 font-medium text-ink-800">{f.label}</th>
                    <td className={cn("px-4 py-3 font-semibold", f.flag === "high" || f.flag === "low" ? "text-warning-700" : "text-ink-900")}>
                      {f.value}
                      {f.flag && f.flag !== "normal" && <span className="ml-1.5 rounded bg-warning-50 px-1.5 py-0.5 text-caption">{f.flag === "high" ? "High" : "Low"}</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{f.range ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!record.findings && (
          <div className="flex aspect-[4/3] max-h-72 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-canvas text-center">
            <FileText className="size-10 text-ink-300" aria-hidden="true" />
            <p className="text-small font-medium text-ink-600">Document preview</p>
            <p className="text-caption text-ink-500">{record.pages ?? 1} page PDF · {record.fileSize}</p>
          </div>
        )}
        <dl className="grid gap-3 text-small sm:grid-cols-2">
          {doctor && (<div><dt className="text-ink-500">Doctor</dt><dd className="font-semibold text-ink-900">{doctor.name}</dd></div>)}
          {hospital && (<div><dt className="text-ink-500">Facility</dt><dd className="font-semibold text-ink-900">{hospital.name}</dd></div>)}
          <div><dt className="text-ink-500">Who can see this</dt><dd className="font-semibold text-ink-900">{record.sharedWith.length ? `You, ${record.sharedWith.join(", ")}` : "Only you"}</dd></div>
          <div><dt className="text-ink-500">Storage</dt><dd className="inline-flex items-center gap-1 font-semibold text-ink-900"><ShieldCheck className="size-4 text-success-700" aria-hidden="true" /> Encrypted at rest</dd></div>
        </dl>
        <p className="text-caption text-ink-500">Results should be interpreted by your doctor. Reference ranges may vary between labs.</p>
      </div>
    </Modal>
  );
}

const shareOptions = [
  { id: "doctor", label: "A doctor on HealthSphere", hint: "They can view until you revoke access" },
  { id: "family", label: "A family member", hint: "Arun Raman (Husband)" },
  { id: "link", label: "Secure link", hint: "Expires in 24 hours, PIN protected" },
];

export function ShareDialog({ record, onOpenChange, onShared }: { record: MedicalRecord | null; onOpenChange: (o: boolean) => void; onShared: (record: MedicalRecord, who: string) => void }) {
  const [choice, setChoice] = useState("doctor");
  const [doctor, setDoctor] = useState("Dr. Arjun Mehta");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  if (!record) return null;
  const who = choice === "doctor" ? doctor : choice === "family" ? "Arun Raman (family)" : "Secure link";
  return (
    <Modal
      open={!!record}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setConsent(false);
      }}
      title="Share record"
      description={record.title}
      variant="sheet"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!consent}
            loading={loading}
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => {
                setLoading(false);
                setConsent(false);
                onShared(record, who);
              }, 700);
            }}
          >
            <Share2 className="size-4" aria-hidden="true" /> Share securely
          </Button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-small font-semibold text-ink-800">Share with</legend>
        {shareOptions.map((o) => (
          <label key={o.id} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors", choice === o.id ? "border-primary-500 bg-primary-25" : "border-line hover:border-line-strong")}>
            <input type="radio" name="share" value={o.id} checked={choice === o.id} onChange={() => setChoice(o.id)} className="size-4.5 accent-primary-600" />
            <span>
              <span className="block text-small font-semibold text-ink-900">{o.label}</span>
              <span className="block text-caption text-ink-500">{o.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {choice === "doctor" && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-small font-semibold text-ink-800">Doctor</span>
          <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="h-11 w-full rounded-md border border-line-strong bg-white px-3 focus:border-primary-500 focus:shadow-focus focus:outline-none">
            <option>Dr. Arjun Mehta</option>
            <option>Dr. Ananya Sharma</option>
            <option>Dr. Vikram Rao</option>
          </select>
        </label>
      )}
      <label className="mt-5 flex items-start gap-3 rounded-xl bg-subtle p-3.5">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4.5 shrink-0 accent-primary-600" />
        <span className="text-small text-ink-700">I consent to share this record. I can revoke access at any time from Profile → Privacy. Every access is logged.</span>
      </label>
    </Modal>
  );
}
