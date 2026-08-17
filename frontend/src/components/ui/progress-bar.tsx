import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ProgressBarProps {
  value: number; // Current value (e.g. 64000)
  max?: number;  // Max value (e.g. 80000)
  label?: string;
  sublabel?: string;
  color?: "terracotta" | "gold" | "emerald" | "voyager" | "rose" | "blue";
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  color = "terracotta",
  showPercentage = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / (max || 1)) * 100, 0), 100);

  const colorGradients: Record<string, string> = {
    terracotta: "from-[#c25e38] to-[#c88842]",
    gold: "from-[#c88842] to-[#d97706]",
    emerald: "from-[#3b7a57] to-[#4e9b70]",
    voyager: "from-[#2a475e] to-[#3d6585]",
    rose: "from-[#c2410c] to-[#e11d48]",
    blue: "from-[#2a475e] to-[#c25e38]",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-[#221c17]">
            {label && <span className="font-serif font-bold text-[#221c17]">{label}</span>}
            {sublabel && <span className="text-[#998c7e] font-medium text-[11px]">{sublabel}</span>}
          </div>
          {showPercentage && (
            <span className="text-[#221c17] font-bold font-mono tabular-nums text-xs">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#f5eee2] border border-[#e3d6c1] p-0.5 shadow-inner">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r shadow-xs", colorGradients[color] || colorGradients.terracotta)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
