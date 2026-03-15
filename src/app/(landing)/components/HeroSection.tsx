'use client';

import { useTranslations } from 'next-intl';
import { motion, type Variants, type Transition } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PhoneMockup from './PhoneMockup';
import BrowserMockup from './BrowserMockup';

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

function SipuniLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </div>
      <span className="text-sm font-semibold text-gray-500">Sipuni</span>
    </div>
  );
}

function BinotelLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
        <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </div>
      <span className="text-sm font-semibold text-gray-500">Binotel</span>
    </div>
  );
}

export default function HeroSection() {
  const t = useTranslations('landing');
  const prefersReduced = usePrefersReducedMotion();

  const animate = !prefersReduced;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: animate ? 0.12 : 0,
      },
    },
  };

  const fadeUp: Variants = animate
    ? {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }
    : {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      };

  const slideInLeft: Variants = animate
    ? {
        hidden: { opacity: 0, x: -40 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 },
        },
      }
    : {
        hidden: { opacity: 1, x: 0 },
        visible: { opacity: 1, x: 0, transition: { duration: 0 } },
      };

  const slideInRight: Variants = animate
    ? {
        hidden: { opacity: 0, x: 40 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.6 },
        },
      }
    : {
        hidden: { opacity: 1, x: 0 },
        visible: { opacity: 1, x: 0, transition: { duration: 0 } },
      };

  const title = t('hero.title');
  const words = title.split(' ');
  const lastWord = words[words.length - 1];
  const restOfTitle = words.slice(0, -1).join(' ');

  return (
    <section className="relative overflow-hidden pt-20 lg:pt-24">
      {/* Subtle Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 via-white to-white" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #4338CA 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: Text Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
            >
              {restOfTitle}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #4338CA, #6366F1)',
                }}
              >
                {lastWord}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-600 lg:mx-0"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30"
                style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
              >
                {t('hero.cta')}
                <svg
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>

              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 transition-colors duration-200 group-hover:bg-indigo-200">
                  <svg
                    className="ml-0.5 h-3.5 w-3.5 text-indigo-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {t('hero.watchDemo')}
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Device Mockups */}
          <div className="relative flex w-full flex-1 items-end justify-center gap-4 lg:gap-6">
            {/* Phone Mockup — positioned to overlap slightly */}
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              className="relative z-10 -mr-4 lg:-mr-8"
            >
              <PhoneMockup />
            </motion.div>

            {/* Browser Mockup — slightly behind */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              className="hidden sm:block"
            >
              <BrowserMockup />
            </motion.div>
          </div>
        </div>

        {/* Social Proof Strip */}
        <motion.div
          initial={animate ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            (animate
              ? { duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0 }) as Transition
          }
          className="mt-16 border-t border-gray-100 pt-8 lg:mt-20"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
            <p className="text-sm font-medium text-gray-400">
              {t('hero.integrationStrip')}
            </p>
            <div className="flex items-center gap-8">
              <SipuniLogo />
              <div className="h-6 w-px bg-gray-200" />
              <BinotelLogo />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-16 lg:h-24" />
    </section>
  );
}
