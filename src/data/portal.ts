import type { PortalPatient, SpecialtySlug } from "@/types";

/* ---------------------------------------------------------------------------
   Doctor portal (signed in as Dr. Ananya Sharma) — mock data
   --------------------------------------------------------------------------- */

export const portalDoctorId = "ananya-sharma";

export const portalPatients: PortalPatient[] = [
  { id: "pp-1", name: "Anita Kumar", initials: "AK", age: 34, gender: "F", condition: "Keratoconus — CXL review", lastVisit: "2026-09-08", status: "follow-up", phone: "+91 98410 22110", vitals: { bp: "116/74", hr: 76, spo2: 99, temp: "98.4°F" }, allergies: [], history: ["Keratoconus (both eyes)", "CXL right eye 2025"] },
  { id: "pp-2", name: "Ramesh Iyer", initials: "RI", age: 61, gender: "M", condition: "Cataract — right eye", lastVisit: "2026-09-30", status: "follow-up", phone: "+91 98840 33221", vitals: { bp: "132/84", hr: 70, spo2: 97, temp: "98.2°F" }, allergies: ["Sulfa drugs"], history: ["Type 2 diabetes (10 yrs)", "Hypertension"] },
  { id: "pp-3", name: "Sneha Reddy", initials: "SR", age: 27, gender: "F", condition: "LASIK evaluation", lastVisit: "2026-10-08", status: "new", phone: "+91 99620 44332", vitals: { bp: "110/70", hr: 72, spo2: 99, temp: "98.6°F" }, allergies: [], history: ["Myopia -5.00 DS"] },
  { id: "pp-4", name: "Vikram Singh", initials: "VS", age: 45, gender: "M", condition: "Post-op LASIK — day 7", lastVisit: "2026-10-01", status: "stable", phone: "+91 90030 55443", vitals: { bp: "124/80", hr: 68, spo2: 98, temp: "98.4°F" }, allergies: ["Penicillin"], history: ["LASIK both eyes Oct 2026"] },
  { id: "pp-5", name: "Priya Raman", initials: "PR", age: 29, gender: "F", condition: "Pre-LASIK assessment", lastVisit: "2026-09-19", status: "follow-up", phone: "+91 98400 12345", vitals: { bp: "118/76", hr: 72, spo2: 98, temp: "98.4°F" }, allergies: ["Penicillin", "Dust mites"], history: ["Myopia -4.25 / -4.50", "Migraine without aura", "Appendectomy 2019"] },
  { id: "pp-6", name: "Mohammed Farooq", initials: "MF", age: 52, gender: "M", condition: "Dry eye disease", lastVisit: "2026-08-22", status: "stable", phone: "+91 98400 66554", vitals: { bp: "128/82", hr: 74, spo2: 98, temp: "98.6°F" }, allergies: [], history: ["Dry eye (meibomian gland dysfunction)"] },
  { id: "pp-7", name: "Lakshmi Narayanan", initials: "LN", age: 68, gender: "F", condition: "Corneal ulcer — urgent", lastVisit: "2026-10-07", status: "critical", phone: "+91 94440 77665", vitals: { bp: "138/86", hr: 82, spo2: 96, temp: "99.1°F" }, allergies: ["Ciprofloxacin"], history: ["Corneal ulcer left eye", "Hypothyroidism"] },
  { id: "pp-8", name: "Arjun Das", initials: "AD", age: 22, gender: "M", condition: "Contact lens fitting", lastVisit: "2026-09-12", status: "new", phone: "+91 97910 88776", vitals: { bp: "114/72", hr: 66, spo2: 99, temp: "98.2°F" }, allergies: [], history: [] },
];

export interface PortalAppointment {
  id: string;
  time: string;
  patientId: string;
  type: "Consultation" | "Follow-up" | "Surgery" | "Video consult" | "Post-op";
  status: "checked-in" | "waiting" | "completed" | "scheduled" | "in-consultation";
  reason: string;
}

