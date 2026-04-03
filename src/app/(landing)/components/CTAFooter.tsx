'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { type Locale, locales } from '@/i18n/config';
import { BlurFade } from './magicui/blur-fade';
import { ShimmerButton } from './magicui/shimmer-button';

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

  return (
    <>
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-indigo-950 via-[#0D0D12] to-violet-950 relative overflow-hidden py-24">
        {/* Floating gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-indigo-600/[0.12] blur-3xl" />
          <div className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-violet-600/[0.10] blur-3xl" />
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8">
          <BlurFade delay={0} inView>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                {t('ctaFooter.title')}
              </h2>

              <div className="mt-10 flex justify-center">
                <a
                  href={`https://t.me/s1p_support?text=${encodeURIComponent(t('demoMessage'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ShimmerButton
                    className="px-10 py-4 text-lg font-bold"
                    background="rgba(99, 102, 241, 0.2)"
                    shimmerColor="#818CF8"
                    borderRadius="16px"
                  >
                    {t('ctaFooter.cta')}
                  </ShimmerButton>
                </a>
              </div>

              <p className="mt-6 text-indigo-300/60 text-sm font-body">
                {t('ctaFooter.subtitle')}
              </p>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#08090a] border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="font-display text-white font-bold text-lg">S1P</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500 font-body">
                {t('footer.description')}
              </p>
            </div>

            {/* Links column */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-4 font-body">
                {t('footer.product')}
              </h3>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    <a
                      href={href}
                      onClick={(e) => handleSmoothScroll(e, href)}
                      className="text-sm text-gray-400 hover:text-white transition font-body"
                    >
                      {t(`footer.${key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-4 font-body">
                {t('footer.contact')}
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="mailto:info@s1p.uz"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition font-body"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
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
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition font-body"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    @s1p_support
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400 font-body">
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
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
          <div className="mt-10 border-t border-white/[0.06] py-4">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
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
                          ? 'text-white font-semibold'
                          : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {LOCALE_LABELS[loc]}
                    </button>
                  </span>
                ))}
              </div>

              {/* Copyright */}
              <p className="text-gray-500 text-sm font-body">
                {t('footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
