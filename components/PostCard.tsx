// components/PostCard.tsx
import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, PencilIcon, TagIcon } from "@heroicons/react/24/outline"
import { 
  type Article,
  getStrapiImageUrl,
  getStrapiImageAlt 
} from "@/lib/types/strapi"

interface PostCardProps {
  article: Article
  locale?: string
  isDefaultLocale?: boolean
  featured?: boolean
  className?: string
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

export default function PostCard({
  article,
  locale = 'hr',
  isDefaultLocale = true,
  featured = false,
  className = ""
}: PostCardProps) {
  const publishDate = formatDisplayDate(article.publishDate)

  const articleUrl = isDefaultLocale
    ? `/blog/${article.slug}`
    : `/${locale}/blog/${article.slug}`

  // ✅ Use utility functions instead of direct property access
  const coverUrl = getStrapiImageUrl(article.cover, "/placeholder.svg")
  const coverAlt = getStrapiImageAlt(article.cover, article.title || "Article image")

  return (
    <article className={`group bg-white rounded-xl shadow-sm border border-elanpurple overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-200 hover:-translate-y-2 hover:scale-105 h-full ${featured ? 'lg:col-span-2 lg:row-span-2' : ''} ${className}`}>
      <Link href={articleUrl} className="h-full flex flex-col">
        {/* Featured Image */}
        {article.cover && (
          <div className={`relative overflow-hidden flex-shrink-0 ${featured ? 'h-64 lg:h-80' : 'h-48'}`}>
            <Image
              src={coverUrl}
              alt={coverAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={featured ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"}
            />

            {/* Featured badge */}
            {article.featured && (
              <div className="absolute top-4 left-4">
                <span className="bg-elanpurple text-white px-3 py-1 rounded-full text-sm font-medium">
                  Izdvojeno
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content - Using flex-grow to fill remaining space */}
        <div className={`flex flex-col flex-grow ${featured ? 'p-8' : 'p-6'}`}>

          {/* Title - Fixed line-clamp with proper centering */}
          <div className={`mb-6 border-y border-gray-200 ${featured ? 'min-h-[3.5rem] lg:min-h-[4rem]' : 'min-h-[3rem]'} flex items-center justify-center`}>
            <h3 className={`font-bold text-gray-900 text-center group-hover:text-elanpurple transition-all duration-300 ${featured ? 'text-xl lg:text-2xl' : 'text-lg'} line-clamp-2 group-hover:line-clamp-none`}>
              {article.title}
            </h3>
          </div>

          {/* Category */}
          {article.category && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1 text-xs font-medium text-elanpurple bg-elanpurple/10 px-2 py-1 rounded-full"
              >
                <TagIcon className="h-3 w-3" />
                {article.category.name}
              </span>
            </div>
          )}

          {/* Description (excerpt) - Smaller font with hover to show full text */}
          <div className="flex-grow">
            {article.description && (
              <p className={`text-gray-600 mb-6 transition-all duration-300 ${featured ? 'text-base line-clamp-3 group-hover:line-clamp-none' : 'text-sm line-clamp-2 group-hover:line-clamp-none'}`}>
                {article.description}
              </p>
            )}
          </div>

          {/* Meta information - Pushed to bottom */}
          <div className="mt-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 mb-4">
              {/* Author */}
              {article.author && (
                <div className="flex items-center gap-1">
                  <PencilIcon className="h-4 w-4 text-elanpurple" />
                  <span className="font-bold">{article.author.name}</span>
                </div>
              )}

              {/* Published date */}
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-green-500" />
                <time dateTime={article.publishDate} className="font-bold">
                  {publishDate}
                </time>
              </div>
            </div>

            {/* Read more indicator - Always at bottom */}
            <div className="pt-4 border-t border-gray-200">
              <span className="text-elanpurple font-medium text-sm group-hover:text-elanpurple/80 transition-colors">
                Pročitajte više →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

/**
 * Grid layout for PostCards with responsive design
 */
export function PostCardGrid({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Featured PostCard with larger layout
 */
export function FeaturedPostCard(props: Omit<PostCardProps, 'featured'>) {
  return <PostCard {...props} featured={true} className="col-span-full lg:col-span-2" />
}

// Re-export types for convenience
export type { Article } from "@/lib/types/strapi"