/**
 * Extended API client for Strapi CMS with Blog and Jobs functionality
 * Supports both standard Strapi REST API and custom routes
 * UPDATED for Strapi 5 with proper documentId handling
 */

import type {
  KutakArticleV5,
  KutakArticlesResponseV5,
  ProcessedKutakArticle,
  KutakLikeResponse
} from '@/lib/types/kutak';

// Import Article type from centralized types
import type { Article } from '@/lib/types/blog';

// Re-export for convenience
export type { Article } from '@/lib/types/blog';
export type { ProcessedKutakArticle } from '@/lib/types/kutak';

// Job types
export interface Job {
  id: number
  title?: string
  jobStart: string
  location: string
  salary: number
  patientDescription: any[] // Rich text array from Strapi
  requirements: string[] | { text: string }[] // Array of strings or requirement objects
  advantages?: string[] | { text: string }[] // Array of strings or advantage objects
  featured?: boolean
  image?: {
    url: string
    alternativeText?: string
  }
  publishDate: string
  createdAt: string
  updatedAt: string
}

// Base query options type
export interface ApiQueryOptions {
  locale?: string;
  filters?: Record<string, any>;
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  sort?: string[];
  populate?: string | string[] | Record<string, any>;
}

// Job-specific response types
interface JobsResponse {
  data: Job[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface GetJobsParams {
  locale?: string
  sort?: string[]
  populate?: string | string[] | Record<string, any>
  filters?: Record<string, any>
  pagination?: {
    page?: number
    pageSize?: number
  }
}

// Define valid locales for the application
export const VALID_LOCALES = ['hr', 'en', 'de'];
export const DEFAULT_LOCALE = 'hr';

// Toggle between standard Strapi API and custom routes
const USE_CUSTOM_ROUTES = false; // Set to true to use your custom website.js routes

// Helper function to validate locale
function validateLocale(locale: string | undefined): string {
  if (!locale) return DEFAULT_LOCALE;
  return VALID_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

// Global cache for navigation data
const navigationCache: Record<string, any> = {};

/**
 * Get global data including navigation
 */
export async function getGlobalData(locale: string) {
  const safeLocale = validateLocale(locale);

  // Check cache first
  const cacheKey = `global_${safeLocale}`;
  if (navigationCache[cacheKey]) {
    return navigationCache[cacheKey];
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

    let url: string;
    if (USE_CUSTOM_ROUTES) {
      url = `${apiUrl}/api/website/navigation/${safeLocale}`;
    } else {
      url = `${apiUrl}/api/global?locale=${safeLocale}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`❌ Global API Error: ${response.status}`);
      const errorText = await response.text();
      console.warn(`❌ Error details: ${errorText}`);
      return null;
    }

    const result = await response.json();

    const data = result.data;

    if (data) {
      navigationCache[cacheKey] = data;
    }

    return data;

  } catch (error) {
    console.error(`❌ Global API error for ${safeLocale}:`, error);
    return null;
  }
}

/**
 * Get homepage data
 */
export async function getHomepage(locale: string) {
  const safeLocale = validateLocale(locale);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

    let url: string;
    if (USE_CUSTOM_ROUTES) {
      url = `${apiUrl}/api/website/homepage/${safeLocale}`;
    } else {
      url = `${apiUrl}/api/homepage?locale=${safeLocale}&populate[sections][populate]=*`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`❌ Homepage API Error: ${response.status}`);
      const errorText = await response.text();
      console.warn(`❌ Error details: ${errorText}`);
      return null;
    }

    const result = await response.json();

    return result.data;

  } catch (error) {
    console.error(`❌ Homepage API error for ${safeLocale}:`, error);
    return null;
  }
}

/**
 * Get all articles with optional filtering and sorting
 */
export async function getArticles(options: ApiQueryOptions = {}): Promise<{ data: Article[], meta: any } | null> {
  const safeLocale = validateLocale(options.locale);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

    // Build query parameters
    const params = new URLSearchParams();

    // Add locale
    params.append('locale', safeLocale);

    // Add population - be specific about which fields we need
    params.append('populate[author][fields]', 'name,email');
    params.append('populate[author][populate][avatar][fields]', 'url,alternativeText');
    params.append('populate[cover][fields]', 'url,alternativeText');
    params.append('populate[category][fields]', 'name,slug');

    // Add pagination
    if (options.pagination?.page) {
      params.append('pagination[page]', options.pagination.page.toString());
    }
    if (options.pagination?.pageSize) {
      params.append('pagination[pageSize]', options.pagination.pageSize.toString());
    }

    // Add sorting (default to newest first)
    const sortOrder = options.sort || ['publishDate:desc'];
    sortOrder.forEach(sort => params.append('sort', sort));

    // Add filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filters[${key}]`, value.toString());
        }
      });
    }

