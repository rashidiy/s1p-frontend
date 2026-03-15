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

function SparkleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M8 0L9.79 6.21L16 8L9.79 9.79L8 16L6.21 9.79L0 8L6.21 6.21L8 0Z" fill="url(#sparkle-grad)" />
      <defs>
        <linearGradient id="sparkle-grad" x1="0" y1="0" x2="16" y2="16">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function HeroSection() {
  const t = useTranslations('landing');
  const prefersReduced = usePrefersReducedMotion();
  const animate = !prefersReduced;

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: animate ? 0.1 : 0 } },
  };

  const fadeUp: Variants = animate
    ? {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
      }
    : { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { duration: 0 } } };

  const title = t('hero.title');
  const words = title.split(' ');
  const lastWord = words[words.length - 1];
  const restOfTitle = words.slice(0, -1).join(' ');

  return (
    <section className="relative min-h-[90vh] overflow-hidden pt-24 lg:pt-32">
      {/* ===== BACKGROUND LAYERS ===== */}
      {/* Base gradient */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#4338CA 1px, transparent 1px), linear-gradient(90deg, #4338CA 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Floating gradient orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Orb 1 — top right, indigo */}
        <motion.div
          className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
          animate={animate ? { y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Orb 2 — left center, violet */}
        <motion.div
          className="absolute -left-48 top-1/3 h-[600px] w-[600px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
          animate={animate ? { y: [0, 25, 0], x: [0, -20, 0], scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Orb 3 — bottom right, blue */}
        <motion.div
          className="absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
          animate={animate ? { y: [0, -20, 0], scale: [1, 1.03, 1] } : {}}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-8 xl:gap-12">
          {/* ===== LEFT: TEXT CONTENT (45%) ===== */}
          <motion.div
            className="flex-shrink-0 text-center lg:w-[46%] lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
              <SparkleIcon />
              <span className="text-sm font-semibold tracking-wide text-indigo-700">
                CRM #1 для колл-центров
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-[4.25rem]"
            >
              {restOfTitle}
              <br />
              <span className="relative inline-block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #4338CA 0%, #6366F1 40%, #818CF8 70%, #4338CA 100%)',
                    backgroundSize: '200% 100%',
                    animation: animate ? 'gradient-shift 4s ease-in-out infinite' : 'none',
                  }}
                >
                  {lastWord}
                </span>
                {/* Underline accent */}
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, #4338CA, #818CF8, #4338CA)' }}
                  initial={animate ? { scaleX: 0, originX: 0 } : { scaleX: 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-gray-500 lg:mx-0 lg:text-xl"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              {/* Primary CTA with glow */}
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-8 py-4 text-[15px] font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #4338CA 0%, #5B4FE8 50%, #6366F1 100%)' }}
              >
                {/* Glow pulse */}
                <span
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: '0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(67, 56, 202, 0.2)',
                    animation: animate ? 'glow-pulse 3s ease-in-out infinite' : 'none',
                  }}
                />
                <span className="relative z-10 flex items-center gap-2.5">
                  {t('hero.cta')}
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>

              {/* Secondary CTA */}
              <button
                type="button"
                className="group inline-flex items-center gap-2.5 rounded-2xl px-6 py-4 text-[15px] font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:shadow-indigo-200/50">
                  <svg className="ml-0.5 h-3.5 w-3.5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {t('hero.watchDemo')}
              </button>
            </motion.div>
          </motion.div>

          {/* ===== RIGHT: DEVICE MOCKUPS (55%) ===== */}
          <div className="relative w-full flex-1 lg:w-[54%]">
            <div className="relative flex items-end justify-center lg:justify-end">
              {/* Shadow/glow behind mockups */}
              <div
                className="absolute bottom-0 left-1/2 h-[80%] w-[80%] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(ellipse, #6366F1 0%, transparent 70%)' }}
              />

              {/* Phone — foreground, overlapping */}
              <motion.div
                className="relative z-20 -mr-6 lg:-mr-12"
                initial={animate ? { opacity: 0, x: -50, y: 20 } : { opacity: 1 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="drop-shadow-2xl">
                  <PhoneMockup />
                </div>
              </motion.div>

              {/* Browser — background, slightly behind and up */}
              <motion.div
                className="relative z-10 hidden sm:block"
                initial={animate ? { opacity: 0, x: 50, y: 20 } : { opacity: 1 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="drop-shadow-xl">
                  <BrowserMockup />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ===== SOCIAL PROOF STRIP ===== */}
        <motion.div
          initial={animate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={(animate ? { duration: 0.6, delay: 1, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }) as Transition}
          className="mt-16 lg:mt-24"
        >
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 px-8 py-5">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                {t('hero.integrationStrip')}
              </span>
              <div className="h-px w-12 bg-gray-200 sm:h-8 sm:w-px" />
              <div className="flex items-center gap-10">
                {/* Sipuni */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 shadow-sm">
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-600">Sipuni</span>
                </div>
                {/* Binotel */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 shadow-sm">
                    <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-600">Binotel</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade to white */}
      <div className="h-20 bg-gradient-to-b from-transparent to-white lg:h-28" />

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}
