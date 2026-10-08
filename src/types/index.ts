/* HealthSphere domain models. All data in this prototype is mock data. */

export type SpecialtySlug =
  | "eye-care"
  | "heart-care"
  | "brain-neuro"
  | "bone-spine"
  | "lung-care"
  | "skin-care"
  | "cancer-care"
  | "kidney-urology"
  | "dental-care"
  | "womens-health"
  | "child-care";

export type IconName = string; // lucide icon name resolved through lib/icons

export interface Tone {
  /** Accent used for icons, progress and small marks */
  color: string;
  /** Very light tint used for icon tiles and soft backgrounds */
  tint: string;
  /** Darker accent that clears 4.5:1 on white — for accent text */
  ink: string;
}

export interface ImageAsset {
  /** Base name in /public/images, e.g. "eye-care-specialty" */
  name: string;
  alt: string;
  /** CSS object-position for cover crops */
  focus?: string;
}

export interface SpecialtyCondition {
  name: string;
  summary: string;
  icon: IconName;
}

export interface SpecialtyService {
  name: string;
  description: string;
  icon: IconName;
  kind: "test" | "treatment" | "procedure" | "program";
  duration?: string;
  priceFrom?: number;
}

export interface JourneyTemplateStage {
  title: string;
  description: string;
}

/** Specialty-specific interactive module rendered on the specialty page. */
export type SpecialtyModule =
  | "vision-profile"
  | "heart-overview"
  | "neuro-assessment"
  | "pain-tracker"
  | "lung-function"
  | "skin-profile"
  | "oncology-plan"
  | "kidney-function"
  | "dental-chart"
  | "womens-tracker"
  | "child-growth";

export interface Specialty {
  slug: SpecialtySlug;
  name: string;
  shortName: string;
  tagline: string;
  headline: string;
  description: string;
  icon: IconName;
  tone: Tone;
  image: ImageAsset;
  module: SpecialtyModule;
  /** Labels used for the quick-action strip on the specialty hero */
  quickActions: { label: string; icon: IconName }[];
  conditions: SpecialtyCondition[];
  services: SpecialtyService[];
  journey: JourneyTemplateStage[];
  specialistTitles: string[];
  stats: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
  libraryCategory: ArticleCategory;
}

export interface Doctor {
  id: string;
  name: string;
  title: string; // e.g. "Ophthalmologist"
  specialty: SpecialtySlug;
  subSpecialty: string;
  experienceYears: number;
  hospitalId: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  patientsTreated: number;
  successRate?: number;
  fee: { inPerson: number; video: number; homeVisit?: number };
  consultationTypes: ConsultationType[];
  photo?: ImageAsset;
  initials: string;
  gender: "female" | "male";
  nextAvailable: string; // ISO date-time
  about: string;
  education: { degree: string; institution: string; year: number }[];
  experience: { role: string; place: string; period: string }[];
  specializations: string[];
  awards?: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  verifiedVisit: boolean;
}

export type ConsultationType = "in-person" | "video" | "home-visit";

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  type: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  rating: number;
  reviewCount: number;
  beds: number;
  established: number;
  distanceKm: number;
  image: ImageAsset;
  departments: SpecialtySlug[];
  facilities: string[];
  insurance: string[];
  hours: { label: string; value: string }[];
  emergency24x7: boolean;
  accreditations: string[];
  about: string;
  reviews: Review[];
  erWaitMinutes: number;
}

export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "in-progress";

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  specialty: SpecialtySlug;
  date: string; // ISO date-time
  type: ConsultationType;
  status: AppointmentStatus;
  reason: string;
  hospitalId: string;
  journeyId?: string;
  token?: string;
}

export type RecordType =
  | "report"
  | "prescription"
  | "document"
  | "history"
  | "imaging"
  | "lab";

export interface MedicalRecord {
  id: string;
  title: string;
  type: RecordType;
  category: "Reports" | "Prescriptions" | "Documents" | "History";
  date: string;
  doctorId?: string;
  hospitalId?: string;
  specialty?: SpecialtySlug;
  summary: string;
  fileSize: string;
  pages?: number;
  sharedWith: string[];
  status?: "normal" | "attention" | "pending";
  findings?: { label: string; value: string; range?: string; flag?: "normal" | "high" | "low" }[];
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  advice: string[];
  tests: string[];
  followUp?: string;
}

export type JourneyStageStatus = "completed" | "current" | "upcoming" | "scheduled";

export interface JourneyStage {
  id: string;
  title: string;
  status: JourneyStageStatus;
  date?: string;
  doctorId?: string;
  location?: string;
  summary: string;
  documents: { title: string; recordId?: string }[];
  nextStep?: string;
  checklist?: { label: string; done: boolean }[];
}

export interface CareJourney {
  id: string;
  title: string;
  condition: string;
  specialty: SpecialtySlug;
  leadDoctorId: string;
  hospitalId: string;
  startedOn: string;
  progress: number; // 0..100
  status: "active" | "completed" | "monitoring";
  nextStep: string;
  nextStepDate?: string;
  stages: JourneyStage[];
}

export interface HealthMetric {
  id: "heart-rate" | "blood-pressure" | "steps" | "sleep" | "weight" | "spo2";
  label: string;
  value: string;
  unit: string;
  status: "normal" | "attention" | "good";
  statusLabel: string;
  updated: string;
  trend: number[];
  trendLabels: string[];
  /** Secondary series (e.g. diastolic) */
  trend2?: number[];
  range?: string;
  goal?: number;
  icon: IconName;
}

export interface Patient {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  age: number;
  gender: "female" | "male";
  bloodGroup: string;
  phone: string;
  email: string;
  city: string;
  allergies: string[];
  conditions: string[];
  emergencyContacts: { name: string; relation: string; phone: string }[];
  insurance: { provider: string; policy: string; validTill: string };
  heightCm: number;
  weightKg: number;
}

export interface PortalPatient {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: "F" | "M";
  condition: string;
  lastVisit: string;
  status: "stable" | "follow-up" | "critical" | "new";
  phone: string;
  vitals: { bp: string; hr: number; spo2: number; temp: string };
  allergies: string[];
  history: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "appointment" | "report" | "journey" | "medication" | "system";
  read: boolean;
  href?: string;
}

export type ArticleCategory =
  | "Eye"
  | "Heart"
  | "Brain"
  | "Nutrition"
  | "Women's Health"
  | "Children"
  | "Skin"
  | "Bone"
  | "Preventive Care"
  | "Lungs"
  | "Kidney"
  | "Dental"
  | "Cancer"
  | "Mental Health"
  | "Fitness"
  | "Sleep";

export interface HealthArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  readMinutes: number;
  date: string;
  author: string;
  reviewer: string;
  image: ImageAsset;
  featured?: boolean;
  body: { heading?: string; paragraphs: string[]; list?: string[] }[];
  keyTakeaways: string[];
}
