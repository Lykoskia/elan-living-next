"use client"
import { CalendarDaysIcon } from "@heroicons/react/24/solid"
import { AiFillLike } from "react-icons/ai"
import { RiTwitterXFill } from "react-icons/ri"
import { RichText } from "@/lib/richtext"

interface KutakArticleProps {
  article: {
    title: string
    publishedDate: string
    content: string
    image?: {
      filename: string
      alt?: string
    }
    download?: boolean
    downloadTitle?: string
    downloadText?: string
    downloadLink?: {
      filename: string
    }
    shareText?: string
  }
}

const formatDisplayDate = (dateString?: string) => {
  if (!dateString) {
    console.log("Empty date string provided")
    return ""
  }
  console.log("Date string provided:", dateString)
  const [datePart] = dateString.split("T")
  const [year, month, day] = datePart.split("-")

  return `${day}. ${month}. ${year}.`
}

export default function KutakArticle({ article }: KutakArticleProps) {
  const publishDate = formatDisplayDate(article.publishedDate) || formatDisplayDate(new Date().toISOString())

  return (
    <div className="w-full lg:w-[1130px] h-auto lg:h-[97px] flex flex-col-reverse lg:flex-row items-center lg:items-start justify-start gap-0 lg:gap-[50px] mb-[14px]">
      <h4 className="text-[18px] leading-[18px] pl-0 lg:pl-[28px] pt-[24px] text-elanpurple">
        <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2" /> {publishDate}
      </h4>
      <h2 className="font-serif text-[33px] lg:text-[65.12px] leading-[49.5px] lg:leading-[87.68px] pt-[6px]">
        {article.title}
      </h2>
      <div className="w-full lg:w-[1130px] h-full flex items-center justify-end lg:gap-[50px] mb-[14px] ">
        <div className="w-full lg:w-[970px] h-full text-base leading-[32px] space-y-8">
          <img
            src={article.image?.filename || "/placeholder.svg"}
            alt={article.image?.alt || ""}
            className="w-full lg:w-[970px] h-full lg:h-[569px] py-2.5 object-cover"
          />
          <div className="px-[8px] lg:px-[12px] text-gray-800 leading-relaxed mx-auto">
            <RichText content={article.content} />
          </div>
        </div>
      </div>

      {article.download && article.downloadLink && (
        <div className="flex gap-[18px] items-center justify-start w-full lg:w-[1130px] h-[52px] pl-0 lg:pl-[160px] my-[24px]">
          <img src="/img/pdf.png" alt="PDF icon" className="w-9 h-9" />
          <div className="flex flex-col gap-1.5">
            <p className="text-[12px] leading-[10.8px]">{article.downloadTitle}</p>
            <a
              href={article.downloadLink.filename}
              className="text-[#0000ee] text-base leading-[32px] font-semibold"
              download
            >
              {article.downloadText}
            </a>
          </div>
        </div>
      )}

      <div className="w-full lg:w-[1130px] h-[46px] flex gap-[44px] items-center justify-start pl-0 lg:pl-[160px] mb-[56px]">
        <div className="w-[68px] h-[20px] bg-[#1877F2] flex gap-1 rounded-[3px] text-white items-center justify-center cursor-pointer">
          <AiFillLike className="w-4 h-4" />
          <p className="text-[11px] font-semibold">Like</p>
          <p className="text-[11px] font-light">0</p>
        </div>

        <div className="inline-flex items-center justify-center gap-[3px] px-3 py-px max-h-max relative bg-black rounded-full hover:bg-slate-950 transition-colors cursor-pointer">
          <RiTwitterXFill className="w-4 h-4 text-white" />
          <div className="relative w-fit mt-[-1.00px] z-0 [font-family:'Helvetica_Neue-65Medium',Helvetica] font-semibold text-white text-xs tracking-[0] leading-[18px] whitespace-nowrap">
            {article.shareText || "Share"}
          </div>
        </div>
      </div>
    </div>
  )
}
