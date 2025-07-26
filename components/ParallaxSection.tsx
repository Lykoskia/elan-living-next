"use client";

import { useEffect, useRef } from "react";
import { RichText } from "@/lib/richtext";
import type { StrapiImage, StrapiRichText } from "@/lib/types/strapi";
import { getStrapiImageUrl, isRichTextEmpty } from "@/lib/types/strapi";

interface ParallaxSectionProps {
  id?: number;
  __component?: "shared.parallax-section";
  image?: StrapiImage;
  quote?: StrapiRichText;
  author?: string;
}

export default function ParallaxSection({ 
  image,
  quote,
  author
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Use utility function instead of custom logic
  const backgroundImageUrl = getStrapiImageUrl(image);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && backgroundImageUrl && backgroundImageUrl !== '/placeholder.svg') {
          (entry.target as HTMLElement).style.backgroundImage = `url(${backgroundImageUrl})`;
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0.01,
    });

    if (sectionElement) {
      observer.observe(sectionElement);
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
    };
  }, [backgroundImageUrl]);

  // Don't render if no meaningful content
  const hasImage = backgroundImageUrl && backgroundImageUrl !== '/placeholder.svg';
  const hasQuote = !isRichTextEmpty(quote);
  const hasAuthor = author && author.trim().length > 0;

  if (!hasImage && !hasQuote && !hasAuthor) {
    console.warn('ParallaxSection: No content found, not rendering component');
    return null;
  }

  const backgroundStyle = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  // Type-safe quote rendering
  const renderQuote = () => {
    if (!hasQuote) return null;
    
    return (
      <div className="text-right z-10">
        <RichText 
          content={quote} 
          className="text-[33px] leading-[33px] font-serif text-white [&_p]:text-white [&_p]:mb-0"
        />
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-end justify-center gap-[25px] h-[750px] md:h-[724px] w-full py-20 my-24 px-5 md:px-[180px] text-white relative"
      style={backgroundStyle}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute w-full h-full bg-black/40 top-0 left-0" />
      
      {/* Quote content */}
      {hasQuote && renderQuote()}
      
      {/* Author */}
      {hasAuthor && (
        <p className="text-[15px] leading-10 text-right mb-[30px] z-10">
          {author}
        </p>
      )}
    </section>
  );
}