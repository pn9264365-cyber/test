import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;

    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl select-none cursor-col-resize group touch-none"
      onMouseDown={() => isDragging.current = true}
      onTouchStart={() => isDragging.current = true}
      onMouseUp={() => isDragging.current = false}
      onTouchEnd={() => isDragging.current = false}
      onMouseLeave={() => isDragging.current = false}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Before Image (Background) */}
      <img 
        src={beforeImage} 
        alt="Original Room" 
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full pointer-events-none">
        Original
      </div>

      {/* After Image (Foreground - Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ 
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
        }}
      >
        <img 
          src={afterImage} 
          alt="New Design" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full pointer-events-none shadow-sm">
          AI Design
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-lg pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 md:w-8 md:h-8 bg-white rounded-full shadow-xl flex items-center justify-center text-stone-600 pointer-events-auto cursor-grab active:cursor-grabbing">
           <div className="flex gap-0.5">
             <ChevronLeft className="w-4 h-4 md:w-3 md:h-3" />
             <ChevronRight className="w-4 h-4 md:w-3 md:h-3" />
           </div>
        </div>
      </div>
    </div>
  );
};