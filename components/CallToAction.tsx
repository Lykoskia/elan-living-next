"use client";

import { StrapiImage, StrapiLink, getStrapiImageUrl, getStrapiImageAlt, getStrapiLinkUrl } from "@/lib/types/strapi";
import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';

interface CallToActionProps {
  headline: string;
  title: string;
  button: string;
  buttonLink: StrapiLink;
  image: StrapiImage;
  locale?: string;
  isDefaultLocale?: boolean;
}

export default function CallToAction({
  headline,
  title,
  button,
  buttonLink,
  image,
  locale,
  isDefaultLocale
}: CallToActionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use the utility functions from our Strapi types instead of manual logic
  const imageUrl = getStrapiImageUrl(image, '/placeholder.svg');
  const imageAlt = getStrapiImageAlt(image, headline || 'Call to action image');
  const linkUrl = getStrapiLinkUrl(buttonLink, '/');

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
  };

  return (
    <section className="mt-[60px] md:mt-[100px] py-[80px] w-full flex flex-col items-center justify-center px-4 md:px-[120px]">
      <div className="flex flex-col items-center justify-center">
        <h4 className="text-[12px] leading-[16.8px] tracking-[1.3px] mb-2.5 uppercase">
          {headline}
        </h4>
        <h1 className="font-serif text-[40px] md:text-[58px] leading-[66.12px] text-center md:w-[900px] mb-[46px] w-full">
          {title}
        </h1>
        <Link
          href={linkUrl}
          target={buttonLink?.isExternal ? '_blank' : '_self'}
          className="text-[12px] leading-[32px] tracking-[1px] hover:text-black text-white uppercase bg-[#ac7cb4] hover:bg-transparent border-2 border-[#ac7cb4] hover:border-black transition-all rounded-full px-[26px] py-[12px] flex items-center justify-center z-50"
        >
          {buttonLink?.label || button}
        </Link>
      </div>
      {!imageError && (
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={600}
          height={600}
          className="w-full h-[300px] md:h-[650px] object-cover rounded-[800px] -mt-4"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      {imageError && (
        <div className="w-full h-[300px] md:h-[650px] flex items-center justify-center bg-gray-200 rounded-[800px] -mt-4">
          <p>Image could not be loaded</p>
        </div>
      )}
    </section>
  );
}