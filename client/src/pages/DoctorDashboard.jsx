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
import PatientsPage from "./PatientsPage";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

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
    <div className="space-y-10 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Welcome back, <span className="text-primary-600">Dr. {user?.name}</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Ready to make a difference in your patients' lives today?</p>
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
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Today's Appointments", value: todayAppointments.length, icon: Calendar, color: "bg-indigo-50 text-indigo-600", border: "border-indigo-100" },
          { label: "Pending Requests", value: appointments?.filter((a) => a.status === "Pending").length || 0, icon: Clock, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
          { label: "Completed Visits", value: appointments?.filter((a) => a.status === "Completed").length || 0, icon: Users, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("premium-card p-8 flex flex-col items-start gap-4", stat.border)}
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", stat.color)}>
               <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

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
          {activeTab === "overview" && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-10"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                      Upcoming Patient Visits
                    </h3>
                    <div className="w-10 h-1 bg-primary-100 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-4">
                    {appointments?.length > 0 ? (
                      appointments.slice(0, 10).map((apt) => (
                        <div
                          key={apt._id}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-100 transition-all duration-300 shadow-none hover:shadow-xl hover:shadow-slate-200/50"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[1.2rem] bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                               <User className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-lg">
                                {apt.patient?.name}
                              </h4>
                              <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(apt.date), "MMM dd")}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.time}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 sm:mt-0">
                            <AppointmentActions
                              appointment={apt}
                              userRole="doctor"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-20 text-center flex flex-col items-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                           <Calendar className="w-10 h-10" />
                        </div>
                        <p className="text-slate-400 font-bold text-lg">Your schedule is clear today.</p>
                        <p className="text-slate-300 text-sm mt-1">Excellent time to catch up on medical records.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Side info or Mini profile card could go here */}
              </div>
            </motion.div>
          )}

          {activeTab === "patients" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <PatientsPage scope="mine" />
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
                      Medical Profile
                   </h3>
                </div>
                <div className="px-2">
                   <EditDoctorProfileForm />
                </div>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DoctorDashboard;
