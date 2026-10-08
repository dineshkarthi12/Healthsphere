/**
 * Curated icon registry. Data files reference icons by name so that mock data
 * stays serialisable, while only the icons we use are bundled.
 */
import {
  Activity, AlarmClock, Ambulance, Apple, Baby, BadgeCheck, Bandage, Bed, Bone, Brain, BrainCircuit, CalendarCheck,
  CalendarClock, CalendarDays, Camera, ClipboardCheck, ClipboardList, Droplet, Droplets, Ear, Eye, EyeOff, FileHeart,
  FileText, FlaskConical, Footprints, Glasses, HandHeart, Heart, HeartHandshake, HeartPulse, Hospital, Info, Leaf,
  LineChart, Microscope, Milk, Moon, Pill, PillBottle, Radiation, Ribbon, Ruler, Salad, Scale, Scan, ScanEye,
  ScanFace, ScanLine, ShieldCheck, ShieldPlus, Smile, Sparkles, Stethoscope, Sun, Syringe, Thermometer, Timer,
  TrendingUp, UserRound, Users, Video, Waves, Weight, Wind, Zap, Gauge, Footprints as Steps, Dumbbell, Flower2,
  Baby as Child, Accessibility, Sparkle, Search, MapPin, Phone, Siren, BookOpen, Home, Upload, Share2, Download,
  TestTube, Dna, ScanHeart, HandHelping, PersonStanding, BicepsFlexed, Scissors, CalendarHeart, Hand, Cross, Crosshair, Laptop, Building2, Clock, Gem, Target, Eclipse, Shield, Soup, Brush, Layers, Focus,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { Kidney, Lungs, SkinLayers, Tooth, Venus } from "@/components/ui/custom-icons";

export type IconComponent = ComponentType<LucideProps>;

const registry: Record<string, IconComponent> = {
  Kidney, Lungs, SkinLayers, Tooth, Venus,
  TestTube, Dna, ScanHeart, HandHelping, PersonStanding, BicepsFlexed, Scissors, CalendarHeart, Hand, Cross, Crosshair, Laptop, Building2, Clock, Gem, Target, Eclipse, Shield, Soup, Brush, Layers, Focus,
  Activity, AlarmClock, Ambulance, Apple, Baby, BadgeCheck, Bandage, Bed, Bone, Brain, BrainCircuit, CalendarCheck,
  CalendarClock, CalendarDays, Camera, ClipboardCheck, ClipboardList, Droplet, Droplets, Ear, Eye, EyeOff, FileHeart,
  FileText, FlaskConical, Footprints, Glasses, HandHeart, Heart, HeartHandshake, HeartPulse, Hospital, Info, Leaf,
  LineChart, Microscope, Milk, Moon, Pill, PillBottle, Radiation, Ribbon, Ruler, Salad, Scale, Scan, ScanEye,
  ScanFace, ScanLine, ShieldCheck, ShieldPlus, Smile, Sparkles, Stethoscope, Sun, Syringe, Thermometer, Timer,
  TrendingUp, UserRound, Users, Video, Waves, Weight, Wind, Zap, Gauge, Steps, Dumbbell, Flower2, Child,
  Accessibility, Sparkle, Search, MapPin, Phone, Siren, BookOpen, Home, Upload, Share2, Download,
};

export function getIcon(name: string): IconComponent {
  return registry[name] ?? Info;
}
