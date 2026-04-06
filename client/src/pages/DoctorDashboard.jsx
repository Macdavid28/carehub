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
  Activity,
  Shield,
  Building,
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

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { user } = useAuthStore();

  const { data: appointments, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ["doctorAppointments", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const { data } = await axios.get("/appointments");
      return data;
    },
    enabled: !!user?._id,
  });

  const { data: departments, isLoading: isDeptsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await axios.get("/departments");
      return data;
    },
  });

  if (isAppointmentsLoading || isDeptsLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 rounded-full border-primary-100 border-t-primary-600 animate-spin"></div>
      </div>
    );

  const myDept = departments?.find(
    (d) => d._id === user?.department || d._id === user?.department?._id,
  );

  const otherDepts = departments?.filter((d) => d._id !== myDept?._id) || [];

  const today = new Date().toDateString();
  const todayAppointments =
    appointments?.filter(
      (apt) => new Date(apt.date).toDateString() === today,
    ) || [];

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "patients", label: "My Patients", icon: Users },
    { id: "departments", label: "Other Departments", icon: Building },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <div className="space-y-10 animate-in">
      {/* Clinician Header Section */}
      <div className="flex flex-col justify-between gap-8 pb-4 border-b md:flex-row md:items-end border-slate-100">
        <div>
          <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-900">
            Clinical Overview:{" "}
            <span className="text-primary-600">Dr. {user?.name}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary-100">
              <Activity className="w-3 h-3" />
              Medical Staff
            </div>
            {myDept && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <Building className="w-3 h-3" />
                Dept: {myDept.name}
              </div>
            )}
            <p className="text-sm italic font-bold text-slate-400">
              Oversight and patient management portal.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="text-xs font-black tracking-widest uppercase rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Security Vault
          </Button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* High-Precision Stats Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {[
          {
            label: "Daily Appointments",
            value: todayAppointments.length,
            icon: Calendar,
            color: "text-indigo-600",
            bg: "bg-indigo-50/50",
            border: "border-indigo-100/50",
          },
          {
            label: "Pending Requests",
            value:
              appointments?.filter((a) => a.status === "Pending").length || 0,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50/50",
            border: "border-amber-100/50",
          },
          {
            label: "Completed Rounds",
            value:
              appointments?.filter((a) => a.status === "Completed").length || 0,
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50/50",
            border: "border-emerald-100/50",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-start gap-6 relative overflow-hidden group",
              stat.border,
            )}
          >
            <div className="absolute top-0 right-0 p-10 -mt-8 -mr-8 transition-colors rounded-full bg-slate-50/50 blur-2xl group-hover:bg-slate-100/50"></div>
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm relative z-10",
                stat.bg,
                stat.color,
              )}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                {stat.label}
              </p>
              <h3 className="text-4xl font-black tracking-tighter text-slate-900">
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b bg-slate-50/50 border-slate-200">
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
                    "flex items-center m-2 px-6 py-2 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? "bg-white text-primary-600 shadow-lg shadow-slate-200/50 scale-105 ring-1 ring-slate-200"
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
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              <div className="flex flex-col gap-8 lg:flex-row">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black tracking-widest uppercase text-slate-900">
                      Upcoming Patient Visits
                    </h3>
                    <div className="w-10 h-1 rounded-full bg-primary-100"></div>
                  </div>

                  <div className="px-4 pb-4 -mx-4 overflow-x-auto sm:mx-0 sm:px-0">
                    <div className="space-y-4 min-w-[600px] md:min-w-full">
                      {appointments?.length > 0 ? (
                        appointments.slice(0, 10).map((apt) => (
                          <div
                            key={apt._id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-200 transition-all duration-300 shadow-none hover:shadow-xl hover:shadow-slate-200/50"
                          >
                            <div className="flex items-center gap-5">
                              <div className="flex items-center justify-center transition-all duration-500 bg-white border shadow-sm w-14 h-14 rounded-2xl border-slate-200 text-primary-600 group-hover:bg-primary-600 group-hover:text-white">
                                <User className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black tracking-tight text-slate-900">
                                  {apt.patient?.name}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                  <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100">
                                    <Calendar className="w-3.5 h-3.5 text-primary-500" />{" "}
                                    {format(new Date(apt.date), "MMM dd")}
                                  </span>
                                  <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100">
                                    <Clock className="w-3.5 h-3.5 text-primary-500" />{" "}
                                    {apt.time}
                                  </span>
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
                        <div className="p-20 text-center flex flex-col items-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100 font-black">
                          <div className="flex items-center justify-center w-20 h-20 mb-6 bg-white rounded-full shadow-sm text-slate-200">
                            <Calendar className="w-10 h-10" />
                          </div>
                          <p className="text-lg tracking-widest uppercase text-slate-400">
                            Schedule Clear
                          </p>
                          <p className="text-slate-300 text-[10px] mt-2 uppercase tracking-widest">
                            Review patient records to optimize clinic
                            efficiency.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "patients" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <PatientsPage scope="mine" />
            </motion.div>
          )}

          {activeTab === "departments" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                  Medical Departments
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {otherDepts.map((dept) => (
                  <div
                    key={dept._id}
                    className="flex items-center gap-4 p-6 border bg-slate-50 rounded-3xl border-slate-100"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-white shadow-sm rounded-2xl text-primary-600">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{dept.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {dept.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
                <h3 className="text-3xl font-black tracking-tight text-slate-900">
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
