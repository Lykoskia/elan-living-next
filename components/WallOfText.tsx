import Link from "next/link";
import { RichText } from "@/lib/richtext";
import type { StrapiRichText, StrapiLink } from "@/lib/types/strapi";
import { getStrapiLinkUrl } from "@/lib/types/strapi";

interface WallOfTextProps {
  title: string;
  subtitle: string;
  content: StrapiRichText;
  button?: string;
  buttonLink?: StrapiLink;
}

export default function WallOfText({ 
  title,
  subtitle,
  content,
  button,
  buttonLink
}: WallOfTextProps) {
  const linkUrl = getStrapiLinkUrl(buttonLink, '/');

  return (
    <section className="flex flex-col w-full items-center justify-center my-[48px]">
      <h2 className="bg-white lg:px-72 leading-tight py-60 font-serif text-[50px] md:text-[80px] text-elangreen font-semibold my-[12px] px-[60px]">
        {title}
      </h2>
      <h3 className="mt-[18px] md:px-[20%] text-left font-serif text-[24px] leading-[38.76px] md:leading-[52.44px] my-8 mx-[48px]">
        {subtitle}
      </h3>
      <div className="text-[18px] leading-[29.7px] my-[12px] xl:mx-[240px] max-w-80 md:max-w-96 lg:max-w-2xl xl:max-w-4xl 2xl:max-w-7xl">
        <RichText content={content} />
      </div>
      {button && button.length !== 0 && (
        <Link
          href={linkUrl}
          className="text-[12px] leading-[32px] tracking-[1px] uppercase px-[26px] py-[12px] rounded-full border-2 border-elangreen bg-transparent text-[#222] text-center hover:bg-elanpurple hover:border-elanpurple hover:text-white transition-all flex items-center justify-center mt-[61px]"
        >
          {button}
        </Link>
      )}
    </section>
  );
}