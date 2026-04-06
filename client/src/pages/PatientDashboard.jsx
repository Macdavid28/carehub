import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import {
  Calendar,
  FolderPlus,
  Lock,
  Pill,
  FileText,
  User,
  Shield,
  Activity,
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
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

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

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-10 animate-in">
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
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

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-primary-600 hover:bg-primary-50"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button
            className="rounded-xl hms-gradient-blue shadow-xl shadow-primary-200/50 font-black text-xs uppercase tracking-[0.2em] px-8"
            onClick={() => setIsModalOpen(true)}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Book Consult
          </Button>
        </div>
      </div>

      {/* High-Impact Clinical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 bg-primary-50/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-100/30 transition-colors"></div>

          <div className="relative z-10 font-black">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-8 shadow-xl relative overflow-hidden group-hover:bg-primary-600 transition-colors duration-500">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                <Activity className="w-6 h-6" />
              </motion.div>
              <div className="absolute inset-0 bg-primary-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              Clinical Identity
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              Live Tracking Active
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-200/60">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Blood Group
              </span>
              <span className="text-xl font-black text-rose-600">
                {user?.bloodGroup && user.bloodGroup !== "Not set"
                  ? user.bloodGroup
                  : "—"}
              </span>
            </div>
            <div className="p-5 bg-slate-900 rounded-2xl text-white">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">
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
          className="lg:col-span-2 hms-gradient-blue rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-primary-200 group"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:scale-110 transition-transform duration-[2000ms]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                  Network Status: Active
                </span>
              </div>
              <h2 className="text-3xl xl:text-5xl font-black mb-6 leading-[1.1] tracking-tighter">
                Accelerate Your <br />
                <span className="text-white/60">Recovery Path.</span>
              </h2>
              <p className="text-primary-50 text-lg font-medium leading-relaxed mb-10 opacity-80 max-w-lg">
                Gain instant access to our network of premier medical
                specialists and advanced diagnostic protocols.
              </p>
            </div>
            <Link to="/patient/doctors" className="w-fit">
              <Button
                variant="secondary"
                className="bg-white text-primary-900 hover:bg-slate-50 px-4 sm:px-10 py-3 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl shadow-black/20 active:scale-95 transition-all"
              >
                Discover Specialists{" "}
                <Calendar className="ml-3 w-5 h-5 text-primary-500" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Detailed Tabs Section */}
      {/* <div className="premium-card p-0 overflow-hidden !rounded-[3rem]">
        <div className="bg-slate-50/50 border-b border-slate-100 p-3">
          <nav className="flex gap-2" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center px-6 py-3.5 text-sm font-bold rounded-[1.5rem] transition-all duration-300",
                    isActive
                      ? "bg-white text-primary-600 shadow-xl shadow-slate-200/50 scale-105"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 mr-2.5 transition-transform duration-300",
                      isActive
                        ? "scale-110 text-primary-500"
                        : "text-slate-300",
                    )}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8 md:p-12">
          {activeTab === "appointments" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black text-slate-900">
                  Upcoming Consultations
                </h3>
                <div className="w-10 h-1 bg-primary-100 rounded-full"></div>
              </div>

              <div className="space-y-4">
                {appointments?.length > 0 ? (
                  appointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-100 transition-all duration-300 shadow-none hover:shadow-xl hover:shadow-slate-200/50"
                    >
                      <div className="flex items-center gap-5 mb-4 sm:mb-0">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg">
                            Dr. {apt.doctor?.name}
                          </h4>
                          <p className="text-sm font-bold text-slate-400">
                            {apt.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-base">
                            {format(new Date(apt.date), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {apt.time}
                          </p>
                        </div>
                        <AppointmentActions
                          appointment={apt}
                          userRole="patient"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                      <Calendar className="w-10 h-10" />
                    </div>
                    <p className="text-slate-400 font-bold text-lg">
                      No upcoming consultations found.
                    </p>
                    <p className="text-slate-300 text-sm mt-2">
                      Book an appointment to get started.
                    </p>
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
                <h3 className="text-3xl font-black text-slate-900">
                  Security & Profile
                </h3>
              </div>
              <div className="px-2">
                <EditPatientProfileForm />
              </div>
            </motion.div>
          )}
        </div>
      </div> */}
      <div className="premium-card p-0 overflow-hidden !rounded-[3rem]">
        <div className="bg-slate-50/50 border-b border-slate-100 p-3">
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
                    "flex items-center px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold rounded-[1.5rem] transition-all duration-300 whitespace-nowrap min-h-[44px]",
                    isActive
                      ? "bg-white text-primary-600 shadow-xl shadow-slate-200/50 scale-105"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 mr-2.5 transition-transform duration-300",
                      isActive
                        ? "scale-110 text-primary-500"
                        : "text-slate-300",
                    )}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 sm:p-8 md:p-12">
          {activeTab === "appointments" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Upcoming Consultations
                </h3>
                <div className="w-10 h-1 bg-primary-100 rounded-full"></div>
              </div>

              <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="space-y-4 min-w-[600px] md:min-w-full">
                  {appointments?.length > 0 ? (
                    appointments.map((apt) => (
                      <div
                        key={apt._id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-100 transition-all duration-300 shadow-none hover:shadow-xl hover:shadow-slate-200/50"
                      >
                        <div className="flex items-center gap-4 sm:gap-5 mb-4 sm:mb-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                            <User className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-base sm:text-lg text-slate-900">
                              Dr. {apt.doctor?.name}
                            </h4>
                            <p className="text-xs sm:text-sm font-bold text-slate-400">
                              {apt.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                          <div className="text-left sm:text-right">
                            <p className="font-black text-slate-900 text-sm sm:text-base">
                              {format(new Date(apt.date), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {apt.time}
                            </p>
                          </div>
                          <AppointmentActions
                            appointment={apt}
                            userRole="patient"
                          />
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
      </div>
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

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
