import React from "react";
import { cn } from "../../lib/utils";

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "dock" | "card" | "pill" | "subtle";
  glow?: boolean;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className,
  variant = "card",
  glow = false,
  ...props
}) => {
  const variantStyles = {
    dock: "rounded-2xl bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03]",
    card: "rounded-3xl bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_48px_rgba(15,23,42,0.1)] transition-all duration-300",
    pill: "rounded-full bg-white/75 backdrop-blur-md border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
    subtle: "rounded-2xl bg-slate-50/60 backdrop-blur-lg border border-slate-200/60 shadow-xs"
  };

  return (
    <div
      className={cn(
        "relative transition-all overflow-hidden",
        variantStyles[variant],
        glow && "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-tr before:from-blue-500/10 before:via-transparent before:to-indigo-500/10 before:pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Specular highlight border sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export const LiquidGlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }> = ({
  children,
  className,
  active = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        "relative px-4 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 flex items-center gap-2",
        "backdrop-blur-md border border-white/60",
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border-blue-500 font-semibold"
          : "bg-white/60 hover:bg-white/90 text-slate-700 hover:text-slate-900 shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
