'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { type Locale, locales } from '@/i18n/config';

const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  uz: 'UZ',
};

const FOOTER_LINKS = [
  { key: 'product', href: '#features' },
  { key: 'pricingLink', href: '#pricing' },
  { key: 'faqLink', href: '#faq' },
  { key: 'apiDocs', href: '#' },
] as const;

export default function CTAFooter() {
  const t = useTranslations('landing');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const handleLocaleChange = useCallback(
    (newLocale: Locale) => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith('#') && href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    [],
  );

  const ctaVariants: Variants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <>
      {/* CTA Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 50%, #312E81 100%)' }}
        />

        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={ctaVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t('ctaFooter.title')}
            </h2>

            <div className="mt-10 flex justify-center">
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-indigo-700 shadow-xl shadow-indigo-900/20 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50 hover:shadow-2xl"
              >
                {t('ctaFooter.cta')}
              </Link>
            </div>

            <p className="mt-6 text-base text-indigo-200">
              {t('ctaFooter.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
                  style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
                >
                  <span className="text-[11px] font-bold tracking-wider text-white">
                    S1P
                  </span>
                </div>
                <span className="text-xl font-bold text-white">S1P</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
                {t('footer.description')}
              </p>
            </div>

            {/* Links column */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                {t('footer.product')}
              </h3>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    <a
                      href={href}
                      onClick={(e) => handleSmoothScroll(e, href)}
                      className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                    >
                      {t(`footer.${key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                {t('footer.contact')}
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href={`tel:${t('nav.phone').replace(/\s/g, '')}`}
                    className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
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
                </li>
                <li>
                  <a
                    href="mailto:info@s1p.uz"
                    className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    info@s1p.uz
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/s1p_support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    @s1p_support
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {t('footer.address')}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-gray-800 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              {/* Language toggle */}
              <div className="flex items-center gap-1">
                {locales.map((loc, index) => (
                  <span key={loc} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-1.5 text-gray-600">/</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleLocaleChange(loc)}
                      className={`text-sm transition-colors duration-200 ${
                        loc === locale
                          ? 'font-semibold text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {LOCALE_LABELS[loc]}
                    </button>
                  </span>
                ))}
              </div>

              {/* Copyright */}
              <p className="text-sm text-gray-500">
                {t('footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
