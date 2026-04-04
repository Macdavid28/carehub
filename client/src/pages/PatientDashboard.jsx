import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import { Calendar, FolderPlus, Lock, Pill, FileText, User } from "lucide-react";
import { format } from "date-fns";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import AppointmentForm from "../components/forms/AppointmentForm";
import AppointmentActions from "../components/AppointmentActions";
import useAuthStore from "../store/useAuthStore";
import Prescriptions from "../components/Prescriptions";
import MedicalRecords from "../components/MedicalRecords";
import { Link } from "react-router-dom";
import EditPatientProfileForm from "../components/forms/EditPatientProfileForm";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { user } = useAuthStore();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["patientAppointments", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const { data } = await axios.get("/appointments");
      return data;
    },
    enabled: !!user?._id,
  });

  const tabs = [
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "records", label: "Medical Records", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500">Manage your health and appointments.</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Blood Group</span>
              <span className="font-bold text-gray-900">
                {user?.bloodGroup || "Not set"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Next Appointment</span>
              <span className="font-bold text-primary-600">
                {appointments?.[0]
                  ? format(new Date(appointments[0].date), "MMM dd")
                  : "None"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-primary-500 rounded-xl shadow-sm p-6 text-white bg-gradient-to-br from-primary-400 to-primary-600">
          <h2 className="text-xl font-bold mb-2">Find a Doctor</h2>
          <p className="text-primary-50 mb-6">
            Search for specialists and book your consultation today.
          </p>
          <Link to="/patient/doctors">
            <Button
              variant="secondary"
              className="w-full bg-white text-primary-600 hover:bg-primary-50"
            >
              Search Doctors
            </Button>
          </Link>
        </div>
      </div>

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
          {activeTab === "appointments" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Upcoming Appointments
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {appointments?.length > 0 ? (
                  appointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    >
                      <div className="mb-2 sm:mb-0">
                        <h4 className="font-medium text-gray-900">
                          Dr. {apt.doctor?.name}
                        </h4>
                        <p className="text-sm text-gray-500">{apt.reason}</p>
                      </div>
                      <div className="text-left sm:text-right flex items-center gap-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(apt.date), "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">{apt.time}</p>
                        </div>
                        <AppointmentActions
                          appointment={apt}
                          userRole="patient"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No appointments history.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && <Prescriptions />}
          {activeTab === "records" && <MedicalRecords />}
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Profile Settings
              </h3>
              <EditPatientProfileForm />
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Book Appointment"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <AppointmentForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default PatientDashboard;
