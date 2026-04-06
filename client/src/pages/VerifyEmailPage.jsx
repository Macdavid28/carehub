import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const [token, setToken] = useState(tokenFromUrl || "");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setToken(newOtp.join(""));

    // Move focus forward
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    setToken(newOtp.join(""));
    
    // Focus last filled or next empty
    const nextIndex = Math.min(data.length, 5);
    document.getElementById(`otp-${nextIndex}`)?.focus();
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!tokenFromUrl) return;
      setStatus("loading");
      try {
        const { data } = await axios.post("/auth/verify-email", {
          token: tokenFromUrl,
        });
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => {
          navigate("/login", {
            state: { message: "Email verified! You can now login." },
          });
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed");
      }
    };

    if (tokenFromUrl) {
      verifyToken();
    }
  }, [tokenFromUrl, navigate]);

  const onManualSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setStatus("loading");
    try {
      const { data } = await axios.post("/auth/verify-email", { token });
      setStatus("success");
      setMessage(data.message);
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Email verified! You can now login." },
        });
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Verification failed");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-indigo-600/10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-8 shadow-xl shadow-primary-100"></div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight animate-pulse">
            Authenticating...
          </h2>
          <p className="text-slate-400 font-medium mt-2 text-sm">Verifying your secure access token</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-indigo-600/10 pointer-events-none"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full relative z-10"
        >
          <div className="glass-card shadow-2xl shadow-emerald-200/40 p-8 text-center border-emerald-100/50">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 text-white">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Success!
            </h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{message}</p>
            <div className="space-y-4">
               <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                    className="h-full bg-emerald-500"
                  />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Redirecting to login</p>
            </div>
            <Link to="/login" className="mt-8 block">
              <Button className="w-full hms-gradient-blue rounded-2xl py-4 font-black">Manual Access</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-indigo-600/10 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full relative z-10"
      >
        <div className="glass-card shadow-2xl shadow-indigo-200/30 p-8 md:p-10 border-indigo-100/30">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-primary-200">
               <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Account</h2>
            <p className="text-slate-500 font-medium mt-2 text-sm leading-relaxed">
              Enter the <span className="text-primary-600 font-black tracking-widest">6-DIGIT</span> secure code
            </p>
          </div>
  
          {status === "error" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 text-rose-600 p-3.5 rounded-xl mb-6 flex items-center gap-3 text-xs font-bold border border-rose-100 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {message}
            </motion.div>
          )}
  
          <form onSubmit={onManualSubmit} className="space-y-8">
            <div className="flex justify-between gap-2 md:gap-3" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-full h-12 md:h-14 text-center text-xl md:text-2xl font-black text-primary-700 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary-500 focus:bg-white focus:shadow-lg focus:shadow-primary-100 transition-all outline-none"
                />
              ))}
            </div>
            <Button type="submit" className="w-full hms-gradient-blue rounded-2xl py-4 text-sm font-black shadow-primary-200 uppercase tracking-[0.2em]" size="lg">
              Unlock Portal
            </Button>
          </form>
  
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
              Missing Access Code?
            </h3>
            <div className="px-2">
               <ResendVerificationSection />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ResendVerificationSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.post("/auth/resend-verification", { email });
      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
       <form onSubmit={handleResend} className="flex gap-3">
         <Input
           type="email"
           placeholder="Confirm medical email"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           className="flex-1 rounded-xl h-12"
           required
         />
         <Button type="submit" variant="outline" className="rounded-xl px-6 border-slate-200 text-slate-500 font-bold hover:text-primary-600 h-12" isLoading={loading}>
           Request
         </Button>
       </form>
       {message && (
         <motion.div 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-xs font-bold text-emerald-600 mt-2 flex items-center justify-center gap-2"
         >
           <CheckCircle className="w-3 h-3" />
           {message}
         </motion.div>
       )}
    </div>
  );
};

export default VerifyEmailPage;
