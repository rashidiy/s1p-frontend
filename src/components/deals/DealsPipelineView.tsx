'use client';

import { useEffect, useState, useMemo } from 'react';
import { Spin, message } from 'antd';
import { DollarOutlined, RiseOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { DealResponse } from '@/types/api';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const PIPELINE_STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation'] as const;

const STAGE_COLORS: Record<string, string> = {
  prospecting: '#3B82F6',
  qualification: '#F59E0B',
  proposal: '#F97316',
  negotiation: '#8B5CF6',
};

interface PipelineSummaryStage {
  stage: string;
  count: number;
  total_value: number;
}

export default function DealsPipelineView() {
  const t = useTranslations('deals');
  const tStatuses = useTranslations('statuses');

  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [pipelineSummary, setPipelineSummary] = useState<PipelineSummaryStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dealsResult, summaryResult] = await Promise.all([
          apiClient.getDeals({ page: 1, page_size: 1000 }),
          apiClient.getPipelineSummary(),
        ]);
        setDeals(dealsResult.items);
        setPipelineSummary(Array.isArray(summaryResult) ? summaryResult : summaryResult?.stages ?? []);
      } catch (error) {
        console.error('Failed to load pipeline:', error);
        message.error(t('failedToLoadPipeline'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, DealResponse[]> = {};
    for (const stage of PIPELINE_STAGES) {
      grouped[stage] = [];
    }
    for (const deal of deals) {
      const stage = deal.stage?.toLowerCase();
      if (stage && stage in grouped) {
        grouped[stage].push(deal);
      }
    }
    return grouped;
  }, [deals]);

  const getStageSummary = (stage: string) => {
    const found = pipelineSummary.find(
      (s) => s.stage?.toLowerCase() === stage
    );
    if (found) return { count: found.count, total: found.total_value };
    const stageDeals = dealsByStage[stage] || [];
    return {
      count: stageDeals.length,
      total: stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pipeline-board">
      {PIPELINE_STAGES.map((stage) => {
        const color = STAGE_COLORS[stage];
        const summary = getStageSummary(stage);
        const stageDeals = dealsByStage[stage] || [];

        return (
          <div key={stage} className="pipeline-column">
            <div className="pipeline-column-header" style={{ borderTopColor: color }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800 text-sm">
                  {tStatuses(stage)}
                </span>
                <span
                  className="pipeline-count-badge"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {summary.count}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                ${summary.total.toLocaleString()}
              </span>
            </div>

            <div className="pipeline-column-body">
              {stageDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="pipeline-deal-card glass-card"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                    {deal.title}
                  </h4>

                  <div className="flex items-center gap-1 text-green-600 font-bold text-base mb-2">
                    <DollarOutlined className="text-xs" />
                    ${(deal.amount ?? 0).toLocaleString()}
                  </div>

                  {deal.contact_name && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <UserOutlined className="text-[10px]" />
                      {deal.contact_name}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    {deal.probability != null && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <RiseOutlined className="text-[10px]" />
                        {deal.probability}%
                      </span>
                    )}
                    {deal.expected_close_date && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <CalendarOutlined className="text-[10px]" />
                        {new Date(deal.expected_close_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}

              {stageDeals.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-400">
                  {t('noDealsInStage')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
