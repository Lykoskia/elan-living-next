"use client";

import { useState, useMemo, useEffect } from "react";
import { MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getArticles, processMediaUrls } from "@/lib/api-client";
import PostCard, { PostCardGrid, FeaturedPostCard } from "@/components/PostCard";
import { RichText } from "@/lib/richtext";
import type { Article, StrapiRichText } from "@/lib/types/strapi";

interface BlogListingSectionProps {
  featuredTitle?: string;
  allTitle?: string;
  showFeatured?: boolean;
  featuredCount?: number;
  articlesPerPage?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  introText?: StrapiRichText;

  // System props
  locale?: string;
  isDefaultLocale?: boolean;
}

// Sorting options with proper typing
const SORT_OPTIONS = [
  { value: 'newest', label: 'Najnoviji prvi', key: 'publishDate', order: 'desc' },
  { value: 'oldest', label: 'Najstariji prvi', key: 'publishDate', order: 'asc' },
  { value: 'title-asc', label: 'Naslov A-Z', key: 'title', order: 'asc' },
  { value: 'title-desc', label: 'Naslov Z-A', key: 'title', order: 'desc' },
] as const;

// Type for sort option values
type SortOptionValue = typeof SORT_OPTIONS[number]['value'];

// Type-safe sorting function
function sortArticles(articles: Article[], sortKey: string, sortOrder: string): Article[] {
  return [...articles].sort((a: Article, b: Article) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortKey === 'publishDate') {
      aValue = new Date(a.publishDate).getTime();
      bValue = new Date(b.publishDate).getTime();
    } else if (sortKey === 'title') {
      aValue = a.title.toLowerCase();
      bValue = b.title.toLowerCase();
    } else {
      // Fallback - should never happen with our defined sort options
      aValue = 0;
      bValue = 0;
    }

    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });
}

