import React, { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Home,
  Compass,
  CalendarDays,
  Building2,
  Plane,
  Globe2,
  Bot,
  Wallet,
  UserCircle2,
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface DockItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

export const DEFAULT_DOCK_ITEMS: DockItem[] = [
  { title: "Home", icon: Home, href: "/dashboard" },
  { title: "Explore", icon: Globe2, href: "/explore" },
  { title: "Flights", icon: Plane, href: "/flights" },
  { title: "Hotels", icon: Building2, href: "/hotels" },
  { title: "Planner", icon: Compass, href: "/planner" },
  { title: "Itinerary", icon: CalendarDays, href: "/itinerary/1" },
  { title: "Budget", icon: Wallet, href: "/budget" },
  { title: "Assistant", icon: Bot, href: "/assistant" },
  { title: "Profile", icon: UserCircle2, href: "/profile" },
];

export const FloatingDock = ({
  items = DEFAULT_DOCK_ITEMS,
  className,
}: {
  items?: DockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      className={cn(
        "fixed left-1/2 -translate-x-1/2 bottom-6 z-[1000] pointer-events-auto",
        className
      )}
    >
      {/* Desktop / Tablet Liquid Glass Dock */}
      <motion.nav
        aria-label="Main Floating Navigation"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="hidden sm:flex h-16 md:h-18 gap-2.5 items-end rounded-full liquid-glass-dock px-4 pb-2.5 shadow-2xl transition-all duration-300"
      >
        {items.map((item) => (
          <DockIconContainer mouseX={mouseX} key={item.title} {...item} />
        ))}
      </motion.nav>

      {/* Mobile Compact Centered Dock */}
      <nav
        aria-label="Mobile Floating Navigation"
        className="flex sm:hidden h-14 items-center gap-1.5 rounded-full liquid-glass-dock px-3 py-1.5 shadow-2xl max-w-[95vw] overflow-x-auto no-scrollbar"
      >
        {items.map((item) => {
          return <MobileDockItem key={item.title} {...item} />;
        })}
      </nav>
    </div>
  );
};

function DockIconContainer({
  mouseX,
  title,
  icon: Icon,
  href,
}: {
  mouseX: any;
  title: string;
  icon: React.ElementType;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isActive = location.pathname === href || (href !== "/dashboard" && location.pathname.startsWith(href));

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-130, 0, 130], [42, 58, 42]);
  const heightTransform = useTransform(distance, [-130, 0, 130], [42, 58, 42]);
  const iconSizeTransform = useTransform(distance, [-130, 0, 130], [18, 26, 18]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 160, damping: 14 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 160, damping: 14 });
  const iconSize = useSpring(iconSizeTransform, { mass: 0.1, stiffness: 160, damping: 14 });

  const [hovered, setHovered] = useState(false);

  return (
    <Link to={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c25e38] rounded-full">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "aspect-square rounded-full flex items-center justify-center relative transition-all duration-200",
          isActive
            ? "bg-[#c25e38] text-[#fffefb] shadow-lg shadow-[#c25e38]/30 ring-2 ring-[#c25e38]/40"
            : "bg-[#f5eee2]/80 text-[#695e52] hover:bg-[#eae0cf] hover:text-[#221c17] border border-[#e3d6c1]/60"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 4, x: "-50%" }}
              className="px-3 py-1 whitespace-pre rounded-lg bg-[#221c17] text-[#fffefb] absolute left-1/2 -top-9 -translate-x-1/2 text-[11px] font-bold tracking-wide shadow-xl pointer-events-none z-50 border border-[#4a3e35]"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          style={{ width: iconSize, height: iconSize }}
          className="flex items-center justify-center"
        >
          <Icon className="h-full w-full stroke-[2.2]" />
        </motion.div>

        {isActive && (
          <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#c25e38]" />
        )}
      </motion.div>
    </Link>
  );
}

function MobileDockItem({
  title,
  icon: Icon,
  href,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
}) {
  const location = useLocation();
  const isActive = location.pathname === href || (href !== "/dashboard" && location.pathname.startsWith(href));

  return (
    <Link
      to={href}
      title={title}
      className={cn(
        "h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition-all",
        isActive
          ? "bg-[#c25e38] text-white shadow-md shadow-[#c25e38]/30 ring-1 ring-[#c25e38]"
          : "bg-[#f5eee2]/80 text-[#695e52] hover:text-[#221c17] border border-[#e3d6c1]/50"
      )}
    >
      <Icon className="h-4 w-4 stroke-[2.2]" />
    </Link>
  );
}
