'use client';

import { useEffect, useState, useCallback } from 'react';
import { FundProjectionScreenOutlined, RightOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { DealResponse } from '@/types/api';
import { formatAmount, STAGE_BADGE, ALL_STAGES } from '../_utils';

const PAGE_SIZE = 30;

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

export default function MiniAppDeals() {
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

  const load = useCallback(async (stageFilter?: string, pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(false);
    try {
      const res = await apiClient.getDeals({
        page: pageNum,
        page_size: PAGE_SIZE,
        stage: stageFilter || undefined,
      });
      const items = res.items || [];
      if (pageNum === 1) {
        setDeals(items);
      } else {
        setDeals(prev => [...prev, ...items]);
      }
      setHasMore(items.length === PAGE_SIZE);
      setPage(pageNum);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleFilter(stage: string) {
    webApp?.HapticFeedback.selectionChanged();
    const newFilter = filter === stage ? '' : stage;
    setFilter(newFilter);
    load(newFilter);
  }

  function handleLoadMore() {
    webApp?.HapticFeedback.selectionChanged();
    load(filter, page + 1);
  }

  return (
    <div className="miniapp-page-enter">
      <div className="miniapp-page-title">{t('deals.title')}</div>

      <div className="miniapp-chips">
        <button
          className={`miniapp-chip ${!filter ? 'active' : ''}`}
          onClick={() => { setFilter(''); load(); webApp?.HapticFeedback.selectionChanged(); }}
        >
          {t('deals.all')}
        </button>
        {ALL_STAGES.map((s) => (
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
      ) : deals.length === 0 ? (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon"><FundProjectionScreenOutlined /></div>
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
                  <span className={`miniapp-badge ${STAGE_BADGE[stage] || 'miniapp-badge-default'}`}>
                    {tStatus(stage)}
                  </span>
                  <div className="miniapp-list-item-chevron"><RightOutlined /></div>
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
      )}
    </div>
  );
}
