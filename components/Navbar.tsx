"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, XMarkIcon, ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// Use existing Strapi types and create specific navigation types
interface SubNavItem {
  id: number;
  label: string;
  href: string;
}

interface NavItem {
  id: number;
  href: string;
  label: string;
  isExternal: boolean;
  isButtonLink: boolean;
  type: string | null;
  subNavItems: SubNavItem[];
}

interface Banner {
  id: number;
  isVisible: boolean;
  leftText: string;
  rightText: string;
}

interface GlobalData {
  header: {
    id: number;
    navItems: NavItem[];
  };
  banner: Banner;
  siteName: string;
  siteDescription: string;
}

interface Language {
  code: string;
  flag: string;
  alt: string;
}

interface NavbarProps {
  lang: string;
  initialData?: GlobalData | null;
}

// Type-safe locale validation
const VALID_LOCALES = ['hr', 'en', 'de'] as const;
type ValidLocale = typeof VALID_LOCALES[number];
const DEFAULT_LOCALE: ValidLocale = "hr";

// Type guard for valid locales
const isValidLocale = (locale: string): locale is ValidLocale => {
  return VALID_LOCALES.includes(locale as ValidLocale);
};

export default function Navbar({ lang, initialData }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const [shrinkNav, setShrinkNav] = useState(false);
  const [globalData, setGlobalData] = useState<GlobalData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  const router = useRouter();
  const pathname = usePathname() || "/";

  // Validate the lang prop - only use valid locales
  const currentLocale: ValidLocale = isValidLocale(lang) ? lang : DEFAULT_LOCALE;

  console.log(`🧭 Navbar: received lang="${lang}", using currentLocale="${currentLocale}"`);

  // Fetch data from Strapi if not provided via props
  useEffect(() => {
    const fetchGlobalData = async () => {
      if (initialData) {
        return; // Skip fetching if data was provided via props
      }

      try {
        const { getGlobalData } = await import('@/lib/api-client');
        const data = await getGlobalData(currentLocale);
        setGlobalData(data);
      } catch (error) {
        console.error('Error fetching global data:', error);

        // Fallback to direct API call if needed
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}/api/global?populate[header][populate][navItems][populate]=subNavItems&locale=${currentLocale}`
          );
          const fallbackData = await res.json();
          setGlobalData(fallbackData.data);
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, [currentLocale, initialData]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShrinkNav(true);
      } else {
        setShrinkNav(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = (id: string) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Function to get localized URLs
  const getLocalizedPath = (newLocale: ValidLocale, currentPath: string): string => {
    console.log(`🔄 Language switch: ${currentLocale} -> ${newLocale}, path: ${currentPath}`);

    // Remove trailing slash except for root
    let normalizedPath = currentPath.endsWith("/") && currentPath !== "/"
      ? currentPath.slice(0, -1)
      : currentPath;

    // Parse current path to extract current locale and clean path
    const segments = normalizedPath.split('/').filter(Boolean);
    let cleanPath = '';

    // Check if first segment is a locale
    if (segments.length > 0 && isValidLocale(segments[0])) {
      // Path has locale prefix, extract the clean path
      cleanPath = segments.length > 1 ? '/' + segments.slice(1).join('/') : '/';
    } else {
      // Path doesn't have locale prefix (default locale)
      cleanPath = normalizedPath || '/';
    }

    console.log(`🔍 Clean path extracted: ${cleanPath}`);

    // Build new path
    let newPath = '';
    if (newLocale === DEFAULT_LOCALE) {
      // Croatian (default) - no prefix needed
      newPath = cleanPath;
    } else {
      // Non-default locale - add prefix
      if (cleanPath === '/') {
        newPath = `/${newLocale}`;
      } else {
        newPath = `/${newLocale}${cleanPath}`;
      }
    }

    console.log(`🎯 New path: ${newPath}`);
    return newPath;
  };

  const languages: Language[] = [
    { code: "en", flag: "/img/flags/gb.svg", alt: "English flag" },
    { code: "de", flag: "/img/flags/de.svg", alt: "German flag" },
    { code: "hr", flag: "/img/flags/hr.svg", alt: "Croatian flag" },
  ];

  const otherLanguages = languages.filter((l): l is Language => isValidLocale(l.code) && l.code !== currentLocale);

  const handleLanguageChange = (newLocaleCode: string) => {
    if (!isValidLocale(newLocaleCode)) {
      console.error(`Invalid locale: ${newLocaleCode}`);
      return;
    }

    console.log(`🌍 Switching language from ${currentLocale} to ${newLocaleCode}`);
    setIsLanguageDropdownOpen(false);

    const newPath = getLocalizedPath(newLocaleCode, pathname);
    router.push(newPath);
  };

  // Helper to generate correct links
  const getLink = (path: string): string => {
    console.log(`🔗 Building link for path="${path}" with currentLocale="${currentLocale}"`);
    return currentLocale === DEFAULT_LOCALE ? path : `/${currentLocale}${path}`;
  };

  const getCurrentFlag = (): string => {
    const lang = languages.find(l => l.code === currentLocale);
    return lang?.flag || "/img/flags/hr.svg"; // Default to Croatian flag
  };

  // If no data and still loading, show minimal placeholder
  if (!globalData && loading) {
    return (
      <header className="fixed text-xs inset-x-0 bg-[#f7f5f2]/80 backdrop-blur-[10px] top-0 z-50 border-b border-[#DFDAD2]">
        <div className="flex items-center justify-between h-20 px-[20px] sm:px-[50px]">
          <div className="h-20 w-[163px]" /> {/* Logo placeholder */}
          <div className="w-6 h-6" /> {/* Menu button placeholder */}
        </div>
      </header>
    );
  }

  // Get navigation items from API
  const navigation = globalData?.header?.navItems || [];

  // Type-safe function to check if a link is active
  const isActive = (href: string, children: SubNavItem[] = []): boolean => {
    let normalizedHref = href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href;
    let normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    // Remove locale prefix from pathname if present
    if (currentLocale !== DEFAULT_LOCALE && normalizedPath.startsWith(`/${currentLocale}`)) {
      normalizedPath = normalizedPath.replace(`/${currentLocale}`, "") || "/";
    }

    // Normalize root path
    if (normalizedPath === "") normalizedPath = "/";

    // Make sure homepage only matches "/"
    if (normalizedHref === "/") {
      return normalizedPath === "/";
    }

    // Exact match or subpath match
    if (normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`)) {
      return true;
    }

    // Check if any subNavItem matches current path
    return children.some((child) => {
      const childHref = child.href.endsWith("/") && child.href !== "/" ? child.href.slice(0, -1) : child.href;
      return normalizedPath === childHref || normalizedPath.startsWith(`${childHref}/`);
    });
  };

  // Get banner data from Strapi
  const bannerData = globalData?.banner;
  const bannerLeftText = bannerData?.leftText || "PREMIUM USLUGA 24 - SATNE KUĆNE NJEGE";
  const bannerRightText = bannerData?.rightText || "TEL.+385 91 613 81 56 / +385 97 647 4494";
  const showBanner = bannerData?.isVisible !== false;

  return (
    <header className="fixed text-xs inset-x-0 bg-[#f7f5f2]/80 backdrop-blur-[10px] top-0 z-50 border-b border-[#DFDAD2]">
      {showBanner && (
        <div
          className={`${shrinkNav ? "md:hidden" : "md:flex"} hidden w-full bg-[#dfdad2]/40 h-[34px] px-[50px] items-center justify-between border-b border-[#DFDAD2] relative`}
        >
          <h4 className="text-[11px] leading-[13.2px] tracking-[1.3px]">{bannerLeftText}</h4>
          <div className="inline-block">
            <span className="text-[#797c83]">TEL.</span>
            <span className="text-[#3d3935]">{bannerRightText.replace('TEL.', '')}</span>
          </div>
        </div>
      )}

      <nav
        className={`${shrinkNav ? "py-2.5" : "py-5"} flex items-center justify-between transition-all duration-300 px-[20px] sm:px-[50px]`}
        aria-label="Global"
      >
        <Link href={currentLocale === DEFAULT_LOCALE ? "/" : `/${currentLocale}`}>
          <Image
            alt="Elan logo"
            width={shrinkNav ? 102 : 163}
            height={shrinkNav ? 50 : 80}
            className={`${shrinkNav ? "h-[50px] w-[102px]" : "h-20 w-[163px]"} transition-all duration-300`}
            src="/img/elan-web-logo.png"
          />
        </Link>

        {/* Mobile view ELAN HOMECARE button */}
        <Link
          href="https://www.elan-homecare.com"
          className='lg:hidden text-[12px] leading-[32px] tracking-[1px] uppercase w-[160px] h-[51px] rounded-full bg-[#ac7cb4] text-white text-center hover:bg-transparent hover:border-2 hover:border-black hover:text-black transition-all ml-[16px] mr-2.5 flex items-center justify-center'
        >
          ELAN HOMECARE
        </Link>

        <button
          type="button"
          className="-m-2.5 rounded-md p-2.5 text-gray-700 lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="hidden lg:flex flex-row items-center justify-around lg:justify-end gap-1">
          {navigation.map((item) => (
            <div key={item.id} className="relative">
              <Link
                href={getLink(item.href)}
                onMouseEnter={() => (item.subNavItems?.length > 0 ? toggleDropdown(item.id.toString()) : undefined)}
                className={`${isActive(item.href, item.subNavItems || [])
                  ? "text-purple-700 hover:text-purple-700 hover:animate-pulse"
                  : "text-gray-900 hover:text-purple-700 hover:animate-pulse"
                  } text-[13px] uppercase leading-8 tracking-[1.3px] font-medium text-center h-[33px] px-[15px]`}
              >
                {item.label}
                {item.subNavItems?.length > 0 &&
                  (dropdownOpen[item.id.toString()] ? (
                    <ChevronUpIcon className="ml-2 inline h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="ml-2 inline h-4 w-4" />
                  ))}
              </Link>
              {item.subNavItems?.length > 0 && dropdownOpen[item.id.toString()] && (
                <div
                  className="absolute min-w-full whitespace-nowrap text-center bg-[#f7f5f2]/80 backdrop-blur-[10px] shadow-md mt-0 border-2 border-[#ac7cb4]"
                  onMouseLeave={() => toggleDropdown(item.id.toString())}
                >
                  {item.subNavItems.map((child) => (
                    <Link
                      key={child.id}
                      href={getLink(child.href)}
                      className={`block px-4 py-2 text-[13px] ${isActive(child.href)
                        ? "text-white bg-[#ac7cb4]"
                        : "text-gray-700 hover:text-white hover:bg-[#ac7cb4]"
                        } uppercase`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="relative inline-flex items-center ml-5">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border px-4 py-1 text-sm font-medium hover:bg-purple-200"
              aria-expanded={isLanguageDropdownOpen}
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            >
              <img src={getCurrentFlag()} width="24px" alt="Current Language" />
            </button>
            {isLanguageDropdownOpen && (
              <div className="absolute right-0 mt-1 w-[52px] shadow-lg bg-[#f7f5f2]" style={{ top: "100%" }}>
                {otherLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    className="block w-full text-center px-3 py-2 text-sm bg-[#f7f5f2] hover:bg-purple-200 rounded-md"
                    role="menuitem"
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <img src={lang.flag} alt={lang.alt} width="24px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop view ELAN HOMECARE button */}
          <Link
            href="https://www.elan-homecare.com"
            className='text-[12px] leading-[32px] tracking-[1px] uppercase w-[160px] h-[51px] rounded-full bg-[#ac7cb4] text-white text-center hover:bg-transparent hover:border-2 hover:border-black hover:text-black transition-all ml-[16px] mr-2.5 flex items-center justify-center'
          >
            ELAN HOMECARE
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href={currentLocale === DEFAULT_LOCALE ? "/" : `/${currentLocale}`} className="-m-1.5 p-1.5">
              <img className="h-20 w-[163px]" src="/img/elan-web-logo.png" alt="Elan logo" />
            </Link>

            {/* Mobile menu ELAN HOMECARE button */}
            <Link
              href="https://www.elan-homecare.com"
              className='text-[12px] leading-[32px] tracking-[1px] uppercase w-[160px] h-[51px] rounded-full bg-[#ac7cb4] text-white text-center hover:bg-transparent hover:border-2 hover:border-black hover:text-black transition-all ml-[16px] mr-2.5 flex items-center justify-center'
            >
              ELAN HOMECARE
            </Link>

            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 pt-6 flow-root border-t-2 border-gray-300">
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.id} className="relative py-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={getLink(item.href)}
                      className={`block px-3 py-2 text-[13px] ${isActive(item.href, item.subNavItems || []) ? "text-purple-700" : "text-gray-900"
                        } uppercase leading-8 tracking-[1.3px] font-medium`}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                    {item.subNavItems?.length > 0 && (
                      <button
                        className="px-3 py-2"
                        onClick={() => toggleDropdown(item.id.toString())}
                        aria-expanded={dropdownOpen[item.id.toString()]}
                      >
                        <ChevronRightIcon
                          className={`h-5 w-5 transition-transform ${dropdownOpen[item.id.toString()] ? "rotate-90" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {item.subNavItems?.length > 0 && dropdownOpen[item.id.toString()] && (
                    <div className="pl-6 py-1">
                      {item.subNavItems.map((child) => (
                        <Link
                          key={child.id}
                          href={getLink(child.href)}
                          className={`block px-3 py-2 text-[13px] ${isActive(child.href) ? "text-purple-700" : "text-gray-700"
                            } uppercase`}
                          onClick={closeMobileMenu}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="py-6">
              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-1 text-sm font-medium hover:bg-purple-200"
                  aria-expanded={isLanguageDropdownOpen}
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                >
                  <img src={getCurrentFlag()} width="24px" alt="Current Language" />
                </button>
                {isLanguageDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-[52px] shadow-lg bg-[#f7f5f2]" style={{ top: "100%" }}>
                    {otherLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        className="block w-full text-center px-3 py-2 text-sm bg-[#f7f5f2] hover:bg-purple-200 rounded-md"
                        role="menuitem"
                        onClick={() => handleLanguageChange(lang.code)}
                      >
                        <img src={lang.flag} alt={lang.alt} width="24px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}