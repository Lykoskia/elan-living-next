"use client"

import Link from "next/link"
import { CalendarDaysIcon, PencilIcon } from "@heroicons/react/24/solid"

interface Post {
  uuid: string
  full_slug?: string
  published_date?: string
  content?: {
    body?: Array<{
      title?: string
      teaser?: string
      image?: {
        filename?: string
        alt?: string
      }
      author?: string
      readmore_label?: string
    }>
  }
}

interface AllPostsProps {
  posts: Post[]
  headlineText?: string
}

export default function AllPosts({ posts, headlineText }: AllPostsProps) {
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) {
      return ""
    }

    // Handle both formats (with or without time part)
    const datePart = dateString.includes(" ") ? dateString.split(" ")[0] : dateString.split("T")[0]

    const [year, month, day] = datePart.split("-")
    return `${day}.${month}.${year}.`
  }

  // Safe content extraction
  const getArticleContent = (article: Post) => {
    if (!article?.content?.body || !article.content.body[0]) {
      return {}
    }
    return article.content.body[0]
  }

  return (
    <section className="mt-4 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">{headlineText || "Sve objave"}</h2>
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const content = getArticleContent(post)

              return (
                <Link
                  href={`/${post.full_slug || "#"}`}
                  key={post.uuid}
                  className="block bg-purple-100 p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 hover:ring-2 hover:ring-elanpurple/75 group"
                >
                  <div className="flex flex-col h-full">
                    {content.image && content.image.filename && (
                      <img
                        src={content.image.filename || "/placeholder.svg"}
                        alt={content.image.alt || "Article Image"}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    )}
                    <div className="flex flex-col flex-grow">
                      <h3 className="mt-4 text-xl font-semibold text-center border-y-2 border-gray-200 bg-sky-100/50 uppercase">
                        {content.title || "No Title Available"}
                      </h3>
                      <div className="text-elangreen mt-4 text-right flex items-center justify-end border-y-2 border-gray-200 bg-red-100/20">
                        <CalendarDaysIcon className="h-6 w-6 mr-2" />
                        {formatDisplayDate(post.published_date) || "Unknown date."}
                      </div>
                      <p className="text-gray-600 mt-4 flex-grow">{content.teaser || "No teaser available."}</p>
                      <div className="mt-4">
                        <div className="text-elanpurple text-right flex items-center justify-end border-y-2 border-gray-200 bg-red-100/20">
                          <PencilIcon className="h-6 w-6 mr-2" />
                          {content.author || "Unknown author."}
                        </div>
                        <div className="mt-4">
                          <span className="text-blue-600 group-hover:text-blue-300 group-hover:scale-105 transition-colors duration-300 inline-block">
                            {content.readmore_label || "Read more"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Nema objava.</p>
          </div>
        )}
      </div>
    </section>
  )
}

// Export as named export as well for compatibility
export { AllPosts }
