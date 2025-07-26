// lib/types/strapi.ts
// Universal Strapi types - single source of truth for all Strapi content

// ===================================
// RICH TEXT TYPES (defined here to avoid circular dependencies)
// ===================================

export interface StrapiMarkLink {
  linktype?: string;
  href?: string;
  target?: string;
}

export interface StrapiRichTextMark {
  type: string;
  attrs?: StrapiMarkLink;
}

export interface StrapiRichTextNode {
  type?: string;
  content?: StrapiRichTextNode[];
  children?: StrapiRichTextNode[];
  text?: string;
  marks?: StrapiRichTextMark[];
  attrs?: Record<string, unknown>; // Using Record instead of any
  // Strapi direct formatting properties
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

// Universal rich text type that handles all formats
export type StrapiRichText = 
  | StrapiRichTextNode 
  | StrapiRichTextNode[] 
  | string 
  | null 
  | undefined;

// ===================================
// CORE STRAPI TYPES
// ===================================

// Image format for different sizes
export interface StrapiImageFormat {
  url: string;
  width?: number;
  height?: number;
  size?: number;
  ext?: string;
  mime?: string;
}

// All possible image formats from Strapi
export interface StrapiImageFormats {
  thumbnail?: StrapiImageFormat;
  small?: StrapiImageFormat;
  medium?: StrapiImageFormat;
  large?: StrapiImageFormat;
  xlarge?: StrapiImageFormat;
}

// Universal Strapi image type - handles all possible formats
export type StrapiImage = 
  // Direct URL string
  | string
  // Strapi V5 direct format
  | {
      url: string;
      alternativeText?: string;
      caption?: string;
      width?: number;
      height?: number;
      formats?: StrapiImageFormats;
      hash?: string;
      ext?: string;
      mime?: string;
      size?: number;
      id?: number;
      documentId?: string;
    }
  // Strapi V4 nested format
  | {
      data: {
        id?: number;
        documentId?: string;
        attributes: {
          url: string;
          alternativeText?: string;
          caption?: string;
          width?: number;
          height?: number;
          formats?: StrapiImageFormats;
          hash?: string;
          ext?: string;
          mime?: string;
          size?: number;
        };
      };
    }
  // Legacy format
  | {
      filename: string;
      alt?: string;
    }
  // Could be null/undefined
  | null
  | undefined;

// Universal link type for buttons and navigation
export interface StrapiLink {
  href?: string;
  url?: string;
  label?: string;
  isExternal?: boolean;
  isButtonLink?: boolean;
  type?: string;
  target?: '_blank' | '_self';
  // Legacy support
  cached_url?: string;
}

// File/Media type for downloads
export interface StrapiFile {
  id?: number;
  documentId?: string;
  url: string;
  name: string;
  ext: string;
  mime?: string;
  size?: number;
  alternativeText?: string;
  caption?: string;
}

// ===================================
// CONTENT SPECIFIC TYPES
// ===================================

// Author type for blog posts
export interface StrapiAuthor {
  id?: number;
  name?: string;
  email?: string;
  avatar?: StrapiImage;
  bio?: StrapiRichText;
}

// Category type for blog posts
export interface StrapiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Job requirement/advantage item
export interface JobRequirement {
  text: string;
  id?: number;
}

// ===================================
// DOMAIN SPECIFIC TYPES
// ===================================

// Blog Article
export interface Article {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content?: StrapiRichText;
  cover?: StrapiImage;
  author?: StrapiAuthor;
  publishDate: string;
  featured: boolean;
  category?: StrapiCategory;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  locale?: string;
}

// Job
export interface Job {
  id: number;
  title?: string;
  jobStart: string;
  location: string;
  salary: number;
  patientDescription: StrapiRichText;
  requirements: JobRequirement[] | string[];
  advantages?: JobRequirement[] | string[];
  featured?: boolean;
  image?: StrapiImage;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
  locale?: string;
}

// Kutak Article V5
export interface KutakArticleV5 {
  id: number;
  documentId: string;
  title: string;
  content: StrapiRichText;
  publishDate: string;
  locale: string;
  likes: number;
  image?: StrapiImage;
  download: boolean;
  downloadTitle?: string;
  downloadText?: string;
  downloadLink?: StrapiFile;
  shareText?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Processed Kutak Article
export interface ProcessedKutakArticle {
  id: string; // documentId
  databaseId: number;
  title: string;
  content: StrapiRichText;
  publishDate: string;
  locale: string;
  likes: number;
  image?: StrapiImage;
  download: boolean;
  downloadTitle?: string;
  downloadText?: string;
  downloadLink?: StrapiFile;
  shareText?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Kutak API Response types
export interface KutakArticlesResponseV5 {
  data: KutakArticleV5[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface KutakArticleResponseV5 {
  data: KutakArticleV5;
  meta: Record<string, unknown>;
}

export interface KutakLikeResponse {
  success: boolean;
  data?: {
    id: string;
    databaseId?: number;
    likes: number;
  };
}

// Kutak Section Config
export interface KutakSectionConfig {
  headerTitle?: string;
  headerText?: StrapiRichText;
  loadMoreLabel?: string;
  backgroundImage?: StrapiImage;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Get image URL with proper fallback handling
export const getStrapiImageUrl = (
  image: StrapiImage, 
  fallback: string = '/placeholder.svg'
): string => {
  if (!image) return fallback;

  let imageUrl = '';
  
  if (typeof image === 'string') {
    imageUrl = image;
  } else if (typeof image === 'object' && 'data' in image && image.data?.attributes?.url) {
    imageUrl = image.data.attributes.url;
  } else if (typeof image === 'object' && image !== null) {
    if ('url' in image && typeof image.url === 'string') {
      imageUrl = image.url;
    } else if ('filename' in image && typeof image.filename === 'string') {
      imageUrl = image.filename;
    } else if ('formats' in image && image.formats?.large?.url) {
      imageUrl = image.formats.large.url;
    }
  }

  if (!imageUrl) {
    console.error('No valid image URL found:', image);
    return fallback;
  }

  if (imageUrl.startsWith('/')) {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    return `${strapiUrl}${imageUrl}`;
  }

  return imageUrl;
};

// Get image alt text with proper fallback handling
export const getStrapiImageAlt = (
  image: StrapiImage, 
  fallback: string = 'Image'
): string => {
  if (!image || typeof image === 'string') {
    return fallback;
  }

  if (typeof image === 'object' && image !== null) {
    if ('data' in image && image.data?.attributes?.alternativeText) {
      return image.data.attributes.alternativeText;
    }
    if ('alternativeText' in image && image.alternativeText) {
      return image.alternativeText;
    }
    if ('alt' in image && image.alt) {
      return image.alt;
    }
  }

  return fallback;
};

// Get link URL with proper fallback handling
export const getStrapiLinkUrl = (
  link: StrapiLink | undefined, 
  fallback: string = '/'
): string => {
  if (!link) return fallback;
  
  return link.href || link.url || (link.cached_url ? `/${link.cached_url}` : fallback);
};

// Check if rich text content is empty
export const isRichTextEmpty = (content: StrapiRichText): boolean => {
  if (!content) return true;
  
  if (typeof content === 'string') {
    return content.trim().length === 0;
  }
  
  if (Array.isArray(content)) {
    return content.length === 0;
  }
  
  if (typeof content === 'object' && content !== null) {
    const hasText = content.text && content.text.trim().length > 0;
    const hasContent = content.content && content.content.length > 0;
    const hasChildren = content.children && content.children.length > 0;
    
    return !hasText && !hasContent && !hasChildren;
  }
  
  return true;
};

// Get plain text from rich text content
export const getRichTextPlainText = (content: StrapiRichText): string => {
  if (!content) return '';
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content
      .map(node => getRichTextPlainText(node))
      .join('\n');
  }
  
  if (typeof content === 'object' && content !== null) {
    if (content.text) {
      return content.text;
    }
    
    const childContent = content.content || content.children;
    if (childContent) {
      return getRichTextPlainText(childContent);
    }
  }
  
  return '';
};

// Type guard to check if content is structured rich text
export const isStrapiRichTextStructured = (
  content: StrapiRichText
): content is StrapiRichTextNode | StrapiRichTextNode[] => {
  return typeof content === 'object' && content !== null;
};