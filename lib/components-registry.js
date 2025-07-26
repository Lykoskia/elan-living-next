import AboutCard from '@/components/AboutCard';
import BlogListingSection from '@/components/BlogListingSection';
import CallToAction from '@/components/CallToAction';
import CardGroup from '@/components/CardGroup';
import Cards from '@/components/Cards';
import Carousel from '@/components/Carousel';
import Contact from '@/components/Contact';
import FeatureCards from '@/components/FeatureCards';
import FeatureSection from '@/components/FeatureSection';
import HeroSection from '@/components/HeroSection';
import HeroSectionFlat from '@/components/HeroSectionFlat';
import IconGrid from '@/components/IconGrid';
import JobForm from '@/components/JobForm';
import JobListingSection from '@/components/JobListingSection';
import Kutak from '@/components/Kutak';
import MapComponent from '@/components/MapComponent';
import MessageForm from '@/components/MessageForm';
import ParallaxSection from '@/components/ParallaxSection';
import ParallaxSectionCenter from '@/components/ParallaxSectionCenter';
import ReferralForm from '@/components/ReferralForm';
import RequestForm from '@/components/RequestForm';
import ReviewSection from '@/components/ReviewSection';
import Steps from '@/components/Steps';
import Testimonials from '@/components/Testimonials';
import WallOfText from '@/components/WallOfText';
import WallOfTextBanner from '@/components/WallOfTextBanner';

// Define the default locale
export const DEFAULT_LOCALE = 'hr';

// Simple registry object
export const componentsRegistry = {
  'shared.about-card': AboutCard,
  'shared.blog-listing': BlogListingSection,
  'shared.call-to-action': CallToAction,
  'shared.card-group': CardGroup,
  'shared.cards': Cards,
  'shared.carousel': Carousel,
  'shared.contact': Contact,
  'shared.feature-cards': FeatureCards,
  'shared.feature': FeatureSection,
  'shared.hero': HeroSection,
  'shared.hero-flat': HeroSectionFlat,
  'shared.icon-grid': IconGrid,
  'shared.job-form': JobForm,
  'shared.job-listing': JobListingSection,
  'shared.kutak': Kutak,
  'shared.map': MapComponent,
  'shared.message-form': MessageForm,
  'shared.parallax-section': ParallaxSection,
  'shared.parallax-section-center': ParallaxSectionCenter,
  'shared.referral-form': ReferralForm,
  'shared.request-form': RequestForm,
  'shared.review': ReviewSection,
  'shared.steps': Steps,
  'shared.testimonials': Testimonials,
  'shared.wall-of-text': WallOfText,
  'shared.wall-of-text-banner': WallOfTextBanner,
};

// Helper function to get localized URLs
export function getLocalizedUrl(path, locale) {
  if (locale === DEFAULT_LOCALE) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

// Simple renderer function
export function renderPageSections(sections, locale) {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  return sections.map((section, index) => {
    const componentType = section.__component;
    const SectionComponent = componentsRegistry[componentType];

    if (!SectionComponent) {
      console.warn(`No component found for type: ${componentType}`);
      return null;
    }

    // Generate a more reliable key
    const key = `${componentType}-${section.id ?? index}`;

    return (
      <SectionComponent
        key={key}
        {...section}
        locale={locale}
        isDefaultLocale={locale === DEFAULT_LOCALE}
      />
    );
  });
}