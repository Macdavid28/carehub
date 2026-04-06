import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import EditPatientProfileForm from "../components/forms/EditPatientProfileForm";
import EditDoctorProfileForm from "../components/forms/EditDoctorProfileForm";
import { User, Shield } from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-10 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-black uppercase tracking-widest leading-none">
                Identity Profile
             </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium mt-2">
            Configure your personal information and secure access preferences.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Shield className="w-6 h-6" />
           </div>
           <div className="pr-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Level</p>
              <p className="text-sm font-black text-slate-900">High Protection</p>
           </div>
        </div>
      </div>

      <div className="premium-card p-0 overflow-hidden !rounded-[2.5rem]">
        <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary-600">
              <User className="w-6 h-6" />
           </div>
           <div>
              <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
              <p className="text-xs font-bold text-slate-400">Basic details for your medical profile</p>
           </div>
        </div>
        
        <div className="p-8 md:p-12">
          {user.role === "patient" && (
            <EditPatientProfileForm />
          )}

          {user.role === "doctor" && (
            <EditDoctorProfileForm />
          )}

          {user.role === "admin" && (
            <div className="text-slate-500 font-medium">
              Admin profiles are managed by system configuration.
              <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p>Name: <span className="text-slate-900 font-black">{user.name}</span></p>
                <p>Email: <span className="text-slate-900 font-black">{user.email}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
