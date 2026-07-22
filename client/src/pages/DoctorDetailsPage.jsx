import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
import useAuthStore from "../store/useAuthStore";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import DoctorForm from "../components/forms/DoctorForm";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Award,
  Briefcase,
  Star,
  Stethoscope,
  Edit,
} from "lucide-react";
import { motion } from "framer-motion";

const DoctorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: doctor,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const { data } = await axios.get(`/doctors/${id}`);
      return data;
    },
  });

  if (isLoading)
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100 mx-auto max-w-2xl mt-10">
        <h3 className="text-xl font-bold text-rose-900 mb-2">Network Error</h3>
        <p className="text-rose-600">
          Could not fetch doctor details. Please try again later.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      {/* Premium Doctor Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="h-40 md:h-56 bg-[url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-indigo-800/60 to-primary-600/40 backdrop-blur-[2px]"></div>
          <div className="absolute top-4 left-4 z-10 flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white bg-black/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back
            </Button>
            {user?.role === "admin" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white bg-primary-600/50 hover:bg-primary-600 backdrop-blur-md rounded-xl text-xs"
                onClick={() => setIsModalOpen(true)}
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 md:px-8 pb-6">
          <div className="relative flex flex-col items-center md:items-end md:flex-row -mt-16 md:-mt-24 mb-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white p-1.5 shadow-xl z-20 border-4 border-white ring-1 ring-slate-100"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-primary-50 flex items-center justify-center text-primary-700 font-black text-3xl md:text-5xl shadow-inner uppercase">
                {doctor.name?.replace(/^Dr\.\s*/i, "").charAt(0)}
              </div>
            </motion.div>

            <div className="flex-1 text-center md:text-left pb-1">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-2.5 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {doctor.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`}
                </h1>
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-100 tracking-widest shadow-sm">
                  <Star className="w-3 h-3 fill-amber-400" />
                  Top Rated
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-1">
                <div className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                  {doctor.specialization}
                </div>
                <div className="text-xs text-slate-500 font-medium border-l-2 border-slate-100 pl-3">
                  {doctor.qualification}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button size="sm" className="hms-gradient-blue rounded-xl py-2.5 px-4 font-bold text-xs shadow-md shadow-primary-200 group">
                Book Priority Access
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-1.5 inline-block"
                >
                  →
                </motion.span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Clinical Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-6 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 bg-primary-50/20 rounded-full blur-2xl -mr-12 -mt-12"></div>

            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                <Stethoscope className="w-5 h-5" />
              </div>
              Clinical Expertise & Vision
            </h3>

            <p className="text-slate-600 leading-relaxed text-sm font-medium mb-6 relative z-10 italic">
              "
              {doctor.about ||
                `${doctor.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`} is a renowned healthcare leader in ${doctor.specialization}. With over ${doctor.experience} years of clinical excellence, they specialize in transformative patient care and advanced medical protocols.`}
              "
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <div className="glass-card bg-slate-50/50 border-slate-200 p-4 flex flex-col justify-center gap-1 group hover:bg-white transition-all">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                  Medical Tenure
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {doctor.experience}
                  <span className="text-primary-600">+</span>{" "}
                  <span className="text-xs font-bold text-slate-400">
                    Years
                  </span>
                </span>
              </div>
              <div className="glass-card bg-slate-50/50 border-slate-200 p-4 flex flex-col justify-center gap-1 group hover:bg-white transition-all">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                  Patient Satisfaction
                </span>
                <span className="text-2xl font-black text-slate-900">
                  4.9<span className="text-amber-500">★</span>{" "}
                  <span className="text-xs font-bold text-slate-400">Avg</span>
                </span>
              </div>
            </div>
          </div>

          {/* Additional Capabilities Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="premium-card p-6 bg-white border-t-4 border-primary-500 shadow-primary-100">
              <h4 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-500" />
                Certifications
              </h4>
              <ul className="space-y-2">
                {[
                  "Board Certified Specialist",
                  "Fellow of Royal Medicine",
                  "Research Publication Lead",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-slate-600 font-bold text-xs bg-slate-50 p-2.5 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="premium-card p-6 bg-white border-t-4 border-indigo-500 shadow-indigo-100">
              <h4 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                Practice Focus
              </h4>
              <ul className="space-y-2">
                {[
                  "Advanced Diagnostics",
                  "Chronic Disease Mgmt",
                  "Emergency Consultation",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-slate-600 font-bold text-xs bg-indigo-50 p-2.5 rounded-lg border border-indigo-100/50"
                  >
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Clinical Operations Sidebar */}
        <div className="space-y-6">
          <div className="premium-card p-6 bg-white ring-1 ring-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              Weekly Session Map
            </h3>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-6">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const isAvailable = doctor.availableDays?.some(
                  (d) => d.includes(day) || d === day,
                );
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">
                      {day.charAt(0)}
                    </span>
                    <div
                      className={`
                        w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all
                        ${
                          isAvailable
                            ? "bg-primary-600 text-white shadow-md shadow-primary-200 scale-105"
                            : "bg-slate-100 text-slate-300"
                        }
                    `}
                    >
                      {isAvailable ? "ON" : "OFF"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 min-w-0">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider leading-none truncate">
                    Session Start
                  </span>
                </div>
                <span className="font-black text-xs text-slate-900 shrink-0 ml-2">
                  {doctor.availableTimeStart}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-600 min-w-0">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider leading-none truncate">
                    Session End
                  </span>
                </div>
                <span className="font-black text-xs text-indigo-900 shrink-0 ml-2">
                  {doctor.availableTimeEnd}
                </span>
              </div>
            </div>
          </div>

          {/* Secure Communication Card */}
          <div className="hms-gradient-teal p-6 rounded-3xl shadow-xl shadow-emerald-200/50 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 p-16 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/30 shadow-md shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-lg tracking-tight leading-none mb-1 truncate">
                    Clinic Access
                  </h3>
                  <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest opacity-70 truncate">
                    Secure Credentials
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 font-bold text-xs tracking-wide text-center break-all overflow-hidden text-ellipsis">
                {doctor.email}
              </div>

              <p className="text-[11px] font-medium mt-4 text-emerald-100 italic opacity-85 leading-relaxed text-center">
                Automated reminders for your scheduled sessions will be
                delivered to this verified mailbox.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Edit Doctor Profile"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <DoctorForm
          onSuccess={() => setIsModalOpen(false)}
          initialData={doctor}
        />
      </Modal>
    </div>
  );
};

export default DoctorDetailsPage;
