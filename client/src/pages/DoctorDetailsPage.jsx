import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../services/api";
// import useAuthStore from "../store/useAuthStore";
import Button from "../components/ui/Button";
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Clock, 
  Award, 
  Briefcase, 
  Star,
  Stethoscope
} from "lucide-react";
import { motion } from "framer-motion";

const DoctorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        <p className="text-rose-600">Could not fetch doctor details. Please try again later.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      {/* Premium Doctor Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/30 border border-slate-100 overflow-hidden"
      >
        <div className="h-56 md:h-80 bg-[url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-indigo-800/60 to-primary-600/40 backdrop-blur-[2px]"></div>
          <div className="absolute top-6 left-6 z-10">
            <Button
              variant="ghost"
              className="text-white bg-black/10 hover:bg-white/20 backdrop-blur-md rounded-xl"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        <div className="px-6 md:px-12 pb-10">
          <div className="relative flex flex-col items-center md:items-end md:flex-row -mt-20 md:-mt-32 mb-6 gap-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] bg-white p-2 shadow-2xl z-20 border-[6px] border-white ring-1 ring-slate-100"
            >
              <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-indigo-50 to-primary-50 flex items-center justify-center text-primary-700 font-black text-5xl md:text-7xl shadow-inner uppercase">
                {doctor.name.charAt(0)}
              </div>
            </motion.div>

            <div className="flex-1 text-center md:text-left pb-2">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-4">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                  {doctor.name}
                </h1>
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black border border-amber-100 uppercase tracking-widest shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  Top Rated
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 mt-2">
                 <div className="text-lg font-bold text-primary-600 bg-primary-50 px-4 py-1 rounded-xl border border-primary-100">
                    {doctor.specialization}
                 </div>
                 <div className="text-slate-400 font-medium tracking-tight border-l-2 border-slate-100 pl-4">
                    {doctor.qualification}
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
               <Button className="hms-gradient-blue rounded-2xl py-6 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-200 group">
                  Book Priority Access
                  <motion.span 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-2"
                  >→</motion.span>
               </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Clinical Profile */}
        <div className="lg:col-span-2 space-y-10">
          <div className="premium-card p-10 bg-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-16 bg-primary-50/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                  <Stethoscope className="w-6 h-6" />
               </div>
               Clinical Expertise & Vision
             </h3>
             
             <p className="text-slate-600 leading-relaxed text-xl font-medium mb-10 relative z-10 italic">
               "{doctor.about ||
                `Dr. ${doctor.name} is a renowned healthcare leader in ${doctor.specialization}. With over ${doctor.experience} years of clinical excellence, they specialize in transformative patient care and advanced medical protocols.`}"
             </p>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
               <div className="glass-card bg-slate-50/50 border-slate-200 p-6 flex flex-col justify-center gap-2 group hover:bg-white transition-all">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Medical Tenure</span>
                  <span className="text-4xl font-black text-slate-900">
                    {doctor.experience}<span className="text-primary-600">+</span> <span className="text-sm font-bold text-slate-400">Years</span>
                  </span>
               </div>
               <div className="glass-card bg-slate-50/50 border-slate-200 p-6 flex flex-col justify-center gap-2 group hover:bg-white transition-all">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Patient Satisfaction</span>
                  <span className="text-4xl font-black text-slate-900">
                    4.9<span className="text-amber-500">★</span> <span className="text-sm font-bold text-slate-400">Avg</span>
                  </span>
               </div>
             </div>
          </div>

          {/* Additional Capabilities Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="premium-card p-8 bg-white border-t-8 border-primary-500 shadow-primary-100">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                   <Award className="w-5 h-5 text-primary-500" />
                   Certifications
                </h4>
                <ul className="space-y-4">
                   {["Board Certified Specialist", "Fellow of Royal Medicine", "Research Publication Lead"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600 font-bold text-sm bg-slate-50 p-3 rounded-xl">
                         <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                         {item}
                      </li>
                   ))}
                </ul>
             </div>

             <div className="premium-card p-8 bg-white border-t-8 border-indigo-500 shadow-indigo-100">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                   <Briefcase className="w-5 h-5 text-indigo-500" />
                   Practice Focus
                </h4>
                <ul className="space-y-4">
                   {["Advanced Diagnostics", "Chronic Disease Mgmt", "Emergency Consultation"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600 font-bold text-sm bg-indigo-50 p-3 rounded-xl border border-indigo-100/50">
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                         {item}
                      </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>

        {/* Clinical Operations Sidebar */}
        <div className="space-y-8">
          <div className="premium-card p-8 bg-white ring-1 ring-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Calendar className="w-4 h-4" />
               </div>
               Weekly Session Map
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-8">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const isAvailable = doctor.availableDays?.some(d => d.includes(day) || d === day);
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{day.charAt(0)}</span>
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all
                        ${isAvailable 
                          ? "bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110" 
                          : "bg-slate-100 text-slate-300"
                        }
                    `}>
                      {isAvailable ? "ON" : "OFF"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-500">
                     <Clock className="w-5 h-5" />
                     <span className="text-xs font-black uppercase tracking-widest leading-none">Session Start</span>
                  </div>
                  <span className="font-black text-slate-900">{doctor.availableTimeStart}</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3 text-indigo-600">
                     <Clock className="w-5 h-5" />
                     <span className="text-xs font-black uppercase tracking-widest leading-none">Session End</span>
                  </div>
                  <span className="font-black text-indigo-900">{doctor.availableTimeEnd}</span>
               </div>
            </div>
          </div>

          {/* Secure Communication Card */}
          <div className="hms-gradient-teal p-8 rounded-[3rem] shadow-2xl shadow-emerald-200/50 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 p-20 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-none mb-1">Clinic Access</h3>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest opacity-60">Secure Credentials</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 font-black text-sm tracking-wide text-center">
                {doctor.email}
              </div>
              
              <p className="text-xs font-medium mt-6 text-emerald-100 italic opacity-80 leading-relaxed text-center">
                Automated reminders for your scheduled sessions will be delivered to this verified mailbox.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsPage;
