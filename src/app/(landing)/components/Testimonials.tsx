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
    <section id="testimonials" className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('testimonials.title')}
          </h2>
        </div>

        {/* Testimonial cards */}
        <motion.div
          className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {TESTIMONIALS.map(({ quoteKey, authorKey, roleKey, initials }) => (
            <motion.div
              key={quoteKey}
              variants={cardVariants}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              {/* Decorative quote mark */}
              <span
                className="pointer-events-none absolute right-6 top-6 select-none font-serif text-6xl leading-none text-indigo-100"
                aria-hidden="true"
              >
                &ldquo;
              </span>

              {/* Quote text */}
              <blockquote className="relative mb-8 text-lg leading-relaxed text-gray-700 italic">
                &ldquo;{t(`testimonials.${quoteKey}`)}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Avatar with gradient */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #4338CA, #8B5CF6)',
                  }}
                >
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
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
