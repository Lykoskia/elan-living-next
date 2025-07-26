"use client";

import { useState, useEffect, useMemo } from "react";
import JobCard from "@/components/JobCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { hr } from "date-fns/locale";
import { RiArrowDownSLine } from "react-icons/ri";
import { ArrowUpIcon, ArrowDownIcon, XMarkIcon, MagnifyingGlassIcon, FunnelIcon, MapPinIcon, CalendarIcon, CurrencyEuroIcon } from "@heroicons/react/24/outline";
import { getJobs, processMediaUrls } from "@/lib/api-client";
import { RichText } from "@/lib/richtext";
import type { Job, JobRequirement, StrapiRichText } from "@/lib/types/strapi";
import { getRichTextPlainText } from "@/lib/types/strapi";

interface DateRange {
  start: Date | undefined;
  end: Date | undefined;
}

interface SalaryRange {
  min: number | undefined;
  max: number | undefined;
}

interface FilterValues {
  location: string;
  dateRange: DateRange;
  salary: SalaryRange;
  searchTerm: string;
}

interface JobListingSectionProps {
  title?: string;
  showFeatured?: boolean;
  featuredCount?: number;
  jobsPerPage?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  introText?: StrapiRichText;
  sortLabel?: string;
  sortByJobStart?: string;
  sortBySalary?: string;
  sortByPublishDate?: string;
  filterLabel?: string;
  locationPlaceholder?: string;
  dateFromPlaceholder?: string;
  dateToPlaceholder?: string;
  salaryFromPlaceholder?: string;
  salaryToPlaceholder?: string;
  clearAllFiltersLabel?: string;
  noResultsTitle?: string;
  noResultsMessage?: string;
  startLabel?: string;
  locationLabel?: string;
  salaryLabel?: string;
  salaryOnRequestLabel?: string;
  patientDescriptionLabel?: string;
  requirementsLabel?: string;
  advantagesLabel?: string;
  applyLabel?: string;
  locale?: string;
  isDefaultLocale?: boolean;
}

