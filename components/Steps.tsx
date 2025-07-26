"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"

// Component props interface matching dynamic zone structure
interface StepsProps {
  id?: number
  __component?: "shared.steps" // Strapi component type
  title?: string
  description?: string
  step1title?: string
  step1?: string
  step2title?: string
  step2?: string
  step3title?: string
  step3?: string
}

export default function Steps({ 
  title,
  description,
  step1title,
  step1,
  step2title,
  step2,
  step3title,
  step3,
}: StepsProps) {
  const [showStep1, setShowStep1] = useState<boolean>(false)
  const [showStep2, setShowStep2] = useState<boolean>(false)
  const [showStep3, setShowStep3] = useState<boolean>(false)

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.01,
  })

  useEffect(() => {
    let step2Timeout: NodeJS.Timeout
    let step3Timeout: NodeJS.Timeout

    if (inView) {
      setShowStep1(true)
      step2Timeout = setTimeout(() => setShowStep2(true), 400)
      step3Timeout = setTimeout(() => setShowStep3(true), 800)
    }

    return () => {
      clearTimeout(step2Timeout)
      clearTimeout(step3Timeout)
    }
  }, [inView])

  // Check if we have any step content (either title or description)
  const hasStep1 = step1title || step1
  const hasStep2 = step2title || step2  
  const hasStep3 = step3title || step3

  // Don't render if no content at all
  if (!title && !description && !hasStep1 && !hasStep2 && !hasStep3) {
    console.warn('Steps: No content found, not rendering component')
    return null
  }

  return (
    <section className="flex flex-col items-center text-center px-4 py-6 my-12">
      <div className="mb-4 mx-auto items-center">
        {title && (
          <h2 className="text-xs md:text-sm font-extralight text-gray-800 uppercase mb-4">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-[34px] lg:text-[46px] font-medium font-serif text-gray-800 lg:mx-[25vw] leading-tight">
            {description}
          </p>
        )}
      </div>
      <div ref={ref} className="flex flex-col md:flex-row justify-evenly items-center w-full my-12 gap-8 md:gap-0">
        {hasStep1 && (
          <div
            className={`flex flex-col items-center justify-center w-full md:w-1/4 transition-all duration-500 ${
              showStep1 ? "animate-slide-in-top" : "opacity-0"
            }`}
          >
            <div className="text-[30px] flex justify-center items-center bg-elangreen rounded-full w-[70px] h-[70px] mb-4 md:mb-8 italic text-white shadow-[0_0_0_15px_rgba(133,155,68,0.1)]">
              1
            </div>
            {step1title && (
              <h1 className="text-[19px] lg:text-[24px] mb-2 text-center">{step1title}</h1>
            )}
            {step1 && (
              <p className="text-[16px] lg:text-[14px] mb-8 md:mb-20 text-center px-4">{step1}</p>
            )}
          </div>
        )}
        {hasStep2 && (
          <div
            className={`flex flex-col items-center justify-center w-full md:w-1/4 transition-all duration-500 ${
              showStep2 ? "animate-slide-in-top" : "opacity-0"
            }`}
          >
            <div className="text-[30px] flex justify-center items-center bg-elanpurple rounded-full w-[70px] h-[70px] mb-4 md:mb-8 italic text-white shadow-[0_0_0_15px_rgba(133,155,68,0.1)]">
              2
            </div>
            {step2title && (
              <h1 className="text-[19px] lg:text-[24px] mb-2 text-center">{step2title}</h1>
            )}
            {step2 && (
              <p className="text-[16px] lg:text-[14px] mb-8 md:mb-20 text-center px-4">{step2}</p>
            )}
          </div>
        )}
        {hasStep3 && (
          <div
            className={`flex flex-col items-center justify-center w-full md:w-1/4 transition-all duration-500 ${
              showStep3 ? "animate-slide-in-top" : "opacity-0"
            }`}
          >
            <div className="text-[30px] flex justify-center items-center bg-elanbrown rounded-full w-[70px] h-[70px] mb-4 md:mb-8 italic text-white shadow-[0_0_0_15px_rgba(133,155,68,0.1)]">
              3
            </div>
            {step3title && (
              <h1 className="text-[19px] lg:text-[24px] mb-2 text-center">{step3title}</h1>
            )}
            {step3 && (
              <p className="text-[16px] lg:text-[14px] mb-8 md:mb-20 text-center px-4">{step3}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}