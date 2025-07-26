"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { getArticles, processMediaUrls } from "@/lib/api-client"
import { 
  type Article,
  getStrapiImageUrl,
  getStrapiImageAlt 
} from "@/lib/types/strapi"

interface ArticleNavigationProps {
  currentArticle: Article
  locale?: string
  isDefaultLocale?: boolean
  className?: string
}

interface NavigationArticles {
  previous: Article | null
  next: Article | null
}

export default function ArticleNavigation({
  currentArticle,
  locale = 'hr',
  isDefaultLocale = true,
  className = ""
}: ArticleNavigationProps) {
  const [navigation, setNavigation] = useState<NavigationArticles>({
    previous: null,
    next: null
  })
  const [loading, setLoading] = useState(true)
  
  const prevTitleRef = useRef<HTMLHeadingElement>(null)
  const nextTitleRef = useRef<HTMLHeadingElement>(null)
  const [prevTitleTruncated, setPrevTitleTruncated] = useState(false)
  const [nextTitleTruncated, setNextTitleTruncated] = useState(false)

  const checkTruncation = () => {
    if (prevTitleRef.current) {
      const element = prevTitleRef.current
      
      if (!element.textContent?.trim() || element.offsetWidth === 0) {
        setPrevTitleTruncated(false)
        return
      }
      
      const clampedHeight = element.clientHeight
      
      const originalClasses = element.className
      element.className = element.className.replace(/line-clamp-\d+/g, '')
      
      element.offsetHeight
      
      const naturalHeight = element.scrollHeight
      
      element.className = originalClasses
      
      const isSignificantlyTruncated = naturalHeight > clampedHeight + 5
      
      setPrevTitleTruncated(isSignificantlyTruncated)
    }
    
    if (nextTitleRef.current) {
      const element = nextTitleRef.current
      
      if (!element.textContent?.trim() || element.offsetWidth === 0) {
        setNextTitleTruncated(false)
        return
      }
      
      const clampedHeight = element.clientHeight
      
      const originalClasses = element.className
      element.className = element.className.replace(/line-clamp-\d+/g, '')
      
      element.offsetHeight // Force reflow
      
      const naturalHeight = element.scrollHeight
      
      element.className = originalClasses
      
      const isSignificantlyTruncated = naturalHeight > clampedHeight + 5
      
      setNextTitleTruncated(isSignificantlyTruncated)
    }
  }

  useEffect(() => {
    async function findAdjacentArticles() {
      try {
        setLoading(true)

        const articlesResponse = await getArticles({
          locale,
          sort: ['publishDate:desc'],
        })

        if (!articlesResponse?.data) {
          throw new Error('Failed to fetch articles for navigation')
        }

        const allArticles = processMediaUrls(articlesResponse.data)
        
        const currentIndex = allArticles.findIndex(
          (article: Article) => article.id === currentArticle.id
        )

        if (currentIndex === -1) {
          console.warn('Current article not found in articles list')
          return
        }

        const previousArticle = currentIndex < allArticles.length - 1 
          ? allArticles[currentIndex + 1] 
          : null

        const nextArticle = currentIndex > 0 
          ? allArticles[currentIndex - 1] 
          : null

        setNavigation({
          previous: previousArticle,
          next: nextArticle
        })

      } catch (error) {
        console.error('Error fetching adjacent articles:', error)
      } finally {
        setLoading(false)
      }
    }

    findAdjacentArticles()
  }, [currentArticle.id, locale])

  useEffect(() => {
    if (!navigation.previous && !navigation.next) return
    
    const observer = new ResizeObserver((entries) => {
      let shouldCheck = false
      entries.forEach(entry => {
        if (entry.contentBoxSize && entry.contentBoxSize.length > 0) {
          shouldCheck = true
        }
      })
      
      if (shouldCheck) {
        setTimeout(checkTruncation, 50)
      }
    })
    
    if (prevTitleRef.current) observer.observe(prevTitleRef.current)
    if (nextTitleRef.current) observer.observe(nextTitleRef.current)
    
    return () => observer.disconnect()
  }, [navigation])

  useEffect(() => {
    if (navigation.previous || navigation.next) {
      setPrevTitleTruncated(false)
      setNextTitleTruncated(false)

      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            checkTruncation()
          })
        })
      }, 150)
      
      return () => clearTimeout(timeoutId)
    }
  }, [navigation])

  if (loading || (!navigation.previous && !navigation.next)) {
    return null
  }

  const createArticleUrl = (article: Article) => {
    return isDefaultLocale
      ? `/blog/${article.slug}`
      : `/${locale}/blog/${article.slug}`
  }

  return (
    <nav className={`bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
        Povezane objave
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Article */}
        <div className="space-y-4 flex justify-center items-center">
          {navigation.previous ? (
            <Link 
              href={createArticleUrl(navigation.previous)}
              className="group block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-elanpurple hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <ChevronLeftIcon className="h-5 w-5 text-elanpurple flex-shrink-0" />
                <span className="text-sm font-medium text-elanpurple">
                  Prethodna objava
                </span>
              </div>
              
              <div className="flex gap-3 h-20">
                {/* Thumbnail */}
                {navigation.previous.cover && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={getStrapiImageUrl(navigation.previous.cover, "/placeholder.svg")}
                      alt={getStrapiImageAlt(navigation.previous.cover, navigation.previous.title)}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  <div className="flex items-start">
                    <h4 
                      ref={prevTitleRef}
                      className="font-medium text-gray-900 group-hover:text-elanpurple transition-colors line-clamp-2 text-sm md:text-base leading-tight md:leading-tight"
                      title={prevTitleTruncated ? navigation.previous.title : undefined}
                    >
                      {navigation.previous.title}
                    </h4>
                  </div>
                  {navigation.previous.description && (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <div className="flex items-start">
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                          {navigation.previous.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        {/* Next Article */}
        <div className="space-y-4 flex justify-center items-center">
          {navigation.next ? (
            <Link 
              href={createArticleUrl(navigation.next)}
              className="group block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-elanpurple hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3 justify-end">
                <span className="text-sm font-medium text-elanpurple">
                  Sljedeća objava
                </span>
                <ChevronRightIcon className="h-5 w-5 text-elanpurple flex-shrink-0" />
              </div>
              
              <div className="flex gap-3 h-20">
                {/* Content */}
                <div className="flex-1 min-w-0 text-right flex flex-col justify-start">
                  <div className="flex items-start justify-end">
                    <h4 
                      ref={nextTitleRef}
                      className="font-medium text-gray-900 group-hover:text-elanpurple transition-colors line-clamp-2 text-sm md:text-base leading-tight md:leading-tight"
                      title={nextTitleTruncated ? navigation.next.title : undefined}
                    >
                      {navigation.next.title}
                    </h4>
                  </div>
                  {navigation.next.description && (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <div className="flex items-start justify-end">
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                          {navigation.next.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Thumbnail - ✅ FIXED: Use utility functions */}
                {navigation.next.cover && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={getStrapiImageUrl(navigation.next.cover, "/placeholder.svg")}
                      alt={getStrapiImageAlt(navigation.next.cover, navigation.next.title)}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </nav>
  )
}