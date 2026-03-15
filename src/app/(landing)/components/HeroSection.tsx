'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Particles } from './magicui/particles';
import { BlurFade } from './magicui/blur-fade';
import { ShimmerButton } from './magicui/shimmer-button';
import { NumberTicker } from './magicui/number-ticker';
import { Marquee } from './magicui/marquee';

function SparkleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M8 0L9.79 6.21L16 8L9.79 9.79L8 16L6.21 9.79L0 8L6.21 6.21L8 0Z" fill="url(#sparkle-grad-hero)" />
      <defs>
        <linearGradient id="sparkle-grad-hero" x1="0" y1="0" x2="16" y2="16">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MOCK_LEADS = [
  { name: 'Алексей М.', phone: '+998 90 •••', status: 'new' },
  { name: 'Дилшод К.', phone: '+998 91 •••', status: 'contacted' },
  { name: 'Нодира Р.', phone: '+998 93 •••', status: 'qualified' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: 'Новый', color: 'bg-indigo-500/20 text-indigo-400' },
  contacted: { label: 'Связались', color: 'bg-amber-500/20 text-amber-400' },
  qualified: { label: 'Квалиф.', color: 'bg-emerald-500/20 text-emerald-400' },
};

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function RiseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const STAT_CARDS = [
  { value: 847, labelKey: 'dashboard.totalCalls', icon: PhoneIcon, iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400', accent: 'text-indigo-400' },
  { value: 156, labelKey: 'dashboard.totalLeads', icon: RiseIcon, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', accent: 'text-emerald-400' },
  { value: 43, labelKey: 'dashboard.totalDeals', icon: ChartIcon, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400', accent: 'text-blue-400' },
  { value: 12, labelKey: 'dashboard.completedTasks', icon: CheckIcon, iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', accent: 'text-amber-400' },
];

function CRMDashboardCard() {
  const tDashboard = useTranslations();

  return (
    <BlurFade delay={0.4} direction="left" duration={0.8} blur="12px">
      <div className="relative">
        {/* Glow behind card */}
        <div
          className="absolute -inset-8 rounded-3xl opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(ellipse at center, #6366F1 0%, transparent 70%)' }}
        />

        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm overflow-hidden">
          {/* Dashboard header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-md"
                style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-sm font-body font-semibold text-white/80">S1P</span>
              <span className="text-[10px] font-body text-gray-500">Dashboard</span>
            </div>
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            </div>
          </div>

          {/* Stats grid — matches real dashboard layout */}
          <div className="grid grid-cols-2 gap-3 p-4">
            {STAT_CARDS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.labelKey}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.iconBg}`}>
                      <span className={stat.iconColor}><Icon /></span>
                    </div>
                    <span className="text-[11px] font-body text-gray-500">{tDashboard(stat.labelKey)}</span>
                  </div>
                  <div className={`text-xl font-display font-bold ${stat.accent}`}>
                    <NumberTicker value={stat.value} delay={0.6} className={stat.accent} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini leads table */}
          <div className="px-4 pb-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
                <span className="text-[11px] font-body font-medium text-gray-500 uppercase tracking-wider">
                  {tDashboard('entities.leads')}
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              {MOCK_LEADS.map((lead, i) => (
                <div
                  key={lead.name}
                  className={`flex items-center justify-between px-3 py-2 ${
                    i < MOCK_LEADS.length - 1 ? 'border-b border-white/[0.03]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-medium text-gray-400">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-300 font-body">{lead.name}</div>
                      <div className="text-[10px] text-gray-600 font-body">{lead.phone}</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_MAP[lead.status].color}`}>
                    {STATUS_MAP[lead.status].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}

export default function HeroSection() {
  const t = useTranslations('landing');

  const title = t('hero.title');
  const words = title.split(' ');
  const lastWord = words[words.length - 1];
  const restOfTitle = words.slice(0, -1).join(' ');

  return (
    <section className="relative min-h-screen bg-[#08090a] overflow-hidden">
      {/* ===== BACKGROUND LAYERS ===== */}

      {/* Layer 1: Particles */}
      <Particles
        color="#6366f1"
        quantity={80}
        size={0.3}
        className="z-0"
      />

      {/* Layer 2: Gradient orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -right-40 -top-40 h-[700px] w-[700px] rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -left-60 top-1/3 h-[800px] w-[800px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #A78BFA 0%, transparent 70%)' }}
          animate={{ y: [0, 25, 0], x: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Layer 3: Grid pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.02) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-12 xl:gap-16">

          {/* ===== LEFT: TEXT CONTENT ===== */}
          <div className="flex-shrink-0 text-center lg:w-[50%] lg:text-left">

            {/* Badge */}
            <BlurFade delay={0} duration={0.5}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-1.5 backdrop-blur-sm">
                <SparkleIcon />
                <span className="text-sm font-body text-gray-300">
                  CRM #1 для колл-центров
                </span>
              </div>
            </BlurFade>

            {/* Headline */}
            <BlurFade delay={0.1} duration={0.6}>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] -tracking-[0.02em]">
                {restOfTitle}{' '}
                <span
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #818CF8, #A78BFA, #C084FC, #818CF8)',
                    backgroundSize: '300% 100%',
                    animation: 'hero-gradient-shift 4s ease-in-out infinite',
                  }}
                >
                  {lastWord}
                </span>
              </h1>
            </BlurFade>

            {/* Subtitle */}
            <BlurFade delay={0.2} duration={0.6}>
              <p className="font-body text-lg lg:text-xl text-gray-400 max-w-xl leading-relaxed mt-6 mx-auto lg:mx-0">
                {t('hero.subtitle')}
              </p>
            </BlurFade>

            {/* CTAs */}
            <BlurFade delay={0.3} duration={0.6}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                {/* Primary CTA — ShimmerButton */}
                <Link href="/register">
                  <ShimmerButton
                    background="rgba(99, 102, 241, 0.15)"
                    shimmerColor="#818CF8"
                    borderRadius="16px"
                    className="px-8 py-4 text-[15px] font-semibold"
                  >
                    <span className="flex items-center gap-2.5">
                      {t('hero.cta')}
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  </ShimmerButton>
                </Link>

                {/* Secondary ghost CTA */}
                <button
                  type="button"
                  className="group inline-flex items-center gap-2.5 rounded-2xl px-6 py-4 text-[15px] font-medium text-gray-400 transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.06] transition-all duration-200 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10">
                    <svg className="ml-0.5 h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  {t('hero.watchDemo')}
                </button>
              </div>
            </BlurFade>
          </div>

          {/* ===== RIGHT: CRM DASHBOARD CARD ===== */}
          <div className="relative w-full flex-1 lg:w-[50%] hidden sm:block">
            <CRMDashboardCard />
          </div>
        </div>

        {/* ===== SOCIAL PROOF STRIP ===== */}
        <BlurFade delay={0.5} duration={0.6}>
          <div className="mt-16 lg:mt-24 border-t border-white/[0.06] pt-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-0">
              <span className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-gray-500 whitespace-nowrap sm:mr-8">
                {t('hero.integrationStrip')}
              </span>
              <div className="w-full overflow-hidden">
                <Marquee pauseOnHover className="[--duration:30s] [--gap:3rem]">
                  {/* Sipuni */}
                  <div className="flex items-center gap-2.5 mx-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                      <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-gray-400 font-body">Sipuni</span>
                  </div>
                  {/* Binotel */}
                  <div className="flex items-center gap-2.5 mx-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-gray-400 font-body">Binotel</span>
                  </div>
                </Marquee>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes hero-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}
