// Job-specific types - imports from central strapi.ts

import { Job } from '@/lib/types/strapi';

// Import and re-export all job-related types from central strapi.ts
export type {
  Job,
  JobRequirement,
  StrapiImage,
  StrapiRichText,
  getStrapiImageUrl,
  getStrapiImageAlt,
  isRichTextEmpty,
  getRichTextPlainText,
  isStrapiRichTextStructured
} from '@/lib/types/strapi';

// Job-specific component types
export interface JobPageData {
  jobs: Job[];
  featuredJobs: Job[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface JobFilters {
  location?: string;
  featured?: boolean;
  salaryRange?: {
    min?: number;
    max?: number;
  };
  jobStart?: {
    from?: string;
    to?: string;
  };
}

export interface JobSearchParams {
  page?: string;
  location?: string;
  featured?: string;
  minSalary?: string;
  maxSalary?: string;
  search?: string;
}

// Job card component props
export interface JobCardProps {
  job: Job;
  showSalary?: boolean;
  showLocation?: boolean;
  showDescription?: boolean;
  className?: string;
}

// Job list component props
export interface JobListProps {
  jobs: Job[];
  showPagination?: boolean;
  showFilters?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: JobFilters) => void;
}

// Job application types
export interface JobApplication {
  id?: number;
  jobId: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  coverLetter?: string;
  resume?: File;
  createdAt?: string;
}

export interface JobApplicationFormData {
  name: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  resume?: File;
}

// Job detail page props
export interface JobDetailProps {
  job: Job;
  relatedJobs?: Job[];
  onApply?: (application: JobApplicationFormData) => void;
}

// Salary formatting utility type
export interface SalaryDisplayOptions {
  currency?: string;
  locale?: string;
  showCurrency?: boolean;
  abbreviate?: boolean;
}

// Re-export Job as the default export for backward compatibility
export type { Job as default } from '@/lib/types/strapi';