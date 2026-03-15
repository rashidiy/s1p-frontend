'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
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

interface RegularFeature {
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  gradient: string;
  hoverBorder: string;
}

const regularFeatures: RegularFeature[] = [
  {
    titleKey: 'features.crm',
    descKey: 'features.crmDesc',
    gradient: 'from-blue-500 to-blue-600',
    hoverBorder: 'group-hover:border-blue-200',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    titleKey: 'features.telephony',
    descKey: 'features.telephonyDesc',
    gradient: 'from-emerald-500 to-emerald-600',
    hoverBorder: 'group-hover:border-emerald-200',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        <path d="M14.05 2a9 9 0 018 7.94" />
        <path d="M14.05 6A5 5 0 0118 10" />
      </svg>
    ),
  },
  {
    titleKey: 'features.analytics',
    descKey: 'features.analyticsDesc',
    gradient: 'from-amber-500 to-amber-600',
    hoverBorder: 'group-hover:border-amber-200',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    titleKey: 'features.api',
    descKey: 'features.apiDesc',
    gradient: 'from-violet-500 to-violet-600',
    hoverBorder: 'group-hover:border-violet-200',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    titleKey: 'features.i18n',
    descKey: 'features.i18nDesc',
    gradient: 'from-cyan-500 to-cyan-600',
    hoverBorder: 'group-hover:border-cyan-200',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

function PhoneMockup() {
  return (
    <div className="mt-auto pt-6 flex justify-center">
      <div className="relative w-[130px] h-[180px]">
        {/* Phone body */}
        <div className="absolute inset-0 rounded-[18px] border-2 border-white/30 bg-white/10 backdrop-blur-sm">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/20 rounded-full" />
          {/* Screen area */}
          <div className="absolute top-6 left-2 right-2 bottom-6 rounded-lg bg-white/10 flex flex-col items-center justify-center gap-2 p-2">
            {/* Telegram icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.2)" />
              <path d="M17 8L7 12.5L10.5 14L11.75 18L14 15L16.5 16.5L17 8Z" fill="white" />
            </svg>
            {/* Notification lines */}
            <div className="w-full space-y-1.5 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-300 flex-shrink-0" />
                <div className="h-1.5 bg-white/30 rounded-full flex-1" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-300 flex-shrink-0" />
                <div className="h-1.5 bg-white/25 rounded-full w-4/5" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-300 flex-shrink-0" />
                <div className="h-1.5 bg-white/20 rounded-full w-3/5" />
              </div>
            </div>
          </div>
          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/25 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function FeatureGrid() {
  const t = useTranslations('landing');
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-14"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            {t('features.title')}
          </h2>
          <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4"
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Hero card: Telegram Bot */}
          <motion.div
            className="md:col-span-1 lg:row-span-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-8 flex flex-col shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            variants={prefersReducedMotion ? undefined : cardVariants}
          >
            {/* Paper plane icon */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-5 flex-shrink-0">
              <path d="M42 8L6 22L18 27L23 41L29 31L37 37L42 8Z" fill="white" fillOpacity="0.9" />
              <path d="M18 27L29 20" stroke="rgba(99,102,241,0.6)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h3 className="text-2xl font-bold mb-3">
              {t('features.telegramBot')}
            </h3>
            <p className="text-indigo-100 leading-relaxed text-[15px]">
              {t('features.telegramBotDesc')}
            </p>
            <PhoneMockup />
          </motion.div>

          {/* Regular feature cards */}
          {regularFeatures.map((feature) => (
            <motion.div
              key={feature.titleKey}
              className={`group rounded-2xl bg-white border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${feature.hoverBorder}`}
              variants={prefersReducedMotion ? undefined : cardVariants}
            >
              <div className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-sm`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t(feature.descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
