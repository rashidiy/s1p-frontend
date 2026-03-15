'use client';

import { useTranslations } from 'next-intl';
import { BlurFade } from './magicui/blur-fade';

function PhoneXIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/20">
      <svg
        className="h-7 w-7 text-rose-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        <line x1="18" y1="2" x2="22" y2="6" />
        <line x1="22" y1="2" x2="18" y2="6" />
      </svg>
    </div>
  );
}

function ClockIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20">
      <svg
        className="h-7 w-7 text-amber-400"
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
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/20">
      <svg
        className="h-7 w-7 text-violet-400"
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
  'text-rose-400',
  'text-amber-400',
  'text-violet-400',
] as const;

export default function PainPoints() {
  const t = useTranslations('landing');

  const stats = [
    { key: 'stat1', text: 'stat1Text' },
    { key: 'stat2', text: 'stat2Text' },
    { key: 'stat3', text: 'stat3Text' },
  ] as const;

  return (
    <section id="pain" className="bg-[#0D0D12] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <BlurFade delay={0} inView>
          <div className="mb-10 text-center lg:mb-14">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              {t('pain.title')}
            </h2>
            <p className="mt-3 text-gray-400 font-body">
              {t('pain.subtitle')}
            </p>
          </div>
        </BlurFade>

        {/* Cards Grid */}
        {/* Industry stats — update with real data when available */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = ICONS[index];

            return (
              <BlurFade key={stat.key} delay={0.1 + index * 0.15} inView>
                <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/[0.15]">
                  <Icon />

                  <div
                    className={`mt-6 font-display text-5xl font-black tracking-tight md:text-6xl ${STAT_COLORS[index]}`}
                  >
                    {t(`pain.${stat.key}`)}
                  </div>

                  <p className="mt-3 text-base leading-relaxed text-gray-400 font-body">
                    {t(`pain.${stat.text}`)}
                  </p>
                </div>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
