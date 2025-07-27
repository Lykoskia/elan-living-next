"use client";

import { Suspense } from 'react';
import Navbar from './Navbar';

function NavbarSkeleton() {
  return (
    <header className="fixed text-xs inset-x-0 bg-[#f7f5f2]/80 backdrop-blur-[10px] top-0 z-50 border-b border-[#DFDAD2]">
      <div className="flex items-center justify-between h-20 px-[20px] sm:px-[50px]">
        <div className="h-20 w-[163px] bg-gray-200 animate-pulse rounded" />
        <div className="hidden lg:flex space-x-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
        <div className="w-6 h-6 bg-gray-200 animate-pulse rounded lg:hidden" />
      </div>
    </header>
  );
}

interface NavbarWithSuspenseProps {
  lang: string;
}

export default function NavbarWithSuspense({ lang }: NavbarWithSuspenseProps) {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <Navbar lang={lang} />
    </Suspense>
  );
}