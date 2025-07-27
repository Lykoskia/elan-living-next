import type React from "react"
import { Poppins, PT_Serif } from "next/font/google"
import { DEFAULT_LOCALE } from '@/lib/api-client';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={`${poppins.variable} ${ptSerif.variable}`} lang={DEFAULT_LOCALE}>
      <body className="font-sans bg-[#f7f5f2]">
        {children}
      </body>
    </html>
  )
}

export const metadata = {
  title: 'ELAN Living',
  description: 'Profesionalna njega starijih osoba u njihovom domu',
}