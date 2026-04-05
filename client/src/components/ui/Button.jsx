import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const Button = ({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  ...props
}) => {
  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200/40 hover:shadow-primary-300/60 active:scale-[0.98]",
    secondary:
      "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200/40 hover:shadow-teal-300/60 active:scale-[0.98]",
    outline:
      "border-2 border-slate-200 text-slate-700 bg-white hover:border-primary-200 hover:bg-primary-50 active:scale-[0.98]",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
    danger:
      "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200/40 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
