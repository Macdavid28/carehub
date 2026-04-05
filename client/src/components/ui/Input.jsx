import { forwardRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(({ className, label, error, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={isPasswordType ? (showPassword ? "text" : "password") : type}
          className={cn(
            "flex h-11 w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500",
            isPasswordType && "pr-12",
            className,
          )}
          ref={ref}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 ml-1 text-xs font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
