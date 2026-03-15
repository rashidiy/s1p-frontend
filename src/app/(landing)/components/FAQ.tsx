'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurFade } from './magicui/blur-fade';

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const;

export default function FAQ() {
  const t = useTranslations('landing');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-[#0D0D12] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Section heading */}
        <BlurFade delay={0} inView>
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              {t('faq.title')}
            </h2>
          </div>
        </BlurFade>

        {/* FAQ accordion */}
        <div>
          {FAQ_KEYS.map((num, index) => {
            const isOpen = openIndex === index;

            return (
              <BlurFade key={num} delay={0.05 + index * 0.06} inView>
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl mb-3 overflow-hidden">
                  {/* Question row */}
                  <button
                    type="button"
                    onClick={() => handleToggle(index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left cursor-pointer"
                  >
                    <span className="pr-4 font-body text-[15px] font-semibold text-white">
                      {t(`faq.q${num}`)}
                    </span>
                    {/* Chevron */}
                    <motion.svg
                      className="h-5 w-5 shrink-0 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </motion.svg>
                  </button>

                  {/* Answer with AnimatePresence */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.2, ease: 'easeInOut' },
                        }}
                      >
                        <div className="px-6 pb-5 text-gray-400 font-body text-[15px] leading-relaxed">
                          {t(`faq.a${num}`)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
