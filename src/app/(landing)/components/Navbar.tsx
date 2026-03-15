'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { type Locale, locales } from '@/i18n/config';

const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  uz: 'UZ',
};

const NAV_LINKS = [
  { key: 'features', href: '#features' },
  { key: 'howItWorks', href: '#how-it-works' },
  { key: 'pricing', href: '#pricing' },
  { key: 'faq', href: '#faq' },
] as const;

export default function Navbar() {
  const t = useTranslations('landing');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = useCallback(
    (newLocale: Locale) => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
      setLangDropdownOpen(false);
      router.refresh();
    },
    [router],
  );

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setMobileMenuOpen(false);
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [],
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
            style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
          >
            <span className="text-[11px] font-bold tracking-wider text-white">
              S1P
            </span>
          </div>
          <span className="text-xl font-bold text-gray-900">S1P</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              onClick={(e) => handleSmoothScroll(e, href)}
              className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
            >
              {t(`nav.${key}`)}
            </a>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-4 lg:flex">
          {/* Language Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {LOCALE_LABELS[locale]}
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 5l3 3 3-3" />
              </svg>
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-24 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLocaleChange(loc)}
                      className={`flex w-full items-center px-3 py-2 text-sm transition-colors duration-150 ${
                        loc === locale
                          ? 'bg-indigo-50 font-semibold text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {LOCALE_LABELS[loc]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Phone Number */}
          <a
            href={`tel:${t('nav.phone').replace(/\s/g, '')}`}
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            {t('nav.phone')}
          </a>

          {/* CTA Button */}
          <Link
            href="/register"
            className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30"
            style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
          >
            {t('nav.tryFree')}
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <div className="flex h-5 w-5 flex-col items-center justify-center">
            <span
              className={`block h-0.5 w-5 rounded-full bg-gray-700 transition-all duration-300 ${
                mobileMenuOpen ? 'translate-y-[3px] rotate-45' : '-translate-y-1'
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-gray-700 transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-gray-700 transition-all duration-300 ${
                mobileMenuOpen ? '-translate-y-[3px] -rotate-45' : 'translate-y-1'
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-full z-40 border-b border-gray-200 bg-white px-4 pb-6 pt-2 shadow-xl lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map(({ key, href }) => (
                  <a
                    key={key}
                    href={href}
                    onClick={(e) => handleSmoothScroll(e, href)}
                    className="rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
                  >
                    {t(`nav.${key}`)}
                  </a>
                ))}
              </div>

              <div className="my-3 border-t border-gray-100" />

              {/* Language Options — Mobile */}
              <div className="flex items-center gap-2 px-4 py-2">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocaleChange(loc)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                      loc === locale
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {LOCALE_LABELS[loc]}
                  </button>
                ))}
              </div>

              {/* Phone — Mobile */}
              <a
                href={`tel:${t('nav.phone').replace(/\s/g, '')}`}
                className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-gray-600"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {t('nav.phone')}
              </a>

              {/* CTA — Mobile */}
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex w-full items-center justify-center rounded-xl px-5 py-3 text-base font-semibold text-white shadow-md shadow-indigo-500/25"
                style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
              >
                {t('nav.tryFree')}
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
