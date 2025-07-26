"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"

interface CardGroupProps {
  card1Text: string
  card2Text: string
  card3Text: string
}

export default function CardGroup({ card1Text, card2Text, card3Text }: CardGroupProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.01,
  })

  const dotColors = ["bg-[#fd4b8b]/[0.1]", "bg-[#8979ec]/[0.1]", "bg-[#32b77a]/[0.1]"]

  interface CardItemProps {
    text: string
    dotColor: string
    index: number
  }

  const CardItem = ({ text, dotColor, index }: CardItemProps) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
      let timer: NodeJS.Timeout
      if (inView) {
        timer = setTimeout(() => {
          setIsVisible(true)
        }, index * 400)
      }

      return () => clearTimeout(timer)
    }, [inView, index])

    return (
      <div className="mx-auto w-5/6 md:w-1/2 lg:w-1/3 md:mx-6 border border-sky-200 flex flex-col rounded-3xl overflow-hidden shadow-lg shadow-sky-100 bg-white transition-transform hover:-translate-y-2 hover:shadow-xl">
        <div className="relative px-4 pb-6 pt-16 flex-1 flex flex-col justify-center items-center">
          <span className={`${dotColor} absolute top-6 left-9 rounded-full h-12 w-12`}></span>
          <p
            className={`text-gray-600 text-center mt-4 pt-8 transition-all duration-500 ${isVisible ? "animate-slide-in-top" : "opacity-0 translate-y-4"}`}
          >
            {text}
          </p>
        </div>
      </div>
    )
  }

  const cardTexts = [card1Text, card2Text, card3Text]

  return (
    <div ref={ref} className="flex flex-col md:flex-row justify-center gap-4 lg:gap-2 xl:mx-24 my-12">
      {cardTexts.map((text, index) => (
        <CardItem key={index} text={text} dotColor={dotColors[index]} index={index} />
      ))}
    </div>
  )
}