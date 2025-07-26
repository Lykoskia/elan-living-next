'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { RichText } from "@/lib/richtext";
import type { StrapiRichTextNode } from "@/lib/types/strapi";

// Type definitions for Strapi content
interface StrapiButtonLink {
  id: string;
  href: string;
  label: string;
  isExternal?: boolean;
  isButtonLink?: boolean;
  type?: string;
}

// This is the shape of data when AboutCard is used in a dynamic zone
interface AboutCardProps {
  id?: number;
  __component?: string;
  headline: string;
  title: string;
  text: StrapiRichTextNode[];
  button?: boolean;
  buttonLink?: StrapiButtonLink;
}

export default function AboutCard({
  headline,
  title,
  text,
  button,
  buttonLink
}: AboutCardProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.01
      }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Validate required fields
  if (!headline || !title || !text) {
    console.error('AboutCard: Missing required fields (headline, title, or text)', {
      headline,
      title,
      text
    });
    return null;
  }

  // Determine button URL and label
  const buttonUrl = buttonLink?.href || '/';
  const buttonLabel = buttonLink?.label || '';

  return (
    <section ref={cardRef} className="flex w-full items-center justify-center px-2 md:px-[160px] py-[200px] my-[48px]">
      {isVisible && (
        <div className="flex w-full flex-col items-center justify-center rounded-[30px] bg-[#ac7cb4] px-[50px] pb-[113px] md:pb-[117px] pt-[70px] text-white">
          <h4 className="text-[12px] leading-[16.8px] tracking-[1.3px] uppercase mb-2">
            {headline}
          </h4>
          <h3 className="mt-[5px] md:px-[20%] text-center font-serif text-[34px] md:text-[46px] leading-[38.76px] md:leading-[52.44px]">
            {title}
          </h3>
          <div className="mt-[47px] text-center text-[14px] md:text-[16px] leading-[28px] md:leading-[32px] text-white">
            <RichText 
              content={text} 
              className="[&_p]:mb-4 [&_p]:text-white [&_a]:underline [&_a]:hover:text-gray-200"
            />
          </div>
          {button && buttonLink && buttonLabel && (
            <div className="my-12">
              <Link 
                href={buttonUrl}
                target={buttonLink?.isExternal ? "_blank" : undefined}
                className="text-[12px] leading-[42px] tracking-[1px] uppercase w-[213px] h-[66px] rounded-full bg-white text-[#222] text-center hover:bg-elangreen hover:text-white transition-all flex items-center justify-center"
              >
                {buttonLabel}
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}