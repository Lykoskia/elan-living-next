"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLocalizedUrl } from '@/lib/components-registry';
import { Spinner } from './Spinner';
import { RichText } from '@/lib/richtext';
import {
  type StrapiImage,
  type StrapiLink,
  type StrapiRichText,
  getStrapiImageUrl,
  getStrapiImageAlt,
  getStrapiLinkUrl,
  getRichTextPlainText
} from '@/lib/types/strapi';

export interface HeroSectionProps {
  locale: string;
  headline?: string;
  title?: string;
  content?: StrapiRichText;
  button?: string;
  buttonLink?: StrapiLink;
  image?: StrapiImage;
}

export default function HeroSection({
  locale,
  headline,
  title,
  content,
  button,
  buttonLink,
  image
}: HeroSectionProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // This useEffect only runs on the client, after component mounts
  useEffect(() => {
    setHasMounted(true);

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Use utility functions from strapi types
  const imageUrl = getStrapiImageUrl(image, '');
  const imageAlt = getStrapiImageAlt(image, title || 'Hero image');

  // Handle image events
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
  };

  // Extract text content - handles both old and new formats with backward compatibility
  const getTextContent = () => {
    if (!content) return "";

    // Handle string content
    if (typeof content === 'string') {
      return content;
    }

    // Handle array content (both old format and rich text nodes)
    if (Array.isArray(content)) {
      return content.map(item => {
        // Old format: { type: 'paragraph', children: [{ text: '...' }] }
        if (item && typeof item === 'object' && 'type' in item && item.type === 'paragraph' && 'children' in item && Array.isArray(item.children)) {
          return item.children.map(child => {
            if (child && typeof child === 'object' && 'text' in child) {
              return child.text || '';
            }
            return '';
          }).join('');
        }
        // Rich text node format - use utility function
        return getRichTextPlainText(item);
      }).filter(Boolean).join('\n');
    }

    // Handle single rich text node - use utility function
    return getRichTextPlainText(content);
  };

  const textContent = getTextContent();

  // Use utility function for link URL, then apply localization
  const baseLinkUrl = getStrapiLinkUrl(buttonLink, '/contact');
  const linkUrl = getLocalizedUrl(baseLinkUrl, locale);

  // Should render image check
  const shouldRenderImage = (!hasMounted || !isMobile) && !!imageUrl;

  return (
    <section className="relative bg-[#f7f5f2] mt-[100px] flex flex-col w-full min-h-[100vh] items-center justify-center px-[4px] sm:px-[64px]">
      <div className="w-full sm:w-[800px] lg:w-full h-[678px] lg:h-[772px] shadow-[rgba(31,32,34,0.1)_0px_60px_60px_-15px] rounded-[30px] relative">
        {/* Loading spinner while image loads */}
        {shouldRenderImage && !imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-[30px]">
            <Spinner />
          </div>
        )}

        {/* Main hero image */}
        {shouldRenderImage && (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            fetchPriority="high"
            loading="eager"
            priority
            className={`w-full h-full object-cover rounded-[30px] transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            sizes="(max-width: 768px) 100vw, 1200px"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Error state */}
        {imageError && (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-[30px]">
            <p className="text-gray-600">Image could not be loaded</p>
          </div>
        )}

        {/* Content overlay */}
        <div className="absolute bottom-[-30px] -left-[34px] bg-[#ac7cb4] rounded-t-[30px] rounded-br-[260px] lg:rounded-br-[360px] rounded-bl-[30px] w-[420px] sm:w-[500px] md:w-[600px] lg:w-[725px] h-[575px] py-[140px] px-[40px] lg:h-[652px] lg:py-[100px] lg:px-[60px] text-white flex flex-col items-start justify-center gap-[50px]">
          <div className="flex flex-col items-start gap-1 p-4">
            {headline && (
              <p className="text-[12px] leading-[16.8px] tracking-[1.3px] my-[10px] uppercase">
                {headline}
              </p>
            )}

            {title && (
              <h1 className="text-[40px] lg:text-[58px] font-normal leading-[45.6px] lg:leading-[66.12px] font-serif mt-[1px] mb-[36px]">
                {title}
              </h1>
            )}

            {content && (
              <div className="text-[18px] leading-[29.7px]">
                <RichText
                  content={content}
                  className="text-inherit [&_p]:mb-4 [&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit [&_h4]:text-inherit [&_h5]:text-inherit [&_h6]:text-inherit [&_a]:text-inherit [&_a]:underline"
                />
              </div>
            )}

            {button && buttonLink && (
              <div className="my-12">
                <Link
                  href={linkUrl}
                  className="text-[12px] leading-[42px] tracking-[1px] uppercase w-[213px] h-[66px] rounded-full bg-white text-[#222] text-center hover:bg-elangreen hover:text-white transition-all flex items-center justify-center"
                  {...(buttonLink.isExternal && {
                    target: buttonLink.target || '_blank',
                    rel: 'noopener noreferrer'
                  })}
                >
                  {button}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}