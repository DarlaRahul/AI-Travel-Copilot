import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function Carousel07<T>({
  items,
  renderItem,
  className,
  autoPlay = false,
  autoPlayInterval = 6000,
}: CarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = () => {
    setCurrentIndex((curr) => (curr === 0 ? Math.max(items.length - 1, 0) : curr - 1));
  };

  const next = () => {
    setCurrentIndex((curr) => (curr === items.length - 1 ? 0 : curr + 1));
  };

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const interval = setInterval(next, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative w-full group select-none", className)}>
      {/* Cards Viewport */}
      <div className="overflow-hidden rounded-3xl" ref={containerRef}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full shrink-0 px-1">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            type="button"
            aria-label="Previous item"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#fffefb]/90 backdrop-blur-md border border-[#e3d6c1] shadow-lg flex items-center justify-center text-[#221c17] hover:bg-[#fffefb] hover:border-[#c25e38]/50 transition opacity-80 group-hover:opacity-100 z-20"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <button
            onClick={next}
            type="button"
            aria-label="Next item"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#fffefb]/90 backdrop-blur-md border border-[#e3d6c1] shadow-lg flex items-center justify-center text-[#221c17] hover:bg-[#fffefb] hover:border-[#c25e38]/50 transition opacity-80 group-hover:opacity-100 z-20"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        </>
      )}

      {/* Indicator Pills */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentIndex === i ? "w-6 bg-[#c25e38]" : "w-1.5 bg-[#e3d6c1] hover:bg-[#c88842]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
