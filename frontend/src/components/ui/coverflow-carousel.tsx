import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CoverflowItem {
  id: string | number;
  title: string;
  subtitle?: string;
  country?: string;
  image: string;
  rating?: number;
  badge?: string;
  cost?: string;
  data?: any;
}

interface CoverflowCarouselProps {
  items: CoverflowItem[];
  activeIndex?: number;
  onSelect?: (item: CoverflowItem, index: number) => void;
  className?: string;
  aspectRatio?: string;
}

export const CoverflowCarousel: React.FC<CoverflowCarouselProps> = ({
  items,
  activeIndex: controlledIndex,
  onSelect,
  className,
  aspectRatio = "aspect-[16/10]"
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Sync internal index if controlled
  useEffect(() => {
    if (controlledIndex !== undefined && controlledIndex >= 0 && controlledIndex < items.length) {
      setInternalIndex(controlledIndex);
    }
  }, [controlledIndex, items.length]);

  const handleSelect = (index: number) => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, index));
    setInternalIndex(safeIndex);
    if (onSelect && items[safeIndex]) {
      onSelect(items[safeIndex], safeIndex);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex > 0) {
      handleSelect(activeIndex - 1);
    } else {
      handleSelect(items.length - 1); // loop
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex < items.length - 1) {
      handleSelect(activeIndex + 1);
    } else {
      handleSelect(0); // loop
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (containerRef.current && containerRef.current.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!items || items.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn("relative w-full overflow-hidden select-none outline-none py-6", className)}
      style={{ perspective: "1000px" }}
    >
      {/* 3D Carousel Stage */}
      <div className="relative h-[340px] sm:h-[380px] w-full flex items-center justify-center">
        {items.map((item, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isCenter = offset === 0;

          // Limit rendering depth for performance & clean aesthetic
          if (absOffset > 3) return null;

          // Compute 3D transforms for authentic Coverflow perspective
          const translateX = offset * 180; // horizontal separation
          const translateZ = -absOffset * 140; // depth
          const rotateY = offset === 0 ? 0 : offset > 0 ? -38 : 38; // perspective angle
          const scale = isCenter ? 1 : Math.max(0.75, 1 - absOffset * 0.12);
          const zIndex = 50 - absOffset;
          const opacity = isCenter ? 1 : Math.max(0.4, 1 - absOffset * 0.25);

          return (
            <div
              key={item.id || index}
              onClick={() => handleSelect(index)}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
                transition: "all 500ms cubic-bezier(0.25, 1, 0.5, 1)"
              }}
              className={cn(
                "absolute top-0 w-[260px] sm:w-[320px] md:w-[360px] cursor-pointer group",
                isCenter ? "cursor-default" : "hover:opacity-90"
              )}
            >
              {/* Card Surface with Vintage Paper Border */}
              <div className="bg-[#fffefb] rounded-3xl border border-[#e3d6c1] overflow-hidden shadow-lg shadow-[#221c17]/10 flex flex-col">
                {/* Image Container */}
                <div className={cn("relative w-full overflow-hidden bg-[#f5eee2]", aspectRatio)}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#221c17]/90 via-[#221c17]/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {item.badge ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fffefb]/90 text-[#c25e38] px-2.5 py-1 rounded-full shadow-xs font-mono">
                        {item.badge}
                      </span>
                    ) : item.country ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#221c17]/70 text-[#fffefb] px-2.5 py-1 rounded-full font-mono backdrop-blur-xs">
                        {item.country}
                      </span>
                    ) : <span />}

                    {item.rating && (
                      <div className="bg-[#fffefb]/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-[#221c17] flex items-center gap-1 shadow-xs font-mono">
                        <span className="text-[#c88842]">★</span>
                        <span>{item.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Image Overlay Text */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h4 className="font-bold text-lg sm:text-xl leading-tight font-serif drop-shadow-sm">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className="text-xs text-[#e3d6c1] line-clamp-1 mt-0.5 font-sans">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action Strip */}
                <div className="p-3.5 bg-[#fffefb] flex items-center justify-between border-t border-[#e3d6c1]/60">
                  {item.cost ? (
                    <div>
                      <span className="text-[10px] text-[#998c7e] block uppercase font-mono">Est. Budget</span>
                      <span className="text-xs font-extrabold text-[#c25e38] font-mono">{item.cost}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-[#695e52] font-mono">Curated Getaway</span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(index);
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 font-serif",
                      isCenter 
                        ? "bg-[#c25e38] text-white shadow-sm shadow-[#c25e38]/20" 
                        : "bg-[#f5eee2] text-[#221c17] hover:bg-[#eae0cf]"
                    )}
                  >
                    <span>{isCenter ? "Explore Now" : "Select"}</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows & Dot Indicators */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={handlePrev}
          aria-label="Previous destination"
          className="w-10 h-10 rounded-full bg-[#fffefb] border border-[#e3d6c1] text-[#221c17] hover:bg-[#f5eee2] hover:border-[#c25e38] shadow-xs flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicator dots */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5eee2] border border-[#e3d6c1]/70">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                idx === activeIndex
                  ? "w-6 bg-[#c25e38]"
                  : "w-2 bg-[#d1c2ab] hover:bg-[#998c7e]"
              )}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next destination"
          className="w-10 h-10 rounded-full bg-[#fffefb] border border-[#e3d6c1] text-[#221c17] hover:bg-[#f5eee2] hover:border-[#c25e38] shadow-xs flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
