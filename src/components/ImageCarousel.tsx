'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number; // ms
  showArrows?: boolean;
  showDots?: boolean;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'hero'; // 'video' = 16:9, 'square' = 1:1, 'portrait' = 3:4, 'hero' = 3:1
  className?: string;
  objectFit?: 'cover' | 'contain';
}

const aspectRatioClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  hero: 'aspect-[3/1]',
};

export default function ImageCarousel({
  images,
  alt = '图片',
  autoPlay = true,
  autoPlayInterval = 4000,
  showArrows = true,
  showDots = true,
  aspectRatio = 'video',
  className = '',
  objectFit = 'cover',
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Filter valid images - use useMemo to ensure consistent reference
  const validImages = useMemo(() => 
    images.filter(img => img && img.trim() !== ''),
    [images]
  );
  const imageCount = validImages.length;

  // Hooks: Auto play
  useEffect(() => {
    if (!autoPlay || imageCount <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % imageCount);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, imageCount]);

  // Hooks: Reset index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  // Hooks: Navigation callbacks
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % imageCount);
  }, [imageCount]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + imageCount) % imageCount);
  }, [imageCount]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Don't render if no valid images - render placeholder after all hooks
  if (imageCount === 0) {
    return (
      <div className={`relative ${aspectRatioClasses[aspectRatio]} bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span>暂无图片</span>
        </div>
      </div>
    );
  }

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left, go next
      goToNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right, go prev
      goToPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Fullscreen viewer
  const FullscreenViewer = () => (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <button
        onClick={() => setIsFullscreen(false)}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToPrev}
        className="absolute left-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      
      <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
        <Image
          src={validImages[currentIndex]}
          alt={`${alt} - ${currentIndex + 1}`}
          fill
          className={`object-${objectFit}`}
          unoptimized
        />
      </div>
      
      <button
        onClick={goToNext}
        className="absolute right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {currentIndex + 1} / {imageCount}
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2">
        {validImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => goToIndex(idx)}
            className={`relative w-16 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
              idx === currentIndex ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`relative ${aspectRatioClasses[aspectRatio]} bg-gray-900 rounded-lg overflow-hidden ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        <div className="relative w-full h-full">
          {validImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-500 ${
                idx === currentIndex ? 'opacity-100 z10' : 'opacity-0 z0'
              }`}
            >
              <Image
                src={img}
                alt={`${alt} - ${idx + 1}`}
                fill
                className={`object-${objectFit}`}
                priority={idx === 0}
                unoptimized
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-20" />

        {/* Arrows */}
        {showArrows && imageCount > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-30 opacity-0 group-hover:opacity-100 focus:opacity-100"
              style={{ opacity: 1 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-30 opacity-0 group-hover:opacity-100 focus:opacity-100"
              style={{ opacity: 1 }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded transition-colors z-30"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Dots */}
        {showDots && imageCount > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Image counter (mobile) */}
        {imageCount > 1 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full z-30 md:hidden">
            {currentIndex + 1}/{validImages.length}
          </div>
        )}
      </div>

      {/* Fullscreen viewer */}
      {isFullscreen && <FullscreenViewer />}
    </>
  );
}
