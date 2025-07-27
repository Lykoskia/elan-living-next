'use client';

import Image from "next/image";
import Link from "next/link";
import { RichText } from "@/lib/richtext";
import type { StrapiImage, StrapiLink, StrapiRichText } from "@/lib/types/strapi";
import { getStrapiImageUrl, getStrapiImageAlt, getStrapiLinkUrl } from "@/lib/types/strapi";
import { useState } from 'react';

// Props when used in dynamic zone
interface HeroSectionFlatProps {
  id?: number;
  __component?: string;
  headline: string;
  title: string;
  content: StrapiRichText;
  button?: string;
  buttonLink?: StrapiLink;
  image: StrapiImage;
}

export default function HeroSectionFlat({
  headline,
  title,
  content,
  button,
  buttonLink,
  image
}: HeroSectionFlatProps) {
  const [imageError, setImageError] = useState(false);

  // Validate required fields
  if (!headline || !title || !image) {
    console.error('HeroSectionFlat: Missing required fields', {
      headline,
      title,
      content,
      image
    });
    return null;
  }

  // Use centralized utility functions
  const imageUrl = getStrapiImageUrl(image, '/default-image.jpg');
  const imageAlt = getStrapiImageAlt(image, title || 'Hero image');

  // Use utility function for link handling
  const buttonUrl = getStrapiLinkUrl(buttonLink, '/');
  const buttonLabel = button || buttonLink?.label || '';

  // Handle image error
  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
  };

  // Only render image if we have a real URL
  const hasImage = imageUrl !== '/default-image.jpg';

  return (
    <section className="relative bg-[#f7f5f2] mt-[100px] flex flex-col w-full min-h-[100vh] items-center justify-center lg:px-[64px]">
      <div className="w-full sm:w-[800px] lg:w-full h-[678px] lg:h-[772px] shadow-[rgba(31,32,34,0.1)_0px_60px_60px_-15px] rounded-[30px] relative">
        {hasImage && !imageError ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            fetchPriority="high"
            loading="eager"
            priority
            className="w-full h-full object-cover rounded-[30px] bg-center"
            sizes="(max-width: 768px) 100vw, 1200px"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-[30px]">
            <p className="text-gray-500">Image could not be loaded</p>
          </div>
        )}

        <div className="w-[360px] sm:w-[480px] md:w-[600px] lg:w-[720px] absolute bottom-[0px] lg:bottom-[0px] left-[0px] lg:left-[0px] bg-[#ac7cb4] rounded-tr-[30px] rounded-bl-[30px] text-white flex flex-col items-start justify-center px-[12px] py-[48px] lg:p-[60px]">
          <p className="text-[12px] leading-[16.8px] tracking-[1.3px] mb-[10px] uppercase">
            {headline}
          </p>
          
          <h1 className="text-[34px] lg:text-[46px] font-normal leading-[38.76px] lg:leading-[52.44px] font-serif mt-[1px] mb-[36px]">
            {title}
          </h1>

          <div className="text-[18px] [&_p]:mb-4 [&_a]:underline [&_a]:hover:text-gray-200">
            <RichText content={content} className="[&_p]:text-white" />
          </div>
          
          {buttonLabel && (
            <Link
              href={buttonUrl}
              target={buttonLink?.isExternal ? "_blank" : undefined}
              rel={buttonLink?.isExternal ? "noopener noreferrer" : undefined}
              className="text-[12px] leading-[42px] tracking-[1px] uppercase w-[213px] h-[66px] rounded-full text-center hover:bg-elangreen hover:text-white transition-all flex items-center justify-center mt-[20px]"
            >
              {buttonLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}