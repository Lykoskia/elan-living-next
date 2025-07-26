'use client'

import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop
      if (scrolled > 200) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    // Initial check
    toggleVisible()

    // Add scroll listener
    window.addEventListener('scroll', toggleVisible)
    
    // Cleanup
    return () => window.removeEventListener('scroll', toggleVisible)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Don't render if not visible
  if (!visible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 lg:bottom-12 right-8 lg:right-12 transition-all duration-300 bg-[#ac7cb4]/10 hover:bg-[#ac7cb4] text-[#ac7cb4] hover:text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl z-50 transform hover:scale-110 border-2 border-elanpurple hover:border-transparent"
      aria-label="Back to Top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  )
}