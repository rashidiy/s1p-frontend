'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Slider } from 'antd';
import { BlurFade } from './magicui/blur-fade';
import { NumberTicker } from './magicui/number-ticker';

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
    <section id="roi" className="bg-[#0D0D12] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <BlurFade delay={0} inView>
          <div className="mb-12 text-center sm:mb-14">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              {t('roi.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-gray-400 font-body">
              {t('roi.subtitle')}
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.15} inView>
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04]">
              <div className="grid lg:grid-cols-2">
                {/* LEFT: Inputs */}
                <div className="border-b border-white/[0.08] p-8 lg:border-b-0 lg:border-r">
                  <div className="space-y-8">
                    {/* Calls per day */}
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <label className="font-body text-sm font-semibold text-gray-300">
                          {t('roi.callsPerDay')}
                        </label>
                        <span className="rounded-lg bg-indigo-500/20 px-3 py-1 font-body font-bold tabular-nums text-indigo-300">
                          {callsPerDay}
                        </span>
                      </div>
                      <Slider
                        min={10}
                        max={500}
                        value={callsPerDay}
                        onChange={setCallsPerDay}
                        trackStyle={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
                        railStyle={{ background: 'rgba(255,255,255,0.08)' }}
                        handleStyle={{ borderColor: '#6366F1', background: '#6366F1' }}
                      />
                    </div>

                    {/* Missed percent */}
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <label className="font-body text-sm font-semibold text-gray-300">
                          {t('roi.missedPercent')}
                        </label>
                        <span className="rounded-lg bg-indigo-500/20 px-3 py-1 font-body font-bold tabular-nums text-indigo-300">
                          {missedPercent}%
                        </span>
                      </div>
                      <Slider
                        min={5}
                        max={50}
                        value={missedPercent}
                        onChange={setMissedPercent}
                        trackStyle={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
                        railStyle={{ background: 'rgba(255,255,255,0.08)' }}
                        handleStyle={{ borderColor: '#6366F1', background: '#6366F1' }}
                      />
                    </div>

                    {/* Average check */}
                    <div>
                      <label className="mb-3 block font-body text-sm font-semibold text-gray-300">
                        {t('roi.avgCheck')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={avgCheckDisplay}
                          onChange={(e) => handleAvgCheckChange(e.target.value)}
                          onBlur={handleAvgCheckBlur}
                          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 font-body text-lg font-semibold text-white outline-none transition-all focus:border-indigo-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                          {t('roi.currencySuffix')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Results */}
                <div className="flex flex-col justify-center bg-gradient-to-br from-indigo-600/20 to-violet-600/20 p-8">
                  <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                    {t('roi.resultTitle')}
                  </p>

                  <div className="space-y-6">
                    {/* Missed calls */}
                    <div>
                      <NumberTicker
                        value={missedCallsMonth}
                        className="font-display text-4xl font-black tabular-nums text-white"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        {t('roi.missedCallsMonth')}
                      </p>
                    </div>

                    {/* Lost revenue */}
                    <div>
                      <NumberTicker
                        value={lostRevenue}
                        className="font-display text-4xl font-black tabular-nums text-amber-400 md:text-5xl"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        {t('roi.lostRevenue')} {t('roi.currencySuffix')}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/[0.1] pt-5">
                      <p className="mb-3 text-sm text-gray-500">
                        {t('roi.s1pCost')}
                      </p>

                      {/* ROI */}
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                          {t('roi.roiLabel')}
                        </span>
                        <NumberTicker
                          value={Math.round(roi)}
                          decimalPlaces={0}
                          className="font-display text-5xl font-black tabular-nums text-emerald-400 md:text-6xl"
                        />
                        <span className="font-display text-5xl font-black text-emerald-400 md:text-6xl">
                          X
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
