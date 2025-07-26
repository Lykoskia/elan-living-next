"use client"

import Image from "next/image"

const ICON_COLORS = [
  "bg-[#fd4b8b]/[0.1]",
  "bg-[#8979ec]/[0.1]",
  "bg-[#32b77a]/[0.1]",
  "bg-[#acb732]/[0.1]",
]

export interface IconGridProps {
  headline?: string
  title?: string
  icon_1?: {
    url: string
    alternativeText?: string
  }
  subtitle_1?: string
  text_1?: string
  icon_2?: {
    url: string
    alternativeText?: string
  }
  subtitle_2?: string
  text_2?: string
  icon_3?: {
    url: string
    alternativeText?: string
  }
  subtitle_3?: string
  text_3?: string
  icon_4?: {
    url: string
    alternativeText?: string
  }
  subtitle_4?: string
  text_4?: string
  locale?: string
  isDefaultLocale?: boolean
}

export default function IconGrid({
  headline = "Zašto odabrati nas",
  title = "Prednosti Elan Living usluga",
  icon_1,
  subtitle_1 = "Stručnost",
  text_1 = "Naš tim čine certificirani stručnjaci s iskustvom.",
  icon_2,
  subtitle_2 = "Pouzdanost",
  text_2 = "Dostupni smo 24/7 za sve vaše potrebe.",
  icon_3,
  subtitle_3 = "Personalizacija",
  text_3 = "Prilagođavamo usluge prema vašim potrebama.",
  icon_4,
  subtitle_4 = "Kvaliteta",
  text_4 = "Pružamo najvišu kvalitetu usluga kućne njege."
}: IconGridProps) {

  // Helper function to get full image URL
  const getImageUrl = (imageObj: { url: string } | undefined) => {
    if (!imageObj?.url) return "/img/icons/default-icon.svg"

    // If URL already starts with http, it's absolute
    if (imageObj.url.startsWith('http')) {
      return imageObj.url
    }

    // Otherwise, prepend Strapi URL
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
    return `${strapiUrl}${imageObj.url}`
  }

  // Array of icon data for easier mapping
  const iconData = [
    {
      icon: icon_1,
      subtitle: subtitle_1,
      text: text_1,
      fallbackIcon: "/img/icons/expertise-icon.svg"
    },
    {
      icon: icon_2,
      subtitle: subtitle_2,
      text: text_2,
      fallbackIcon: "/img/icons/reliability-icon.svg"
    },
    {
      icon: icon_3,
      subtitle: subtitle_3,
      text: text_3,
      fallbackIcon: "/img/icons/personalization-icon.svg"
    },
    {
      icon: icon_4,
      subtitle: subtitle_4,
      text: text_4,
      fallbackIcon: "/img/icons/quality-icon.svg"
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h3 className="text-sm uppercase tracking-wider font-semibold mb-2">
            {headline}
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {title}
          </h2>
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {iconData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-stretch"
            >
              <div className={`${ICON_COLORS[index]} p-[22px] mb-[20px] rounded-3xl`}>
                <Image
                  src={getImageUrl(item.icon) || item.fallbackIcon}
                  alt={item.icon?.alternativeText || item.subtitle || ''}
                  width={28}
                  height={28}
                />
              </div>
              <h3 className="text-center font-sans text-[20px] font-medium mb-[20px] text-gray-900">
                {item.subtitle}
              </h3>
              {item.text && (
                <p className="text-center font-sans text-[16px] text-gray-600">
                  {item.text}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}