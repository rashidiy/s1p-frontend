'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';

const FRAME_DURATION = 1500;
const TOTAL_FRAMES = 5;

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

interface StatCardProps {
  label: string;
  value: string;
  color: string;
  animateValue?: string;
  shouldAnimate: boolean;
  prefersReduced: boolean;
}

function StatCard({ label, value, color, animateValue, shouldAnimate, prefersReduced }: StatCardProps) {
  const displayValue = shouldAnimate && animateValue ? animateValue : value;
  const transition: Transition = prefersReduced ? { duration: 0 } : { duration: 0.3 };

  return (
    <div className="rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-gray-100">
      <div className="text-[8px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={displayValue}
          initial={prefersReduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
          transition={transition}
          className="mt-0.5 text-lg font-bold"
          style={{ color }}
        >
          {displayValue}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface LeadRow {
  name: string;
  phone: string;
  status: string;
  statusColor: string;
  statusBg: string;
  isNew?: boolean;
}

const INITIAL_LEADS: LeadRow[] = [
  {
    name: 'Шерзод А.',
    phone: '+998 91 234 ****',
    status: 'В работе',
    statusColor: '#0d9488',
    statusBg: '#f0fdfa',
  },
  {
    name: 'Нодира К.',
    phone: '+998 93 456 ****',
    status: 'Завершён',
    statusColor: '#4338ca',
    statusBg: '#eef2ff',
  },
  {
    name: 'Бахтиёр Р.',
    phone: '+998 90 789 ****',
    status: 'В работе',
    statusColor: '#0d9488',
    statusBg: '#f0fdfa',
  },
];

const NEW_LEAD: LeadRow = {
  name: 'Азиз М.',
  phone: '+998 90 123 ****',
  status: 'Новый',
  statusColor: '#d97706',
  statusBg: '#fffbeb',
  isNew: true,
};

export default function BrowserMockup() {
  const [frame, setFrame] = useState(0);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % TOTAL_FRAMES);
    }, FRAME_DURATION);

    return () => clearInterval(interval);
  }, [prefersReduced]);

  const transition: Transition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.4, ease: 'easeOut' };

  const showNewLead = frame >= 2;
  const showAssigned = frame >= 3;
  const showCounterUpdate = frame >= 4;

  const newLeadStatus = showAssigned
    ? { status: 'Назначен', statusColor: '#4338ca', statusBg: '#eef2ff' }
    : { status: NEW_LEAD.status, statusColor: NEW_LEAD.statusColor, statusBg: NEW_LEAD.statusBg };

  return (
    <div className="mx-auto w-full max-w-[480px] md:max-w-[560px]">
      {/* Browser Frame */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10">
        {/* Browser Chrome */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
          {/* Traffic Lights */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#28C840] shadow-inner" />
          </div>

          {/* Address Bar */}
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-1 ring-1 ring-gray-200">
            <svg className="h-3 w-3 flex-shrink-0 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="truncate text-[11px] text-gray-500">
              app.s1p.uz/dashboard
            </span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-gray-50 p-3 md:p-4">
          {/* Dashboard Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-md"
                style={{ background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}
              >
                <span className="text-[7px] font-bold text-white">S1P</span>
              </div>
              <span className="text-xs font-semibold text-gray-800">Dashboard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-gray-200" />
              <div className="h-1.5 w-10 rounded bg-gray-200" />
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-3 grid grid-cols-4 gap-2">
            <StatCard
              label="Звонки"
              value="847"
              animateValue="848"
              color="#4338ca"
              shouldAnimate={showCounterUpdate}
              prefersReduced={prefersReduced}
            />
            <StatCard
              label="Лиды"
              value="156"
              animateValue="157"
              color="#0d9488"
              shouldAnimate={showCounterUpdate}
              prefersReduced={prefersReduced}
            />
            <StatCard
              label="Сделки"
              value="43"
              color="#d97706"
              shouldAnimate={false}
              prefersReduced={prefersReduced}
            />
            <StatCard
              label="Задачи"
              value="12"
              color="#6366f1"
              shouldAnimate={false}
              prefersReduced={prefersReduced}
            />
          </div>

          {/* Leads Table */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="border-b border-gray-100 px-3 py-2">
              <span className="text-[11px] font-semibold text-gray-700">
                Последние лиды
              </span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_1fr_80px] border-b border-gray-50 px-3 py-1.5">
              <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
                Имя
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
                Телефон
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
                Статус
              </span>
            </div>

            {/* New Lead Row — animated in */}
            <AnimatePresence>
              {showNewLead && (
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={prefersReduced ? undefined : { opacity: 0, height: 0 }}
                  transition={transition}
                  className="overflow-hidden"
                >
                  <div
                    className={`grid grid-cols-[1fr_1fr_80px] items-center border-b border-gray-50 px-3 py-2 transition-colors duration-500 ${
                      frame >= 2 && frame < 4 ? 'bg-indigo-50/50' : 'bg-white'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-gray-800">
                      {NEW_LEAD.name}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {NEW_LEAD.phone}
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={newLeadStatus.status}
                        initial={prefersReduced ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReduced ? undefined : { opacity: 0, scale: 0.9 }}
                        transition={prefersReduced ? { duration: 0 } : { duration: 0.25 }}
                        className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[9px] font-medium"
                        style={{
                          color: newLeadStatus.statusColor,
                          backgroundColor: newLeadStatus.statusBg,
                        }}
                      >
                        {newLeadStatus.status}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Existing Rows */}
            {INITIAL_LEADS.map((lead) => (
              <div
                key={lead.name}
                className="grid grid-cols-[1fr_1fr_80px] items-center border-b border-gray-50 px-3 py-2 last:border-0"
              >
                <span className="text-[11px] font-medium text-gray-800">
                  {lead.name}
                </span>
                <span className="text-[11px] text-gray-500">{lead.phone}</span>
                <span
                  className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[9px] font-medium"
                  style={{
                    color: lead.statusColor,
                    backgroundColor: lead.statusBg,
                  }}
                >
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