export const portalTodayAppointments: PortalAppointment[] = [
  { id: "pa-1", time: "09:00 AM", patientId: "pp-1", type: "Consultation", status: "completed", reason: "CXL 1-year review" },
  { id: "pa-2", time: "09:30 AM", patientId: "pp-4", type: "Post-op", status: "completed", reason: "LASIK day-7 check" },
  { id: "pa-3", time: "10:30 AM", patientId: "pp-2", type: "Follow-up", status: "in-consultation", reason: "Cataract surgery planning" },
  { id: "pa-4", time: "11:15 AM", patientId: "pp-7", type: "Follow-up", status: "checked-in", reason: "Corneal ulcer — response to drops" },
  { id: "pa-5", time: "12:00 PM", patientId: "pp-3", type: "Consultation", status: "waiting", reason: "LASIK suitability" },
  { id: "pa-6", time: "02:30 PM", patientId: "pp-6", type: "Video consult", status: "scheduled", reason: "Dry eye — therapy review" },
  { id: "pa-7", time: "03:30 PM", patientId: "pp-8", type: "Consultation", status: "scheduled", reason: "Contact lens trial" },
  { id: "pa-8", time: "04:30 PM", patientId: "pp-5", type: "Video consult", status: "scheduled", reason: "Pre-op questions" },
];

export const portalStats = [
  { label: "Today's appointments", value: 12, delta: "+2 vs last Thu", icon: "CalendarCheck" },
  { label: "New patients", value: 3, delta: "This week: 14", icon: "UserRound" },
  { label: "Pending reports", value: 5, delta: "2 marked urgent", icon: "FileText" },
  { label: "Follow-ups due", value: 8, delta: "Next 7 days", icon: "CalendarClock" },
  { label: "Total patients", value: 245, delta: "+18 this month", icon: "Users" },
];

export const portalWeeklyVisits = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  values: [14, 11, 16, 12, 18, 9],
};

export const portalMessages = [
  { id: "msg-1", from: "Ramesh Iyer", initials: "RI", preview: "Doctor, should I continue my diabetes tablets on the morning of surgery?", time: "9:12 AM", unread: true },
  { id: "msg-2", from: "Lab · Harbour Diagnostics", initials: "HD", preview: "Corneal culture report for Lakshmi Narayanan is ready.", time: "8:40 AM", unread: true },
  { id: "msg-3", from: "Vikram Singh", initials: "VS", preview: "Vision is much clearer today, thank you! Slight glare at night.", time: "Yesterday", unread: false },
  { id: "msg-4", from: "Nurse Revathi", initials: "NR", preview: "OT slot for Oct 22 confirmed — 3 LASIK cases.", time: "Yesterday", unread: false },
];

export const portalPendingReports = [
  { id: "pr-1", patientId: "pp-7", title: "Corneal scraping culture", due: "Today", urgent: true },
  { id: "pr-2", patientId: "pp-2", title: "A-scan biometry", due: "Today", urgent: true },
  { id: "pr-3", patientId: "pp-3", title: "Corneal topography", due: "Tomorrow", urgent: false },
  { id: "pr-4", patientId: "pp-5", title: "Repeat topography", due: "Oct 14", urgent: false },
  { id: "pr-5", patientId: "pp-1", title: "Pachymetry", due: "Oct 15", urgent: false },
];

export const medicineCatalogue = [
  "Moxifloxacin 0.5% eye drops",
  "Carboxymethylcellulose 0.5% eye drops",
  "Prednisolone acetate 1% eye drops",
  "Timolol 0.5% eye drops",
  "Nepafenac 0.1% eye drops",
  "Tobramycin + Dexamethasone eye drops",
  "Paracetamol 650 mg",
  "Vitamin A + Omega-3 capsules",
];

export const testCatalogue = [
  "Corneal topography",
  "Pachymetry",
  "OCT macula",
  "A-scan biometry",
  "Fasting blood sugar",
  "HbA1c",
  "Complete blood count",
  "Corneal scraping culture",
];

/* ---------------------------------------------------------------------------
   Hospital / admin portal (Meridian Multispeciality Hospital) — mock data
   --------------------------------------------------------------------------- */

