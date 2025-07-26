// Blog-specific types - imports from central strapi.ts

import { Article, StrapiCategory } from '@/lib/types/strapi';

// Import and re-export all blog-related types from central strapi.ts
export type { 
  Article,
  StrapiImage, 
  StrapiAuthor, 
  StrapiRichText,
  StrapiLink,
  getStrapiImageUrl,
  getStrapiImageAlt,
  getStrapiLinkUrl,
  isRichTextEmpty,
  getRichTextPlainText,
  isStrapiRichTextStructured
} from '@/lib/types/strapi';

// Import and export Category with proper alias
export type { StrapiCategory } from '@/lib/types/strapi';
export type { StrapiCategory as Category } from '@/lib/types/strapi';

// Blog-specific types that extend the base types
export interface BlogPageData {
  articles: Article[];
  featuredArticles: Article[];
  categories: StrapiCategory[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface BlogFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  publishDate?: {
    from?: string;
    to?: string;
  };
}

export interface BlogSearchParams {
  page?: string;
  category?: string;
  search?: string;
  featured?: string;
}

// Article card component props
export interface ArticleCardProps {
  article: Article;
  showCategory?: boolean;
  showAuthor?: boolean;
  showExcerpt?: boolean;
  className?: string;
}

// Article list component props
export interface ArticleListProps {
  articles: Article[];
  showPagination?: boolean;
  showFilters?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: BlogFilters) => void;
}

// Re-export Article as the default export for backward compatibility
export type { Article as default } from '@/lib/types/strapi';