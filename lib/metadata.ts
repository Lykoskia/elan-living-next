import { Metadata } from 'next';
import { getGlobalData } from './api-client';

interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

/**
 * Generates metadata for a page based on global settings and page-specific data
 * 
 * @param locale The locale to fetch global data for (e.g. 'hr', 'en')
 * @param pageMetadata Optional page-specific metadata to override defaults
 * @returns Metadata object for Next.js
 */
export async function generateMetadata(
  locale: string,
  pageMetadata?: PageMetadata
): Promise<Metadata> {
  // Validate locale to prevent errors
  if (!locale || typeof locale !== 'string' || locale.includes('.')) {
    console.warn(`Invalid locale provided to metadata generator: ${locale}`);
    locale = 'hr'; // Default fallback if locale is invalid
  }
  
  // Fetch global data from Strapi
  const globalData = await getGlobalData(locale);
  
  if (!globalData) {
    // Fallback metadata if global data can't be fetched
    return {
      title: pageMetadata?.title || 'ELAN Living',
      description: pageMetadata?.description || 'Premium home care services',
    };
  }
  
  // Extract site info from global data
  const siteName = globalData.siteName || 'ELAN Living';
  const siteDescription = globalData.siteDescription || 'Premium home care services';
  
  // Default SEO from global data
  const defaultSeo = globalData.defaultSeo || {};
  const metaTitle = defaultSeo.metaTitle || siteName;
  const metaDescription = defaultSeo.metaDescription || siteDescription;
  
  // Construct favicon URL if it exists
  let favicon = undefined;
  if (globalData.favicon?.url) {
    const faviconUrl = globalData.favicon.url;
    // If URL is relative, add Strapi base URL
    if (faviconUrl.startsWith('/')) {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
      favicon = `${strapiUrl}${faviconUrl}`;
    } else {
      favicon = faviconUrl;
    }
  }
  
  // Combine global data with page-specific data, giving priority to page-specific
  const title = pageMetadata?.title 
    ? `${pageMetadata.title} | ${siteName}` 
    : metaTitle;
    
  const description = pageMetadata?.description || metaDescription;
  
  // Build the metadata object
  const metadata: Metadata = {
    title,
    description,
    keywords: pageMetadata?.keywords,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      title,
      description,
      images: pageMetadata?.ogImage ? [pageMetadata.ogImage] : undefined,
      siteName,
    },
  };

  return metadata;
}