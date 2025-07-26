interface ReviewSectionProps {
  quote: string
  author: string
}

export default function ReviewSection({ quote, author }: ReviewSectionProps) {
  return (
    <section className="flex flex-col items-end justify-center gap-[26px] bg-cover bg-fixed h-[750px] md:h-[724px] w-full py-[167px] px-5 md:px-[191px]">
      <h3 className="text-left text-[30px] lg:text-[36px] leading-normal font-serif text-elanpurple">{quote}</h3>
      <p className="text-[15px] leading-[30px] text-right mb-[30px] z-10 italic">{author}</p>
    </section>
  )
}
