'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

interface Feature {
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  hero?: boolean;
}

const features: Feature[] = [
  {
    titleKey: 'features.telegramBot',
    descKey: 'features.telegramBotDesc',
    hero: true,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M34.5 6.5L5.5 17.5L15 21L18.5 33.5L23 25L30 30L34.5 6.5Z" stroke="#4338CA" strokeWidth="2" strokeLinejoin="round" />
        <path d="M15 21L23 16" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titleKey: 'features.crm',
    descKey: 'features.crmDesc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="11" height="11" rx="2" stroke="#4338CA" strokeWidth="2" />
        <rect x="18" y="3" width="11" height="11" rx="2" stroke="#4338CA" strokeWidth="2" />
        <rect x="3" y="18" width="11" height="11" rx="2" stroke="#4338CA" strokeWidth="2" />
        <rect x="18" y="18" width="11" height="11" rx="2" stroke="#4338CA" strokeWidth="2" />
      </svg>
    ),
  },
  {
    titleKey: 'features.telephony',
    descKey: 'features.telephonyDesc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 4H13L15 10L12 12C13.6 15.4 16.6 18.4 20 20L22 17L28 19V25C28 26.1 27.1 27 26 27C14.5 26.3 5.7 17.5 5 6C5 4.9 5.9 4 7 4Z" stroke="#4338CA" strokeWidth="2" strokeLinejoin="round" />
        <path d="M22 4V4C25.3 4 28 6.7 28 10V10" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 8V8C23.7 8 25 9.3 25 11V11" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titleKey: 'features.analytics',
    descKey: 'features.analyticsDesc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="18" width="5" height="10" rx="1" stroke="#4338CA" strokeWidth="2" />
        <rect x="13.5" y="12" width="5" height="16" rx="1" stroke="#4338CA" strokeWidth="2" />
        <rect x="23" y="6" width="5" height="22" rx="1" stroke="#4338CA" strokeWidth="2" />
        <path d="M4 4L12 10L20 7L28 3" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titleKey: 'features.api',
    descKey: 'features.apiDesc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8L6 16L12 24" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 8L26 16L20 24" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 4L14 28" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titleKey: 'features.i18n',
    descKey: 'features.i18nDesc',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="#4338CA" strokeWidth="2" />
        <ellipse cx="16" cy="16" rx="6" ry="12" stroke="#4338CA" strokeWidth="2" />
        <path d="M4 16H28" stroke="#4338CA" strokeWidth="2" />
        <path d="M6 10H26" stroke="#6366F1" strokeWidth="1.5" />
        <path d="M6 22H26" stroke="#6366F1" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function PhoneMockup() {
  return (
    <div className="mt-6 flex justify-center">
      <div className="relative w-[140px] h-[200px]">
        {/* Phone body */}
        <div className="absolute inset-0 rounded-[20px] border-2 border-indigo-200 bg-white shadow-sm">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-indigo-100 rounded-full" />
          {/* Screen area */}
          <div className="absolute top-6 left-2 right-2 bottom-6 rounded-lg bg-indigo-50/60 flex flex-col items-center justify-center gap-2 p-2">
            {/* Telegram icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#4338CA" />
              <path d="M20 9L8 14.5L12 16L13.5 21L16 17L19 19L20 9Z" fill="white" />
            </svg>
            {/* Notification lines */}
            <div className="w-full space-y-1.5 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <div className="h-1.5 bg-indigo-200 rounded-full flex-1" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="h-1.5 bg-indigo-200/70 rounded-full w-4/5" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                <div className="h-1.5 bg-indigo-200/50 rounded-full w-3/5" />
              </div>
            </div>
          </div>
          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function FeatureGrid() {
  const t = useTranslations('landing');
  const prefersReducedMotion = useReducedMotion();

  const [heroFeature, ...regularFeatures] = features;

  return (
    <section id="features" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="text-center mb-14 sm:mb-16"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            {t('features.title')}
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr"
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Hero card: Telegram Bot */}
          <motion.div
            className="md:col-span-1 lg:row-span-2 rounded-3xl bg-gradient-to-b from-indigo-50 via-indigo-50/50 to-white border border-indigo-100 p-8 sm:p-10 flex flex-col"
            variants={prefersReducedMotion ? undefined : cardVariants}
          >
            <div className="mb-5">{heroFeature.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {t(heroFeature.titleKey)}
            </h3>
            <p className="text-gray-600 leading-relaxed text-[15px] mb-4 flex-grow-0">
              {t(heroFeature.descKey)}
            </p>
            <div className="flex-grow flex items-center justify-center min-h-0">
              <PhoneMockup />
            </div>
          </motion.div>

          {/* Regular feature cards */}
          {regularFeatures.map((feature) => (
            <motion.div
              key={feature.titleKey}
              className="group rounded-3xl bg-white border border-gray-200 p-7 sm:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 hover:border-indigo-100"
              variants={prefersReducedMotion ? undefined : cardVariants}
            >
              <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 transition-colors duration-300 group-hover:bg-indigo-100">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2.5">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t(feature.descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
