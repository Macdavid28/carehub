import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const [token, setToken] = useState(tokenFromUrl || "");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          Verifying your email...
        </h2>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <p className="text-sm text-gray-500 mb-4">Redirecting to login...</p>
          <Link to="/login">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit verification code sent to your email
          </p>
        </div>

        {status === "error" && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle className="w-4 h-4" />
            {message}
          </div>
        )}

        <form onSubmit={onManualSubmit} className="space-y-4">
          <Input
            label="Verification Code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. 123456"
            maxLength={6}
          />
          <Button type="submit" className="w-full" size="lg">
            Verify Account
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Didn't receive the code?
          </h3>
          <ResendVerificationSection />
        </div>
      </div>
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
    <form onSubmit={handleResend} className="flex gap-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        required
      />
      <Button type="submit" variant="outline" isLoading={loading}>
        Resend
      </Button>
      {message && (
        <p className="text-xs text-green-600 mt-1 absolute">{message}</p>
      )}
    </form>
  );
};

export default VerifyEmailPage;
