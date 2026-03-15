'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

const steps = [
  {
    number: '01',
    titleKey: 'steps.step1Title',
    descKey: 'steps.step1Desc',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#EEF2FF" />
        <path d="M16 24H32M32 24L28 20M32 24L28 28" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="13" cy="24" r="3" stroke="#4338CA" strokeWidth="2" />
        <rect x="30" y="18" width="6" height="12" rx="1" stroke="#4338CA" strokeWidth="2" />
      </svg>
    ),
  },
  {
    number: '02',
    titleKey: 'steps.step2Title',
    descKey: 'steps.step2Desc',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#EEF2FF" />
        <path d="M14 30L24 18L34 30H14Z" stroke="#4338CA" strokeWidth="2" strokeLinejoin="round" />
        <path d="M17 28L24 20L31 28" stroke="#4338CA" strokeWidth="1.5" strokeLinejoin="round" fill="#C7D2FE" fillOpacity="0.5" />
        <path d="M24 18L34 30H32L24 21L16 30H14L24 18Z" fill="#4338CA" fillOpacity="0.15" />
      </svg>
    ),
  },
  {
    number: '03',
    titleKey: 'steps.step3Title',
    descKey: 'steps.step3Desc',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#EEF2FF" />
        <path d="M16 32V22L20 18H28L32 22V32H16Z" stroke="#4338CA" strokeWidth="2" strokeLinejoin="round" />
        <path d="M20 32V26H28V32" stroke="#4338CA" strokeWidth="2" strokeLinejoin="round" />
        <path d="M22 22H26" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="16" r="4" fill="#6366F1" />
        <path d="M30 16L31.5 17.5L34 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.25,
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

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

const lineVerticalVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

export default function HowItWorks() {
  const t = useTranslations('landing');
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            {t('steps.title')}
          </h2>
        </motion.div>

        {/* Desktop: Horizontal layout */}
        <motion.div
          className="hidden lg:grid lg:grid-cols-5 lg:items-start lg:gap-0"
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {steps.map((step, index) => (
            <div key={step.number} className="contents">
              {/* Step card */}
              <motion.div
                className="flex flex-col items-center text-center px-4"
                variants={prefersReducedMotion ? undefined : stepVariants}
              >
                <span className="text-sm font-semibold tracking-widest text-indigo-600 mb-4">
                  {step.number}
                </span>
                <div className="mb-5">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t(step.titleKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed text-[15px] max-w-[260px]">
                  {t(step.descKey)}
                </p>
              </motion.div>

              {/* Connecting line between steps */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center pt-16">
                  <motion.div
                    className="h-px w-full border-t-2 border-dashed border-indigo-200 origin-left"
                    variants={prefersReducedMotion ? undefined : lineVariants}
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Mobile/Tablet: Vertical timeline */}
        <motion.div
          className="lg:hidden flex flex-col items-center gap-0"
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center">
              <motion.div
                className="flex flex-col items-center text-center px-4 max-w-md"
                variants={prefersReducedMotion ? undefined : stepVariants}
              >
                <span className="text-sm font-semibold tracking-widest text-indigo-600 mb-4">
                  {step.number}
                </span>
                <div className="mb-5">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t(step.titleKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">
                  {t(step.descKey)}
                </p>
              </motion.div>

              {/* Vertical connecting line */}
              {index < steps.length - 1 && (
                <motion.div
                  className="w-px h-12 border-l-2 border-dashed border-indigo-200 my-4 origin-top"
                  variants={prefersReducedMotion ? undefined : lineVerticalVariants}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Bottom stat */}
        <motion.div
          className="mt-16 sm:mt-20"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="mx-auto max-w-2xl bg-indigo-50 rounded-2xl px-8 py-6 text-center">
            <p className="text-lg sm:text-xl font-bold text-gray-900">
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
