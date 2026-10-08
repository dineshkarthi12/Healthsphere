import { TODAY, istDay } from "./utils";

/** Deterministic mock availability so the same doctor always shows the same slots. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export interface Slot {
  iso: string;
  label: string;
  available: boolean;
}
export interface SlotDay {
  key: string;
  date: Date;
  weekday: string;
  day: number;
  month: string;
  slots: { morning: Slot[]; afternoon: Slot[]; evening: Slot[] };
  availableCount: number;
}

const times = {
  morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  afternoon: ["12:30", "14:00", "14:30", "15:00", "15:30"],
  evening: ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00"],
};

function label(t: string) {
  const [h, m] = t.split(":").map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function getSlotDays(doctorId: string, count = 7): SlotDay[] {
  const out: SlotDay[] = [];
  const base = new Date(`${istDay(TODAY)}T00:00:00+05:30`);
  for (let d = 0; d < count; d++) {
    const date = new Date(base.getTime() + d * 86400000);
    const key = istDay(date);
    const isSunday = new Date(`${key}T12:00:00+05:30`).getUTCDay() === 0;
    const make = (list: string[]) =>
      list.map((t) => {
        const iso = `${key}T${t}:00+05:30`;
        const past = new Date(iso) <= TODAY;
        const available = !past && !isSunday && hash(doctorId + iso) % 10 > 3;
        return { iso, label: label(t), available };
      });
    const slots = { morning: make(times.morning), afternoon: make(times.afternoon), evening: make(times.evening) };
    const availableCount = [...slots.morning, ...slots.afternoon, ...slots.evening].filter((s) => s.available).length;
    out.push({
      key,
      date,
      weekday: date.toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }),
      day: Number(key.slice(8)),
      month: date.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" }),
      slots,
      availableCount,
    });
  }
  return out;
}
