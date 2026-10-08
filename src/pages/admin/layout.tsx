import { BarChart3, Building2, CalendarDays, FileBarChart, LayoutDashboard, Settings, Stethoscope, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/admin/patients", label: "Patients", icon: Users },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  return (
    <DashboardShell
      nav={nav}
      portalName="Hospital admin"
      searchPlaceholder="Search doctors, patients, departments…"
      user={{ name: "Meera Iyer", role: "Hospital Administrator", initials: "MI" }}
    />
  );
}
