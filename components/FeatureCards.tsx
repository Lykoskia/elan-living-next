"use client"

import React from "react"

interface FeatureCardsProps {
  id?: number
  __component?: "shared.feature-cards"
  headline?: string
  title?: string
  feature1headline?: string
  feature1title?: string
  feature1text?: string
  feature2headline?: string
  feature2title?: string
  feature2text?: string
  feature3headline?: string
  feature3title?: string
  feature3text?: string
  locale?: string
  isDefaultLocale?: boolean
}

interface FeatureCardProps {
  headline?: string
  title?: string
  text?: string
  className?: string
}

function FeatureCard({ headline, title, text, className = "" }: FeatureCardProps) {
  return (
    <div className={`relative flex items-start justify-center p-6 rounded-[30px] shadow-[rgba(31,32,34,0.1)_0px_60px_60px_-15px] text-center min-h-max ${className}`}>
      <div className="flex flex-col items-center justify-center">
        {headline && (
          <h3 className="bg-[#fd4b8b]/10 px-[12px] py-[7px] w-[89px] h-[30px] text-center rounded-[10px] text-[12px] leading-[16.8px] tracking-[1.3px]">
            {headline}
          </h3>
        )}
        {title && (
          <h4 className="text-[48px] leading-[70.4px] w-full md:w-[307px] text-center font-sans mt-[23px] mb-[20px]">
            {title}
          </h4>
        )}
        {text && (
          <p className="text-[14px] leading-[23.1px] w-full md:w-[345px] opacity-50">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default function FeatureCards({ 
  headline,
  title,
  feature1headline,
  feature1title,
  feature1text,
  feature2headline,
  feature2title,
  feature2text,
  feature3headline,
  feature3title,
  feature3text
}: FeatureCardsProps) {

  // Check if we have any content
  const hasFeature1 = feature1headline || feature1title || feature1text
  const hasFeature2 = feature2headline || feature2title || feature2text
  const hasFeature3 = feature3headline || feature3title || feature3text

  // Don't render if no content at all
  if (!headline && !title && !hasFeature1 && !hasFeature2 && !hasFeature3) {
    console.warn('FeatureCards: No content found, not rendering component')
    return null
  }

  return (
    <section className="my-24 mx-auto">
      <div className="text-center">
        {headline && (
          <h2 className="text-xs md:text-sm font-extralight text-gray-800 uppercase">
            {headline}
          </h2>
        )}
        {title && (
          <h3 className="text-[29px] md:text-[46px] text-serif mt-2 mb-16">
            {title}
          </h3>
        )}
      </div>
      <div className="w-full max-w-fit mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex flex-col md:flex-row">
          {hasFeature1 && (
            <FeatureCard
              headline={feature1headline}
              title={feature1title}
              text={feature1text}
              className="bg-white w-full md:w-[387px] h-auto md:h-[507px] z-10 md:col-start-2 py-[25px] md:pt-10 mt-0 md:mt-[38px] rounded-[30px] md:rounded-r-none"
            />
          )}
          {hasFeature2 && (
            <FeatureCard
              headline={feature2headline}
              title={feature2title}
              text={feature2text}
              className="bg-[#ac7cb4] text-white w-full md:w-[425px] h-auto md:h-[583px] rounded-[30px] z-20 py-[25px] md:pt-[101px] mt-4 md:mt-0"
            />
          )}
          {hasFeature3 && (
            <FeatureCard
              headline={feature3headline}
              title={feature3title}
              text={feature3text}
              className="bg-white z-10 w-full md:w-[387px] h-auto md:h-[507px] py-[25px] md:pt-[40px] mt-4 md:mt-[38px] rounded-[30px] md:rounded-l-none"
            />
          )}
        </div>
      </div>
    </section>
  )
}