export default function BlogListingSection({
  featuredTitle = "Izdvojeno",
  allTitle = "Sve objave",
  showFeatured = true,
  featuredCount = 1,
  articlesPerPage = 3,
  showFilters = true,
  showSearch = true,
  introText,
  locale = 'hr',
  isDefaultLocale = true
}: BlogListingSectionProps) {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState<SortOptionValue>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState(1);

  // Fetch articles on component mount
  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);

        const articlesResponse = await getArticles({
          locale,
          sort: ['publishDate:desc'] // Latest first by default
        });

        if (!articlesResponse || !articlesResponse.data) {
          throw new Error('Failed to fetch articles');
        }

        const processedAllArticles = processMediaUrls(articlesResponse.data);
        setAllArticles(processedAllArticles);

        if (showFeatured) {
          const allFeaturedArticles = processedAllArticles
            .filter((article: Article) => article.featured)
            .sort((a: Article, b: Article) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

          setFeaturedArticles(allFeaturedArticles);
          
        }

      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [locale, showFeatured]);

  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    allArticles.forEach((article) => {
      if (article.category?.name) {
        categorySet.add(article.category.name);
      }
    });
    return Array.from(categorySet).sort();
  }, [allArticles]);

  const featuredPagination = useMemo(() => {
    const totalFeatured = featuredArticles.length;
    const totalFeaturedPages = Math.ceil(totalFeatured / featuredCount);
    const startIndex = (featuredCurrentPage - 1) * featuredCount;
    const endIndex = startIndex + featuredCount;
    const currentPageFeatured = featuredArticles.slice(startIndex, endIndex);

    return {
      totalFeatured,
      totalFeaturedPages,
      startIndex,
      endIndex,
      currentPageFeatured,
      hasNextFeatured: featuredCurrentPage < totalFeaturedPages,
      hasPreviousFeatured: featuredCurrentPage > 1,
      showPagination: totalFeaturedPages > 1 // Only show pagination if more than 1 page
    };
  }, [featuredArticles, featuredCurrentPage, featuredCount]);

  // Filter and sort articles (before pagination)
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = [...allArticles];

    // Apply search filter
    if (showSearch && searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(searchLower) ||
        article.description?.toLowerCase().includes(searchLower) ||
        article.author?.name?.toLowerCase().includes(searchLower) ||
        article.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedTag) {
      filtered = filtered.filter((article) =>
        article.category?.name === selectedTag
      );
    }

    // Apply sorting with type safety
    const sortOption = SORT_OPTIONS.find(option => option.value === selectedSort);
    if (sortOption) {
      filtered = sortArticles(filtered, sortOption.key, sortOption.order);
    }

    return filtered;
  }, [allArticles, searchTerm, selectedTag, selectedSort, showSearch]);

  const paginationInfo = useMemo(() => {
    const totalArticles = filteredAndSortedArticles.length;
    const totalPages = Math.ceil(totalArticles / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const currentPageArticles = filteredAndSortedArticles.slice(startIndex, endIndex);

    return {
      totalArticles,
      totalPages,
      startIndex,
      endIndex,
      currentPageArticles,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [filteredAndSortedArticles, currentPage, articlesPerPage]);

  // Reset to page 1 when filters change (regular articles)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag, selectedSort]);

  const goToFeaturedPage = (page: number) => {
    if (page >= 1 && page <= featuredPagination.totalFeaturedPages) {
      setFeaturedCurrentPage(page);
    }
  };

  const goToNextFeatured = () => goToFeaturedPage(featuredCurrentPage + 1);
  const goToPreviousFeatured = () => goToFeaturedPage(featuredCurrentPage - 1);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag(null);
    setSelectedSort('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedTag || selectedSort !== 'newest';

  // Generate page numbers for pagination (both regular and featured articles)
  const getPageNumbers = (currentPageNum: number, totalPages: number): (number | string)[] => {
    const delta = 2; // Show 2 pages before and after current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, currentPageNum - delta); i <= Math.min(totalPages - 1, currentPageNum + delta); i++) {
      range.push(i);
    }

    if (currentPageNum - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPageNum + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elanpurple"></div>
            <span className="ml-3 text-gray-600">Učitavam objave...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-16">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Greška kod prikazivanja objava
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-elanpurple text-white rounded-lg hover:bg-elanpurple/80 transition-colors"
            >
              Pokušajte ponovo
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="md:pb-24">
      {/* Intro Text */}
      {introText && (
        <div className="mx-auto px-8 md:px-12 mb-16 max-w-3xl">
          <RichText content={introText} />
        </div>
      )}
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Featured Articles Section with Pagination */}
        {showFeatured && featuredArticles.length > 0 && (
          <div className="mb-20">
            {/* Clean header - no pagination controls */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {featuredTitle}
              </h2>
            </div>

            {/* Show current page of featured articles */}
            <PostCardGrid className="mb-8">
              {featuredPagination.currentPageFeatured.map((article, index) => (
                // First article in the page gets special featured treatment
                index === 0 ? (
                  <FeaturedPostCard
                    key={article.id}
                    article={article}
                    locale={locale}
                    isDefaultLocale={isDefaultLocale}
                  />
                ) : (
                  <PostCard
                    key={article.id}
                    article={article}
                    locale={locale}
                    isDefaultLocale={isDefaultLocale}
                  />
                )
              ))}
            </PostCardGrid>

            {/* Full-width pagination matching regular articles style */}
            {featuredPagination.showPagination && (
              <div className="flex items-center justify-center mb-8">
                <nav className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousFeatured}
                    disabled={!featuredPagination.hasPreviousFeatured}
                    className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                      featuredPagination.hasPreviousFeatured
                        ? 'text-elanpurple hover:bg-elanpurple/10 hover:text-elanpurple/80'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Prethodna
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers(featuredCurrentPage, featuredPagination.totalFeaturedPages).map((pageNumber, index) => (
                      <button
                        key={index}
                        onClick={() => typeof pageNumber === 'number' ? goToFeaturedPage(pageNumber) : undefined}
                        disabled={pageNumber === '...'}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          pageNumber === featuredCurrentPage
                            ? 'bg-elanpurple text-white'
                            : pageNumber === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'text-gray-700 hover:bg-elanpurple/10 hover:text-elanpurple'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={goToNextFeatured}
                    disabled={!featuredPagination.hasNextFeatured}
                    className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                      featuredPagination.hasNextFeatured
                        ? 'text-elanpurple hover:bg-elanpurple/10 hover:text-elanpurple/80'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Sljedeća
                    <ChevronRightIcon className="h-5 w-5 ml-1" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}

        {/* All Articles Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {allTitle}
            </h2>

            {/* Filter Toggle Button */}
            {showFilters && (
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="flex items-center gap-2 px-4 py-2 bg-elanpurple/10 text-elanpurple rounded-lg hover:bg-elanpurple/20 transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
                <span className="font-medium">Filteri</span>
                {hasActiveFilters && (
                  <span className="bg-elanpurple text-white text-xs px-2 py-1 rounded-full">
                    Aktivni
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && filtersVisible && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search */}
                {showSearch && (
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                      Pretraži objave
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pretraži po naslovu, sadržaju ili autoru..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elanpurple focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                {allCategories.length > 0 && (
                  <div>
                    <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Filtriraj po kategoriji
                    </label>
                    <select
                      id="category-filter"
                      value={selectedTag || ''}
                      onChange={(e) => setSelectedTag(e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elanpurple focus:border-transparent"
                    >
                      <option value="">Sve kategorije</option>
                      {allCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort */}
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                    Sortiraj po:
                  </label>
                  <select
                    id="sort"
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value as SortOptionValue)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elanpurple focus:border-transparent"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={clearFilters}
                    className="text-elanpurple hover:text-elanpurple/80 font-medium text-sm transition-colors"
                  >
                    Poništi sve filtere
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Summary with Pagination Info */}
          {showFilters && (
            <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
              <span>
                Prikazuje se <span className="font-bold">{paginationInfo.startIndex + 1}-{Math.min(paginationInfo.endIndex, paginationInfo.totalArticles)}</span> od ukupno <span className="font-bold">{paginationInfo.totalArticles}</span> objava.
                {paginationInfo.totalPages > 1 && (
                  <span className="ml-2">
                    Stranica <span className="font-bold">{currentPage}</span> od <span className="font-bold">{paginationInfo.totalPages}</span>
                  </span>
                )}
              </span>
              {hasActiveFilters && (
                <span className="text-elanpurple">
                  Filteri primjenjeni
                </span>
              )}
            </div>
          )}

          {/* Articles Grid - Now showing paginated results */}
          {paginationInfo.currentPageArticles.length > 0 ? (
            <>
              <PostCardGrid>
                {paginationInfo.currentPageArticles.map((article) => (
                  <PostCard
                    key={article.id}
                    article={article}
                    locale={locale}
                    isDefaultLocale={isDefaultLocale}
                  />
                ))}
              </PostCardGrid>

              {/* Pagination Controls */}
              {paginationInfo.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center">
                  <nav className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={!paginationInfo.hasPreviousPage}
                      className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                        paginationInfo.hasPreviousPage
                          ? 'text-elanpurple hover:bg-elanpurple/10 hover:text-elanpurple/80'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeftIcon className="h-5 w-5 mr-1" />
                      Prethodna
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers(currentPage, paginationInfo.totalPages).map((pageNumber, index) => (
                        <button
                          key={index}
                          onClick={() => typeof pageNumber === 'number' ? goToPage(pageNumber) : undefined}
                          disabled={pageNumber === '...'}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                            pageNumber === currentPage
                              ? 'bg-elanpurple text-white'
                              : pageNumber === '...'
                              ? 'text-gray-400 cursor-default'
                              : 'text-gray-700 hover:bg-elanpurple/10 hover:text-elanpurple'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={goToNextPage}
                      disabled={!paginationInfo.hasNextPage}
                      className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                        paginationInfo.hasNextPage
                          ? 'text-elanpurple hover:bg-elanpurple/10 hover:text-elanpurple/80'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Sljedeća
                      <ChevronRightIcon className="h-5 w-5 ml-1" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            /* No Results State */
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nema pronađenih objava
              </h3>
              <p className="text-gray-600 mb-4">
                Pokušajte promijeniti kriterije pretrage ili filtere
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-elanpurple text-white rounded-lg hover:bg-elanpurple/80 transition-colors"
                >
                  Poništi filtere
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}