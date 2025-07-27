import {
  getPageBySlug,
  getArticleBySlug,
  processMediaUrls,
  DEFAULT_LOCALE,
  VALID_LOCALES
} from '@/lib/api-client';
import { renderPageSections } from '@/lib/components-registry';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArticlePage from '@/components/ArticlePage';
import NavbarWithSuspense from "@/components/NavbarWithSuspense";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { type Article, getStrapiImageUrl } from '@/lib/types/strapi';

// Different revalidation for articles vs pages
export const revalidate = 60; // 1 minute for articles

export async function generateStaticParams() {
  // Pre-generate common routes to avoid confusion
  const routes = [];
  
  // For each locale, generate common routes
  VALID_LOCALES.forEach(lang => {
    // Common pages
    routes.push(
      { lang, slug: ['about'] },
      { lang, slug: ['services'] },
      { lang, slug: ['contact'] },
      { lang, slug: ['blog'] }
    );
  });
  
  // Add some blog article examples (these will be generated on-demand via ISR)
  routes.push(
    { lang: DEFAULT_LOCALE, slug: ['blog', 'sample-article'] },
    { lang: 'en', slug: ['blog', 'sample-article'] },
    { lang: 'de', slug: ['blog', 'sample-article'] }
  );

  return routes;
}

// Route parsing logic to handle language vs content confusion
function parseRouteParams(lang: string, slug: string[]) {
  let actualLang: string;
  let actualSlug: string[];
  let isDefaultLocale: boolean;

  if (VALID_LOCALES.includes(lang)) {
    // First segment is a valid language
    actualLang = lang;
    actualSlug = slug;
    isDefaultLocale = lang === DEFAULT_LOCALE;
  } else {
    // First segment is NOT a language, treat as content in default locale
    actualLang = DEFAULT_LOCALE;
    actualSlug = [lang, ...slug];
    isDefaultLocale = true;
  }

  return { actualLang, actualSlug, isDefaultLocale };
}

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
  const { actualLang, actualSlug, isDefaultLocale } = parseRouteParams(lang, slug);
  const path = actualSlug.join('/');

  // Skip non-page requests
  if (path.includes('favicon') || path.includes('.ico') || path.includes('uploads/')) {
    return {};
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elan-living.com';

  try {
    const siteName = 'ELAN Living';

    if (isArticlePage(path)) {
      const articleSlug = getArticleSlug(path);
      const article: Article | null = await getArticleBySlug(articleSlug, actualLang);

      if (article) {
        const fullTitle = `${article.title} | ${siteName}`;
        const description = article.description || `Read the full article: ${article.title}`;
        const ogImage = getStrapiImageUrl(article.cover);
        const pageUrl = isDefaultLocale
          ? `${baseUrl}/${path}`
          : `${baseUrl}/${actualLang}/${actualSlug.join('/')}`;

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
            authors: article.author?.name ? [article.author.name] : undefined,
            images: ogImage ? [{
              url: ogImage,
              width: 1200,
              height: 630,
              alt: article.title
            }] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: description,
            images: ogImage ? [ogImage] : undefined,
          },
          alternates: {
            languages: VALID_LOCALES.reduce((acc, locale) => {
              acc[locale] = locale === DEFAULT_LOCALE 
                ? `${baseUrl}/${path}`
                : `${baseUrl}/${locale}/${path}`;
              return acc;
            }, {} as Record<string, string>)
          }
        };
      }
    }

    // Regular page
    const pageData = await getPageBySlug(path, actualLang);
    const page = Array.isArray(pageData) ? pageData[0] : pageData;

    const pageTitle = page?.title || path.split('/').pop()?.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Page';

    const fullTitle = `${pageTitle} | ${siteName}`;
    const description = page?.seo?.metaDescription || page?.description || '';
    const ogImage = getStrapiImageUrl(page?.seo?.shareImage);

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
        type: 'website',
        url: pageUrl,
        images: ogImage ? [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle
        }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description: description,
        images: ogImage ? [ogImage] : undefined,
      },
      alternates: {
        languages: VALID_LOCALES.reduce((acc, locale) => {
          acc[locale] = locale === DEFAULT_LOCALE 
            ? `${baseUrl}/${path}`
            : `${baseUrl}/${locale}/${path}`;
          return acc;
        }, {} as Record<string, string>)
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

export default async function NestedPage({
  params
}: {
  params: { lang: string; slug: string[] }
}) {
  const { lang, slug } = await params;
  const { actualLang, actualSlug, isDefaultLocale } = parseRouteParams(lang, slug);
  const path = actualSlug.join('/');
  
  // Skip asset requests
  if (path.includes('favicon') || path.includes('.ico') || path.includes('uploads/')) {
    return null;
  }

  // Handle articles
  if (isArticlePage(path)) {
    const articleSlug = getArticleSlug(path);

    try {
      const article: Article | null = await getArticleBySlug(articleSlug, actualLang);

      if (!article) {
        notFound();
      }

      const processedArticle = processMediaUrls(article);

      return (
        <>
          <NavbarWithSuspense lang={actualLang} />
          <main className="bg-[#f7f5f2]">
            <ArticlePage
              article={processedArticle}
              locale={actualLang}
              isDefaultLocale={isDefaultLocale}
            />
          </main>
          <Footer />
          <BackToTopButton />
        </>
      );
    } catch (error) {
      console.error(`Error fetching article:`, error);
      notFound();
    }
  }
  
  // Handle regular pages
  try {
    const pageData = await getPageBySlug(path, actualLang);

    if (!pageData || (Array.isArray(pageData) && pageData.length === 0)) {
      notFound();
    }

    const page = Array.isArray(pageData) ? pageData[0] : pageData;

    if (!page.sections || page.sections.length === 0) {
      return (
        <>
          <NavbarWithSuspense lang={actualLang} />
          <main className="container mx-auto px-4 py-12 mt-32">
            <h1 className="text-3xl font-bold mb-6">{page.title || path}</h1>
            <p>This page is currently under construction.</p>
          </main>
          <Footer />
          <BackToTopButton />
        </>
      );
    }

    return (
      <>
        <NavbarWithSuspense lang={actualLang} />
        <main className="bg-[#f7f5f2]">
          {renderPageSections(page.sections, actualLang)}
        </main>
        <Footer />
        <BackToTopButton />
      </>
    );
  } catch (error) {
    console.error(`Error loading page ${path} in ${actualLang}:`, error);
    notFound();
  }
}