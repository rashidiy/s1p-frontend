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
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50">
      <svg
        className="h-3.5 w-3.5 text-teal-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
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
    <section id="pricing" className="relative px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('pricing.title')}
          </h2>
        </div>

        {/* Pricing card */}
        <motion.div
          className="mx-auto max-w-lg"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl shadow-indigo-500/10 ring-1 ring-gray-200/60">
            {/* Top gradient border */}
            <div
              className="h-[3px] w-full"
              style={{ background: 'linear-gradient(90deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)' }}
            />

            <div className="p-10 sm:p-12">
              {/* Plan name */}
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                {t('pricing.planName')}
              </p>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tight text-gray-900">
                  {t('pricing.price')}
                </span>
                <span className="text-xl text-gray-500">
                  {t('pricing.currency')}
                </span>
              </div>

              {/* Per user info */}
              <p className="mt-3 text-base text-gray-600">
                {t('pricing.perUser')}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {t('pricing.extraUser')}
              </p>

              {/* Divider */}
              <div className="my-8 border-t border-gray-100" />

              {/* Feature list */}
              <ul className="space-y-4">
                {FEATURE_KEYS.map((key) => (
                  <li key={key} className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="text-base text-gray-700">
                      {t(`pricing.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Link
                href="/register"
                className="mt-10 flex w-full items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30"
                style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
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
                  <span>
                    {t('pricing.annual')}
                  </span>
                </button>
                {showAnnual && (
                  <p className="mt-2 text-center text-sm font-medium text-emerald-600">
                    {t('pricing.annualSaving')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
