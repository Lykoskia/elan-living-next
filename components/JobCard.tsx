"use client";

import Link from "next/link";
import Image from "next/image";
import { RichText } from "@/lib/richtext";
import type { Job, JobRequirement } from "@/lib/types/strapi";
import { getStrapiImageUrl, getStrapiImageAlt, isRichTextEmpty } from "@/lib/types/strapi";

interface JobCardProps {
  job: Job;
  locale?: string;
  isDefaultLocale?: boolean;
  startLabel?: string;
  locationLabel?: string;
  salaryLabel?: string;
  salaryOnRequestLabel?: string;
  patientDescriptionLabel?: string;
  requirementsLabel?: string;
  advantagesLabel?: string;
  applyLabel?: string;
}

export default function JobCard({
  job,
  locale = 'hr',
  isDefaultLocale = true,
  startLabel = "Početak rada",
  locationLabel = "Lokacija",
  salaryLabel = "Plaća do",
  salaryOnRequestLabel = "Na upit",
  patientDescriptionLabel = "OPIS PACIJENTA",
  requirementsLabel = "UVJETI",
  advantagesLabel = "PREDNOSTI",
  applyLabel = "Prijavi se za posao",
}: JobCardProps) {

  // Type-safe content checking
  const hasListContent = (items?: JobRequirement[] | string[]): boolean => {
    if (!Array.isArray(items) || items.length === 0) return false;

    return items.some(item => {
      if (typeof item === 'string') {
        return item.trim().length > 0;
      }
      if (typeof item === 'object' && 'text' in item) {
        return item.text.trim().length > 0;
      }
      return false;
    });
  };

  // Type-safe list rendering
  const renderListItems = (items?: JobRequirement[] | string[]) => {
    if (!hasListContent(items)) return null;

    return (
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        {items!.map((item, index) => (
          <li key={index} className="leading-normal">
            {typeof item === 'string' ? item : item.text}
          </li>
        ))}
      </ul>
    );
  };

  // Format date for display
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}.`;
  };

  // Use utility functions for image handling
  const imageUrl = getStrapiImageUrl(job.image, "/placeholder.svg");
  const imageAlt = getStrapiImageAlt(job.image, `Slika za ${job.title}`);

  // Create apply URL based on locale
  const applyUrl = isDefaultLocale ? "/apply" : `/${locale}/apply`;

  return (
    <div className="flex flex-col justify-between h-full mx-auto border border-sky-200 p-4 rounded-3xl mb-12 pt-0 shadow-lg transition-transform hover:-translate-y-2 hover:shadow-xl bg-gray-50 prose">
      <div>
        {/* Job Title */}
        {job.title && (
          <h2 className="text-2xl font-bold text-center uppercase border-y-2 border-gray-200 bg-sky-100 mt-6">
            {job.title}
            {job.featured && (
              <span className="ml-2 inline-block bg-elanpurple text-white px-2 py-1 rounded-full text-sm font-medium normal-case">
                Izdvojeno
              </span>
            )}
          </h2>
        )}

        {/* Job Image */}
        {imageUrl && imageUrl !== '/placeholder.svg' && (
          <div className="mb-4">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={300}
              height={300}
              style={{ width: '100%', height: 'auto' }}
              className="rounded-xl"
            />
          </div>
        )}

        {/* Job Details */}
        <div className="flex-col gap-0 leading-tight">
          <p>
            <span className="text-red-700 font-bold">{startLabel}:</span>{" "}
            <span className="text-elangreen font-bold">{formatDisplayDate(job.jobStart)}</span>
          </p>
          <p>
            <span className="text-red-700 font-bold">{locationLabel}:</span>{" "}
            <span className="text-elangreen font-bold">{job.location}</span>
          </p>
          <p>
            <span className="text-red-700 font-bold">{salaryLabel}:</span>{" "}
            <span className="text-elangreen font-bold">
              {job.salary > 0
                ? new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" }).format(job.salary)
                : salaryOnRequestLabel}
            </span>
          </p>
        </div>

        {/* Patient Description */}
        {!isRichTextEmpty(job.patientDescription) && (
          <>
            <p className="text-lg font-bold text-center uppercase leading-6 border-y-2 border-gray-200 bg-sky-100">
              {patientDescriptionLabel}:
            </p>
            <div className="leading-normal">
              <RichText content={job.patientDescription} />
            </div>
          </>
        )}

        {/* Requirements */}
        {hasListContent(job.requirements) && (
          <>
            <p className="text-lg font-bold text-center uppercase leading-6 border-y-2 border-gray-200 bg-red-100">
              {requirementsLabel}:
            </p>
            <div className="leading-normal">
              {renderListItems(job.requirements)}
            </div>
          </>
        )}

        {/* Advantages (optional) */}
        {hasListContent(job.advantages) && (
          <>
            <p className="text-lg font-bold text-center uppercase leading-6 border-y-2 border-gray-200 bg-emerald-100">
              {advantagesLabel}:
            </p>
            <div className="leading-normal">
              {renderListItems(job.advantages)}
            </div>
          </>
        )}
      </div>

      {/* Apply Button */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center justify-center not-prose border-t-2 pt-2 border-gray-200">
          <Link
            href={applyUrl}
            className="bg-elanpurple hover:bg-white text-white hover:text-black border-2 border-white hover:border-black px-4 py-2 rounded-full uppercase mt-3 transition-colors inline-block text-center"
          >
            {applyLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}