    const url = `${apiUrl}/api/articles?${params.toString()}`;

    console.log(`🔍 Fetching articles: ${url}`);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`❌ Articles API Error: ${response.status}`);
      const errorText = await response.text();
      console.warn(`❌ Error details: ${errorText}`);
      return null;
    }

    const result = await response.json();
    console.log(`✅ Articles API success for ${safeLocale} - Found ${result.data?.length || 0} articles`);

    return result;

  } catch (error) {
    console.error(`❌ Articles API error for ${safeLocale}:`, error);
    return null;
  }
}

/**
 * Get featured articles specifically
 */
export async function getFeaturedArticles(locale: string, limit: number = 6): Promise<Article[] | null> {
  const result = await getArticles({
    locale,
    filters: {
      featured: true
    },
    pagination: {
      pageSize: limit
    },
    sort: ['publishDate:desc']
  });

  return result?.data || null;
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string, locale: string): Promise<Article | null> {
  const safeLocale = validateLocale(locale);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

    // Build query parameters
    const params = new URLSearchParams();
    params.append('locale', safeLocale);
    params.append('filters[slug]', slug);
    params.append('populate[author][fields]', 'name,email');
    params.append('populate[author][populate][avatar][fields]', 'url,alternativeText');
    params.append('populate[cover][fields]', 'url,alternativeText');
    params.append('populate[category][fields]', 'name,slug');

    const url = `${apiUrl}/api/articles?${params.toString()}`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`❌ Article API Error: ${response.status}`);
      const errorText = await response.text();
      console.warn(`❌ Response: ${errorText}`);
      return null;
    }

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      return result.data[0];
    } else {
      return null;
    }

  } catch (error) {
    console.error(`❌ Article API error for ${safeLocale}/${slug}:`, error);
    return null;
  }
}

/**
 * Get all jobs with optional filtering and sorting
 */
export async function getJobs(params: GetJobsParams = {}): Promise<JobsResponse | null> {
  const {
    locale = DEFAULT_LOCALE,
    sort = ['jobStart:desc'],
    populate = ['image'],
    filters = {},
    pagination = {}
  } = params

  const safeLocale = validateLocale(locale);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    const searchParams = new URLSearchParams()

    // Add locale
    searchParams.append('locale', safeLocale)

    // Add sorting
    sort.forEach(sortItem => {
      searchParams.append('sort', sortItem)
    })

    // Add population - handle different populate types
    if (populate) {
      if (typeof populate === 'string') {
        searchParams.append('populate', populate)
      } else if (Array.isArray(populate)) {
        populate.forEach(popItem => {
          searchParams.append('populate', popItem)
        })
      } else if (typeof populate === 'object') {
        // Handle object-style populate (like for nested relations)
        Object.entries(populate).forEach(([key, value]) => {
          if (typeof value === 'string') {
            searchParams.append(`populate[${key}]`, value)
          } else if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`populate[${key}]`, v))
          }
        })
      }
    }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(`filters[${key}]`, value.toString())
      }
    })

    // Add pagination
    if (pagination.page) {
      searchParams.append('pagination[page]', pagination.page.toString())
    }
    if (pagination.pageSize) {
      searchParams.append('pagination[pageSize]', pagination.pageSize.toString())
    }

    const url = `${apiUrl}/api/jobs?${searchParams.toString()}`
    console.log('🔍 Fetching jobs from:', url)

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ Jobs fetch failed:', response.status, response.statusText)
      const errorText = await response.text();
      console.warn(`❌ Error details: ${errorText}`);
      return null
    }

    const data: JobsResponse = await response.json()
    console.log('✅ Jobs fetched successfully:', data.data.length, 'jobs')

    return data
  } catch (error) {
    console.error('❌ Error fetching jobs:', error)
    return null
  }
}

/**
 * Get featured jobs specifically
 */
