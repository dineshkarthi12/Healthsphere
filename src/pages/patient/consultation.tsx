import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck2,
  Camera,
  CameraOff,
  CheckCircle2,
  Download,
  FileText,
  FlaskConical,
  MessageSquare,
  Mic,
  MicOff,
  NotebookPen,
  Paperclip,
  PhoneOff,
  Pill,
  Send,
  ShieldCheck,
  Signal,
  Upload,
  Wifi,
} from "lucide-react";
import { getDoctor } from "@/data/doctors";
import { currentPatient } from "@/data/patient";
import { prescriptions } from "@/data/records";
import { RequireSession } from "@/components/layout/RequireSession";
import { Avatar, SmartImage } from "@/components/ui/primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Modal, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from "@/components/ui/overlays";
import { useAppState } from "@/lib/store";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { cn, formatDate, imageSrc } from "@/lib/utils";

type Phase = "lobby" | "call" | "ended";
interface ChatMsg { from: "doctor" | "me"; text: string; time: string; attachment?: string }

export function ConsultationPage() {
  useDocumentTitle("Video consultation");
  return (
    <RequireSession title="Sign in to join your consultation">
      <Consultation />
    </RequireSession>
  );
}

function Consultation() {
  const { id } = useParams();
  const { appointments, updateAppointment } = useAppState();
  const appt = appointments.find((a) => a.id === id) ?? appointments.find((a) => a.type === "video")!;
  const doctor = getDoctor(appt.doctorId)!;
  const [phase, setPhase] = useState<Phase>("lobby");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  if (phase === "lobby") return <Lobby doctorName={doctor.name} title={doctor.title} reason={appt.reason} mic={mic} cam={cam} setMic={setMic} setCam={setCam} onJoin={() => setPhase("call")} />;
  if (phase === "call")
    return (
      <InCall
        doctorId={doctor.id}
        mic={mic}
        cam={cam}
        setMic={setMic}
        setCam={setCam}
        onEnd={() => {
          updateAppointment(appt.id, { status: "completed" });
          setPhase("ended");
        }}
      />
    );
  return <Summary doctorId={doctor.id} />;
}

