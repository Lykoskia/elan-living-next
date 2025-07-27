"use client";

import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { RichText } from "@/lib/richtext";
import type { StrapiRichText, StrapiImage, StrapiLink } from "@/lib/types/strapi";
import { getStrapiImageUrl, getStrapiImageAlt, getStrapiLinkUrl } from "@/lib/types/strapi";
import { getLocalizedUrl } from "@/lib/components-registry";

export interface FeatureSectionProps {
  locale: string;
  isDefaultLocale?: boolean;
  headline?: string;
  title?: string;
  content?: StrapiRichText;
  button?: string;
  buttonLink?: StrapiLink;
  text_left?: boolean;
  image_1?: StrapiImage;
  image_2?: StrapiImage;
  overlay?: boolean;
  overlay_text?: boolean;
  overlayicon?: StrapiImage;
  overlaytitle?: string;
  overlaytext?: string;
}

export default function FeatureSection({
  locale,
  isDefaultLocale,
  headline,
  title,
  content,
  button,
  buttonLink,
  text_left = true,
  image_1,
  image_2,
  overlay = false,
  overlay_text = false,
  overlayicon,
  overlaytitle,
  overlaytext,
}: FeatureSectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '100px 0px',
    skip: false,
  });

  // Animation and layout classes
  const flexDirection = text_left ? "xl:flex-row" : "xl:flex-row-reverse";
  const justifyContent = text_left ? "justify-end" : "justify-start";

  // Use utility functions for all images
  const image1Url = getStrapiImageUrl(image_1);
  const image1Alt = getStrapiImageAlt(image_1, title || "Image");

  const image2Url = getStrapiImageUrl(image_2);
  const image2Alt = getStrapiImageAlt(image_2, title || "Secondary image");

  const iconUrl = getStrapiImageUrl(overlayicon);
  const iconAlt = getStrapiImageAlt(overlayicon, "Overlay icon");

  // Handle button link with proper fallback
  const buttonHref = getStrapiLinkUrl(buttonLink, '/');
  const linkUrl = buttonHref && buttonHref !== '/' 
    ? getLocalizedUrl(buttonHref, locale)
    : getLocalizedUrl("/contact", locale);

  const buttonText = button || buttonLink?.label;
  const shouldShowButton = buttonLink && buttonText;

  // Don't render if no primary image (excluding placeholder)
  if (!image1Url || image1Url === '/placeholder.svg') {
    console.warn('FeatureSection: No primary image found, not rendering component');
    return null;
  }

  return (
    <section
      className="relative bg-[#f7f5f2] my-12 flex flex-col w-full items-center justify-center px-[5%] md:px-[160px]"
      ref={ref}
    >
      <div
        className={`flex flex-col ${flexDirection} items-center justify-center md:gap-[26px] transition-transform duration-700 ease-out ${
          inView 
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
        style={{ 
          willChange: inView ? 'auto' : 'transform, opacity', // Performance hint
          backfaceVisibility: 'hidden', // Prevent flickering
        }}
      >
        {/* Text Content Section */}
        <div
          className={`min-w-[360px] md:w-[640px] px-[5%] md:px-[48px] py-[48px] ${
            text_left ? "md:pr-[48px]" : "md:pl-[48px]"
          } flex flex-col items-start justify-center`}
        >
          {headline && (
            <h4 className="text-[12px] leading-[16.8px] tracking-[1.3px] text-[#1f2022] uppercase">
              {headline}
            </h4>
          )}

          {title && (
            <h3 className="text-[46px] leading-[55.2px] text-[#1f2022] mt-[7px]">
              {title}
            </h3>
          )}

          {content && (
            <div className="text-[16px] leading-[32px] text-[#1f2022] mt-[43px]">
              <RichText content={content} />
            </div>
          )}

          {shouldShowButton && (
            <Link 
              href={linkUrl} 
              className="text-[12px] leading-[32px] tracking-[1px] uppercase px-[26px] py-[12px] rounded-full border-2 border-[#859b44] bg-transparent text-[#222] text-center hover:bg-[#ac7cb4] hover:border-[#ac7cb4] hover:text-white transition-all flex items-center justify-center mt-[61px]"
            >
              {buttonText}
            </Link>
          )}
        </div>

        {/* Image Section */}
        <div
          className={`w-[360px] md:w-[533px] relative flex items-center ${justifyContent}`}
        >
          <Image
            src={image1Url}
            alt={image1Alt}
            width={533}
            height={500}
            sizes="(max-width: 768px) 360px, 533px" 
            quality={80}
            priority={false}
            className="w-[360px] md:w-[533px] h-[500px] rounded-[30px] shadow-[rgba(31,32,34,0.1)_0px_60px_60px_-15px] object-cover"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7+H9v4D6v0A"
          />
          
          {/* Overlay Content */}
          {/* Show text overlay if overlay_text is true AND we have overlaytitle */}
          {overlay_text && overlaytitle ? (
            <div className="absolute bottom-[-5%] left-[-10%] lg:left-[-5%] md:top-[359px] min-w-[364px] max-w-[440px] min-h-[160px] px-[35px] py-[30px] flex flex-col items-center justify-center bg-white text-[#1f2022] rounded-[30px] shadow-[rgba(31,32,34,0.1)_0px_60px_60px_-15px]">
              <div className="w-full flex items-center justify-start gap-[15px] mb-[16px]">
                {iconUrl && iconUrl !== '/placeholder.svg' && (
                  <Image
                    src={iconUrl}
                    alt={iconAlt}
                    width={28}
                    height={32}
                    className="max-w-[28px] max-h-[32px]"
                    quality={90}
                  />
                )}
                <h4 className="text-[19px] md:text-[20px] font-sans leading-[26.4px]">
                  {overlaytitle}
                </h4>
              </div>
              {overlaytext && (
                <p className="text-[14px] md:text-[16px] font-sans leading-[26.4px] w-full py-[2px]">
                  {overlaytext}
                </p>
              )}
            </div>
          ) : (
            image2Url && image2Url !== '/placeholder.svg' && (
              <Image
                src={image2Url}
                alt={image2Alt}
                width={300}
                height={300}
                sizes="300px"
                quality={80}
                className="absolute bottom-[-7.5%] left-[-10%] w-[300px] h-[300px] rounded-[30px] shadow-[rgba(31,32,34,0.1)_0px_60px_60px_-15px] object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7+H9v4D6v0A"
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}