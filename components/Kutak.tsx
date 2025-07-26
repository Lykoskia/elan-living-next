"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CalendarDaysIcon } from "@heroicons/react/24/solid"
import { AiFillLike } from "react-icons/ai"
import { RiTwitterXFill } from "react-icons/ri"
import { RichText } from "@/lib/richtext"
import { getAllKutakArticles, likeKutakArticle, unlikeKutakArticle } from "@/lib/api-client"
import { 
  type ProcessedKutakArticle, 
  type StrapiImage, 
  type StrapiRichText,
  getStrapiImageUrl,
  getStrapiImageAlt,
  isRichTextEmpty
} from "@/lib/types/strapi"

interface KutakProps {
  headerTitle?: string
  headerText?: StrapiRichText
  loadMoreLabel?: string
  backgroundImage?: StrapiImage
  locale: string
  isDefaultLocale?: boolean
}

const formatDisplayDate = (dateString?: string) => {
  if (!dateString) return ""
  const date = new Date(dateString + 'T00:00:00')
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}.`
}

const renderHeaderText = (text?: StrapiRichText) => {
  // ✅ Properly handle all StrapiRichText formats
  if (!text || isRichTextEmpty(text)) {
    return "Njega i briga o starijim osobama istodobno je zahtjevna i katkad iscrpljujuća, a s druge strane, govorimo o iznimno važnom i nagrađujućem radu. Kako bi Vam olakšali Vaš svakodnevni posao - potruditi ćemo se redovito objavljivati korisne savjete za potrebe edukacije Elan njegavljica."
  }
  
  if (typeof text === 'string') {
    return text
  }
  
  return <RichText content={text} />
}

// localStorage helpers for documentId (strings)
const LIKED_ARTICLES_KEY = 'kutak-liked-articles';

const getLikedArticles = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const liked = localStorage.getItem(LIKED_ARTICLES_KEY);
    return liked ? JSON.parse(liked) : [];
  } catch (error) {
    console.error('LocalStorage error:', error);
    return [];
  }
};

const saveLikedArticles = (articles: string[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIKED_ARTICLES_KEY, JSON.stringify(articles));
  } catch (error) {
    console.error('LocalStorage save error:', error);
  }
};

export default function Kutak({
  headerTitle,
  headerText,
  loadMoreLabel,
  backgroundImage,
  locale,
  isDefaultLocale = true
}: KutakProps) {
  const [allArticles, setAllArticles] = useState<ProcessedKutakArticle[]>([])
  const [visibleCount, setVisibleCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Like state using documentId strings
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})
  const [articleLikes, setArticleLikes] = useState<Record<string, number>>({})
  const [likingInProgress, setLikingInProgress] = useState<Record<string, boolean>>({})

  // Load articles with proper documentId handling
  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true)
        setError(null)

        const articles = await getAllKutakArticles(locale)

        if (!articles) {
          throw new Error('Failed to fetch articles')
        }

        setAllArticles(articles)

        // Initialize like counts and user states using documentId (strings)
        const likes: Record<string, number> = {}
        const userLikedState: Record<string, boolean> = {}
        const likedArticleIds = getLikedArticles();

        articles.forEach((article: ProcessedKutakArticle) => {
          const articleId = article.id; // This is now documentId (string)
          likes[articleId] = article.likes || 0
          userLikedState[articleId] = likedArticleIds.includes(articleId)
        })

        setArticleLikes(likes)
        setUserLikes(userLikedState)

      } catch (err) {
        console.error('Error fetching articles:', err)
        setError('Failed to load articles. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [locale])

  // Like handler using documentId (string)
  const handleLike = async (articleId: string) => {
    if (likingInProgress[articleId]) return;

    const isCurrentlyLiked = userLikes[articleId] || false;
    const currentLikeCount = articleLikes[articleId] || 0;

    try {
      setLikingInProgress(prev => ({ ...prev, [articleId]: true }));

      // Optimistic update
      const newLikedState = !isCurrentlyLiked;
      const newLikeCount = isCurrentlyLiked ? Math.max(0, currentLikeCount - 1) : currentLikeCount + 1;

      setUserLikes(prev => ({ ...prev, [articleId]: newLikedState }));
      setArticleLikes(prev => ({ ...prev, [articleId]: newLikeCount }));

      // API call using documentId (string)
      const result = isCurrentlyLiked
        ? await unlikeKutakArticle(articleId)
        : await likeKutakArticle(articleId);

      if (!result.success) {
        // Revert on failure
        setUserLikes(prev => ({ ...prev, [articleId]: isCurrentlyLiked }));
        setArticleLikes(prev => ({ ...prev, [articleId]: currentLikeCount }));
        console.error('API call failed');
      } else {
        // Update localStorage with documentId (string)
        const currentLiked = getLikedArticles();
        if (isCurrentlyLiked) {
          const updated = currentLiked.filter(id => id !== articleId);
          saveLikedArticles(updated);
        } else {
          if (!currentLiked.includes(articleId)) {
            saveLikedArticles([...currentLiked, articleId]);
          }
        }

        // Update with server response
        if (result.data?.likes !== undefined) {
          setArticleLikes(prev => ({ ...prev, [articleId]: result.data!.likes }));
        }
      }
    } catch (error) {
      console.error('Like error:', error);
      // Revert on error
      setUserLikes(prev => ({ ...prev, [articleId]: isCurrentlyLiked }));
      setArticleLikes(prev => ({ ...prev, [articleId]: currentLikeCount }));
    } finally {
      setLikingInProgress(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const showMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => prev + 1)
      setLoadingMore(false)
    }, 300)
  }

  const handleShare = (article: ProcessedKutakArticle) => {
    const shareData = {
      title: article.title,
      text: `Check out this article: ${article.title}`,
      url: `${window.location.origin}${window.location.pathname}#article-${article.id}`
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => fallbackShare(article))
    } else {
      fallbackShare(article)
    }
  }

  const fallbackShare = (article: ProcessedKutakArticle) => {
    const tweetText = encodeURIComponent(`Check out this article: ${article.title}`)
    const tweetUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}#article-${article.id}`)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  // ✅ FIXED: Use utility function instead of V4 syntax
  const bgImageUrl = getStrapiImageUrl(backgroundImage, '/img/448479986.png')

  const visibleArticles = allArticles.slice(0, visibleCount)
  const hasMore = visibleCount < allArticles.length

  // Loading state
  if (loading) {
    return (
      <div className="mt-[120px] lg:mt-[155px] flex flex-col items-center justify-center w-full overflow-hidden">
        <div className="w-full text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-elanpurple border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mt-[120px] lg:mt-[155px] flex flex-col items-center justify-center w-full overflow-hidden">
        <div className="text-center py-16">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading articles</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-elanpurple text-white rounded-lg hover:bg-elanpurple/80 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-[120px] lg:mt-[155px] flex flex-col items-center justify-center w-full overflow-hidden">
      {/* Header Section */}
      <section
        className="w-full h-full lg:h-[676px] bg-cover bg-center bg-no-repeat flex flex-col items-start justify-start px-[30px] lg:px-[191px] pt-[74px] pb-[119px]"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      >
        <Image
          alt="Elan logo"
          className="h-[128px] w-[261px] mb-[55px]"
          src="/img/elan-web-logo.png"
          width={261}
          height={128}
        />
        <h1 className="text-[38px] lg:text-[80px] font-serif lg:leading-[80px] text-elanpurple w-full lg:w-[60%] mb-[75px]">
          {headerTitle || "Kutak za ELAN njegavljice"}
        </h1>
        <div className="text-base lg:leading-[32px] text-[#626262] pr-0 lg:pr-[350px] w-full lg:w-[1136px] font-medium">
          {renderHeaderText(headerText)}
        </div>
      </section>

      {/* Articles Section */}
      <section className="px-10 w-full lg:w-auto lg:px-[194px] py-[35px] flex flex-col items-start justify-start relative">
        {allArticles.length === 0 ? (
          <div className="w-full text-center py-12">
            <p className="text-lg text-gray-600">No articles available yet.</p>
          </div>
        ) : (
          visibleArticles.map((article, index) => {
            const isLiked = userLikes[article.id] || false
            const isLiking = likingInProgress[article.id] || false

            // ✅ FIXED: Use utility functions for article images
            const articleImageUrl = getStrapiImageUrl(article.image)
            const articleImageAlt = getStrapiImageAlt(article.image, article.title)

            // ✅ FIXED: Use utility functions for download link
            const downloadUrl = article.downloadLink ? getStrapiImageUrl(article.downloadLink) : null

            return (
              <article
                key={article.id}
                id={`article-${article.id}`}
                className="w-full lg:w-[1130px] h-auto flex flex-col items-start justify-start mb-[14px]"
              >

                {/* Article Header */}
                <div className="w-full flex flex-col-reverse items-center lg:items-center justify-between gap-4 lg:gap-6 mb-4">
                  <p className="text-[18px] leading-[18px] pl-0 lg:pl-[28px] pt-[24px] text-elanpurple">
                    <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2" /> {formatDisplayDate(article.publishDate)}
                  </p>
                  <h2 className="font-serif text-[33px] lg:text-[65.12px] leading-[49.5px] lg:leading-[87.68px] pt-[6px]">
                    {article.title}
                  </h2>
                </div>

                {/* Article Content */}
                <div className="w-full h-auto flex items-center justify-center lg:gap-[50px] mb-[14px]">
                  <div className="w-full lg:w-[970px] h-auto text-base leading-[32px] space-y-8">
                    {/* ✅ FIXED: Use utility functions for image handling */}
                    {article.image && articleImageUrl && (
                      <Image
                        src={articleImageUrl}
                        alt={articleImageAlt}
                        className="w-full lg:w-[970px] h-auto lg:h-[569px] py-2.5 object-cover rounded-lg"
                        width={970}
                        height={569}
                      />
                    )}
                    <div className="px-[8px] lg:px-[12px] text-gray-800 leading-relaxed mx-auto">
                      <RichText content={article.content} />
                    </div>
                  </div>
                </div>

                {/* Download Section */}
                {article.download && article.downloadLink && downloadUrl && (
                  <div className="flex gap-[18px] items-center justify-start w-full h-[52px] pl-0 lg:pl-[160px] my-[24px]">
                    <Image
                      src="/img/pdf.png"
                      alt="PDF icon"
                      className="w-9 h-9"
                      width={36}
                      height={36}
                    />
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[12px] leading-[10.8px] text-gray-600">
                        {article.downloadTitle}
                      </p>
                      <a
                        href={downloadUrl}
                        className="text-[#0000ee] text-base leading-[32px] font-semibold hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        download={article.downloadLink.name ? `${article.downloadLink.name}${article.downloadLink.ext || ''}` : undefined}
                      >
                        {article.downloadText}
                      </a>
                    </div>
                  </div>
                )}

                {/* Social Actions */}
                <div className="w-full h-[46px] flex gap-[44px] items-center justify-start mb-[56px]">
                  <button
                    onClick={() => handleLike(article.id)}
                    disabled={isLiking}
                    className={`min-w-[68px] h-[20px] flex gap-1 rounded-[3px] text-white items-center justify-center px-2 transition-all ${isLiked
                        ? 'bg-[#1565C0] hover:bg-[#0d4494] cursor-pointer'
                        : 'bg-[#1877F2] hover:bg-[#1565C0] cursor-pointer'
                      } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isLiked ? "Unlike this article" : "Like this article"}
                  >
                    <AiFillLike className={`w-4 h-4 transition-transform ${isLiked ? 'scale-110' : ''}`} />
                    <span className="text-[11px] font-semibold">
                      {isLiking ? '...' : (isLiked ? 'Unlike' : 'Like')}
                    </span>
                    <span className="text-[11px] font-light">{articleLikes[article.id] || 0}</span>
                  </button>

                  <button
                    onClick={() => handleShare(article)}
                    className="inline-flex items-center justify-center gap-[3px] px-3 py-px h-[20px] relative bg-black rounded-full hover:bg-slate-950 transition-colors cursor-pointer"
                    title="Share this article"
                  >
                    <RiTwitterXFill className="w-4 h-4 text-white" />
                    <span className="text-xs font-semibold text-white">
                      {article.shareText || "Share"}
                    </span>
                  </button>
                </div>
              </article>
            )
          })
        )}

        {/* Show More Button */}
        {hasMore && (
          <button
            onClick={showMore}
            disabled={loadingMore}
            className={`font-sans text-base text-center mx-auto mt-4 lg:mt-8 px-6 py-3 border-2 rounded-full uppercase transition-all ${loadingMore
              ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-elanpurple border-elanpurple hover:bg-transparent text-white hover:text-black hover:border-black'
              }`}
          >
            {loadingMore ? "Loading..." : (loadMoreLabel || "Load More")}
          </button>
        )}
      </section>
    </div>
  )
}