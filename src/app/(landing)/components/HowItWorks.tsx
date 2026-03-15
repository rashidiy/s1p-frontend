'use client';

import { useTranslations } from 'next-intl';
import { BlurFade } from './magicui/blur-fade';

function StepIcon1() {
  return (
    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
      <svg
        width="26"
        height="26"
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
    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
      <svg
        width="26"
        height="26"
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
    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
      <svg
        width="26"
        height="26"
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

const STEP_ICONS = [StepIcon1, StepIcon2, StepIcon3] as const;

export default function HowItWorks() {
  const t = useTranslations('landing');

  const steps = [
    { number: '01', titleKey: 'steps.step1Title', descKey: 'steps.step1Desc' },
    { number: '02', titleKey: 'steps.step2Title', descKey: 'steps.step2Desc' },
    { number: '03', titleKey: 'steps.step3Title', descKey: 'steps.step3Desc' },
  ] as const;

  return (
    <section id="how-it-works" className="bg-[#08090a] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title — centered with indigo underline */}
        <BlurFade delay={0} inView>
          <div className="mb-12 text-center lg:mb-14">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              {t('steps.title')}
            </h2>
            <div className="mx-auto mt-4 h-[2px] w-10 bg-indigo-500" />
          </div>
        </BlurFade>

        {/* Desktop: Horizontal card layout with arrow connectors */}
        <div className="hidden lg:flex lg:items-start lg:gap-4">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index];

            return (
              <div key={step.number} className="flex items-start gap-4">
                <BlurFade delay={0.1 + index * 0.15} inView>
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 transition-all duration-300 hover:-translate-y-[2px] hover:border-white/[0.15]">
                    {/* Watermark number */}
                    <span className="pointer-events-none absolute -top-2 right-4 select-none font-display text-8xl font-black text-white/[0.03]">
                      {step.number}
                    </span>

                    <div className="relative">
                      <Icon />
                      <h3 className="mt-5 font-body text-lg font-bold text-white">
                        {t(step.titleKey)}
                      </h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-gray-400">
                        {t(step.descKey)}
                      </p>
                    </div>
                  </div>
                </BlurFade>

                {index < steps.length - 1 && (
                  <div className="flex items-center self-center pt-4">
                    <span className="text-2xl text-white/20">&rarr;</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile/Tablet: Vertical stack with left border line */}
        <div className="lg:hidden">
          <div className="space-y-6 border-l-2 border-white/[0.08] pl-6">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index];

              return (
                <BlurFade key={step.number} delay={0.1 + index * 0.15} inView>
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
                    {/* Watermark number */}
                    <span className="pointer-events-none absolute -top-2 right-3 select-none font-display text-8xl font-black text-white/[0.03]">
                      {step.number}
                    </span>

                    <div className="relative">
                      <Icon />
                      <h3 className="mt-4 font-body text-lg font-bold text-white">
                        {t(step.titleKey)}
                      </h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-gray-400">
                        {t(step.descKey)}
                      </p>
                    </div>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </div>

        {/* Bottom stat bar */}
        <BlurFade delay={0.6} inView>
          <div className="mt-10 lg:mt-14">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-center">
              <p className="font-body text-lg font-semibold text-white sm:text-xl">
                {t('steps.timeToFirst')}
              </p>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
