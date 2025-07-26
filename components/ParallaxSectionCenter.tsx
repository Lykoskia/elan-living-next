"use client";

import { useEffect, useRef } from "react";
import { RichText } from "@/lib/richtext";
import type { StrapiImage, StrapiRichText } from "@/lib/types/strapi";
import { getStrapiImageUrl, isRichTextEmpty } from "@/lib/types/strapi";

interface ParallaxSectionCenterProps {
  id?: number;
  __component?: string;
  image?: StrapiImage;
  quote?: StrapiRichText;
  author?: string;
}

export default function ParallaxSectionCenter({ 
  image,
  quote,
  author
}: ParallaxSectionCenterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Use utility function instead of duplicate logic
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

  // Type-safe content validation
  const hasImage = backgroundImageUrl && backgroundImageUrl !== '/placeholder.svg';
  const hasQuote = !isRichTextEmpty(quote);
  const hasAuthor = author && author.trim().length > 0;

  // Don't render if no meaningful content
  if (!hasImage && !hasQuote && !hasAuthor) {
    console.warn('ParallaxSectionCenter: No content found, not rendering component');
    return null;
  }

  const backgroundStyle = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center justify-center gap-[25px] h-[750px] md:h-[724px] w-full py-20 my-24 px-5 md:px-[180px] text-white relative"
      style={backgroundStyle}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute w-full h-full bg-black/40 top-0 left-0" />
      
      {/* Quote content - centered with larger text */}
      {hasQuote && (
        <div className="text-center z-10">
          <RichText 
            content={quote} 
            className="text-[48px] leading-10 font-serif text-white [&_p]:mb-2 [&_p]:text-white"
          />
        </div>
      )}
      
      {/* Author - centered */}
      {hasAuthor && (
        <p className="text-[16px] leading-[30px] text-center mb-[30px] z-10">
          {author}
        </p>
      )}
    </section>
  );
}