export async function getFeaturedJobs(locale: string, limit: number = 6): Promise<Job[] | null> {
  const result = await getJobs({
    locale,
    filters: {
      featured: true
    },
    pagination: {
      pageSize: limit
    },
    sort: ['publishDate:desc']
  });

  return result?.data || null;
}

/**
 * Get a single job by ID
 */
export async function getJobById(id: number, locale: string = DEFAULT_LOCALE): Promise<Job | null> {
  const safeLocale = validateLocale(locale);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    const searchParams = new URLSearchParams()
    searchParams.append('locale', safeLocale)
    searchParams.append('populate', 'image')

    const url = `${apiUrl}/api/jobs/${id}?${searchParams.toString()}`
    console.log('🔍 Fetching job from:', url)

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ Job fetch failed:', response.status, response.statusText)
      const errorText = await response.text();
      console.warn(`❌ Error details: ${errorText}`);
      return null
    }

    const data = await response.json()
    console.log('✅ Job fetched successfully:', data.data.title || `Job #${data.data.id}`)

    return data.data
  } catch (error) {
    console.error('❌ Error fetching job:', error)
    return null
  }
}

/**
 * ==============================
 * KUTAK ARTICLES - STRAPI 5 FIXED
 * ==============================
 */

/**
 * Get ALL Kutak articles - FIXED to only fetch PUBLISHED content
 */
export async function getAllKutakArticles(locale: string = 'hr'): Promise<ProcessedKutakArticle[] | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

    const params = new URLSearchParams();
    params.append('locale', locale);
    params.append('pagination[pageSize]', '100');
    params.append('sort', 'publishDate:desc');

    // CRITICAL: Only fetch PUBLISHED content
    params.append('publicationState', 'live'); // This ensures only published content

    // Request both id and documentId explicitly
    params.append('fields', 'documentId,id,title,content,publishDate,likes,download,downloadTitle,downloadText,shareText,createdAt,updatedAt,publishedAt');
    params.append('populate[image][fields]', 'url,alternativeText,documentId,id');
    params.append('populate[downloadLink][fields]', 'url,name,ext,documentId,id');

    const url = `${apiUrl}/api/kutak-articles?${params.toString()}`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`❌ Kutak Articles API Error: ${response.status}`);
      const errorText = await response.text();
      console.warn(`❌ Error details: ${errorText}`);
      return null;
    }

    const result: KutakArticlesResponseV5 = await response.json();

    if (!result.data || result.data.length === 0) {
      return [];
    }

    // Process articles and use documentId as the primary identifier
    const processedArticles: ProcessedKutakArticle[] = result.data.map((article: KutakArticleV5) => {
      const processed = processMediaUrls(article);

      // Use documentId as the main id for frontend consistency
      const processedArticle: ProcessedKutakArticle = {
        ...processed,
        id: processed.documentId,        // This is the stable identifier (string)
        databaseId: processed.id,        // This is the auto-incrementing database ID (number)
      };

      return processedArticle;
    });

    return processedArticles;

  } catch (error) {
    console.error(`❌ Kutak Articles API error:`, error);
    return null;
  }
}

/**
 * Like article - FIXED to use documentId (string)
 */
export async function likeKutakArticle(documentId: string): Promise<KutakLikeResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    console.log(`🔍 Liking article with documentId: ${documentId}`);

    const response = await fetch(`${apiUrl}/api/kutak-articles/${documentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error(`❌ Like failed: ${response.status}`);
      const errorText = await response.text();
      console.error(`❌ Error response:`, errorText);
      return { success: false };
    }

    const result = await response.json();
    console.log(`✅ Like result:`, result);

    return {
      success: result.success || true,
      data: {
        id: documentId,  // Keep using documentId as the stable identifier
        likes: result.data?.likes || 0
      }
    };
  } catch (error) {
    console.error('❌ Like error:', error);
    return { success: false };
  }
}

/**
 * Unlike article - FIXED to use documentId (string)
 */
export async function unlikeKutakArticle(documentId: string): Promise<KutakLikeResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    console.log(`🔍 Unliking article with documentId: ${documentId}`);

    const response = await fetch(`${apiUrl}/api/kutak-articles/${documentId}/unlike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error(`❌ Unlike failed: ${response.status}`);
      const errorText = await response.text();
      console.error(`❌ Error response:`, errorText);
      return { success: false };
    }

    const result = await response.json();
    console.log(`✅ Unlike result:`, result);

    return {
      success: result.success || true,
      data: {
        id: documentId,  // Keep using documentId as the stable identifier
        likes: result.data?.likes || 0
      }
    };
  } catch (error) {
    console.error('❌ Unlike error:', error);
    return { success: false };
  }
}

