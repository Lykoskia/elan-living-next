"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { RiMailFill, RiPhoneFill, RiFacebookCircleFill, RiInstagramFill } from "react-icons/ri"

interface LocalizedContent {
  kontaktHeading: string
  upitiHeading: string
  kontakt: Array<{ name: string }>
  upiti: Array<{ name: string }>
  footerText: string
  copyright: string
}

interface LocalizedContentMap {
  [key: string]: LocalizedContent
}

const localizedContent: LocalizedContentMap = {
  hr: {
    kontaktHeading: "Kontakt",
    upitiHeading: "Upiti i informacije",
    kontakt: [
      { name: "Ustanova centar za pomoć u kući Osijek" },
      { name: "Šetalište kardinala Franje Šepera 13," },
      { name: "31000, Osijek" },
    ],
    upiti: [
      { name: "Imate pitanje ili trebate više informacija o našim uslugama?" },
      { name: "Jednostavno nam pošaljite upit." },
      { name: "Pošaljite upit" },
      { name: "Politika privatnosti " },
    ],
    footerText: "Elan Living - Vaš partner za kvalitetnu kućnu njegu",
    copyright: "© 2023-{year} ALL RIGHTS RESERVED.",
  },
  en: {
    kontaktHeading: "Contact",
    upitiHeading: "Inquiries and Information",
    kontakt: [
      { name: "Home Assistance Center Osijek" },
      { name: "Šetalište kardinala Franje Šepera 13," },
      { name: "31000, Osijek" },
    ],
    upiti: [
      { name: "Have a question or need more information about our services?" },
      { name: "Just send us an inquiry." },
      { name: "Send an inquiry" },
      { name: "Privacy policy " },
    ],
    footerText: "Elan Living - Your partner for quality home care",
    copyright: "© 2023-{year} ALL RIGHTS RESERVED.",
  },
  de: {
    kontaktHeading: "Kontakt",
    upitiHeading: "Anfragen und Informationen",
    kontakt: [
      { name: "Hilfszentrum für zu Hause Osijek" },
      { name: "Šetalište kardinala Franje Šepera 13," },
      { name: "31000, Osijek" },
    ],
    upiti: [
      {
        name: "Haben Sie eine Frage oder benötigen Sie mehr Informationen über unsere Dienstleistungen?",
      },
      { name: "Senden Sie uns einfach eine Anfrage." },
      { name: "Anfrage senden" },
      { name: "Datenschutzrichtlinie" },
    ],
    footerText: "Elan Living - Ihr Partner für qualitativ hochwertige häusliche Pflege",
    copyright: "© 2023-{year} ALL RIGHTS RESERVED.",
  },
}

// Helper function to extract locale from pathname
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  // Check if first segment is a valid locale
  if (firstSegment && ['hr', 'en', 'de'].includes(firstSegment)) {
    return firstSegment
  }
  
  return 'hr' // default locale
}

interface FooterProps {
  locale?: string // Optional prop if you want to pass locale from parent
}

export default function Footer({ locale }: FooterProps = {}) {
  const params = useParams()
  const pathname = usePathname()
  
  // Get current locale using different strategies
  const currentLocale = 
    locale || // Use prop if provided
    (params?.locale as string) || // Use params if using [locale] dynamic route
    getLocaleFromPath(pathname) || // Parse from pathname
    'hr' // fallback to default
  
  const currentLocaleContent = localizedContent[currentLocale] || localizedContent.hr
  const currentYear = new Date().getFullYear()
  const copyrightText = currentLocaleContent.copyright.replace("{year}", currentYear.toString())

  return (
    <footer className="bg-white border-t-4 border-elanpurple" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="flex flex-col lg:grid lg:grid-cols-3 mx-auto px-2 pt-24 pb-12">
        {/* Column 1: Logo Only */}
        <div className="flex flex-col items-center justify-center h-full">
          <img className="h-24" src="/img/elan-web-logo.png" alt="Elan Living" />
        </div>

        {/* Column 2: Contact Information with Moved Elements */}
        <div className="mt-16 lg:mt-0 lg:flex lg:justify-center lg:flex-col">
          <div>
            <h3 className="font-semibold leading-6 text-gray-900 uppercase mb-8">
              {currentLocaleContent.kontaktHeading}
            </h3>
            <ul role="list" className="space-y-2 text-gray-700 mb-8">
              {currentLocaleContent.kontakt.map((item, index) => (
                <li key={index}>{item.name}</li>
              ))}
            </ul>
          </div>
          {/* Moved Email and Phone from Left to Middle */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-start items-center leading-3">
              <RiMailFill className="text-elanpurple w-6 h-6" />
              <Link className="ml-2 text-sky-500 hover:text-sky-700" href="mailto:team@elan-living.com">
                team@elan-living.com
              </Link>
            </div>
            <div className="flex justify-start items-center leading-3">
              <RiPhoneFill className="text-elanpurple w-6 h-6" />
              <Link className="ml-2 text-sky-500 hover:text-sky-700" href="tel:+385916138156">
                +385 91 613 8156
              </Link>
            </div>
          </div>
          {/* Moved Social Media Icons to Middle */}
          <div className="flex justify-start space-x-2 mt-4">
            <Link href="https://www.facebook.com/elan.living.croatia" target="_blank" rel="noopener noreferrer">
              <RiFacebookCircleFill className="text-elanpurple w-9 h-9" />
            </Link>
            <Link href="https://www.instagram.com/elan.living" target="_blank" rel="noopener noreferrer">
              <RiInstagramFill className="text-elanpurple w-9 h-9" />
            </Link>
          </div>
        </div>

        {/* Column 3: Inquiry */}
        <div className="mt-16 lg:mt-0 lg:flex lg:justify-center">
          <div>
            <h3 className="font-semibold leading-6 text-gray-900 uppercase mb-8">
              {currentLocaleContent.upitiHeading}
            </h3>
            <ul role="list" className="space-y-2 text-gray-700">
              {currentLocaleContent.upiti.slice(0, 2).map((item, index) => (
                <li key={index}>{item.name}</li>
              ))}
              <li className="text-sky-500 hover:text-sky-700">
                <Link href="/privacy">{currentLocaleContent.upiti[3].name}</Link>
              </li>
            </ul>
            <Link href="/contact">
              <button className="hover:text-black text-white bg-elanpurple hover:bg-transparent border-2 border-elanpurple hover:border-black font-sans text-[12px] px-[26px] py-[16px] rounded-full mt-16 uppercase">
                {currentLocaleContent.upiti[2].name}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom Text */}
      <div className="text-center pt-4 pb-8">
        <p className="text-gray-700">{currentLocaleContent.footerText}</p>
        <p className="font-sans text-[12px]">{copyrightText}</p>
        <p className="font-sans text-[12px]">Web: <a className="text-sky-500 hover:text-sky-700" href="https://www.alfrancis.dev" rel="noopener noreferrer" target="_blank">Alan Frančišković</a></p>
      </div>
    </footer>
  )
}