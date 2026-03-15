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

  const sliderStyles = {
    track: { background: 'linear-gradient(90deg, #4338CA, #6366F1)' },
    handle: {
      borderColor: '#4338CA',
      background: '#ffffff',
      boxShadow: '0 2px 8px rgba(67, 56, 202, 0.3)',
      width: 20,
      height: 20,
    },
    rail: { background: '#E0E7FF' },
  };

  return (
    <section id="roi" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-14"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            {t('roi.title')}
          </h2>
          <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
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
          <div className="rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* LEFT: Inputs */}
              <div className="p-8 sm:p-10">
                <div className="space-y-8">
                  {/* Calls per day */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-gray-700">
                        {t('roi.callsPerDay')}
                      </label>
                      <span className="bg-indigo-50 rounded-lg px-3 py-1 font-bold text-indigo-700 tabular-nums text-sm">
                        {callsPerDay}
                      </span>
                    </div>
                    <Slider
                      min={10}
                      max={500}
                      value={callsPerDay}
                      onChange={setCallsPerDay}
                      styles={sliderStyles}
                    />
                  </div>

                  {/* Missed percent */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-gray-700">
                        {t('roi.missedPercent')}
                      </label>
                      <span className="bg-indigo-50 rounded-lg px-3 py-1 font-bold text-indigo-700 tabular-nums text-sm">
                        {missedPercent}%
                      </span>
                    </div>
                    <Slider
                      min={5}
                      max={50}
                      value={missedPercent}
                      onChange={setMissedPercent}
                      styles={sliderStyles}
                    />
                  </div>

                  {/* Average check */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('roi.avgCheck')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={avgCheckDisplay}
                        onChange={(e) => handleAvgCheckChange(e.target.value)}
                        onBlur={handleAvgCheckBlur}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 text-lg font-semibold text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        {t('roi.currencySuffix')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Results */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-8 sm:p-10 flex flex-col justify-center text-white">
                <p className="text-sm uppercase tracking-wider opacity-80 mb-6 font-medium">
                  {t('roi.resultTitle')}
                </p>

                <div className="space-y-6">
                  {/* Missed calls */}
                  <div>
                    <AnimatedCounter
                      value={missedCallsMonth}
                      className="block text-4xl font-black tabular-nums text-white"
                    />
                    <p className="mt-1 text-sm text-indigo-200">
                      {t('roi.missedCallsMonth')}
                    </p>
                  </div>

                  {/* Lost revenue */}
                  <div className="text-amber-300">
                    <AnimatedCounter
                      value={lostRevenue}
                      className="block text-5xl font-black tabular-nums"
                    />
                    <p className="mt-1 text-lg text-indigo-200">
                      {t('roi.lostRevenue')} {t('roi.currencySuffix')}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/20 pt-5">
                    <p className="text-sm opacity-70 mb-3">
                      {t('roi.s1pCost')}
                    </p>

                    {/* ROI */}
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-semibold uppercase tracking-wider opacity-80">
                        {t('roi.roiLabel')}
                      </span>
                      <AnimatedCounter
                        value={roi}
                        suffix="X"
                        className="text-6xl font-black text-emerald-300 tabular-nums"
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
