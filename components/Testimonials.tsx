'use client';

import { useState } from "react";
import Image from "next/image";
import type { StrapiImage } from "@/lib/types/strapi";
import { getStrapiImageUrl, getStrapiImageAlt } from "@/lib/types/strapi";

// Type for individual testimonial
interface TestimonialData {
  id?: string | number;
  image?: StrapiImage;
  title: string;
  text: string;
}

interface TestimonialsProps {
  id?: number;
  __component?: string;
  testimonials?: TestimonialData[];
  Testimonial?: TestimonialData[];
  showMoreLabel?: string;
  showLessLabel?: string;
}

function TestimonialCard({ image, title, text }: TestimonialData) {
  const [imageError, setImageError] = useState(false);
  
  // Use centralized utility functions
  const imageUrl = getStrapiImageUrl(image, '/placeholder.svg');
  const imageAlt = getStrapiImageAlt(image, title || 'Testimonial image');

  // Only show image if we have a real URL (not placeholder)
  const hasImage = image && imageUrl !== '/placeholder.svg' && !imageError;

  return (
    <section className="bg-white border border-sky-200 rounded-3xl shadow-lg flex flex-col items-stretch w-full sm:w-[40vw] lg:w-[30vw] xl:w-1/4 mb-4 transition-transform hover:-translate-y-2 hover:shadow-xl">
      {hasImage && (
        <div className="relative w-full h-[300px] overflow-hidden rounded-tl-3xl rounded-tr-3xl">
          <Image
            src={imageUrl}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-tl-3xl rounded-tr-3xl"
            alt={imageAlt}
            onError={() => setImageError(true)}
          />
        </div>
      )}
      <h1 className="text-2xl lg:text-3xl font-bold w-full bg-sky-50 px-4 py-2 lg:py-4">
        {title}
      </h1>
      <p className="px-8 lg:px-12 py-8 text-lg lg:text-xl text-start leading-8">
        {text}
      </p>
    </section>
  );
}

export default function Testimonials({ 
  testimonials,
  Testimonial,
  showMoreLabel,
  showLessLabel
}: TestimonialsProps) {
  const [showMore, setShowMore] = useState(false);

  // Handle both field names - testimonials (lowercase) and Testimonial (uppercase)
  const testimonialsList = testimonials || Testimonial || [];

  // Validate required fields
  if (!testimonialsList || !Array.isArray(testimonialsList) || testimonialsList.length === 0) {
    console.error('Testimonials: No testimonials provided', {
      testimonials,
      Testimonial,
      testimonialsList
    });
    return null;
  }

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  // Default labels if not provided
  const moreLabel = showMoreLabel || 'Show More';
  const lessLabel = showLessLabel || 'Show Less';

  return (
    <section className="pt-24 pb-8 px-8 text-center">
      <div className="flex flex-wrap justify-center gap-x-8 lg:flex-row">
        {testimonialsList
          .slice(0, showMore ? testimonialsList.length : 3)
          .map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id || index} 
              {...testimonial}
            />
          ))}
      </div>
      
      {testimonialsList.length > 3 && (
        <div className="flex justify-center">
          <button
            onClick={toggleShowMore}
            className="font-sans text-base mt-4 lg:mt-8 px-4 py-2 bg-[#ac7cb4] border-2 border-[#ac7cb4] hover:bg-transparent text-white hover:text-black hover:border-2 hover:border-black rounded-full uppercase"
          >
            {showMore ? lessLabel : moreLabel}
          </button>
        </div>
      )}
    </section>
  );
}