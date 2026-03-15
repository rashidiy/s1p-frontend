'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

function PhoneXIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
      <svg
        className="h-6 w-6 text-red-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        <line x1="18" y1="2" x2="22" y2="6" className="text-red-400" />
        <line x1="22" y1="2" x2="18" y2="6" className="text-red-400" />
      </svg>
    </div>
  );
}

function ClockIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
      <svg
        className="h-6 w-6 text-amber-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </div>
  );
}

function ChartDownIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
      <svg
        className="h-6 w-6 text-indigo-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
        <polyline points="16 17 22 17 22 11" />
      </svg>
    </div>
  );
}

const ICONS = [PhoneXIcon, ClockIcon, ChartDownIcon] as const;

const STAT_COLORS = [
  'text-red-600',
  'text-amber-600',
  'text-indigo-600',
] as const;

export default function PainPoints() {
  const t = useTranslations('landing');
  const prefersReduced = usePrefersReducedMotion();
  const animate = !prefersReduced;

  const stats = [
    { key: 'stat1', text: 'stat1Text' },
    { key: 'stat2', text: 'stat2Text' },
    { key: 'stat3', text: 'stat3Text' },
  ] as const;

  return (
    <section id="pain" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={animate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={
            animate
              ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0 }
          }
          className="mb-12 text-center lg:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t('pain.title')}
          </h2>
        </motion.div>

        {/* Cards Grid */}
        {/* Industry stats — update with real data when available */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = ICONS[index];

            return (
              <motion.div
                key={stat.key}
                initial={
                  animate ? { opacity: 0, y: 32 } : { opacity: 1, y: 0 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={
                  animate
                    ? {
                        duration: 0.5,
                        delay: index * 0.15,
                        ease: [0.22, 1, 0.36, 1],
                      }
                    : { duration: 0 }
                }
                className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100"
              >
                <Icon />

                <div
                  className={`mt-6 text-5xl font-bold tracking-tight ${STAT_COLORS[index]}`}
                >
                  {t(`pain.${stat.key}`)}
                </div>

                <p className="mt-3 text-base leading-relaxed text-gray-600">
                  {t(`pain.${stat.text}`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
