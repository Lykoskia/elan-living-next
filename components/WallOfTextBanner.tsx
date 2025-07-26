"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { RichText } from "@/lib/richtext";
import { getLocalizedUrl } from '@/lib/components-registry';
import type { StrapiImage, StrapiLink, StrapiRichText } from "@/lib/types/strapi";
import { getStrapiImageUrl, getStrapiImageAlt } from "@/lib/types/strapi";
import { Spinner } from "./Spinner";

interface WallOfTextBannerProps {
  locale: string;
  caption: string;
  content: StrapiRichText;
  button?: string;
  buttonLink?: StrapiLink;
  image?: StrapiImage;
}

export default function WallOfTextBanner({
  locale,
  caption,
  content,
  button,
  buttonLink,
  image
}: WallOfTextBannerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use centralized utility functions
  const imageUrl = getStrapiImageUrl(image, '/placeholder.svg');
  const imageAlt = getStrapiImageAlt(image, caption || 'Banner image');

  // Handle image events
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
  };

  // Localized URL with proper fallback
  const linkUrl = buttonLink?.href || buttonLink?.url
    ? getLocalizedUrl(buttonLink.href || buttonLink.url || '/contact', locale)
    : getLocalizedUrl('/contact', locale);

  // Only render image if we have a real URL (not placeholder)
  const hasImage = imageUrl !== '/placeholder.svg';

  return (
    <section className="relative w-full flex flex-col items-center justify-center my-[48px]">
      <div className="w-full h-[600px] relative">
        {/* Show loading state while image loads */}
        {hasImage && !imageLoaded && !imageError && (
          <Spinner />
        )}

        {/* Show error state if image fails to load */}
        {hasImage && imageError && (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            <p className="text-gray-600">Image could not be loaded</p>
          </div>
        )}

        {/* The actual image with proper error handling */}
        {hasImage && (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className={`w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            sizes="100vw"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Caption overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-center text-[50px] md:text-[80px] font-serif mx-[20px]">
            {caption}
          </p>
        </div>
      </div>

      {/* Content section */}
      <div className="text-[14px] lg:text-[16px] leading-[29.7px] my-[30px] xl:mx-[240px] max-w-80 md:max-w-96 lg:max-w-2xl xl:max-w-4xl 2xl:max-w-7xl">
        <RichText content={content} />
      </div>

      {/* Button */}
      {button && button.length !== 0 && (
        <Link
          href={linkUrl}
          className="text-[12px] leading-[32px] tracking-[1px] uppercase px-[26px] py-[12px] rounded-full border-2 border-elangreen bg-transparent text-[#222] text-center hover:bg-elanpurple hover:border-elanpurple hover:text-white transition-all flex items-center justify-center mt-[61px]"
        >
          {button}
        </Link>
      )}
    </section>
  );
}