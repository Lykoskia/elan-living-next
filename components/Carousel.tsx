"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { StrapiImage, getStrapiImageUrl, getStrapiImageAlt } from "@/lib/types/strapi";

interface CarouselProps {
  id?: number;
  __component?: "shared.carousel";
  slide1text?: string;
  slide1image?: StrapiImage;
  slide2text?: string;
  slide2image?: StrapiImage;
  interval?: number;
  locale?: string;
  isDefaultLocale?: boolean;
}

interface Slide {
  text: string;
  image: string | null;
  alt: string;
}

export default function Carousel({ 
  slide1text, 
  slide1image, 
  slide2text, 
  slide2image, 
  interval = 3000
}: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const carouselRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tick = setInterval(() => {
      setActiveIndex((current) => (current === 0 ? 1 : 0));
    }, interval);

    return () => clearInterval(tick);
  }, [interval]);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0.01,
    });

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  // Use utility functions instead of custom logic
  const slide1ImageUrl = getStrapiImageUrl(slide1image);
  const slide2ImageUrl = getStrapiImageUrl(slide2image);

  // Create slides array (preserving original order: slide2 first, slide1 second)
  const slides: Slide[] = [
    {
      text: slide2text || "",
      image: slide2ImageUrl !== '/placeholder.svg' ? slide2ImageUrl : null,
      alt: getStrapiImageAlt(slide2image, slide2text || "Slide 2")
    },
    {
      text: slide1text || "",
      image: slide1ImageUrl !== '/placeholder.svg' ? slide1ImageUrl : null,
      alt: getStrapiImageAlt(slide1image, slide1text || "Slide 1")
    },
  ];

  // Don't render if no slides have images
  const hasImages = slides.some(slide => slide.image !== null);
  if (!hasImages) {
    console.warn('Carousel: No images found, not rendering component');
    return null;
  }

  return (
    <section ref={carouselRef} className="relative w-full h-[600px] overflow-hidden my-24">
      {slides.map((slide, index) => {
        // Skip slides without images
        if (!slide.image) return null;
        
        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-transform duration-1000 ${
              activeIndex === index 
                ? "translate-x-0" 
                : index === 0 
                ? "translate-x-full" 
                : "-translate-x-full"
            }`}
          >
            {isVisible && (
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="w-full h-full object-cover"
                priority={index === activeIndex} // Prioritize loading the active slide
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white font-serif text-[45px] lg:text-[80px] px-12 md:px-24 xl:px-60 text-left">
                {slide.text}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}