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

function TelegramHeader() {
  return (
    <div className="flex items-center gap-2.5 border-b border-gray-100 bg-white px-3 py-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600">
        <span className="text-[9px] font-bold text-white">S1P</span>
      </div>
      <div className="flex-1">
        <div className="text-xs font-semibold text-gray-900">S1P Bot</div>
        <div className="text-[10px] text-green-500">online</div>
      </div>
      <div className="flex items-center gap-1.5">
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </div>
    </div>
  );
}

function BotMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
        <p className="text-[11px] leading-relaxed text-gray-800">{text}</p>
        <span className="mt-0.5 block text-right text-[9px] text-gray-400">{time}</span>
      </div>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <div className="flex justify-start">
      <button
        type="button"
        className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-medium text-indigo-700"
      >
        {label}
      </button>
    </div>
  );
}

export default function PhoneMockup() {
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

  const delayedTransition: Transition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.4, ease: 'easeOut', delay: 0.15 };

  const fadeVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
  };

  return (
    <div className="mx-auto w-full max-w-[280px] md:max-w-[320px]">
      {/* Phone Frame */}
      <div className="relative overflow-hidden rounded-[2.5rem] border-[14px] border-gray-800 bg-gray-50 shadow-2xl shadow-gray-900/20">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-10 h-6 w-[120px] -translate-x-1/2 rounded-b-2xl bg-gray-800" />

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white px-3 pb-1 pt-7">
          <span className="text-[10px] font-medium text-gray-700">9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex items-end gap-[2px]">
              <div className="h-1.5 w-[3px] rounded-sm bg-gray-700" />
              <div className="h-2 w-[3px] rounded-sm bg-gray-700" />
              <div className="h-2.5 w-[3px] rounded-sm bg-gray-700" />
              <div className="h-3 w-[3px] rounded-sm bg-gray-300" />
            </div>
            <svg className="h-3 w-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
            <div className="flex h-3 w-5 items-center rounded-sm border border-gray-700 px-0.5">
              <div className="h-1.5 w-3 rounded-sm bg-green-500" />
            </div>
          </div>
        </div>

        {/* Telegram Header */}
        <TelegramHeader />

        {/* Chat Area */}
        <div className="relative h-[340px] overflow-hidden bg-[#e8e3de] px-2.5 py-3 md:h-[380px]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          <div className="relative flex flex-col gap-2.5">
            {/* Persistent messages */}
            <BotMessage
              text="Добро пожаловать в S1P!"
              time="09:00"
            />
            <BotMessage
              text="Sipuni подключён. Отслеживаю звонки."
              time="09:01"
            />

            <AnimatePresence mode="wait">
              {/* Frame 1: Incoming call notification */}
              {frame >= 1 && (
                <motion.div
                  key="incoming-call"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                >
                  <div className="flex justify-start">
                    <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tl-md bg-white shadow-sm ring-1 ring-gray-100">
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                        <span className="text-[10px] font-semibold text-green-700">
                          Входящий звонок
                        </span>
                      </div>
                      <div className="px-3 py-2">
                        <p className="text-[11px] font-medium text-gray-800">
                          Азиз +998 90 123...
                        </p>
                        <span className="text-[9px] text-gray-400">09:15</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Frame 2: New lead created */}
              {frame >= 2 && (
                <motion.div
                  key="new-lead"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={delayedTransition}
                >
                  <BotMessage text="Новый лид создан" time="09:15" />
                  <div className="mt-1.5">
                    <ActionButton label="Назначить" />
                  </div>
                </motion.div>
              )}

              {/* Frame 3: Assignment confirmation */}
              {frame >= 3 && (
                <motion.div
                  key="assigned"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={delayedTransition}
                >
                  <div className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-md bg-indigo-500 px-3 py-2 shadow-sm">
                      <p className="text-[11px] leading-relaxed text-white">
                        Назначить → Дилшод
                      </p>
                      <span className="mt-0.5 block text-right text-[9px] text-indigo-200">
                        09:15 ✓✓
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Frame 4: Lead counter update */}
              {frame >= 4 && (
                <motion.div
                  key="counter"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={delayedTransition}
                >
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-600">Лиды сегодня:</span>
                        <span className="text-[13px] font-bold text-indigo-600">
                          12 → 13
                        </span>
                      </div>
                      <span className="mt-0.5 block text-right text-[9px] text-gray-400">
                        09:15
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom input bar */}
        <div className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2.5">
          <svg className="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          <div className="h-8 flex-1 rounded-full bg-gray-100 px-3 py-1.5">
            <span className="text-[10px] text-gray-400">Сообщение...</span>
          </div>
          <svg className="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center bg-white pb-2 pt-1">
          <div className="h-1 w-24 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}