export default function JobListingSection({
  title = "Dostupni poslovi",
  showFeatured = true,
  featuredCount = 3,
  jobsPerPage = 4,
  showFilters = true,
  showSearch = true,
  introText,
  sortLabel = "Sort",
  sortByJobStart = "Po datumu početka",
  sortBySalary = "Po plaći",
  sortByPublishDate = "Po datumu objave",
  filterLabel = "Filter",
  locationPlaceholder = "Filtriraj po lokaciji",
  dateFromPlaceholder = "Datum od",
  dateToPlaceholder = "Datum do",
  salaryFromPlaceholder = "Plaća od",
  salaryToPlaceholder = "Plaća do",
  clearAllFiltersLabel = "Poništi sve filtere",
  noResultsTitle = "Nema rezultata",
  noResultsMessage = "Nema poslova koji odgovaraju vašim kriterijima",
  startLabel = "Početak",
  locationLabel = "Lokacija",
  salaryLabel = "Plaća",
  salaryOnRequestLabel = "Na upit",
  patientDescriptionLabel = "OPIS PACIJENTA",
  requirementsLabel = "UVJETI",
  advantagesLabel = "PREDNOSTI",
  applyLabel = "Prijavi se",
  locale = 'hr',
  isDefaultLocale = true
}: JobListingSectionProps) {

  // State for jobs data
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filtering and sorting
  const [sortKey, setSortKey] = useState<"jobStart" | "salary" | "publishDate">("jobStart");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    location: "",
    dateRange: { start: undefined, end: undefined },
    salary: { min: undefined, max: undefined },
    searchTerm: ""
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch jobs on component mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all jobs from Strapi
        const jobsResponse = await getJobs({
          locale,
          sort: ['publishDate:desc', 'jobStart:asc'],
          populate: ['image', 'requirements', 'advantages'],
        });

        if (!jobsResponse || !jobsResponse.data) {
          throw new Error('Failed to fetch jobs');
        }

        const processedJobs = processMediaUrls(jobsResponse.data);
        setAllJobs(processedJobs);

        // Filter featured jobs if enabled
        if (showFeatured) {
          const featuredFromAll = processedJobs
            .filter((job: Job) => job.featured)
            .slice(0, featuredCount);
          setFeaturedJobs(featuredFromAll);
        }

      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [locale, showFeatured, featuredCount]);

  // Helper function to parse and format dates
  const parseDateString = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  };

  // Type-safe text extraction from JobRequirement arrays
  const extractTextFromJobRequirements = (arr?: JobRequirement[] | string[]): string => {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && 'text' in item) return item.text;
      return '';
    }).join(' ');
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...allJobs];

    // Apply search filter (always applied if search term exists)
    if (filterValues.searchTerm) {
      const searchLower = filterValues.searchTerm.toLowerCase();
      filtered = filtered.filter((job) => {
        return (
          job.title?.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower) ||
          getRichTextPlainText(job.patientDescription).toLowerCase().includes(searchLower) ||
          extractTextFromJobRequirements(job.requirements).toLowerCase().includes(searchLower) ||
          (job.advantages && extractTextFromJobRequirements(job.advantages).toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply location filter
    if (filterValues.location) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(filterValues.location.toLowerCase())
      );
    }

    // Apply date range filter
    if (filterValues.dateRange.start || filterValues.dateRange.end) {
      filtered = filtered.filter((job) => {
        const jobStartDate = parseDateString(job.jobStart);
        if (!jobStartDate) return false;

        const startDateFilter = filterValues.dateRange.start
          ? parseDateString(filterValues.dateRange.start.toISOString().split("T")[0])
          : null;
        const endDateFilter = filterValues.dateRange.end
          ? parseDateString(filterValues.dateRange.end.toISOString().split("T")[0])
          : null;

        return (
          (!startDateFilter || jobStartDate >= startDateFilter) &&
          (!endDateFilter || jobStartDate <= endDateFilter)
        );
      });
    }

    // Apply salary filter
    if (filterValues.salary.min !== undefined || filterValues.salary.max !== undefined) {
      filtered = filtered.filter((job) => {
        const minSalary = filterValues.salary.min || 0;
        const maxSalary = filterValues.salary.max || Infinity;
        return job.salary >= minSalary && job.salary <= maxSalary;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortKey === "salary") {
        return sortOrder === "asc" ? a.salary - b.salary : b.salary - a.salary;
      } else if (sortKey === "jobStart") {
        const dateA = parseDateString(a.jobStart) || "2999-12-31";
        const dateB = parseDateString(b.jobStart) || "2999-12-31";
        return sortOrder === "asc" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      } else if (sortKey === "publishDate") {
        const dateA = parseDateString(a.publishDate) || "2999-12-31";
        const dateB = parseDateString(b.publishDate) || "2999-12-31";
        return sortOrder === "asc" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      }
      return 0;
    });

    return filtered;
  }, [allJobs, filterValues, sortKey, sortOrder]);

  // Calculate pagination
  const paginationInfo = useMemo(() => {
    const totalJobs = filteredAndSortedJobs.length;
    const totalPages = Math.ceil(totalJobs / jobsPerPage);
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const currentPageJobs = filteredAndSortedJobs.slice(startIndex, endIndex);

    return {
      totalJobs,
      totalPages,
      currentPageJobs,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [filteredAndSortedJobs, currentPage, jobsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValues, sortKey, sortOrder]);

  // Filter management functions
  const handleFilterChange = (filter: keyof FilterValues, value: string | DateRange | SalaryRange) => {
    setFilterValues((prevValues) => ({ ...prevValues, [filter]: value }));
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => prevOrder === "asc" ? "desc" : "asc");
  };

  const clearAllFilters = () => {
    setFilterValues({
      location: "",
      dateRange: { start: undefined, end: undefined },
      salary: { min: undefined, max: undefined },
      searchTerm: ""
    });
  };

  const hasActiveFilters = filterValues.searchTerm || filterValues.location ||
    filterValues.dateRange.start || filterValues.dateRange.end ||
    filterValues.salary.min !== undefined || filterValues.salary.max !== undefined ||
    sortKey !== "publishDate" || sortOrder !== "desc";

  // Count active filters (excluding search and sort)
  const activeFilterCount = (filterValues.location ? 1 : 0) +
    (filterValues.dateRange.start || filterValues.dateRange.end ? 1 : 0) +
    (filterValues.salary.min !== undefined || filterValues.salary.max !== undefined ? 1 : 0);

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elanpurple"></div>
            <span className="ml-3 text-gray-600">Učitavam poslove...</span>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-16">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Greška kod prikazivanja poslova
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-elanpurple text-white rounded-lg hover:bg-elanpurple/80 transition-colors"
            >
              Pokušajte ponovo
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      {/* Featured Jobs Section */}
      {showFeatured && featuredJobs && featuredJobs.length > 0 && (
        <div className="mx-6 md:mx-12 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 mx-auto text-center">
            Izdvojeni poslovi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                locale={locale}
                isDefaultLocale={isDefaultLocale}
                startLabel={startLabel}
                locationLabel={locationLabel}
                salaryLabel={salaryLabel}
                salaryOnRequestLabel={salaryOnRequestLabel}
                patientDescriptionLabel={patientDescriptionLabel}
                requirementsLabel={requirementsLabel}
                advantagesLabel={advantagesLabel}
                applyLabel={applyLabel}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mx-6 md:mx-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 mx-auto text-center">
          {title}
        </h2>

        {/* Intro Text */}
        {introText && (
          <div className="mx-auto px-8 md:px-12 mb-16 prose prose-lg">
            <RichText content={introText} />
          </div>
        )}

        {/* Modern Filter and Sort Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          {/* Top Row: Sort and Filter Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-100">
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{sortLabel}:</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as "jobStart" | "salary" | "publishDate")}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-elanpurple focus:ring-opacity-20 focus:border-elanpurple transition-all"
                  >
                    <option value="publishDate">{sortByPublishDate}</option>
                    <option value="jobStart">{sortByJobStart}</option>
                    <option value="salary">{sortBySalary}</option>
                  </select>
                  <RiArrowDownSLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                </div>
                <button
                  onClick={toggleSortOrder}
                  className="p-2 bg-elanpurple border border-gray-200 rounded-xl hover:bg-elangreen transition-colors"
                  title={sortOrder === "asc" ? "Uzlazno" : "Silazno"}
                >
                  {sortOrder === "asc" ?
                    <ArrowUpIcon className="h-4 w-4 text-white" /> :
                    <ArrowDownIcon className="h-4 w-4 text-white" />
                  }
                </button>
              </div>
            </div>

            {/* Filter Toggle Button */}
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center gap-2 px-4 py-2 bg-elanpurple hover:bg-elangreen text-white rounded-xl transition-colors text-sm font-medium ml-auto"
              >
                <FunnelIcon className="h-4 w-4" />
                <span>{filterLabel}</span>
                {activeFilterCount > 0 && (
                  <span className="bg-white text-elanpurple text-xs rounded-full px-2 py-0.5 font-bold min-w-[20px] text-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Filter Panel - Collapsible */}
          {showFilters && showFiltersPanel && (
            <div className="p-6 bg-gray-50/50">
              <div className="flex flex-wrap gap-4 2xl:gap-6">

                {/* Location Filter */}
                <div className="space-y-3 w-full 2xl:flex-1 2xl:min-w-[320px] 2xl:max-w-[480px]">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPinIcon className="h-4 w-4" />
                    {locationLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={locationPlaceholder}
                      value={filterValues.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                      className="w-[240px] sm:max-xl:w-[480px] md:max-md:w-[320px] xl:max-2xl:w-[480px] 2xl:w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-elanpurple focus:ring-2 focus:ring-elanpurple focus:ring-opacity-20 focus:outline-none transition-all"
                    />
                    {filterValues.location && (
                      <button
                        onClick={() => handleFilterChange("location", "")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Date Range Filter - Medium width for date inputs */}
                <div className="space-y-3 w-full xl:w-auto xl:min-w-[500px]">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CalendarIcon className="h-4 w-4" />
                    {startLabel}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <DatePicker
                      selected={filterValues.dateRange.start}
                      onChange={(date: Date | null) =>
                        handleFilterChange("dateRange", { ...filterValues.dateRange, start: date || undefined })
                      }
                      selectsStart
                      startDate={filterValues.dateRange.start}
                      endDate={filterValues.dateRange.end}
                      locale={hr}
                      dateFormat="dd.MM.yyyy."
                      placeholderText={dateFromPlaceholder}
                      className="flex-1 xl:w-[240px] px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-elanpurple focus:ring-2 focus:ring-elanpurple focus:ring-opacity-20 focus:outline-none transition-all"
                    />
                    <DatePicker
                      selected={filterValues.dateRange.end}
                      onChange={(date: Date | null) =>
                        handleFilterChange("dateRange", { ...filterValues.dateRange, end: date || undefined })
                      }
                      selectsEnd
                      startDate={filterValues.dateRange.start}
                      endDate={filterValues.dateRange.end}
                      minDate={filterValues.dateRange.start}
                      locale={hr}
                      dateFormat="dd.MM.yyyy."
                      placeholderText={dateToPlaceholder}
                      className="flex-1 xl:w-[240px] px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-elanpurple focus:ring-2 focus:ring-elanpurple focus:ring-opacity-20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Salary Range Filter - Smaller width for number inputs */}
                <div className="space-y-3 w-full xl:w-auto xl:min-w-[500px]">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CurrencyEuroIcon className="h-4 w-4" />
                    {salaryLabel}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      placeholder={salaryFromPlaceholder}
                      value={filterValues.salary.min || ""}
                      onChange={(e) =>
                        handleFilterChange("salary", {
                          ...filterValues.salary,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-[240px] px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-elanpurple focus:ring-2 focus:ring-elanpurple focus:ring-opacity-20 focus:outline-none transition-all"
                    />
                    <input
                      type="number"
                      placeholder={salaryToPlaceholder}
                      value={filterValues.salary.max || ""}
                      onChange={(e) =>
                        handleFilterChange("salary", {
                          ...filterValues.salary,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-[240px] px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-elanpurple focus:ring-2 focus:ring-elanpurple focus:ring-opacity-20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-elanpurple hover:bg-elangreen text-white rounded-xl transition-colors text-sm font-medium"
                  >
                    {clearAllFiltersLabel}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Bar - Always Visible */}
        {showSearch && (
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pretraži po nazivu, lokaciji, opisu..."
                value={filterValues.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white border border-gray-200 rounded-2xl shadow-sm focus:border-elanpurple focus:ring-2 focus:ring-elanpurple focus:ring-opacity-20 focus:outline-none transition-all duration-200"
              />
              {filterValues.searchTerm && (
                <button
                  onClick={() => handleFilterChange("searchTerm", "")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {(filterValues.searchTerm || activeFilterCount > 0) && (
          <div className="mb-6 text-sm text-gray-600">
            Pronađeno <span className="font-bold">{paginationInfo.totalJobs}</span> {paginationInfo.totalJobs === 1 ? 'rezultat' : 'rezultata'}
            {filterValues.searchTerm && (
              <span> za "<span className="font-medium">{filterValues.searchTerm}</span>"</span>
            )}
          </div>
        )}

        {/* Pagination */}
        {paginationInfo.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!paginationInfo.hasPreviousPage}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${paginationInfo.hasPreviousPage
                ? 'bg-elanpurple text-white hover:bg-elangreen shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              Prethodna
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">
                Stranica
              </span>
              <span className="bg-elangreen text-white px-3 py-1 rounded-lg font-bold text-sm">
                {currentPage}
              </span>
              <span className="text-gray-600 text-sm">
                od {paginationInfo.totalPages}
              </span>
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(paginationInfo.totalPages, currentPage + 1))}
              disabled={!paginationInfo.hasNextPage}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${paginationInfo.hasNextPage
                ? 'bg-elanpurple text-white hover:bg-elangreen shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              Sljedeća
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {paginationInfo.currentPageJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-auto gap-6 mb-9">
            {paginationInfo.currentPageJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                locale={locale}
                isDefaultLocale={isDefaultLocale}
                startLabel={startLabel}
                locationLabel={locationLabel}
                salaryLabel={salaryLabel}
                salaryOnRequestLabel={salaryOnRequestLabel}
                patientDescriptionLabel={patientDescriptionLabel}
                requirementsLabel={requirementsLabel}
                advantagesLabel={advantagesLabel}
                applyLabel={applyLabel}
              />
            ))}
          </div>
        ) : (
          /* No Results State */
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{noResultsTitle}</h3>
            <p className="text-gray-600 mb-6">{noResultsMessage}</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-6 py-3 bg-elanpurple text-white rounded-xl hover:bg-elangreen transition-colors font-medium"
              >
                {clearAllFiltersLabel}
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {paginationInfo.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!paginationInfo.hasPreviousPage}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${paginationInfo.hasPreviousPage
                ? 'bg-elanpurple text-white hover:bg-elangreen shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              Prethodna
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">
                Stranica
              </span>
              <span className="bg-elangreen text-white px-3 py-1 rounded-lg font-bold text-sm">
                {currentPage}
              </span>
              <span className="text-gray-600 text-sm">
                od {paginationInfo.totalPages}
              </span>
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(paginationInfo.totalPages, currentPage + 1))}
              disabled={!paginationInfo.hasNextPage}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${paginationInfo.hasNextPage
                ? 'bg-elanpurple text-white hover:bg-elangreen shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              Sljedeća
            </button>
          </div>
        )}
      </div>
    </section>
  );
}