export const adminStats = [
  { label: "Total patients", value: 12480, delta: 11.6, unit: "", icon: "Users" },
  { label: "Appointments", value: 842, delta: 8.4, unit: "this week", icon: "CalendarCheck" },
  { label: "Doctors", value: 120, delta: 2.5, unit: "on staff", icon: "Stethoscope" },
  { label: "Revenue", value: 4825000, delta: 11.2, unit: "this month", icon: "TrendingUp" },
];

export const adminAppointmentsTrend = {
  labels: ["Sep 1", "Sep 8", "Sep 15", "Sep 22", "Sep 29", "Oct 6"],
  inPerson: [520, 548, 590, 566, 612, 640],
  video: [140, 152, 171, 168, 190, 202],
};

export const adminDepartments: { slug: SpecialtySlug | "other"; name: string; patients: number; share: number; doctors: number; satisfaction: number; waitMin: number }[] = [
  { slug: "heart-care", name: "Cardiology", patients: 2240, share: 18, doctors: 18, satisfaction: 4.8, waitMin: 14 },
  { slug: "brain-neuro", name: "Neurology", patients: 1870, share: 15, doctors: 14, satisfaction: 4.7, waitMin: 18 },
  { slug: "bone-spine", name: "Orthopaedics", patients: 1620, share: 13, doctors: 16, satisfaction: 4.6, waitMin: 22 },
  { slug: "eye-care", name: "Ophthalmology", patients: 1370, share: 11, doctors: 11, satisfaction: 4.9, waitMin: 11 },
  { slug: "womens-health", name: "Obstetrics & Gynae", patients: 1240, share: 10, doctors: 13, satisfaction: 4.8, waitMin: 16 },
  { slug: "child-care", name: "Paediatrics", patients: 1120, share: 9, doctors: 12, satisfaction: 4.9, waitMin: 12 },
  { slug: "cancer-care", name: "Oncology", patients: 990, share: 8, doctors: 10, satisfaction: 4.7, waitMin: 20 },
  { slug: "kidney-urology", name: "Nephrology & Urology", patients: 870, share: 7, doctors: 9, satisfaction: 4.6, waitMin: 17 },
  { slug: "other", name: "Other departments", patients: 1150, share: 9, doctors: 17, satisfaction: 4.6, waitMin: 15 },
];

export const adminSpecialtyDemand = [
  { name: "Cardiology", searches: 18400 },
  { name: "Ophthalmology", searches: 15200 },
  { name: "Orthopaedics", searches: 13900 },
  { name: "Dermatology", searches: 11800 },
  { name: "Paediatrics", searches: 10600 },
  { name: "Gynaecology", searches: 9700 },
];

export const adminActivity = [
  { id: "ac1", text: "New appointment booked — Cardiology, Dr. Arjun Mehta", time: "10 min ago", kind: "appointment" },
  { id: "ac2", text: "Lab report uploaded — 14 results synced to patient records", time: "23 min ago", kind: "report" },
  { id: "ac3", text: "Dr. Sana Qureshi joined Neurosurgery duty roster", time: "1 h ago", kind: "doctor" },
  { id: "ac4", text: "Patient discharged — Ward 4B, orthopaedics", time: "2 h ago", kind: "discharge" },
  { id: "ac5", text: "Emergency alert resolved — chest pain unit, triage level 2", time: "3 h ago", kind: "emergency" },
  { id: "ac6", text: "Insurance pre-authorisation approved — Star Health", time: "4 h ago", kind: "billing" },
];

export const adminDoctorsOnDuty = [
  { doctorId: "arjun-mehta", status: "In OPD", patientsToday: 18 },
  { doctorId: "sana-qureshi", status: "In surgery", patientsToday: 4 },
  { doctorId: "karthik-subramanian", status: "In OPD", patientsToday: 15 },
  { doctorId: "rajesh-iyer", status: "Tumour board", patientsToday: 9 },
  { doctorId: "meera-krishnan", status: "On leave", patientsToday: 0 },
  { doctorId: "suresh-babu", status: "In OPD", patientsToday: 12 },
];
