'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, BarChart3, ChevronRight } from 'lucide-react';
import { Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { LeadResponse, DealResponse } from '@/types/api';
import { formatAmount, STATUS_BADGE, ALL_STATUSES, STAGE_BADGE, ALL_STAGES } from '../_utils';

const PAGE_SIZE = 30;

type ViewMode = 'leads' | 'deals';

function SkeletonList() {
  return (
    <div className="miniapp-section" style={{ padding: 0 }}>
      {[1,2,3,4].map(i => (
        <div key={i} className="miniapp-skeleton-list-item">
          <div className="miniapp-skeleton-circle" style={{ borderRadius: 8 }} />
          <div className="miniapp-skeleton-lines">
            <div className="miniapp-skeleton-text" style={{ width: '65%' }} />
            <div className="miniapp-skeleton-text" style={{ width: '35%', height: 11 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PipelinePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'deals' ? 'deals' : 'leads';
  const [viewMode, setViewMode] = useState<ViewMode>(initialTab);
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>('');
  const { webApp } = useTelegramWebApp();
  const router = useRouter();
  const t = useTranslations('miniapp');
  const tStatus = useTranslations('statuses');

  const loadLeads = useCallback(async (statusFilter?: string, pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(false);
    try {
      const res = await apiClient.getLeads({
        page: pageNum,
        page_size: PAGE_SIZE,
        status_filter: statusFilter || undefined,
      });
      const items = res.items || [];
      if (pageNum === 1) setLeads(items);
      else setLeads(prev => [...prev, ...items]);
      setHasMore(items.length === PAGE_SIZE);
      setPage(pageNum);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadDeals = useCallback(async (stageFilter?: string, pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(false);
    try {
      const res = await apiClient.getDeals({
        page: pageNum,
        page_size: PAGE_SIZE,
        stage: stageFilter || undefined,
      });
      const items = res.items || [];
      if (pageNum === 1) setDeals(items);
      else setDeals(prev => [...prev, ...items]);
      setHasMore(items.length === PAGE_SIZE);
      setPage(pageNum);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setFilter('');
    setPage(1);
    if (viewMode === 'leads') loadLeads();
    else loadDeals();
  }, [viewMode, loadLeads, loadDeals]);

  function handleFilter(value: string) {
    webApp?.HapticFeedback.selectionChanged();
    const newFilter = filter === value ? '' : value;
    setFilter(newFilter);
    if (viewMode === 'leads') loadLeads(newFilter);
    else loadDeals(newFilter);
  }

  function handleLoadMore() {
    webApp?.HapticFeedback.selectionChanged();
    if (viewMode === 'leads') loadLeads(filter, page + 1);
    else loadDeals(filter, page + 1);
  }

  function switchView(mode: ViewMode) {
    if (mode === viewMode) return;
    webApp?.HapticFeedback.selectionChanged();
    setViewMode(mode);
  }

  const filterOptions = viewMode === 'leads' ? ALL_STATUSES : ALL_STAGES;
  const badgeMap = viewMode === 'leads' ? STATUS_BADGE : STAGE_BADGE;

  return (
    <div className="miniapp-page-enter">
      <div className="miniapp-page-title">{t('pipeline.title')}</div>

      {/* Segmented control */}
      <div className="miniapp-segment">
        <button
          className={`miniapp-segment-btn ${viewMode === 'leads' ? 'active' : ''}`}
          onClick={() => switchView('leads')}
        >
          {t('pipeline.leads')}
        </button>
        <button
          className={`miniapp-segment-btn ${viewMode === 'deals' ? 'active' : ''}`}
          onClick={() => switchView('deals')}
        >
          {t('pipeline.deals')}
        </button>
      </div>

      {/* Filter chips */}
      <div className="miniapp-chips">
        <button
          className={`miniapp-chip ${!filter ? 'active' : ''}`}
          onClick={() => {
            setFilter('');
            webApp?.HapticFeedback.selectionChanged();
            if (viewMode === 'leads') loadLeads();
            else loadDeals();
          }}
        >
          {viewMode === 'leads' ? t('leads.all') : t('deals.all')}
        </button>
        {filterOptions.map((s) => (
          <button
            key={s}
            className={`miniapp-chip ${filter === s ? 'active' : ''}`}
            onClick={() => handleFilter(s)}
          >
            {tStatus(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon">!</div>
          <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
        </div>
      ) : viewMode === 'leads' ? (
        leads.length === 0 ? (
          <div className="miniapp-empty">
            <div className="miniapp-empty-icon"><TrendingUp size={24} /></div>
            <div className="miniapp-empty-title">{t('leads.noLeads')}</div>
            <div className="miniapp-empty-sub">{t('leads.emptyDescription')}</div>
          </div>
        ) : (
          <div className="miniapp-section">
            <div className="miniapp-list">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="miniapp-list-item"
                  onClick={() => {
                    webApp?.HapticFeedback.impactOccurred('light');
                    router.push(`/miniapp/leads/${lead.id}`);
                  }}
                >
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-title">{lead.title || t('detail.untitled')}</div>
                    <div className="miniapp-list-item-sub">
                      {[
                        lead.source,
                        lead.estimated_value ? formatAmount(lead.estimated_value) : null,
                      ].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <span className={`miniapp-badge ${STATUS_BADGE[lead.status || ''] || 'miniapp-badge-default'}`}>
                    {tStatus(lead.status || 'new')}
                  </span>
                  <div className="miniapp-list-item-chevron"><ChevronRight size={16} /></div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="miniapp-section-footer" onClick={handleLoadMore}>
                {loadingMore ? <Spin size="small" /> : t('loadMore')}
              </div>
            )}
          </div>
        )
      ) : (
        deals.length === 0 ? (
          <div className="miniapp-empty">
            <div className="miniapp-empty-icon"><BarChart3 size={24} /></div>
            <div className="miniapp-empty-title">{t('deals.noDeals')}</div>
            <div className="miniapp-empty-sub">{t('deals.emptyDescription')}</div>
          </div>
        ) : (
          <div className="miniapp-section">
            <div className="miniapp-list">
              {deals.map((deal) => {
                const stage = deal.stage || '';
                return (
                  <div
                    key={deal.id}
                    className="miniapp-list-item"
                    onClick={() => {
                      webApp?.HapticFeedback.impactOccurred('light');
                      router.push(`/miniapp/deals/${deal.id}`);
                    }}
                  >
                    <div className="miniapp-list-item-content">
                      <div className="miniapp-list-item-title">{deal.title || t('detail.untitled')}</div>
                      <div className="miniapp-list-item-sub">
                        {formatAmount(deal.amount, deal.currency)}
                      </div>
                    </div>
                    <span className={`miniapp-badge ${badgeMap[stage] || 'miniapp-badge-default'}`}>
                      {tStatus(stage)}
                    </span>
                    <div className="miniapp-list-item-chevron"><ChevronRight size={16} /></div>
                  </div>
                );
              })}
            </div>
            {hasMore && (
              <div className="miniapp-section-footer" onClick={handleLoadMore}>
                {loadingMore ? <Spin size="small" /> : t('loadMore')}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
