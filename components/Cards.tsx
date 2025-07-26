"use client";

import Image from "next/image";
import Link from "next/link";
import { getLocalizedUrl } from "@/lib/components-registry";
import { StrapiImage, getStrapiImageUrl, getStrapiImageAlt } from "@/lib/types/strapi";

// Individual card props interface
interface CardProps {
  headline?: string;
  title?: string;
  text?: string;
  image?: StrapiImage;
  cardLink?: string;
  linkText?: string;
  locale?: string;
}

// Component props interface matching dynamic zone structure
interface CardsProps {
  id?: number;
  __component?: "shared.cards"; // Strapi component type
  card1headline?: string;
  card1title?: string;
  card1text?: string;
  card1image?: StrapiImage;
  card1link?: string;
  card1linktext?: string;
  card2headline?: string;
  card2title?: string;
  card2text?: string;
  card2image?: StrapiImage;
  card2link?: string;
  card2linktext?: string;
  locale?: string;
  isDefaultLocale?: boolean;
}

function Card({ headline, title, text, image, cardLink, linkText, locale }: CardProps) {
  // Use utility functions instead of duplicating complex logic
  const imageUrl = getStrapiImageUrl(image);
  const imageAlt = getStrapiImageAlt(image, title || headline || 'Card image');

  // Prepare the link URL
  const linkUrl = cardLink && locale ? getLocalizedUrl(cardLink, locale) : cardLink;

  return (
    <div className="mx-auto w-5/6 md:w-1/2 lg:w-1/2 xl:w-1/3 lg:mx-2 border border-sky-200 flex flex-col rounded-3xl overflow-hidden shadow-lg shadow-sky-100 bg-white transition-transform hover:-translate-y-2 hover:shadow-xl">
      <div className="px-6 py-4 flex-1 flex flex-col justify-between">
        <div className="text-center pt-12">
          {headline && (
            <div className="uppercase tracking-wide text-xs lg:text-sm bg-purple-100 text-elangreen rounded-lg px-4 py-2 inline-block">
              {headline}
            </div>
          )}
          {title && (
            <h2 className="text-2xl lg:text-4xl font-sans my-6">{title}</h2>
          )}
          {text && (
            <p className="text-gray-600 pb-6">{text}</p>
          )}
          {cardLink && linkText && (
            <Link 
              href={linkUrl || '#'}
              className="inline-block bg-elangreen text-white px-6 py-2 rounded-full hover:bg-elangreen/90 transition-colors mb-4"
            >
              {linkText}
            </Link>
          )}
        </div>
      </div>
      {imageUrl && imageUrl !== '/placeholder.svg' && (
        <div className="relative w-full h-64 md:h-96 lg:h-[30rem]">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            style={{ objectFit: 'cover' }}
            className="absolute bottom-0 left-0 w-full h-full rounded-t-full"
          />
        </div>
      )}
    </div>
  );
}

export default function Cards({ 
  card1headline,
  card1title,
  card1text,
  card1image,
  card1link,
  card1linktext,
  card2headline,
  card2title,
  card2text,
  card2image,
  card2link,
  card2linktext,
  locale,
  isDefaultLocale
}: CardsProps) {

  // Check if we have any content for either card
  const hasCard1 = card1headline || card1title || card1text || card1image;
  const hasCard2 = card2headline || card2title || card2text || card2image;

  // Don't render if no content at all
  if (!hasCard1 && !hasCard2) {
    console.warn('Cards: No content found, not rendering component');
    return null;
  }

  return (
    <section className="flex flex-col md:flex-row justify-center gap-4 lg:gap-0 my-12">
      {hasCard1 && (
        <Card
          headline={card1headline}
          title={card1title}
          text={card1text}
          image={card1image}
          cardLink={card1link}
          linkText={card1linktext}
          locale={locale}
        />
      )}
      {hasCard2 && (
        <Card
          headline={card2headline}
          title={card2title}
          text={card2text}
          image={card2image}
          cardLink={card2link}
          linkText={card2linktext}
          locale={locale}
        />
      )}
    </section>
  );
}