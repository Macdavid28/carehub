import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import {
  Calendar,
  Clock,
  FolderPlus,
  Lock,
  Pill,
  FileText,
  User,
  Shield,
  Activity,
  Stethoscope,
} from "lucide-react";
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
import { cn, formatDoctorName } from "../lib/utils";
import { motion } from "framer-motion";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
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

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await axios.get("/doctors");
      return data;
    },
  });

  const tabs = [
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "doctors", label: "Doctors & Specialists", icon: Stethoscope },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "records", label: "Medical Records", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-8 animate-in">
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Salutations,{" "}
            <span className="text-primary-600">
              {user?.name?.split(" ")[0]}!
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <Shield className="w-3 h-3" />
              Verified Patient
            </div>
            <p className="text-slate-400 font-bold text-sm italic">
              Tracking your recovery with precision.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            className="rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-primary-600 hover:bg-primary-50"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button
            className="rounded-xl hms-gradient-blue shadow-lg shadow-primary-200/50 font-black text-xs uppercase tracking-widest px-6"
            onClick={() => setIsModalOpen(true)}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Book Consult
          </Button>
        </div>
      </div>

      {/* Balanced Clinical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 bg-primary-50/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-100/30 transition-colors"></div>

          <div className="relative z-10 font-black">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white mb-6 shadow-md relative overflow-hidden group-hover:bg-primary-600 transition-colors duration-500">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                <Activity className="w-5 h-5" />
              </motion.div>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-1 tracking-tight">
              Clinical Identity
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
              Live Tracking Active
            </p>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Blood Group
              </span>
              <span className="text-lg font-black text-rose-600">
                {user?.bloodGroup && user.bloodGroup !== "Not set"
                  ? user.bloodGroup
                  : "—"}
              </span>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl text-white">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Next Scheduled Event
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">
                  {appointments?.[0]
                    ? format(new Date(appointments[0].date), "MMMM dd")
                    : "No Upcoming Visits"}
                </span>
                {appointments?.[0] && (
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 hms-gradient-blue rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-primary-200/40 group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 blur-3xl group-hover:scale-110 transition-transform duration-[2000ms]"></div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Network Status: Active
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black mb-4 leading-tight tracking-tight">
                Accelerate Your Recovery Path
              </h2>
              <p className="text-primary-50 text-sm font-medium leading-relaxed mb-6 opacity-85 max-w-lg">
                Gain instant access to our network of premier medical
                specialists and advanced diagnostic protocols.
              </p>
            </div>
            <Button
              variant="secondary"
              className="w-fit bg-white text-primary-900 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all"
              onClick={() => setActiveTab("doctors")}
            >
              Discover Specialists{" "}
              <Stethoscope className="ml-2 w-4 h-4 text-primary-500" />
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="premium-card p-0 overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
        <div className="bg-slate-50/50 border-b border-slate-100 p-2 sm:p-3">
          <nav
            className="flex gap-2 overflow-x-auto no-scrollbar"
            aria-label="Tabs"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? "bg-white text-primary-600 shadow-md shadow-slate-200/50"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 mr-2 transition-transform duration-300",
                      isActive ? "text-primary-500" : "text-slate-300",
                    )}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === "appointments" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Upcoming Consultations
                </h3>
                <div className="w-10 h-1 bg-primary-100 rounded-full"></div>
              </div>

              <div className="overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
                <div className="space-y-4 min-w-[580px]">
                  {appointments?.length > 0 ? (
                    appointments.map((apt) => (
                      <div
                        key={apt._id}
                        className="group flex items-center justify-between gap-4 p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 transition-all duration-300 shadow-none hover:shadow-md"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-slate-900 text-sm sm:text-base truncate">
                              {formatDoctorName(apt.doctor?.name)}
                            </h4>
                            <p className="text-xs font-medium text-slate-400 truncate">
                              {apt.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                          <div className="text-right shrink-0">
                            <div className="flex items-center justify-end gap-1.5 font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                              <span>{format(new Date(apt.date), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{apt.time}</span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <AppointmentActions
                              appointment={apt}
                              userRole="patient"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 sm:p-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                        <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                      <p className="text-slate-400 font-bold text-base sm:text-lg">
                        No upcoming consultations found.
                      </p>
                      <p className="text-slate-300 text-sm mt-2">
                        Book an appointment to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "doctors" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Medical Specialists & Consultants
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    Select a doctor to book your consultation directly
                  </p>
                </div>
                <div className="w-10 h-1 bg-primary-100 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors && doctors.length > 0 ? (
                  doctors.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-primary-300 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-slate-900 text-sm sm:text-base truncate">
                            {formatDoctorName(doc.name)}
                          </h4>
                          <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] font-bold uppercase tracking-wider border border-primary-100">
                            {doc.specialization || "Specialist"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        {doc.department?.name && (
                          <p className="text-slate-500 font-medium truncate">
                            <span className="font-bold text-slate-700">Dept:</span> {doc.department.name}
                          </p>
                        )}
                        {doc.contact && (
                          <p className="text-slate-500 font-medium truncate">
                            <span className="font-bold text-slate-700">Contact:</span> {doc.contact}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="w-full hms-gradient-blue rounded-xl font-bold text-xs uppercase tracking-widest"
                        onClick={() => {
                          setSelectedDoctorId(doc._id);
                          setIsModalOpen(true);
                        }}
                      >
                        Book Consult <Calendar className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-400 text-sm font-medium">
                    No medical specialists registered at this time.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "prescriptions" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Prescriptions />
            </motion.div>
          )}

          {activeTab === "records" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <MedicalRecords />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-1.5 h-10 bg-primary-600 rounded-full"></div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Security & Profile
                </h3>
              </div>
              <div className="px-2">
                <EditPatientProfileForm />
              </div>
            </motion.div>
          )}
        </div>

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />

        <Modal
          title={selectedDoctorId ? "Book Appointment with Specialist" : "Book Consult"}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDoctorId(null);
          }}
        >
          <AppointmentForm
            preselectedDoctorId={selectedDoctorId}
            onSuccess={() => {
              setIsModalOpen(false);
              setSelectedDoctorId(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default PatientDashboard;
