import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RouteError } from "@/pages/RouteError";

/** Lazy-load a named export so each page becomes its own chunk. */
function page<T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) {
  const C = lazy(() => loader().then((m) => ({ default: m[name] as React.ComponentType })));
  return <C />;
}

const publicPages = () => import("@/pages/public");
const patientPages = () => import("@/pages/patient");
const careDetail = () => import("@/pages/patient/care");
const booking = () => import("@/pages/patient/booking");
const consult = () => import("@/pages/patient/consultation");
const specialtyPages = () => import("@/pages/specialties");
const doctorPages = () => import("@/pages/doctors");
const library = () => import("@/pages/library");
const portal = () => import("@/pages/portal");
const admin = () => import("@/pages/admin");

const DoctorPortalLayout = lazy(() => import("@/pages/portal/layout"));
const AdminLayout = lazy(() => import("@/pages/admin/layout"));

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: "/", element: page(() => import("@/pages/home"), "HomePage") },
      { path: "/specialties", element: page(specialtyPages, "SpecialtiesPage") },
      { path: "/specialties/:slug", element: page(specialtyPages, "SpecialtyPage") },
      { path: "/symptoms", element: page(publicPages, "SymptomsPage") },
      { path: "/doctors", element: page(doctorPages, "DoctorsPage") },
      { path: "/doctors/:id", element: page(doctorPages, "DoctorProfilePage") },
      { path: "/hospitals", element: page(doctorPages, "HospitalsPage") },
      { path: "/hospitals/:id", element: page(doctorPages, "HospitalPage") },
      { path: "/health-library", element: page(library, "LibraryPage") },
      { path: "/health-library/:slug", element: page(library, "ArticlePage") },
      { path: "/about", element: page(publicPages, "AboutPage") },
      { path: "/contact", element: page(publicPages, "ContactPage") },
      { path: "/emergency", element: page(publicPages, "EmergencyPage") },
      { path: "/login", element: page(publicPages, "LoginPage") },
      { path: "/signup", element: page(publicPages, "SignupPage") },

      { path: "/appointments", element: page(patientPages, "AppointmentsPage") },
      { path: "/appointments/book", element: page(booking, "BookingPage") },
      { path: "/care", element: page(careDetail, "CarePage") },
      { path: "/care/journey/:id", element: page(careDetail, "JourneyPage") },
      { path: "/records", element: page(patientPages, "RecordsPage") },
      { path: "/insights", element: page(patientPages, "InsightsPage") },
      { path: "/profile", element: page(patientPages, "ProfilePage") },
      { path: "/consultation/:id", element: page(consult, "ConsultationPage") },

      { path: "*", element: page(publicPages, "NotFoundPage") },
    ],
  },
  {
    path: "/doctor",
    element: <DoctorPortalLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: page(portal, "DoctorDashboard") },
      { path: "appointments", element: page(portal, "DoctorAppointments") },
      { path: "patients", element: page(portal, "DoctorPatients") },
      { path: "patients/:id", element: page(portal, "DoctorPatientDetail") },
      { path: "consult/:id", element: page(portal, "ConsultWorkspace") },
      { path: "messages", element: page(portal, "DoctorMessages") },
      { path: "records", element: page(portal, "DoctorRecords") },
      { path: "prescriptions", element: page(portal, "DoctorPrescriptions") },
      { path: "reports", element: page(portal, "DoctorReports") },
      { path: "settings", element: page(portal, "DoctorSettings") },
      { path: "*", element: <Navigate to="/doctor" replace /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: page(admin, "AdminDashboard") },
      { path: "doctors", element: page(admin, "AdminDoctors") },
      { path: "patients", element: page(admin, "AdminPatients") },
      { path: "departments", element: page(admin, "AdminDepartments") },
      { path: "appointments", element: page(admin, "AdminAppointments") },
      { path: "reports", element: page(admin, "AdminReports") },
      { path: "analytics", element: page(admin, "AdminAnalytics") },
      { path: "settings", element: page(admin, "AdminSettings") },
      { path: "*", element: <Navigate to="/admin" replace /> },
    ],
  },
]);
