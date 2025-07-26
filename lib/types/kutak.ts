// Kutak-specific types - imports from central strapi.ts

import { KutakSectionConfig, ProcessedKutakArticle } from '@/lib/types/strapi';

// Import and re-export all Kutak-related types from central strapi.ts
export type {
  KutakArticleV5,
  ProcessedKutakArticle,
  KutakArticlesResponseV5,
  KutakArticleResponseV5,
  KutakLikeResponse,
  KutakSectionConfig,
  StrapiImage,
  StrapiFile,
  StrapiRichText,
  getStrapiImageUrl,
  getStrapiImageAlt,
  isRichTextEmpty,
  getRichTextPlainText,
  isStrapiRichTextStructured
} from '@/lib/types/strapi';

// Kutak-specific component types
export interface KutakComponentProps {
  articles: ProcessedKutakArticle[];
  config?: KutakSectionConfig;
  locale: string;
  className?: string;
}

export interface KutakCardProps {
  article: ProcessedKutakArticle;
  onLike?: (articleId: string) => void;
  onUnlike?: (articleId: string) => void;
  showDownload?: boolean;
  showShare?: boolean;
  className?: string;
}

export interface KutakGridProps {
  articles: ProcessedKutakArticle[];
  onLike?: (articleId: string) => void;
  onUnlike?: (articleId: string) => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface KutakFilters {
  search?: string;
  hasDownload?: boolean;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface KutakSearchParams {
  search?: string;
  download?: string;
  page?: string;
}

// Like/Unlike action types
export type KutakAction = 'like' | 'unlike';

export interface KutakActionPayload {
  articleId: string;
  action: KutakAction;
}

// Kutak section configuration for CMS
export interface KutakPageData {
  articles: ProcessedKutakArticle[];
  config: KutakSectionConfig;
  totalCount: number;
  hasMore: boolean;
}