// app/[lang]/page.tsx - Handle both language homepages AND default locale pages
import { Suspense } from 'react';
import { getHomepage, getPageBySlug, getGlobalData, DEFAULT_LOCALE } from '@/lib/api-client';
import { renderPageSections } from '@/lib/components-registry';
import { Spinner } from '@/components/Spinner';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

// Valid locales
const VALID_LOCALES = ['hr', 'en', 'de'];

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elanliving.com';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

  // If it's a valid language, get metadata for that language homepage
  if (VALID_LOCALES.includes(langParam)) {
    const [globalData, pageData] = await Promise.all([
      getGlobalData(langParam),
      getHomepage(langParam)
    ]);
    
    const siteName = globalData?.siteName || 'ELAN Living';
    const siteDescription = pageData?.seo?.metaDescription || 
                           globalData?.siteDescription || '';
    
    const ogImage = pageData?.seo?.shareImage?.url || 
                    globalData?.defaultSeo?.shareImage?.url;
    
    return {
      title: siteName,
      description: siteDescription,
      openGraph: {
        title: siteName,
        description: siteDescription,
        siteName: siteName,
        locale: langParam,
        type: 'website',
        url: `${baseUrl}/${langParam}`,
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

  // Otherwise, it's a page slug - get metadata for page in default locale
  const slug = langParam;
  const [globalData, pageData] = await Promise.all([
    getGlobalData(DEFAULT_LOCALE),
    getPageBySlug(slug, DEFAULT_LOCALE)
  ]);
  
  const page = Array.isArray(pageData) ? pageData[0] : pageData;
  const siteName = globalData?.siteName || 'ELAN Living';
  

  const pageTitle = page?.title || slug;
  const fullTitle = `${siteName} | ${pageTitle}`;
  
  const description = page?.seo?.metaDescription || 
                     page?.description || 
                     globalData?.siteDescription || '';
  
  const ogImage = page?.seo?.shareImage?.url || 
                  globalData?.defaultSeo?.shareImage?.url;
  
  return {
    title: fullTitle,
    description: description,
    openGraph: {
      title: fullTitle,
      description: description,
      siteName: siteName,
      locale: DEFAULT_LOCALE,
      type: 'website',
      url: `${baseUrl}/${slug}`,
      images: ogImage ? [{
        url: ogImage.startsWith('http') ? ogImage : `${strapiUrl}${ogImage}`,
        width: 1200,
        height: 630,
        alt: pageTitle
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description,
      images: ogImage ? [ogImage.startsWith('http') ? ogImage : `${strapiUrl}${ogImage}`] : undefined,
    },
    icons: globalData?.favicon?.url ? {
      icon: `${strapiUrl}${globalData.favicon.url}`
    } : undefined
  };
}

export default async function DynamicRoute({
  params,
}: {
  params: { lang: string };
}) {
  const { lang: langParam } = await params;

  if (VALID_LOCALES.includes(langParam)) {
    const lang = langParam;

    if (lang === DEFAULT_LOCALE) {
      redirect('/');
    }

    try {
      // Fetch HOMEPAGE for this language
      const pageData = await getHomepage(lang);

      if (!pageData || !pageData.sections) {
        return (
          <main className="h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Welcome to Elan Living</h1>
              <p>No homepage content found for locale: {lang}</p>
            </div>
          </main>
        );
      }

      return (
        <main className="bg-[#f7f5f2]">
          <Suspense fallback={<Spinner />}>
            {renderPageSections(pageData.sections, lang)}
          </Suspense>
        </main>
      );
    } catch (error) {
      console.error(`❌ Error loading homepage for ${lang}:`, error);
      return notFound();
    }
  } else {
    // NOT a language - treat as page slug in default locale
    const slug = langParam;
    const locale = DEFAULT_LOCALE;

    try {
      // Fetch PAGE with this slug in default locale
      const pageData = await getPageBySlug(slug, locale);

      if (!pageData || (Array.isArray(pageData) && pageData.length === 0)) {
        return notFound();
      }

      const page = Array.isArray(pageData) ? pageData[0] : pageData;

      if (!page.sections || page.sections.length === 0) {
        return (
          <main className="container mx-auto px-4 py-12 mt-32">
            <h1 className="text-3xl font-bold mb-6">{page.title || slug}</h1>
            <p>This page is currently under construction.</p>
          </main>
        );
      }

      return (
        <main className="bg-[#f7f5f2]">
          <Suspense fallback={<Spinner />}>
            {await renderPageSections(page.sections, locale)}
          </Suspense>
        </main>
      );
    } catch (error) {
      console.error(`❌ Error loading page ${slug} in ${locale}:`, error);
      return notFound();
    }
  }
}