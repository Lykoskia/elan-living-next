import type React from "react"
import { Poppins, PT_Serif } from "next/font/google"
import { getGlobalData, DEFAULT_LOCALE } from '@/lib/api-client';
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import BackToTopButton from "@/components/BackToTopButton"
import { headers } from 'next/headers'
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-url') || '/'

  const segments = pathname.split('/').filter(Boolean)
  const validLocales = ['hr', 'en', 'de']

  let currentLocale = DEFAULT_LOCALE
  if (segments.length > 0 && validLocales.includes(segments[0])) {
    currentLocale = segments[0]
  } else {
  }

  const globalData = await getGlobalData(currentLocale);

  return (
    <html className={`${poppins.variable} ${ptSerif.variable}`} lang={currentLocale}>
      <body className="font-sans bg-[#f7f5f2]">
        <Navbar
          lang={currentLocale}
          initialData={globalData}
        />
        <main>{children}</main>
        <Footer />
        <BackToTopButton />
      </body>
    </html>
  )
}