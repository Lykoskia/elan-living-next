import { Poppins, PT_Serif } from "next/font/google"

export const poppins = Poppins({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

export const ptSerif = PT_Serif({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pt-serif",
})
