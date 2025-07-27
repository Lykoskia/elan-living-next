import { getHomepage, DEFAULT_LOCALE } from '@/lib/api-client';
import { renderPageSections } from '@/lib/components-registry';
import NavbarWithSuspense from "@/components/NavbarWithSuspense";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import type { Metadata } from 'next';
import { getStrapiImageUrl } from '@/lib/types/strapi';

// ISR revalidation every 10 minutes
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const pageData = await getHomepage(DEFAULT_LOCALE);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elan-living.com';
    
    const siteName = 'ELAN Living';
    const siteDescription = pageData?.seo?.metaDescription || 
                           'Profesionalna njega starijih osoba u njihovom domu';
    
    const ogImage = getStrapiImageUrl(pageData?.seo?.shareImage);
    
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
          'hr': baseUrl,
          'en': `${baseUrl}/en`,
          'de': `${baseUrl}/de`,
        }
      }
    };
  } catch (error) {
    console.error('Error generating homepage metadata:', error);
    return {
      title: 'ELAN Living',
      description: 'Profesionalna njega starijih osoba u njihovom domu',
    };
  }
}

export default async function HomePage() {
  try {
    // Only fetch page data server-side
    const pageData = await getHomepage(DEFAULT_LOCALE);
    
    if (!pageData?.sections) {
      return (
        <>
          <NavbarWithSuspense lang={DEFAULT_LOCALE} />
          <main className="h-screen flex items-center justify-center mt-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Welcome to Elan Living</h1>
              <p>No homepage content found</p>
            </div>
          </main>
          <Footer />
          <BackToTopButton />
        </>
      );
    }
    
    return (
      <>
        <NavbarWithSuspense lang={DEFAULT_LOCALE} />
        <main className="bg-[#f7f5f2]">
          {renderPageSections(pageData.sections, DEFAULT_LOCALE)}
        </main>
        <Footer />
        <BackToTopButton />
      </>
    );
  } catch (error) {
    console.error('Error loading homepage:', error);
    
    return (
      <>
        <NavbarWithSuspense lang={DEFAULT_LOCALE} />
        <main className="h-screen flex items-center justify-center mt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Elan Living</h1>
            <p>Error loading homepage content</p>
          </div>
        </main>
        <Footer />
        <BackToTopButton />
      </>
    );
  }
}