import React from "react";
import { cn } from "../../lib/utils";

interface VintagePaperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "journal" | "stamp" | "postcard" | "classic";
  stampText?: string;
}

export const VintagePaper: React.FC<VintagePaperProps> = ({
  children,
  className,
  variant = "journal",
  stampText,
  ...props
}) => {
  const variantStyles = {
    journal: "bg-[#fdfbf7] text-[#2c2825] border border-[#e8dfd3] shadow-[0_10px_30px_rgba(60,50,40,0.06)] rounded-3xl",
    stamp: "bg-[#faf6f0] text-[#332e29] border-2 border-dashed border-[#d5c7b3] shadow-md rounded-2xl",
    postcard: "bg-[#fffefb] text-[#24211e] border border-[#ebe3d5] shadow-lg rounded-2xl",
    classic: "bg-[#f7f3eb] text-[#1f1d1a] border border-[#ded4c3] shadow-sm rounded-xl"
  };

  return (
    <div
      className={cn(
        "relative p-6 sm:p-8 transition-all overflow-hidden font-sans",
        variantStyles[variant],
        className
      )}
      style={{
        backgroundImage: `radial-gradient(#e5dcce 0.75px, transparent 0.75px)`,
        backgroundSize: "18px 18px"
      }}
      {...props}
    >
      {/* Top Deckle Border Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-700/20 via-amber-600/30 to-amber-700/20" />

      {/* Decorative Vintage Passport Stamp Badge */}
      {stampText && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none select-none">
          <div className="rotate-12 border-2 border-amber-800/40 text-amber-900/60 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-50/50 backdrop-blur-xs font-bold">
            ✈ {stampText}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export const VintageJournalHeading: React.FC<{
  title: string;
  subtitle?: string;
  badge?: string;
}> = ({ title, subtitle, badge }) => {
  return (
    <div className="border-b border-[#e2d7c5] pb-4 mb-6">
      {badge && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
          {badge}
        </span>
      )}
      <h3 className="font-serif text-2xl font-bold text-[#2a241e] tracking-tight mt-1">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-[#706456] font-medium mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
};
