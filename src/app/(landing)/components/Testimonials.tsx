'use client';

import { useTranslations } from 'next-intl';
import { BlurFade } from './magicui/blur-fade';

/* PLACEHOLDER: Replace with real testimonials after pilot */
const TESTIMONIALS = [
  {
    quoteKey: 'quote1',
    authorKey: 'author1',
    roleKey: 'role1',
    initials: 'АК',
  },
  {
    quoteKey: 'quote2',
    authorKey: 'author2',
    roleKey: 'role2',
    initials: 'ДМ',
  },
] as const;

export default function Testimonials() {
  const t = useTranslations('landing');

  return (
    <section id="testimonials" className="bg-[#08090a] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <BlurFade delay={0} inView>
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              {t('testimonials.title')}
            </h2>
          </div>
        </BlurFade>

        {/* Testimonial cards */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {TESTIMONIALS.map(({ quoteKey, authorKey, roleKey, initials }, index) => (
            <BlurFade key={quoteKey} delay={0.1 + index * 0.15} inView>
              <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
                {/* Decorative quote mark */}
                <span
                  className="pointer-events-none absolute right-6 top-4 select-none text-6xl text-indigo-500/20 font-serif leading-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                {/* Quote text */}
                <blockquote className="relative mb-8 text-lg text-gray-300 italic font-body leading-relaxed">
                  &ldquo;{t(`testimonials.${quoteKey}`)}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {/* Avatar with gradient */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div>
                    <p className="font-body font-bold text-white">
                      {t(`testimonials.${authorKey}`)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t(`testimonials.${roleKey}`)}
                    </p>
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
