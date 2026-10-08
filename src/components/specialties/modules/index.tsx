import type { SpecialtyModule } from "@/types";
import { HeartOverview, VisionProfile } from "./EyeHeartModules";
import { LungFunction, NeuroAssessment, PainTracker } from "./NeuroBoneLungModules";
import { KidneyFunction, OncologyPlan, SkinProfile } from "./SkinCancerKidneyModules";
import { ChildGrowth, DentalChart, WomensTracker } from "./DentalWomenChildModules";

/** Each specialty renders its own interactive module. */
export const specialtyModules: Record<SpecialtyModule, { title: string; component: React.ComponentType }> = {
  "vision-profile": { title: "Your vision, at a glance", component: VisionProfile },
  "heart-overview": { title: "Your heart health", component: HeartOverview },
  "neuro-assessment": { title: "Brain health tools", component: NeuroAssessment },
  "pain-tracker": { title: "Track pain & recovery", component: PainTracker },
  "lung-function": { title: "Breathing & lung function", component: LungFunction },
  "skin-profile": { title: "Your skin, personalised", component: SkinProfile },
  "oncology-plan": { title: "Treatment & screening", component: OncologyPlan },
  "kidney-function": { title: "Kidney health", component: KidneyFunction },
  "dental-chart": { title: "Your oral health", component: DentalChart },
  "womens-tracker": { title: "Cycle & pregnancy care", component: WomensTracker },
  "child-growth": { title: "Vaccines & growth", component: ChildGrowth },
};
