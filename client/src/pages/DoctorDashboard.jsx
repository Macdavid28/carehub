import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import {
  Calendar,
  Clock,
  Lock,
  LayoutDashboard,
  Users,
  User,
} from "lucide-react";
import { format } from "date-fns";
import ChangePasswordModal from "../components/ChangePasswordModal";
import Button from "../components/ui/Button";
import AppointmentActions from "../components/AppointmentActions";
import useAuthStore from "../store/useAuthStore";
import EditDoctorProfileForm from "../components/forms/EditDoctorProfileForm";
import PatientsPage from "./PatientsPage"; // Reusing the PatientsPage (if it exists) or we build a simpler list here directly.
// Ideally, we just render the PatientsPage component if the route matches, but since we are doing tabs in dashboard:
// Let's create a local PatientList specific for "My Patients" if needed,
// OR just link to the main /doctor/patients route.
// However, user requested "Edit Profile in... Doctor Dashboard".
// So let's add tabs here.

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { user } = useAuthStore();
  // Reusing stats API but filtering or using specific doctor stats if backend supports
  // For now, simpler dashboard focusing on appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["doctorAppointments", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const { data } = await axios.get("/appointments");
      return data;
    },
    enabled: !!user?._id,
  });

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  const today = new Date().toDateString();
  const todayAppointments =
    appointments?.filter(
      (apt) => new Date(apt.date).toDateString() === today,
    ) || [];

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "patients", label: "My Patients", icon: Users },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, Dr. {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500">Manage your practice.</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="border-b border-gray-100 overflow-x-auto">
          <nav className="flex space-x-1 p-4" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                                flex items-center px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap
                                ${
                                  activeTab === tab.id
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }
                            `}
                >
                  <Icon
                    className={`w-4 h-4 mr-2 ${activeTab === tab.id ? "text-primary-600" : "text-gray-400"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium">
                    Today's Appointments
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {todayAppointments.length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium">
                    Pending Requests
                  </h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {appointments?.filter((a) => a.status === "Pending")
                      .length || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 font-medium">Completed Total</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {appointments?.filter((a) => a.status === "Completed")
                      .length || 0}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    Upcoming Appointments
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {appointments?.length > 0 ? (
                    appointments.slice(0, 5).map((apt) => (
                      <div
                        key={apt._id}
                        className="p-6 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                            {apt.patient?.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {apt.patient?.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(apt.date), "MMM dd, yyyy")}
                              <Clock className="w-4 h-4 ml-2" />
                              {apt.time}
                            </div>
                          </div>
                        </div>
                        <AppointmentActions
                          appointment={apt}
                          userRole="doctor"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No appointments found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "patients" && <PatientsPage />}

          {activeTab === "profile" && <EditDoctorProfileForm />}
        </div>
      </div>
    </div>
  );
};
export default DoctorDashboard;
