'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Slider } from 'antd';
import AnimatedCounter from './AnimatedCounter';

function formatInputValue(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function parseInputValue(value: string): number {
  const cleaned = value.replace(/\s/g, '').replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

const S1P_MONTHLY_COST = 290000;
const CONVERSION_RATE = 0.3;
const DAYS_PER_MONTH = 30;

export default function ROICalculator() {
  const t = useTranslations('landing');
  const prefersReducedMotion = useReducedMotion();

  const [callsPerDay, setCallsPerDay] = useState(50);
  const [missedPercent, setMissedPercent] = useState(20);
  const [avgCheck, setAvgCheck] = useState(500000);
  const [avgCheckDisplay, setAvgCheckDisplay] = useState('500 000');

  const calculate = useCallback(() => {
    const missedCallsMonth = Math.round(callsPerDay * (missedPercent / 100) * DAYS_PER_MONTH);
    const lostRevenue = Math.round(missedCallsMonth * avgCheck * CONVERSION_RATE);
    const roi = lostRevenue > 0 ? Math.round((lostRevenue / S1P_MONTHLY_COST) * 10) / 10 : 0;
    return { missedCallsMonth, lostRevenue, roi };
  }, [callsPerDay, missedPercent, avgCheck]);

  const { missedCallsMonth, lostRevenue, roi } = useMemo(() => calculate(), [calculate]);

  const handleAvgCheckChange = useCallback((inputVal: string) => {
    const numeric = parseInputValue(inputVal);
    if (numeric <= 99999999) {
      setAvgCheck(numeric);
      setAvgCheckDisplay(numeric > 0 ? formatInputValue(numeric) : '');
    }
  }, []);

  const handleAvgCheckBlur = useCallback(() => {
    if (avgCheck === 0) {
      setAvgCheck(500000);
      setAvgCheckDisplay('500 000');
    }
  }, [avgCheck]);

  return (
    <section id="roi" className="py-24 sm:py-32 bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="text-center mb-14 sm:mb-16"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            {t('roi.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            {t('roi.subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-5xl"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-white via-white to-indigo-50/80 shadow-xl shadow-indigo-100/40 border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: Inputs */}
              <div className="p-8 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100">
                <div className="space-y-10">
                  {/* Calls per day */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-gray-700">
                        {t('roi.callsPerDay')}
                      </label>
                      <span className="text-2xl font-bold text-indigo-700 tabular-nums min-w-[60px] text-right">
                        {callsPerDay}
                      </span>
                    </div>
                    <Slider
                      min={10}
                      max={500}
                      value={callsPerDay}
                      onChange={setCallsPerDay}
                      styles={{
                        track: { background: '#4338CA' },
                        handle: {
                          borderColor: '#4338CA',
                          background: '#ffffff',
                          boxShadow: '0 2px 8px rgba(67, 56, 202, 0.3)',
                        },
                        rail: { background: '#E0E7FF' },
                      }}
                    />
                  </div>

                  {/* Missed percent */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-gray-700">
                        {t('roi.missedPercent')}
                      </label>
                      <span className="text-2xl font-bold text-indigo-700 tabular-nums min-w-[60px] text-right">
                        {missedPercent}%
                      </span>
                    </div>
                    <Slider
                      min={5}
                      max={50}
                      value={missedPercent}
                      onChange={setMissedPercent}
                      styles={{
                        track: { background: '#4338CA' },
                        handle: {
                          borderColor: '#4338CA',
                          background: '#ffffff',
                          boxShadow: '0 2px 8px rgba(67, 56, 202, 0.3)',
                        },
                        rail: { background: '#E0E7FF' },
                      }}
                    />
                  </div>

                  {/* Average check */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('roi.avgCheck')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={avgCheckDisplay}
                        onChange={(e) => handleAvgCheckChange(e.target.value)}
                        onBlur={handleAvgCheckBlur}
                        className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-lg font-semibold text-gray-900 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        {t('roi.currencySuffix')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Results */}
              <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-gray-500 mb-8">
                  {t('roi.resultTitle')}
                </h3>

                <div className="space-y-8">
                  {/* Missed calls */}
                  <div>
                    <AnimatedCounter
                      value={missedCallsMonth}
                      className="block text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums"
                    />
                    <p className="mt-1.5 text-sm text-gray-500">
                      {t('roi.missedCallsMonth')}
                    </p>
                  </div>

                  {/* Lost revenue */}
                  <div>
                    <AnimatedCounter
                      value={lostRevenue}
                      className="block text-4xl sm:text-5xl font-bold text-red-600 tabular-nums"
                    />
                    <p className="mt-1.5 text-sm text-gray-500">
                      {t('roi.lostRevenue')}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-500 mb-4">
                      {t('roi.s1pCost')}
                    </p>

                    {/* ROI */}
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {t('roi.roiLabel')}
                      </span>
                      <AnimatedCounter
                        value={roi}
                        suffix="X"
                        className="text-5xl sm:text-6xl font-extrabold text-indigo-700 tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
