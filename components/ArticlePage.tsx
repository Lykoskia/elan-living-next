"use client"

import Image from "next/image"
import { CalendarIcon, PencilIcon } from "@heroicons/react/24/solid"
import { RichText } from "@/lib/richtext"
import ArticleNavigation from "@/components/ArticleNavigation"
import { 
  type Article,
  getStrapiImageUrl,
  getStrapiImageAlt 
} from "@/lib/types/strapi"

interface ArticlePageProps {
  article: Article
  locale?: string
  isDefaultLocale?: boolean
}

// Utility function for date formatting
const formatDisplayDate = (dateString: string) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}.`
}

export default function ArticlePage({
  article,
  locale = 'hr',
  isDefaultLocale = true
}: ArticlePageProps) {
  const publishDate = formatDisplayDate(article.publishDate)

  // Utility functions for cover image
  const coverImageUrl = getStrapiImageUrl(article.cover, "/placeholder.svg")
  const coverImageAlt = getStrapiImageAlt(article.cover, article.title || "Article image")

  return (
    <article className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 pt-32 pb-12 md:pt-40 md:pb-24 max-w-4xl">
        {/* Article Header */}
        <header className="my-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 md:mb-10 text-gray-900 leading-tight">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-xl text-gray-600 mb-8 font-semibold italic px-12 md:px-36">
              {article.description}
            </p>
          )}

          {/* Author and Date */}
          <div className="flex flex-wrap items-center justify-around gap-6 text-gray-600 border-y border-gray-200 py-4">
            {article.author && (
              <div className="flex items-center gap-2">
                <PencilIcon className="h-5 w-5 text-purple-600" />
                <span className="font-medium">{article.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              <time className="font-medium">{publishDate}</time>
            </div>
            {/* Category */}
            {article.category && (
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {article.category.name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Article Navigation - Top */}
        <ArticleNavigation
          currentArticle={article}
          locale={locale}
          isDefaultLocale={isDefaultLocale}
          className="mb-16"
        />

        {/* Featured Image */}
        {article.cover && coverImageUrl && (
          <figure className="mb-12">
            <Image
              src={coverImageUrl}
              alt={coverImageAlt}
              width={1280}
              height={853}
              className="rounded-lg shadow-lg"
              priority
            />
          </figure>
        )}

        {/* Article Content - Rich Text */}
        {article.content && (
          <div className="mb-16">
            <RichText
              content={article.content}
              className="prose prose-lg prose-slate max-w-4xl prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800 prose-a:transition-colors prose-li:marker:text-purple-500"
            />
          </div>
        )}

        {/* Article Navigation - Bottom */}
        <ArticleNavigation
          currentArticle={article}
          locale={locale}
          isDefaultLocale={isDefaultLocale}
          className="mt-16"
        />
      </div>
    </article>
  )
}