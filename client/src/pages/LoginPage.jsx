import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { AlertCircle, LogIn } from "lucide-react";
import { motion } from "framer-motion";

const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

const LoginPage = () => {
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/"; // Redirect to where they came from

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
      const response = await login(data.email, data.password);
      const userRole = response.user?.role;

      // Redirect based on role or 'from'
      // If 'from' is login or root, verify role redirect
      if (from === "/" || from === "/login") {
        if (userRole === "admin") navigate("/admin/dashboard");
        else if (userRole === "doctor") navigate("/doctor/dashboard");
        else navigate("/patient/dashboard");
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover bg-slate-50 p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-indigo-600/10 pointer-events-none"></div>

      {/* Decorative Blur Elements */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary-200/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full relative z-10"
      >
        <div className="glass-card shadow-2xl shadow-indigo-200/50 p-6 sm:p-10">
          <div className="text-center mb-6 sm:mb-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 sm:mb-6 shadow-xl shadow-primary-200 group transition-all duration-500">
              <LogIn className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Portal Entry
            </h2>
            <p className="text-slate-500 font-medium mt-2 text-sm">
              Access your{" "}
              <span className="text-primary-600 font-bold">
                Health Dashboard
              </span>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 sm:mb-8 flex items-center gap-3 text-sm font-bold border border-rose-100 shadow-sm"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="doctor@carehub.com"
              className="rounded-2xl"
              {...register("email")}
              error={errors.email?.message}
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                className="rounded-2xl"
                {...register("password")}
                error={errors.password?.message}
              />
              <div className="flex justify-end pr-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4 sm:mt-6 hms-gradient-blue rounded-2xl py-4 text-lg font-black shadow-primary-200"
              isLoading={loading}
              size="lg"
            >
              Login
            </Button>
          </form>

          <div className="mt-2 sm:mt-2 text-center text-slate-500 font-medium border-t border-slate-100 pt-6 sm:pt-8">
            New to CareHub?{" "}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-black decoration-2 underline-offset-4 hover:underline transition-all"
            >
              Join us today
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
