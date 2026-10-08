import { BarChart3, CalendarDays, ClipboardList, LayoutDashboard, MessageSquare, Pill, Settings, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { avatarSrc } from "@/lib/utils";

const nav = [
  { to: "/doctor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays, badge: 12 },
  { to: "/doctor/patients", label: "Patients", icon: Users },
  { to: "/doctor/messages", label: "Messages", icon: MessageSquare, badge: 2 },
  { to: "/doctor/records", label: "Medical Records", icon: ClipboardList },
  { to: "/doctor/prescriptions", label: "Prescriptions", icon: Pill },
  { to: "/doctor/reports", label: "Reports", icon: BarChart3 },
  { to: "/doctor/settings", label: "Settings", icon: Settings },
];

export default function DoctorPortalLayout() {
  return (
    <DashboardShell
      nav={nav}
      portalName="Doctor portal"
      searchPlaceholder="Search patients, reports, prescriptions…"
      user={{ name: "Dr. Ananya Sharma", role: "Ophthalmologist", initials: "AS", photo: avatarSrc("doctor-female-portrait") }}
    />
  );
}

