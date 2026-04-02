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
    titleKey: 'features.calls',
    descKey: 'features.callsDesc',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        <path d="M14.05 2a9 9 0 018 7.94" />
        <path d="M14.05 6A5 5 0 0118 10" />
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
        <path d="M8 12H16M16 12L13 9M16 12L13 15" />
        <circle cx="6" cy="12" r="2.5" />
        <rect x="17" y="9" width="4" height="6" rx="1" />
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
    titleKey: 'features.telegram',
    descKey: 'features.telegramDesc',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
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
          {/* Hero card: Deal Pipeline / Kanban */}
          <BlurFade delay={0.1} inView>
            <div className="md:col-span-1 lg:row-span-2 h-full rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/20 p-8 flex flex-col">
              {/* Kanban board icon */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-5 flex-shrink-0">
                <rect x="4" y="6" width="12" height="36" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
                <rect x="18" y="6" width="12" height="28" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
                <rect x="32" y="6" width="12" height="20" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
                <rect x="7" y="10" width="6" height="4" rx="1" fill="white" fillOpacity="0.7" />
                <rect x="7" y="17" width="6" height="4" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="7" y="24" width="6" height="4" rx="1" fill="white" fillOpacity="0.3" />
                <rect x="21" y="10" width="6" height="4" rx="1" fill="white" fillOpacity="0.7" />
                <rect x="21" y="17" width="6" height="4" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="35" y="10" width="6" height="4" rx="1" fill="#4ADE80" fillOpacity="0.8" />
              </svg>
              <h3 className="text-2xl font-bold text-white font-display mb-3">
                {t('features.pipeline')}
              </h3>
              <p className="text-indigo-200/80 font-body leading-relaxed text-[15px]">
                {t('features.pipelineDesc')}
              </p>

              {/* Mini pipeline visualization */}
              <div className="mt-auto pt-6">
                <div className="flex gap-2">
                  {[
                    { label: 'Новые', count: 5, color: 'bg-indigo-500' },
                    { label: 'Перег.', count: 3, color: 'bg-amber-500' },
                    { label: 'Закр.', count: 8, color: 'bg-emerald-500' },
                  ].map((stage) => (
                    <div key={stage.label} className="flex-1">
                      <div className="text-[10px] text-white/40 font-body mb-1 text-center">{stage.label}</div>
                      <div className={`h-1 rounded-full ${stage.color} opacity-60`} />
                      <div className="text-[11px] text-white/60 font-body mt-1 text-center font-semibold">{stage.count}</div>
                    </div>
                  ))}
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
