'use client';

import { useTranslations } from 'next-intl';
import { motion, type Variants } from 'framer-motion';
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

function StepIcon1() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 12H16M16 12L13 9M16 12L13 15" />
        <circle cx="6" cy="12" r="2.5" />
        <rect x="17" y="9" width="4" height="6" rx="1" />
      </svg>
    </div>
  );
}

function StepIcon2() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20L12 6L20 20H4Z" />
        <path d="M7 18L12 9L17 18" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function StepIcon3() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 20V14L10 11H14L16 14V20H8Z" />
        <path d="M10 20V16H14V20" />
        <path d="M11 13H13" />
        <circle cx="16" cy="8" r="3" fill="white" stroke="none" />
        <path d="M14.5 8L15.5 9L17.5 7" stroke="#4338CA" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function ChevronConnector() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <svg
        width="40"
        height="24"
        viewBox="0 0 40 24"
        fill="none"
        className="text-indigo-300"
      >
        <path
          d="M0 12H36M36 12L28 5M36 12L28 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

const STEP_ICONS = [StepIcon1, StepIcon2, StepIcon3] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function HowItWorks() {
  const t = useTranslations('landing');
  const prefersReduced = usePrefersReducedMotion();
  const animate = !prefersReduced;

  const steps = [
    { number: '01', titleKey: 'steps.step1Title', descKey: 'steps.step1Desc' },
    { number: '02', titleKey: 'steps.step2Title', descKey: 'steps.step2Desc' },
    { number: '03', titleKey: 'steps.step3Title', descKey: 'steps.step3Desc' },
  ] as const;

  return (
    <section id="how-it-works" className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title — centered with indigo underline */}
        <motion.div
          className="mb-12 text-center lg:mb-14"
          initial={animate ? { opacity: 0, y: 20 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={animate ? { duration: 0.5 } : { duration: 0 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t('steps.title')}
          </h2>
          <div className="mx-auto mt-4 h-[3px] w-10 rounded-full bg-indigo-500" />
        </motion.div>

        {/* Desktop: Horizontal card layout with arrow connectors */}
        <motion.div
          className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-start lg:gap-6"
          variants={animate ? containerVariants : undefined}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index];

            return (
              <div key={step.number} className="contents">
                <motion.div
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  variants={animate ? stepVariants : undefined}
                >
                  {/* Watermark number */}
                  <span className="pointer-events-none absolute -top-2 right-4 select-none text-7xl font-black text-indigo-100/70">
                    {step.number}
                  </span>

                  <div className="relative">
                    <Icon />
                    <h3 className="mt-5 text-xl font-bold text-gray-900">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-2 leading-relaxed text-gray-500">
                      {t(step.descKey)}
                    </p>
                  </div>
                </motion.div>

                {index < steps.length - 1 && <ChevronConnector />}
              </div>
            );
          })}
        </motion.div>

        {/* Mobile/Tablet: Vertical timeline with indigo left line */}
        <motion.div
          className="lg:hidden"
          variants={animate ? containerVariants : undefined}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="relative border-l-2 border-indigo-200 pl-8">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index];

              return (
                <motion.div
                  key={step.number}
                  className={`relative ${index < steps.length - 1 ? 'pb-10' : ''}`}
                  variants={animate ? stepVariants : undefined}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[calc(2rem+5px)] top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-indigo-500 ring-4 ring-white" />

                  <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    {/* Watermark number */}
                    <span className="pointer-events-none absolute -top-2 right-3 select-none text-6xl font-black text-indigo-100/70">
                      {step.number}
                    </span>

                    <div className="relative">
                      <Icon />
                      <h3 className="mt-4 text-lg font-bold text-gray-900">
                        {t(step.titleKey)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        {t(step.descKey)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom stat bar */}
        <motion.div
          className="mt-10 lg:mt-14"
          initial={animate ? { opacity: 0, y: 20 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={animate ? { duration: 0.5, delay: 0.5 } : { duration: 0 }}
        >
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-5 text-center text-white shadow-lg shadow-indigo-200">
            <p className="text-lg font-semibold sm:text-xl">
              <span className="mr-2" role="img" aria-label="timer">
                &#9201;
              </span>
              {t('steps.timeToFirst')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
