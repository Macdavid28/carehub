import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages (Placeholders for now)
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DoctorDetailsPage from "./pages/DoctorDetailsPage";
import PatientDetailsPage from "./pages/PatientDetailsPage";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ProfilePage from "./pages/ProfilePage";

// Public layout or Shared layout
import Layout from "./components/Layout";

const queryClient = new QueryClient();

import { Toaster } from "react-hot-toast";

// ... (existing imports)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/patients" element={<PatientsPage />} />
              <Route
                path="/admin/patients/:id"
                element={<PatientDetailsPage />}
              />
              <Route path="/admin/doctors" element={<DoctorsPage />} />
              <Route
                path="/admin/doctors/:id"
                element={<DoctorDetailsPage />}
              />
              <Route path="/admin/departments" element={<DepartmentsPage />} />
              <Route
                path="/admin/appointments"
                element={<AppointmentsPage />}
              />
              <Route path="/admin/profile" element={<ProfilePage />} />
            </Route>

            {/* Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/patients" element={<PatientsPage />} />
              <Route
                path="/doctor/patients/:id"
                element={<PatientDetailsPage />}
              />
              <Route
                path="/doctor/appointments"
                element={<AppointmentsPage />}
              />
              <Route path="/doctor/profile" element={<ProfilePage />} />
            </Route>

            {/* Patient Routes */}
            <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/doctors" element={<DoctorsPage />} />
              <Route
                path="/patient/doctors/:id"
                element={<DoctorDetailsPage />}
              />
              <Route
                path="/patient/appointments"
                element={<AppointmentsPage />}
              />
              <Route path="/patient/profile" element={<ProfilePage />} />
            </Route>

            {/* Shared/Common Routes or Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
