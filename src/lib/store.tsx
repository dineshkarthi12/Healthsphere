import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { appointments as seedAppointments, notifications as seedNotifications } from "@/data/patient";
import { medicalRecords as seedRecords } from "@/data/records";
import type { Appointment, MedicalRecord, NotificationItem } from "@/types";

/**
 * Lightweight client-side app state for the prototype. Persists to
 * localStorage when available so bookings and uploads survive a reload.
 * Nothing leaves the browser — there is no backend.
 */
interface AppState {
  signedIn: boolean;
  appointments: Appointment[];
  records: MedicalRecord[];
  notifications: NotificationItem[];
}

interface AppActions {
  signIn: () => void;
  signOut: () => void;
  addAppointment: (a: Appointment) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  addRecord: (r: MedicalRecord) => void;
  updateRecord: (id: string, patch: Partial<MedicalRecord>) => void;
  markNotificationsRead: () => void;
  resetDemo: () => void;
}

const KEY = "healthsphere-demo-v1";
const initial: AppState = { signedIn: false, appointments: seedAppointments, records: seedRecords, notifications: seedNotifications };

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...initial, ...parsed };
  } catch {
    return initial;
  }
}

const Ctx = createContext<(AppState & AppActions) | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — state stays in memory */
    }
  }, [state]);

  const signIn = useCallback(() => setState((s) => ({ ...s, signedIn: true })), []);
  const signOut = useCallback(() => setState((s) => ({ ...s, signedIn: false })), []);
  const addAppointment = useCallback((a: Appointment) => setState((s) => ({ ...s, appointments: [a, ...s.appointments] })), []);
  const updateAppointment = useCallback(
    (id: string, patch: Partial<Appointment>) => setState((s) => ({ ...s, appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
    [],
  );
  const addRecord = useCallback((r: MedicalRecord) => setState((s) => ({ ...s, records: [r, ...s.records] })), []);
  const updateRecord = useCallback(
    (id: string, patch: Partial<MedicalRecord>) => setState((s) => ({ ...s, records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
    [],
  );
  const markNotificationsRead = useCallback(() => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })), []);
  const resetDemo = useCallback(() => setState(initial), []);

  const value = useMemo(
    () => ({ ...state, signIn, signOut, addAppointment, updateAppointment, addRecord, updateRecord, markNotificationsRead, resetDemo }),
    [state, signIn, signOut, addAppointment, updateAppointment, addRecord, updateRecord, markNotificationsRead, resetDemo],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