/**
 * ==============================
 * OTHER EXISTING FUNCTIONS
 * ==============================
 */

/**
 * Get a page by slug - Enhanced with debugging
 */
export async function getPageBySlug(slug: string, locale: string) {
  const safeLocale = validateLocale(locale);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

    let url: string;
    if (USE_CUSTOM_ROUTES) {
      url = `${apiUrl}/api/website/page/${safeLocale}/${encodeURIComponent(slug)}`;
    } else {
      url = `${apiUrl}/api/pages?locale=${safeLocale}&filters[slug]=${encodeURIComponent(slug)}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`❌ Page API Error: ${response.status}`);
      const errorText = await response.text();
      console.warn(`❌ Response: ${errorText}`);
      return null;
    }

    const result = await response.json();

    if (USE_CUSTOM_ROUTES) {
      if (result.data) {
        return [result.data];
      } else {
        return [];
      }
    } else {
      return result.data || [];
    }

  } catch (error) {
    console.error(`❌ Page API error for ${safeLocale}/${slug}:`, error);
    return null;
  }
}

/**
 * Check if a slug is a blog page
 */
export function isBlogPage(slug: string): boolean {
  return slug === 'blog' || slug.startsWith('blog/');
}

/**
 * Check if a slug is an individual article
 */
export function isArticlePage(slug: string): boolean {
  return slug.startsWith('blog/') && slug !== 'blog';
}

/**
 * Extract article slug from full path
 */
export function getArticleSlug(slug: string): string {
  return slug.replace('blog/', '');
}

/**
 * Fetch any content type - routes to appropriate API
 */
export async function fetchContent(contentType: string, options: ApiQueryOptions = {}) {
  const locale = validateLocale(options.locale);

  switch (contentType) {
    case 'global':
      return await getGlobalData(locale);
    case 'homepage':
      return await getHomepage(locale);
    case 'articles':
      return await getArticles(options);
    case 'featured-articles':
      return await getFeaturedArticles(locale, options.pagination?.pageSize);
    case 'jobs':
      return await getJobs({ locale, ...options });
    case 'featured-jobs':
      return await getFeaturedJobs(locale, options.pagination?.pageSize);
    case 'pages':
      console.warn('fetchContent with "pages" requires a slug. Use getPageBySlug instead.');
      return null;
    default:
      console.warn(`Content type "${contentType}" not supported.`);
      return null;
  }
}

/**
 * Process media URLs - keeping for compatibility
 */
export function processMediaUrls(data: any) {
  if (!data) return data;

  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

  const processed = JSON.parse(JSON.stringify(data));

  function processItem(item: any): any {
    if (!item) return item;

    if (Array.isArray(item)) {
      return item.map(i => processItem(i));
    }

    if (typeof item === 'object') {
      if (item.url && typeof item.url === 'string') {
        if (item.url.startsWith('/uploads')) {
          item.url = `${apiUrl}${item.url}`;
        }

        if (item.formats) {
          Object.keys(item.formats).forEach(format => {
            if (item.formats[format].url && item.formats[format].url.startsWith('/uploads')) {
              item.formats[format].url = `${apiUrl}${item.formats[format].url}`;
            }
          });
        }
      }

      Object.keys(item).forEach(key => {
        item[key] = processItem(item[key]);
      });
    }

    return item;
  }

  return processItem(processed);
}

/**
 * Debug function to test API endpoints
 */
export async function debugWorkingApi() {
  const results: any = {};

  for (const locale of VALID_LOCALES) {
    results[locale] = {
      navigation: await getGlobalData(locale),
      homepage: await getHomepage(locale),
      articles: await getArticles({ locale, pagination: { pageSize: 5 } }),
      featuredArticles: await getFeaturedArticles(locale, 3),
      jobs: await getJobs({ locale, pagination: { pageSize: 5 } }),
      featuredJobs: await getFeaturedJobs(locale, 3),
      kutakArticles: await getAllKutakArticles(locale), // Add kutak articles to debug
    };

    const samplePage = await getPageBySlug('about', locale);
    results[locale].samplePage = samplePage;

    const sampleArticle = await getArticleBySlug('sample-article', locale);
    results[locale].sampleArticle = sampleArticle;
  }

  return results;
}