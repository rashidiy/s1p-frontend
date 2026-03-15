'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import Link from 'next/link';

const FEATURE_KEYS = [
  'feature1',
  'feature2',
  'feature3',
  'feature4',
  'feature5',
  'feature6',
  'feature7',
] as const;

function CheckIcon() {
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
      <svg
        className="h-3 w-3 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );
}

export default function Pricing() {
  const t = useTranslations('landing');
  const prefersReducedMotion = useReducedMotion();
  const [showAnnual, setShowAnnual] = useState(false);

  const cardVariants: Variants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section id="pricing" className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('pricing.title')}
          </h2>
        </div>

        {/* Pricing card */}
        <motion.div
          className="mx-auto max-w-xl"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-indigo-500/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Top gradient border */}
              <div
                className="h-1 w-full"
                style={{
                  background:
                    'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #6366F1 100%)',
                }}
              />

              {/* Free trial badge */}
              <div className="absolute right-6 top-6">
                <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/25">
                  14 дней бесплатно
                </div>
              </div>

              <div className="p-10 sm:p-12">
                {/* Plan name */}
                <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                  {t('pricing.planName')}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-baseline">
                  <span className="text-6xl font-black tracking-tight text-gray-900">
                    {t('pricing.price')}
                  </span>
                  <span className="ml-2 text-xl text-gray-400">
                    {t('pricing.currency')}
                  </span>
                </div>

                {/* Per user info */}
                <p className="mt-3 text-base text-gray-500">
                  {t('pricing.perUser')}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {t('pricing.extraUser')}
                </p>

                {/* Gradient divider */}
                <div className="my-8">
                  <div
                    className="h-px w-full"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, #E0E7FF 50%, transparent 100%)',
                    }}
                  />
                </div>

                {/* Feature list */}
                <ul className="space-y-4">
                  {FEATURE_KEYS.map((key) => (
                    <li key={key} className="flex items-center gap-3">
                      <CheckIcon />
                      <span className="text-[15px] text-gray-700">
                        {t(`pricing.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Link
                  href="/register"
                  className="mt-10 flex w-full items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/35"
                  style={{
                    background: 'linear-gradient(135deg, #4338CA, #6366F1)',
                  }}
                >
                  {t('pricing.cta')}
                </Link>

                {/* No card disclaimer */}
                <p className="mt-4 text-center text-sm text-gray-400">
                  {t('pricing.noCard')}
                </p>

                {/* Annual toggle */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAnnual(!showAnnual)}
                    className="flex w-full items-center justify-center gap-2 text-sm text-gray-500 transition-colors duration-200 hover:text-indigo-600"
                  >
                    <div
                      className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors duration-200 ${
                        showAnnual ? 'bg-indigo-600' : 'bg-gray-200'
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
