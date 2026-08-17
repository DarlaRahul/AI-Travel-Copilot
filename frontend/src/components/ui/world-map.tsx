import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapRoute {
  start: MapPoint;
  end: MapPoint;
}

interface WorldMapProps {
  dots?: MapRoute[];
  lineColor?: string;
  className?: string;
  title?: string;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  dots = [],
  lineColor = "#3b82f6",
  className,
  title = "Live Route Intelligence",
}) => {
  // Equirectangular projection mapping (lat: -90 to 90 -> y: 100% to 0%, lng: -180 to 180 -> x: 0% to 100%)
  const project = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  // Generate continuous world continent grid dots
  const gridDots = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let lat = -60; lat <= 75; lat += 7.5) {
      for (let lng = -170; lng <= 175; lng += 9) {
        // Approximate major landmasses filter to create an authentic dotted world continent silhouette
        const isLand =
          // Americas
          (lng > -165 && lng < -35 && lat > -55 && lat < 70 && !(lng > -110 && lng < -40 && lat < 10 && lat > -5)) ||
          // Eurasia & Africa
          (lng > -20 && lng < 180 && lat > -35 && lat < 72) ||
          // Australia
          (lng > 110 && lng < 155 && lat > -42 && lat < -10);

        if (isLand) {
          const pt = project(lat, lng);
          pts.push(pt);
        }
      }
    }
    return pts;
  }, []);

  return (
    <div className={cn("relative w-full aspect-[2/1] rounded-3xl bg-slate-950 p-4 overflow-hidden border border-slate-800 shadow-2xl", className)}>
      {/* Background glow & subtle radar scan */}
      <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Header Info */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">{title}</span>
        {dots.length > 0 && (
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
            {dots.length} Active {dots.length === 1 ? "Route" : "Routes"}
          </span>
        )}
      </div>

      <svg
        viewBox="0 0 800 400"
        className="w-full h-full select-none"
        style={{ filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.1))" }}
      >
        {/* Continent Background Dots */}
        <g opacity="0.3">
          {gridDots.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="1.2"
              fill="#64748b"
            />
          ))}
        </g>

        {/* Dynamic Animated Flight Curves */}
        {dots.map((route, idx) => {
          const startPt = project(route.start.lat, route.start.lng);
          const endPt = project(route.end.lat, route.end.lng);

          // Bezier control point for natural great-circle curve
          const midX = (startPt.x + endPt.x) / 2;
          const dist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);
          const midY = (startPt.y + endPt.y) / 2 - Math.min(dist * 0.35, 80);

          const pathD = `M ${startPt.x} ${startPt.y} Q ${midX} ${midY} ${endPt.x} ${endPt.y}`;

          return (
            <g key={`route-${idx}`}>
              {/* Glowing Background Path */}
              <path
                d={pathD}
                fill="none"
                stroke={lineColor}
                strokeWidth="3"
                strokeOpacity="0.2"
                strokeLinecap="round"
              />

              {/* Animated Foreground Flight Line */}
              <motion.path
                d={pathD}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.5,
                }}
              />

              {/* Start Point Marker */}
              <g transform={`translate(${startPt.x}, ${startPt.y})`}>
                <circle r="6" fill={lineColor} fillOpacity="0.2" className="animate-ping" />
                <circle r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                {route.start.label && (
                  <text
                    y="-8"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontWeight="600"
                    className="select-none shadow-xs"
                  >
                    {route.start.label}
                  </text>
                )}
              </g>

              {/* End Point Marker */}
              <g transform={`translate(${endPt.x}, ${endPt.y})`}>
                <circle r="6" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
                <circle r="3.5" fill="#34d399" stroke="#ffffff" strokeWidth="1" />
                {route.end.label && (
                  <text
                    y="-8"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontWeight="600"
                    className="select-none shadow-xs"
                  >
                    {route.end.label}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
