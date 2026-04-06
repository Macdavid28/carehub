import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const schema = yup
  .object({
    name: yup.string().required("Full name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  })
  .required();

const RegisterPage = () => {
  const { register: registerUser, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    clearError();
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate("/verify-email", { state: { email: data.email } });
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-indigo-600/10 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass-card shadow-2xl shadow-indigo-200/50 p-8 md:p-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-primary-200 animate-pulse">
               <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 font-medium mt-2 text-sm leading-relaxed">
              Step into a new era of <span className="text-primary-600 font-bold">personalized healthcare</span>
            </p>
          </div>
  
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-bold border border-rose-100 shadow-sm"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
  
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                placeholder="Dr. Gregory House"
                className="rounded-2xl"
                {...register("name")}
                error={errors.name?.message}
              />
    
              <Input
                label="Email Address"
                type="email"
                placeholder="house@carehub.com"
                className="rounded-2xl"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                className="rounded-2xl"
                {...register("password")}
                error={errors.password?.message}
              />
    
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                className="rounded-2xl"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>
  
            <Button
              type="submit"
              className="w-full mt-6 hms-gradient-blue rounded-2xl py-4 text-lg font-black shadow-primary-200"
              isLoading={loading}
              size="lg"
            >
              Begin Journey
            </Button>
          </form>
  
          <div className="mt-10 text-center text-slate-500 font-medium">
            Already part of CareHub?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-black decoration-2 underline-offset-4 hover:underline transition-all"
            >
              Log in here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
