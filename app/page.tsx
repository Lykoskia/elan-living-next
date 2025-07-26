// app/page.tsx - Homepage for default locale
import { Suspense } from 'react';
import { getHomepage, getGlobalData, DEFAULT_LOCALE } from '@/lib/api-client';
import { renderPageSections } from '@/lib/components-registry';
import { Spinner } from '@/components/Spinner';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const [globalData, pageData] = await Promise.all([
    getGlobalData(DEFAULT_LOCALE),
    getHomepage(DEFAULT_LOCALE)
  ]);
  
  // For homepage, just use siteName without separator
  const siteName = globalData?.siteName || 'ELAN Living';
  const siteDescription = pageData?.seo?.metaDescription || 
                         globalData?.siteDescription || 
                         'Profesionalna njega starijih osoba u njihovom domu';
  
  // Get OG image from page or global data
  const ogImage = pageData?.seo?.shareImage?.url || 
                  globalData?.defaultSeo?.shareImage?.url;
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elanliving.com';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
  
  return {
    title: siteName,
    description: siteDescription,
    openGraph: {
      title: siteName,
      description: siteDescription,
      siteName: siteName,
      locale: DEFAULT_LOCALE,
      type: 'website',
      url: baseUrl,
      images: ogImage ? [{
        url: ogImage.startsWith('http') ? ogImage : `${strapiUrl}${ogImage}`,
        width: 1200,
        height: 630,
        alt: siteName
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: siteDescription,
      images: ogImage ? [ogImage.startsWith('http') ? ogImage : `${strapiUrl}${ogImage}`] : undefined,
    },
    icons: globalData?.favicon?.url ? {
      icon: `${strapiUrl}${globalData.favicon.url}`
    } : undefined
  };
}

// Render the default locale homepage directly at the root
export default async function HomePage() {
  try {
    // Fetch homepage with the default locale
    const pageData = await getHomepage(DEFAULT_LOCALE);
    
    if (!pageData || !pageData.sections) {
      return (
        <main className="h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Elan Living</h1>
            <p>No homepage content found</p>
          </div>
        </main>
      );
    }
    
    return (
      <>
        <Suspense fallback={<Spinner />}>
          {renderPageSections(pageData.sections, DEFAULT_LOCALE)}
        </Suspense>
      </>
    );
  } catch (error) {
    console.error(`Error loading homepage:`, error);
    return (
      <main className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Elan Living</h1>
          <p>Error loading homepage content</p>
          <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
        </div>
      </main>
    );
  }
}