'use client';

import { useTranslations } from 'next-intl';
import { BlurFade } from './magicui/blur-fade';

interface RegularFeature {
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const regularFeatures: RegularFeature[] = [
  {
    titleKey: 'features.crm',
    descKey: 'features.crmDesc',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        <path d="M14.05 2a9 9 0 018 7.94" />
        <path d="M14.05 6A5 5 0 0118 10" />
      </svg>
    ),
  },
  {
    titleKey: 'features.analytics',
    descKey: 'features.analyticsDesc',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    titleKey: 'features.i18n',
    descKey: 'features.i18nDesc',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

export default function FeatureGrid() {
  const t = useTranslations('landing');

  return (
    <section id="features" className="py-20 sm:py-28 bg-[#08090a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <BlurFade delay={0} inView>
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              {t('features.title')}
            </h2>
            <p className="mt-3 text-lg text-gray-400 font-body max-w-xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4">
          {/* Hero card: Telegram Bot */}
          <BlurFade delay={0.1} inView>
            <div className="md:col-span-1 lg:row-span-2 h-full rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/20 p-8 flex flex-col">
              {/* Paper plane icon */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-5 flex-shrink-0">
                <path d="M42 8L6 22L18 27L23 41L29 31L37 37L42 8Z" fill="white" fillOpacity="0.9" />
                <path d="M18 27L29 20" stroke="rgba(99,102,241,0.6)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 className="text-2xl font-bold text-white font-display mb-3">
                {t('features.telegramBot')}
              </h3>
              <p className="text-indigo-200/80 font-body leading-relaxed text-[15px]">
                {t('features.telegramBotDesc')}
              </p>

              {/* Simplified phone outline */}
              <div className="mt-auto pt-6 flex justify-center">
                <div className="relative w-[130px] h-[180px]">
                  <div className="absolute inset-0 rounded-[18px] border-2 border-white/30">
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/20 rounded-full" />
                    {/* Notification lines */}
                    <div className="absolute top-10 left-4 right-4 space-y-3">
                      <div className="h-2 bg-white/15 rounded-full w-full" />
                      <div className="h-2 bg-white/10 rounded-full w-4/5" />
                      <div className="h-2 bg-white/[0.07] rounded-full w-3/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Regular feature cards */}
          {regularFeatures.map((feature, index) => (
            <BlurFade key={feature.titleKey} delay={0.15 + index * 0.08} inView>
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 transition-all duration-300 hover:border-white/[0.15] hover:-translate-y-0.5">
                <div className={`mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl ${feature.iconBg} ${feature.iconColor}`}>
                  {feature.icon}
                </div>
                <h3 className="font-body text-base font-bold text-white mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm text-gray-400 font-body leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
