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
import { cn } from "../lib/utils";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Welcome back, <span className="text-primary-600">{user?.name?.split(" ")[0]}!</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Empowering your health journey every day.</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 text-slate-600 hover:text-primary-600"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Security
          </Button>
          <Button 
            className="rounded-2xl hms-gradient-blue shadow-lg shadow-primary-200"
            onClick={() => setIsModalOpen(true)}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Book Visit
          </Button>
        </div>
      </div>

      {/* Quick Stats & Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-8 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
               <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">My Health Key</h2>
            <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">Quick overview of your vital information.</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Type</span>
              <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-xl font-black text-sm">
                {user?.bloodGroup || "Not set"}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Appointment</span>
              <span className="font-black text-primary-600 text-sm">
                {appointments?.[0]
                  ? format(new Date(appointments[0].date), "MMM dd")
                  : "None"}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 hms-gradient-blue rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary-200"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="max-w-md">
              <h2 className="text-4xl font-black mb-4 leading-tight">Connect with Top Specialists</h2>
              <p className="text-primary-100 text-lg font-medium opacity-90 leading-relaxed mb-8">
                Your health deserves the best care. Schedule a consultation with our world-class medical team.
              </p>
            </div>
            <Link to="/patient/doctors" className="w-fit">
              <Button
                variant="secondary"
                className="bg-white text-primary-700 hover:bg-primary-50 px-8 py-4 rounded-2xl font-black text-base shadow-xl shadow-black/10 active:scale-95"
              >
                Search Doctors <Calendar className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Detailed Tabs Section */}
      <div className="premium-card p-0 overflow-hidden !rounded-[3rem]">
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
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  )}
                >
                  <Icon
                    className={cn("w-4 h-4 mr-2.5 transition-transform duration-300", isActive ? "scale-110 text-primary-500" : "text-slate-300")}
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
                          <p className="text-sm font-bold text-slate-400">{apt.reason}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-base">
                            {format(new Date(apt.date), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{apt.time}</p>
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
                    <p className="text-slate-400 font-bold text-lg">No upcoming consultations found.</p>
                    <p className="text-slate-300 text-sm mt-2">Book an appointment to get started.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "prescriptions" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <Prescriptions />
            </motion.div>
          )}
          {activeTab === "records" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
