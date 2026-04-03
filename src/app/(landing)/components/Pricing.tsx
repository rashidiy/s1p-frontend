'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { BlurFade } from './magicui/blur-fade';
import { BorderBeam } from './magicui/border-beam';
import { ShimmerButton } from './magicui/shimmer-button';

const FEATURE_KEYS = [
  'feature1',
  'feature2',
  'feature3',
  'feature4',
  'feature5',
  'feature6',
  'feature7',
] as const;

export default function Pricing() {
  const t = useTranslations('landing');
  const [showAnnual, setShowAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-[#0D0D12] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <BlurFade delay={0} inView>
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              {t('pricing.title')}
            </h2>
          </div>
        </BlurFade>

        {/* Pricing card */}
        <BlurFade delay={0.15} inView>
          <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-3xl max-w-xl mx-auto overflow-hidden">
            <BorderBeam size={250} duration={12} colorFrom="#6366f1" colorTo="#a855f7" />

            {/* Free trial badge */}
            <div className="absolute right-6 top-6 z-10">
              <div className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                {t('pricing.freeTrialBadge')}
              </div>
            </div>

            <div className="p-10 sm:p-12">
              {/* Plan name */}
              <p className="text-indigo-400 font-bold text-sm uppercase tracking-wider font-body">
                {t('pricing.planName')}
              </p>

              {/* Price */}
              <div className="mt-6 flex items-baseline">
                <span className="font-display text-6xl font-black text-white">
                  {t('pricing.price')}
                </span>
                <span className="ml-2 text-xl text-gray-500">
                  {t('pricing.currency')}
                </span>
              </div>

              {/* Per user info */}
              <p className="mt-3 text-base text-gray-400 font-body">
                {t('pricing.perUser')}
              </p>
              <p className="mt-1 text-sm text-gray-500 font-body">
                {t('pricing.extraUser')}
              </p>

              {/* Divider */}
              <div className="my-8">
                <div className="h-px w-full bg-white/[0.08]" />
              </div>

              {/* Feature list */}
              <ul className="space-y-4">
                {FEATURE_KEYS.map((key) => (
                  <li key={key} className="flex items-center gap-3">
                    <div className="bg-emerald-500 w-2 h-2 rounded-full flex-shrink-0" />
                    <span className="text-gray-300 font-body text-[15px]">
                      {t(`pricing.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <div className="mt-10">
                <a
                  href={`https://t.me/s1p_support?text=${encodeURIComponent(t('demoMessage'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <ShimmerButton
                    className="w-full py-4 text-lg font-semibold"
                    background="rgba(99, 102, 241, 0.2)"
                    shimmerColor="#818CF8"
                    borderRadius="16px"
                  >
                    {t('pricing.cta')}
                  </ShimmerButton>
                </a>
              </div>

              {/* No card disclaimer */}
              <p className="mt-4 text-center text-gray-500 text-sm font-body">
                {t('pricing.noCard')}
              </p>

              {/* Annual toggle */}
              <div className="mt-8 border-t border-white/[0.08] pt-6">
                <button
                  type="button"
                  onClick={() => setShowAnnual(!showAnnual)}
                  className="flex w-full items-center justify-center gap-2 text-sm text-gray-500 font-body transition-colors duration-200 hover:text-gray-300"
                >
                  <div
                    className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors duration-200 ${
                      showAnnual ? 'bg-indigo-600' : 'bg-white/[0.1]'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        showAnnual ? 'translate-x-[14px]' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span>{t('pricing.annual')}</span>
                </button>
                {showAnnual && (
                  <p className="mt-2 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-400">
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {t('pricing.annualSaving')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
