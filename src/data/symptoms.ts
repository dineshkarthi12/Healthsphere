import type { SpecialtySlug } from "@/types";

/**
 * Symptom → care pathway map used by the symptom checker and global search.
 * Guidance is deliberately conservative and educational, never a diagnosis.
 */
export interface SymptomEntry {
  id: string;
  label: string;
  area: "Head & brain" | "Eyes" | "Chest & heart" | "Breathing" | "Bones & joints" | "Skin" | "Stomach & urinary" | "Mouth & teeth" | "Women's health" | "Children" | "General";
  specialty: SpecialtySlug;
  keywords: string[];
  redFlags?: string[];
  pathway: string[];
}

export const symptoms: SymptomEntry[] = [
  { id: "headache", label: "Headache or migraine", area: "Head & brain", specialty: "brain-neuro", keywords: ["headache", "migraine", "head pain"], redFlags: ["Sudden 'worst ever' headache", "Headache with weakness, confusion or slurred speech"], pathway: ["Neurology consult", "Neurological assessment", "MRI if advised", "Treatment plan & headache diary"] },
  { id: "dizziness", label: "Dizziness or numbness", area: "Head & brain", specialty: "brain-neuro", keywords: ["dizzy", "vertigo", "numb", "tingling"], redFlags: ["Face drooping, arm weakness or speech difficulty"], pathway: ["Neurology consult", "Neuro assessment", "Imaging if needed", "Treatment"] },
  { id: "blurred-vision", label: "Blurred vision", area: "Eyes", specialty: "eye-care", keywords: ["blurry", "vision", "glasses", "eye"], redFlags: ["Sudden loss of vision", "Curtain or flashes across vision"], pathway: ["Eye consult", "Vision test & OCT", "Diagnosis", "Glasses, treatment or surgery"] },
  { id: "red-eye", label: "Red, itchy or dry eyes", area: "Eyes", specialty: "eye-care", keywords: ["red eye", "itchy", "dry eye", "watering"], pathway: ["Eye consult", "Slit-lamp exam", "Drops & care plan"] },
  { id: "chest-pain", label: "Chest pain or tightness", area: "Chest & heart", specialty: "heart-care", keywords: ["chest pain", "heart", "angina", "tightness"], redFlags: ["Chest pain with sweating, breathlessness or pain spreading to arm/jaw — call 108/112 now"], pathway: ["Cardiology consult", "ECG", "Echo / stress test", "Diagnosis & treatment"] },
  { id: "palpitations", label: "Palpitations", area: "Chest & heart", specialty: "heart-care", keywords: ["palpitation", "racing heart", "irregular heartbeat", "flutter"], redFlags: ["Palpitations with fainting or chest pain"], pathway: ["Cardiology consult", "ECG", "Holter if needed", "Care plan"] },
  { id: "high-bp", label: "High blood pressure", area: "Chest & heart", specialty: "heart-care", keywords: ["bp", "blood pressure", "hypertension"], pathway: ["Cardiology or physician consult", "BP monitoring", "Blood tests", "Treatment & monitoring"] },
  { id: "breathless", label: "Breathlessness or wheezing", area: "Breathing", specialty: "lung-care", keywords: ["breathless", "wheeze", "asthma", "short of breath"], redFlags: ["Severe breathlessness at rest or blue lips"], pathway: ["Pulmonology consult", "Lung function test", "Chest imaging if needed", "Inhaler plan"] },
  { id: "cough", label: "Persistent cough", area: "Breathing", specialty: "lung-care", keywords: ["cough", "phlegm", "chest congestion"], redFlags: ["Coughing up blood"], pathway: ["Pulmonology consult", "Chest X-ray", "Diagnosis", "Treatment"] },
  { id: "back-pain", label: "Back or neck pain", area: "Bones & joints", specialty: "bone-spine", keywords: ["back pain", "neck pain", "sciatica", "slip disc"], redFlags: ["Back pain with loss of bladder/bowel control or leg weakness"], pathway: ["Spine consult", "X-ray / MRI", "Diagnosis", "Physiotherapy or treatment"] },
  { id: "joint-pain", label: "Joint pain or injury", area: "Bones & joints", specialty: "bone-spine", keywords: ["knee", "joint", "sprain", "fracture", "injury", "shoulder"], pathway: ["Orthopaedic consult", "X-ray", "Treatment", "Physiotherapy"] },
  { id: "acne", label: "Acne or breakouts", area: "Skin", specialty: "skin-care", keywords: ["acne", "pimples", "breakout"], pathway: ["Dermatology consult", "Skin examination", "Treatment plan", "Progress review"] },
  { id: "rash", label: "Rash, itching or pigmentation", area: "Skin", specialty: "skin-care", keywords: ["rash", "itch", "pigmentation", "eczema", "spots", "hair loss"], redFlags: ["Rash with fever and breathing difficulty"], pathway: ["Dermatology consult", "Skin exam / patch test", "Treatment"] },
  { id: "urinary", label: "Burning or frequent urination", area: "Stomach & urinary", specialty: "kidney-urology", keywords: ["urine", "uti", "burning", "frequent urination"], pathway: ["Urology consult", "Urine test", "Treatment", "Follow-up"] },
  { id: "flank-pain", label: "Side / flank pain", area: "Stomach & urinary", specialty: "kidney-urology", keywords: ["kidney stone", "flank", "side pain"], redFlags: ["Severe pain with fever or vomiting"], pathway: ["Urology consult", "Ultrasound KUB", "Diagnosis", "Treatment"] },
  { id: "toothache", label: "Toothache or sensitivity", area: "Mouth & teeth", specialty: "dental-care", keywords: ["tooth", "teeth", "toothache", "sensitivity", "gum", "dental"], pathway: ["Dental check-up", "X-ray", "Treatment plan", "Filling / RCT"] },
  { id: "irregular-periods", label: "Irregular or painful periods", area: "Women's health", specialty: "womens-health", keywords: ["period", "menstrual", "pcos", "cramps"], pathway: ["Gynaecology consult", "Hormone tests & ultrasound", "Diagnosis", "Care plan"] },
  { id: "pregnancy", label: "Pregnancy care", area: "Women's health", specialty: "womens-health", keywords: ["pregnant", "pregnancy", "antenatal"], redFlags: ["Bleeding or severe abdominal pain in pregnancy"], pathway: ["Obstetrics consult", "Scans & tests", "Antenatal plan"] },
  { id: "child-fever", label: "Child has fever", area: "Children", specialty: "child-care", keywords: ["child fever", "baby fever", "kid sick"], redFlags: ["Baby under 3 months with fever", "Fever with drowsiness, breathing difficulty or non-fading rash"], pathway: ["Paediatric consult", "Examination", "Treatment & home-care guidance"] },
  { id: "child-growth", label: "Growth or vaccination", area: "Children", specialty: "child-care", keywords: ["vaccine", "vaccination", "growth", "height", "weight"], pathway: ["Paediatric check-up", "Growth assessment", "Vaccination plan"] },
  { id: "lump", label: "Lump or unexplained weight loss", area: "General", specialty: "cancer-care", keywords: ["lump", "weight loss", "cancer", "screening"], pathway: ["Specialist consult", "Screening & imaging", "Biopsy if needed", "Tumour board plan"] },
];

export const symptomAreas = Array.from(new Set(symptoms.map((s) => s.area)));
