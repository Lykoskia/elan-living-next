import { Suspense } from 'react';
import {
  getPageBySlug,
  getGlobalData,
  getArticleBySlug,
  processMediaUrls,
  DEFAULT_LOCALE,
  VALID_LOCALES
} from '@/lib/api-client';
import { renderPageSections } from '@/lib/components-registry';
import { Spinner } from '@/components/Spinner';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArticlePage from '@/components/ArticlePage';
import { 
  type Article,
  getStrapiImageUrl 
} from '@/lib/types/strapi';

export const experimental_ppr = true;
export const revalidate = 60;

function isArticlePage(path: string): boolean {
  return path.startsWith('blog/') && path !== 'blog';
}

function getArticleSlug(path: string): string {
  return path.replace('blog/', '');
}

export async function generateMetadata({
  params
}: {
  params: { lang: string; slug: string[] }
}): Promise<Metadata> {
  const { lang, slug } = await params;

  let actualLang: string;
  let actualSlug: string[];
  let isDefaultLocale: boolean;

  if (lang === 'blog') {
    actualLang = DEFAULT_LOCALE;
    actualSlug = ['blog', ...slug];
    isDefaultLocale = true;
  } else if (VALID_LOCALES.includes(lang)) {
    actualLang = lang;
    actualSlug = slug;
    isDefaultLocale = lang === DEFAULT_LOCALE;
  } else {
    actualLang = DEFAULT_LOCALE;
    actualSlug = [lang, ...slug];
    isDefaultLocale = true;
  }

  const path = actualSlug.join('/');

  // Skip non-page requests
  if (path.includes('favicon') || path.includes('.ico') || path.includes('uploads/')) {
    return {};
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elanliving.hr';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

  try {
    const globalData = await getGlobalData(actualLang);
    const siteName = globalData?.siteName || 'ELAN Living';

    let pageTitle = '';
    let description = '';
    let ogImage = '';

    if (isArticlePage(path)) {
      const articleSlug = getArticleSlug(path);
      const article: Article | null = await getArticleBySlug(articleSlug, actualLang);

      if (article) {
        pageTitle = article.title;
        description = article.description || `Read the full article: ${article.title}`;
        
        // ✅ Use utility function instead of direct property access
        ogImage = getStrapiImageUrl(article.cover, '');

        const fullTitle = `${siteName} | ${pageTitle}`;
        const pageUrl = isDefaultLocale
          ? `${baseUrl}/${path}`
          : `${baseUrl}/${actualLang}/${actualSlug.slice(0, -1).join('/')}`;

        // ✅ Safe author access with optional chaining
        const authorNames = article.author?.name ? [article.author.name] : undefined;

        return {
          title: fullTitle,
          description: description,
          openGraph: {
            title: fullTitle,
            description: description,
            siteName: siteName,
            locale: actualLang,
            type: 'article',
            url: pageUrl,
            publishedTime: article.publishDate,
            authors: authorNames,
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
          alternates: {
            languages: {
              'hr': `${baseUrl}/${path}`,
              'en': `${baseUrl}/en/${path}`,
              'de': `${baseUrl}/de/${path}`,
            }
          }
        };
      }
    }

    const [pageData] = await Promise.all([
      getPageBySlug(path, actualLang)
    ]);

    const page = Array.isArray(pageData) ? pageData[0] : pageData;

    pageTitle = page?.title || path.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    const fullTitle = `${siteName} | ${pageTitle}`;

    description = page?.seo?.metaDescription ||
      page?.description ||
      globalData?.siteDescription || '';

    // ✅ Safe property access for SEO images
    ogImage = getStrapiImageUrl(page?.seo?.shareImage, '') ||
      getStrapiImageUrl(globalData?.defaultSeo?.shareImage, '');

    const pageUrl = isDefaultLocale
      ? `${baseUrl}/${path}`
      : `${baseUrl}/${actualLang}/${path}`;

    return {
      title: fullTitle,
      description: description,
      openGraph: {
        title: fullTitle,
        description: description,
        siteName: siteName,
        locale: actualLang,
        type: isArticlePage(path) ? 'article' : 'website',
        url: pageUrl,
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
      // ✅ Safe favicon access
      icons: globalData?.favicon ? {
        icon: getStrapiImageUrl(globalData.favicon, '')
      } : undefined,
      alternates: {
        languages: {
          'hr': `${baseUrl}/${path}`,
          'en': `${baseUrl}/en/${path}`,
          'de': `${baseUrl}/de/${path}`,
        }
      }
    };
  } catch (error) {
    console.error(`Error generating metadata for ${path}:`, error);
    return {
      title: 'ELAN Living',
      description: ''
    };
  }
}

export default async function LanguagePageWithSlug({
  params
}: {
  params: { lang: string; slug: string[] }
}) {
  const { lang, slug } = await params;

  let actualLang: string;
  let actualSlug: string[];
  let isDefaultLocale: boolean;

  if (lang === 'blog') {
    actualLang = DEFAULT_LOCALE;
    actualSlug = ['blog', ...slug];
    isDefaultLocale = true;
  } else if (VALID_LOCALES.includes(lang)) {
    actualLang = lang;
    actualSlug = slug;
    isDefaultLocale = lang === DEFAULT_LOCALE;
  } else {
    actualLang = DEFAULT_LOCALE;
    actualSlug = [lang, ...slug];
    isDefaultLocale = true;
  }

  const path = actualSlug.join('/');

  // Skip favicon and other asset requests
  if (path.includes('favicon') || path.includes('.ico') || path.includes('uploads/')) {
    return null;
  }

  const isArticle = isArticlePage(path);

  if (isArticle) {
    const articleSlug = getArticleSlug(path);

    try {
      const article: Article | null = await getArticleBySlug(articleSlug, actualLang);

      if (!article) {
        return notFound();
      }

      const processedArticle = processMediaUrls(article);

      return (
        <Suspense fallback={<Spinner />}>
          <main className="bg-[#f7f5f2]">
            <ArticlePage
              article={processedArticle}
              locale={actualLang}
              isDefaultLocale={isDefaultLocale}
            />
          </main>
        </Suspense>
      );
    } catch (error) {
      console.error(`❌ Error fetching article:`, error);
      return notFound();
    }
  }
  
  try {
    const pageData = await getPageBySlug(path, actualLang);

    if (!pageData || (Array.isArray(pageData) && pageData.length === 0)) {
      return notFound();
    }

    const page = Array.isArray(pageData) ? pageData[0] : pageData;

    if (!page.sections || page.sections.length === 0) {
      return (
        <Suspense fallback={<Spinner />}>
          <main className="container mx-auto px-4 py-12 mt-32">
            <h1 className="text-3xl font-bold mb-6">{page.title || path}</h1>
            <p>This page is currently under construction.</p>
          </main>
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<Spinner />}>
        <main className="bg-[#f7f5f2]">
          {renderPageSections(page.sections, actualLang)}
        </main>
      </Suspense>
    );
  } catch (error) {
    console.error(`❌ Error loading regular page ${path} in ${actualLang}:`, error);
    return notFound();
  }
}