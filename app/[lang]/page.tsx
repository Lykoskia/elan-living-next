import { getHomepage, getPageBySlug, VALID_LOCALES, DEFAULT_LOCALE } from '@/lib/api-client';
import { renderPageSections } from '@/lib/components-registry';
import NavbarWithSuspense from "@/components/NavbarWithSuspense";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getStrapiImageUrl } from '@/lib/types/strapi';

export const revalidate = 600;

export async function generateStaticParams() {
  // Generate params for:
  // 1. Non-default language homepages: /en, /de
  // 2. Default locale pages that might be confused with languages: /blog, /about, etc.
  const languageParams = VALID_LOCALES
    .filter(lang => lang !== DEFAULT_LOCALE)
    .map(lang => ({ lang }));
    
  // Add common pages that could be confused with languages
  const commonPages = ['blog', 'about', 'services', 'contact', 'kutak'];
  const pageParams = commonPages.map(page => ({ lang: page }));
  
  return [...languageParams, ...pageParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elan-living.com';
  
  try {
    // Check if it's a valid language
    if (VALID_LOCALES.includes(lang)) {
      // It's a language homepage
      const pageData = await getHomepage(lang);
      const siteName = 'ELAN Living';
      const siteDescription = pageData?.seo?.metaDescription || '';
      const ogImage = getStrapiImageUrl(pageData?.seo?.shareImage);
      
      return {
        title: siteName,
        description: siteDescription,
        openGraph: {
          title: siteName,
          description: siteDescription,
          siteName: siteName,
          locale: lang,
          type: 'website',
          url: `${baseUrl}/${lang}`,
          images: ogImage ? [{
            url: ogImage,
            width: 1200,
            height: 630,
            alt: siteName
          }] : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: siteName,
          description: siteDescription,
          images: ogImage ? [ogImage] : undefined,
        },
        alternates: {
          languages: {
            'hr': `${baseUrl}/`,
            'en': `${baseUrl}/en`,
            'de': `${baseUrl}/de`,
          }
        }
      };
    } else {
      // It's a page slug in default locale
      const pageData = await getPageBySlug(lang, DEFAULT_LOCALE);
      const page = Array.isArray(pageData) ? pageData[0] : pageData;
      
      const siteName = 'ELAN Living';
      const pageTitle = page?.title || lang.charAt(0).toUpperCase() + lang.slice(1);
      const fullTitle = `${pageTitle} | ${siteName}`;
      const description = page?.seo?.metaDescription || page?.description || '';
      const ogImage = getStrapiImageUrl(page?.seo?.shareImage);
      
      return {
        title: fullTitle,
        description: description,
        openGraph: {
          title: fullTitle,
          description: description,
          siteName: siteName,
          locale: DEFAULT_LOCALE,
          type: 'website',
          url: `${baseUrl}/${lang}`,
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
          languages: {
            'hr': `${baseUrl}/${lang}`,
            'en': `${baseUrl}/en/${lang}`,
            'de': `${baseUrl}/de/${lang}`,
          }
        }
      };
    }
  } catch (error) {
    console.error(`Error generating metadata for ${lang}:`, error);
    return {
      title: 'ELAN Living',
      description: ''
    };
  }
}

export default async function DynamicRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Check if it's a valid language code
  if (VALID_LOCALES.includes(lang)) {
    // It's a language homepage
    
    // Redirect default locale to root
    if (lang === DEFAULT_LOCALE) {
      redirect('/');
    }

    try {
      const pageData = await getHomepage(lang);

      if (!pageData?.sections) {
        return (
          <>
            <NavbarWithSuspense lang={lang} />
            <main className="h-screen flex items-center justify-center mt-20">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome to Elan Living</h1>
                <p>No homepage content found for locale: {lang}</p>
              </div>
            </main>
            <Footer />
            <BackToTopButton />
          </>
        );
      }

      return (
        <>
          <NavbarWithSuspense lang={lang} />
          <main className="bg-[#f7f5f2]">
            {renderPageSections(pageData.sections, lang)}
          </main>
          <Footer />
          <BackToTopButton />
        </>
      );
    } catch (error) {
      console.error(`Error loading homepage for ${lang}:`, error);
      return notFound();
    }
  } else {
    // It's NOT a language - treat as a page slug in default locale
    const slug = lang;
    const locale = DEFAULT_LOCALE;

    try {
      const pageData = await getPageBySlug(slug, locale);

      if (!pageData || (Array.isArray(pageData) && pageData.length === 0)) {
        return notFound();
      }

      const page = Array.isArray(pageData) ? pageData[0] : pageData;

      if (!page.sections || page.sections.length === 0) {
        return (
          <>
            <NavbarWithSuspense lang={locale} />
            <main className="container mx-auto px-4 py-12 mt-32">
              <h1 className="text-3xl font-bold mb-6">{page.title || slug}</h1>
              <p>This page is currently under construction.</p>
            </main>
            <Footer />
            <BackToTopButton />
          </>
        );
      }

      return (
        <>
          <NavbarWithSuspense lang={locale} />
          <main className="bg-[#f7f5f2]">
            {renderPageSections(page.sections, locale)}
          </main>
          <Footer />
          <BackToTopButton />
        </>
      );
    } catch (error) {
      console.error(`Error loading page ${slug} in ${locale}:`, error);
      return notFound();
    }
  }
}