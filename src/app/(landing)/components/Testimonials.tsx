'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

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

function QuoteMark() {
  return (
    <svg
      className="h-10 w-10 text-indigo-100"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
    </svg>
  );
}

export default function Testimonials() {
  const t = useTranslations('landing');
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.15 },
        },
      };

  const cardVariants: Variants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 32 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <section id="testimonials" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('testimonials.title')}
          </h2>
        </div>

        {/* Testimonial cards */}
        <motion.div
          className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {TESTIMONIALS.map(({ quoteKey, authorKey, roleKey, initials }) => (
            <motion.div
              key={quoteKey}
              variants={cardVariants}
              className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              {/* Decorative quote mark */}
              <div className="mb-4">
                <QuoteMark />
              </div>

              {/* Quote text */}
              <blockquote className="mb-8 text-lg leading-relaxed text-gray-700 italic">
                &ldquo;{t(`testimonials.${quoteKey}`)}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Avatar placeholder with gradient initials */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {t(`testimonials.${authorKey}`)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t(`testimonials.${roleKey}`)} &middot; [Company]
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