/* --------------------------------------------------------------- Lobby */
function Lobby({ doctorName, title, reason, mic, cam, setMic, setCam, onJoin }: { doctorName: string; title: string; reason: string; mic: boolean; cam: boolean; setMic: (v: boolean) => void; setCam: (v: boolean) => void; onJoin: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="container-page max-w-5xl py-6 md:py-10">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back</button>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="card overflow-hidden">
          <div className="relative aspect-video bg-gradient-to-br from-primary-50 to-[#e8f6fb]">
            {cam ? (
              <SmartImage image={{ name: "video-consultation", alt: "Preview: a patient on a video call with her doctor", focus: "20% 50%" }} priority sizes="(min-width:1024px) 60vw, 100vw" className="absolute inset-0 size-full" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Avatar name={currentPatient.name} initials={currentPatient.initials} size={88} />
                <p className="text-small font-semibold text-ink-600">Camera is off</p>
              </div>
            )}
            <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-caption font-semibold text-ink-700 shadow-xs">Camera preview</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4">
            <CallButton on={mic} onClick={() => setMic(!mic)} labelOn="Mute microphone" labelOff="Unmute microphone" iconOn={Mic} iconOff={MicOff} />
            <CallButton on={cam} onClick={() => setCam(!cam)} labelOn="Turn camera off" labelOff="Turn camera on" iconOn={Camera} iconOff={CameraOff} />
          </div>
        </div>
        <div className="card flex flex-col p-6">
          <p className="t-eyebrow text-primary-700">Video consultation</p>
          <h1 className="t-h2 mt-1">Ready to join?</h1>
          <p className="mt-2 text-ink-600">{doctorName} · {title}</p>
          <p className="text-small text-ink-500">{reason}</p>
          <ul className="mt-5 space-y-2.5 text-small">
            <li className="flex items-center gap-2.5"><CheckCircle2 className="size-4.5 text-success-700" aria-hidden="true" />Microphone {mic ? "working" : "muted"}</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="size-4.5 text-success-700" aria-hidden="true" />Camera {cam ? "working" : "off"}</li>
            <li className="flex items-center gap-2.5"><Wifi className="size-4.5 text-success-700" aria-hidden="true" />Connection is good</li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="size-4.5 text-success-700" aria-hidden="true" />End-to-end encrypted, not recorded</li>
          </ul>
          <div className="mt-auto pt-6">
            <Button size="lg" block onClick={onJoin}>Join consultation</Button>
            <p className="mt-3 text-center text-caption text-ink-500">Prototype: no real camera or call is used.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CallButton({ on, onClick, labelOn, labelOff, iconOn: On, iconOff: Off, className }: { on: boolean; onClick: () => void; labelOn: string; labelOff: string; iconOn: typeof Mic; iconOff: typeof Mic; className?: string }) {
  return (
    <button onClick={onClick} aria-pressed={!on} aria-label={on ? labelOn : labelOff} className={cn("inline-flex size-13 items-center justify-center rounded-full border transition-colors", on ? "border-line bg-white text-ink-800 hover:bg-subtle" : "border-transparent bg-ink-800 text-white hover:bg-ink-700", className)}>
      {on ? <On className="size-5.5" aria-hidden="true" /> : <Off className="size-5.5" aria-hidden="true" />}
    </button>
  );
}

/* -------------------------------------------------------------- In call */
function InCall({ doctorId, mic, cam, setMic, setCam, onEnd }: { doctorId: string; mic: boolean; cam: boolean; setMic: (v: boolean) => void; setCam: (v: boolean) => void; onEnd: () => void }) {
  const doctor = getDoctor(doctorId)!;
  const { toast } = useToast();
  const isDesktop = useIsDesktop();
  const [seconds, setSeconds] = useState(0);
  const [panel, setPanel] = useState<"chat" | "files" | "notes" | "rx">("chat");
  const [sheet, setSheet] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<string[]>(["Echocardiogram (Oct 3).pdf"]);
  const [rxShared, setRxShared] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ from: "doctor", text: `Hello ${currentPatient.firstName}, I have your echo report open. How have the palpitations been this week?`, time: "6:30 PM" }]);
  const [draft, setDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    const r = window.setTimeout(() => {
      setRxShared(true);
      setMsgs((m) => [...m, { from: "doctor", text: "Good news — your heart is structurally normal. I've shared a short prescription and two tests.", time: "6:34 PM", attachment: "Prescription" }]);
      toast({ kind: "info", title: "Dr. shared a prescription", description: "Open the Prescription tab to review it." });
    }, 7000);
    return () => { window.clearInterval(t); window.clearTimeout(r); };
  }, [toast]);

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: draft.trim(), time: "Now" }]);
    setDraft("");
  };
  const openPanel = (p: typeof panel) => { setPanel(p); if (!isDesktop) setSheet(true); };
  const rx = prescriptions.find((p) => p.doctorId === doctor.id) ?? prescriptions[1];

  const panelBody = (
    <Tabs value={panel} onValueChange={(v) => setPanel(v as typeof panel)} className="flex h-full flex-col">
      <TabsList aria-label="Consultation tools" className="mb-3">
        <TabsTrigger value="chat"><MessageSquare className="size-4" aria-hidden="true" />Chat</TabsTrigger>
        <TabsTrigger value="files"><Paperclip className="size-4" aria-hidden="true" />Files</TabsTrigger>
        <TabsTrigger value="rx"><Pill className="size-4" aria-hidden="true" />Prescription{rxShared && <span className="size-2 rounded-full bg-success-500" aria-label="new" />}</TabsTrigger>
        <TabsTrigger value="notes"><NotebookPen className="size-4" aria-hidden="true" />Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="flex min-h-0 flex-1 flex-col">
        <ul className="flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite" aria-label="Chat messages">
          {msgs.map((m, i) => (
            <li key={i} className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-small", m.from === "me" ? "ml-auto rounded-br-md bg-primary-600 text-white" : "rounded-bl-md bg-subtle text-ink-800")}>
              <span className="sr-only">{m.from === "me" ? "You" : doctor.name}: </span>
              {m.text}
              {m.attachment && <button onClick={() => setPanel("rx")} className="mt-2 flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left font-semibold text-primary-700"><FileText className="size-4" aria-hidden="true" />{m.attachment}</button>}
              <span className={cn("mt-1 block text-[0.6875rem]", m.from === "me" ? "text-primary-100" : "text-ink-500")}>{m.time}</span>
            </li>
          ))}
        </ul>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <label htmlFor="chat-input" className="sr-only">Message</label>
          <input id="chat-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" className="h-11 min-w-0 flex-1 rounded-full border border-line-strong px-4 text-small focus:border-primary-500 focus:shadow-focus focus:outline-none" />
          <Button type="submit" size="icon" aria-label="Send message" className="rounded-full"><Send className="size-4.5" aria-hidden="true" /></Button>
        </form>
      </TabsContent>
      <TabsContent value="files" className="space-y-3">
        <input ref={fileRef} type="file" className="sr-only" accept=".pdf,image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFiles((x) => [...x, f.name]); toast({ title: "File shared", description: `${f.name} sent to ${doctor.name}.` }); } e.target.value = ""; }} />
        <Button variant="outline" block onClick={() => fileRef.current?.click()}><Upload className="size-4" aria-hidden="true" />Share a file</Button>
        <ul className="space-y-2">
          {files.map((f) => <li key={f} className="flex items-center gap-2.5 rounded-xl border border-line p-3 text-small font-medium"><FileText className="size-4.5 text-primary-600" aria-hidden="true" />{f}</li>)}
        </ul>
        <p className="text-caption text-ink-500">Files are shared only with your doctor for this consultation.</p>
      </TabsContent>
      <TabsContent value="rx">
        {rxShared ? (
          <div className="space-y-3 text-small">
            <p className="font-bold text-ink-900">{rx.diagnosis}</p>
            {rx.medications.map((m) => <div key={m.name} className="rounded-xl border border-line p-3"><p className="font-semibold">{m.name}</p><p className="text-ink-600">{m.dose} · {m.frequency} · {m.duration}</p></div>)}
            <p className="font-semibold">Tests</p>
            <ul className="list-disc pl-5 text-ink-700">{rx.tests.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        ) : (
          <p className="py-8 text-center text-small text-ink-500">Your doctor hasn't shared a prescription yet.</p>
        )}
      </TabsContent>
      <TabsContent value="notes">
        <label htmlFor="my-notes" className="mb-1.5 block text-small font-semibold text-ink-800">Private notes (only you can see these)</label>
        <textarea id="my-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={8} placeholder="E.g. ask about coffee, exercise limits…" className="w-full rounded-md border border-line-strong p-3 text-small focus:border-primary-500 focus:shadow-focus focus:outline-none" />
        <p className="mt-1 text-caption text-ink-500">Saved to your consultation summary.</p>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="flex h-dvh flex-col bg-canvas md:h-[calc(100dvh-4.5rem)]">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Avatar name={doctor.name} initials={doctor.initials} photo={doctor.photo} size={38} />
          <div className="leading-tight">
            <p className="text-small font-bold">{doctor.name}</p>
            <p className="text-caption text-ink-500">{doctor.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-small">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-50 px-2.5 py-1 font-semibold text-danger-700"><span className="size-2 animate-pulse rounded-full bg-danger-500" aria-hidden="true" />Live</span>
          <span className="font-semibold tabular-nums" aria-label={`Call duration ${mmss}`}>{mmss}</span>
          <Signal className="size-4 text-success-700" aria-label="Good connection" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4 p-3 md:p-4">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-gradient-to-b from-primary-100 via-primary-50 to-[#e6f4f8] shadow-card">
          <img src={imageSrc(doctor.photo?.name ?? "doctor-profile-male", 1024)} alt={`${doctor.name} on video`} width={1536} height={1024} className="absolute inset-0 size-full object-cover object-[50%_10%]" />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-caption font-semibold text-ink-800 shadow-xs">{doctor.name}</span>
          <div className="absolute top-3 right-3 flex aspect-[3/4] w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gradient-to-b from-[#fde8d8] to-[#f9d5c1] shadow-raised sm:w-36">
            {cam ? <Avatar name={currentPatient.name} initials={currentPatient.initials} size={56} className="bg-white/80" /> : <CameraOff className="size-6 text-ink-500" aria-label="Your camera is off" />}
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/90 px-2 text-[0.6875rem] font-semibold">You{!mic && " · muted"}</span>
          </div>
        </div>
        <aside className="hidden w-[22rem] min-h-0 flex-col rounded-3xl border border-line bg-white p-4 shadow-card lg:flex" aria-label="Consultation tools">{panelBody}</aside>
      </div>

      <div className="safe-bottom border-t border-line bg-white px-4 py-3">
        <div className="mx-auto flex max-w-xl items-center justify-center gap-2.5 sm:gap-3">
          <CallButton on={mic} onClick={() => setMic(!mic)} labelOn="Mute" labelOff="Unmute" iconOn={Mic} iconOff={MicOff} />
          <CallButton on={cam} onClick={() => setCam(!cam)} labelOn="Turn camera off" labelOff="Turn camera on" iconOn={Camera} iconOff={CameraOff} />
          <button onClick={() => setConfirmEnd(true)} className="inline-flex h-13 items-center gap-2 rounded-full bg-danger-600 px-5 font-semibold text-white hover:bg-danger-700" aria-label="End call">
            <PhoneOff className="size-5" aria-hidden="true" /><span className="hidden sm:inline">End</span>
          </button>
          <button onClick={() => openPanel("chat")} className="inline-flex size-13 items-center justify-center rounded-full border border-line bg-white text-ink-800 hover:bg-subtle lg:hidden" aria-label="Open chat"><MessageSquare className="size-5.5" aria-hidden="true" /></button>
          <button onClick={() => openPanel("files")} className="inline-flex size-13 items-center justify-center rounded-full border border-line bg-white text-ink-800 hover:bg-subtle" aria-label="Share files"><Paperclip className="size-5.5" aria-hidden="true" /></button>
          <button onClick={() => openPanel("rx")} className="relative hidden size-13 items-center justify-center rounded-full border border-line bg-white text-ink-800 hover:bg-subtle sm:inline-flex lg:hidden" aria-label="Prescription"><Pill className="size-5.5" aria-hidden="true" />{rxShared && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-success-500" aria-hidden="true" />}</button>
        </div>
      </div>

      <Modal open={sheet && !isDesktop} onOpenChange={setSheet} title="Consultation" variant="sheet" hideTitle>
        <div className="flex h-[60dvh] flex-col">{panelBody}</div>
      </Modal>
      <Modal
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        title="End consultation?"
        description="You'll see a summary with your doctor's notes and prescription."
        size="sm"
        footer={<><Button variant="outline" onClick={() => setConfirmEnd(false)}>Stay in call</Button><Button variant="danger" onClick={onEnd}><PhoneOff className="size-4" aria-hidden="true" />End call</Button></>}
      >
        <p className="text-small text-ink-600">Your private notes will be saved.</p>
      </Modal>
    </div>
  );
}

/* -------------------------------------------------------------- Summary */
function Summary({ doctorId }: { doctorId: string }) {
  const doctor = getDoctor(doctorId)!;
  const { toast } = useToast();
  const rx = prescriptions.find((p) => p.doctorId === doctor.id) ?? prescriptions[1];
  return (
    <div className="container-page max-w-4xl py-8 md:py-12">
      <div className="text-center">
        <span className="mx-auto inline-flex size-16 animate-pop items-center justify-center rounded-full bg-success-50 text-success-700"><CheckCircle2 className="size-9" aria-hidden="true" /></span>
        <h1 className="t-h1 mt-4">Consultation complete</h1>
        <p className="mt-2 text-ink-600">{doctor.name} · {formatDate(rx.date)} · 14 minutes</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="card p-5 md:col-span-2" aria-labelledby="dn">
          <h2 id="dn" className="flex items-center gap-2 t-h3"><NotebookPen className="size-5 text-primary-600" aria-hidden="true" />Doctor's notes</h2>
          <p className="mt-2 text-ink-700">ECG and echocardiogram are normal (EF 62%, no valve disease). Palpitations are most likely benign and linked to caffeine and short sleep. No medication needed for the heart. Lifestyle changes advised; review in 5 weeks or sooner if you faint, have chest pain or sustained racing heartbeat.</p>
        </section>
        <section className="card p-5" aria-labelledby="rxh">
          <h2 id="rxh" className="flex items-center gap-2 t-h3"><Pill className="size-5 text-primary-600" aria-hidden="true" />Prescription</h2>
          <ul className="mt-3 space-y-2">{rx.medications.map((m) => <li key={m.name} className="rounded-xl bg-subtle p-3 text-small"><p className="font-semibold text-ink-900">{m.name}</p><p className="text-ink-600">{m.dose} · {m.frequency} · {m.duration}</p>{m.notes && <p className="text-ink-500">{m.notes}</p>}</li>)}</ul>
          <ul className="mt-3 space-y-1.5 text-small text-ink-700">{rx.advice.map((a) => <li key={a} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-700" aria-hidden="true" />{a}</li>)}</ul>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => toast({ title: "Prescription saved", description: "Added to Health Records → Prescriptions." })}><Download className="size-4" aria-hidden="true" />Download</Button>
        </section>
        <section className="card p-5" aria-labelledby="tests">
          <h2 id="tests" className="flex items-center gap-2 t-h3"><FlaskConical className="size-5 text-primary-600" aria-hidden="true" />Recommended tests</h2>
          <ul className="mt-3 space-y-2">{rx.tests.map((t) => <li key={t} className="flex items-center justify-between gap-2 rounded-xl border border-line p-3 text-small"><span className="font-semibold">{t}</span><Button size="sm" variant="secondary" onClick={() => toast({ title: "Home collection requested", description: `${t} · Harbour Diagnostics will call to confirm.` })}>Book</Button></li>)}</ul>
          <div className="mt-4 rounded-xl bg-primary-25 p-4">
            <p className="text-caption font-semibold text-ink-500">Next appointment</p>
            <p className="font-bold">{rx.followUp ? formatDate(rx.followUp, { weekday: "short", day: "numeric", month: "short" }) : "As needed"} · Follow-up</p>
            <ButtonLink to={`/appointments/book?doctor=${doctor.id}&reason=Follow-up`} size="sm" className="mt-2"><CalendarCheck2 className="size-4" aria-hidden="true" />Book follow-up</ButtonLink>
          </div>
        </section>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/care/journey/j-heart" variant="outline">View care journey</ButtonLink>
        <ButtonLink to="/records?tab=prescriptions" variant="ghost">Go to records</ButtonLink>
      </div>
      <p className="mt-6 text-center text-caption text-ink-500">Demo consultation summary — mock data. <Link to="/appointments" className="underline">Back to appointments</Link></p>
    </div>
  );
}
