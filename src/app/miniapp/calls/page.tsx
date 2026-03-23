'use client';

import { useEffect, useState, useCallback } from 'react';
import { PhoneOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { CallEventResponse } from '@/types/api';
import { formatDuration, formatTime, getDateGroup } from '../_utils';

const PAGE_SIZE = 50;

function SkeletonList() {
  return (
    <div className="miniapp-section" style={{ padding: 0 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="miniapp-skeleton-list-item">
          <div className="miniapp-skeleton-circle" />
          <div className="miniapp-skeleton-lines">
            <div className="miniapp-skeleton-text" style={{ width: '55%' }} />
            <div className="miniapp-skeleton-text" style={{ width: '30%', height: 11 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MiniAppCalls() {
  const [calls, setCalls] = useState<CallEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');

  const load = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(false);
    try {
      const res = await apiClient.getCallHistory({ page: pageNum, page_size: PAGE_SIZE });
      const items = res.items || [];
      if (pageNum === 1) {
        setCalls(items);
      } else {
        setCalls(prev => [...prev, ...items]);
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

  useEffect(() => {
    load();
  }, [load]);

  function handleLoadMore() {
    webApp?.HapticFeedback.selectionChanged();
    load(page + 1);
  }

  if (loading) {
    return (
      <div className="miniapp-page-enter">
        <div className="miniapp-page-title">{t('calls.title')}</div>
        <SkeletonList />
      </div>
    );
  }

  if (error) {
    return (
      <div className="miniapp-page-enter">
        <div className="miniapp-page-title">{t('calls.title')}</div>
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon">!</div>
          <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
        </div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="miniapp-page-enter">
        <div className="miniapp-page-title">{t('calls.title')}</div>
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon"><PhoneOutlined /></div>
          <div className="miniapp-empty-title">{t('calls.noCalls')}</div>
          <div className="miniapp-empty-sub">{t('calls.emptyDescription')}</div>
        </div>
      </div>
    );
  }

  // Group calls by date
  const groups: { key: string; label: string; calls: CallEventResponse[] }[] = [];
  const groupMap = new Map<string, CallEventResponse[]>();

  for (const call of calls) {
    const group = getDateGroup(call.created_at);
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push(call);
  }

  const groupOrder: Array<'today' | 'yesterday' | 'thisWeek' | 'earlier'> = ['today', 'yesterday', 'thisWeek', 'earlier'];
  for (const key of groupOrder) {
    const items = groupMap.get(key);
    if (items?.length) {
      groups.push({ key, label: t(`calls.${key}`), calls: items });
    }
  }

  return (
    <div className="miniapp-page-enter">
      <div className="miniapp-page-title">{t('calls.title')}</div>

      {groups.map((group) => (
        <div key={group.key}>
          <div className="miniapp-date-group">{group.label}</div>
          <div className="miniapp-section">
            <div className="miniapp-list">
              {group.calls.map((call) => {
                const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL' || !call.billing_sec;
                const isInbound = call.direction === 'inbound';
                const phone = call.phone_1 || call.phone_2 || '—';

                return (
                  <div
                    key={call.id}
                    className="miniapp-list-item"
                    onClick={() => {
                      if (phone !== '—') {
                        webApp?.HapticFeedback.impactOccurred('light');
                        window.open(`tel:${phone}`, '_self');
                      }
                    }}
                  >
                    <div className={`miniapp-call-icon ${isMissed ? 'miniapp-call-icon-missed' : isInbound ? 'miniapp-call-icon-inbound' : 'miniapp-call-icon-outbound'}`}>
                      <PhoneOutlined style={{ transform: isInbound ? 'rotate(135deg)' : 'rotate(-45deg)' }} />
                    </div>
                    <div className="miniapp-list-item-content">
                      <div className={`miniapp-list-item-title ${isMissed ? 'miniapp-text-missed' : ''}`}>
                        {phone}
                      </div>
                      <div className="miniapp-list-item-sub">
                        {isMissed ? t('calls.missed') : formatDuration(call.billing_sec)}
                      </div>
                    </div>
                    <div className="miniapp-list-item-right">
                      {formatTime(call.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="miniapp-section" style={{ marginTop: 0 }}>
          <div className="miniapp-section-footer" onClick={handleLoadMore}>
            {loadingMore ? <Spin size="small" /> : t('loadMore')}
          </div>
        </div>
      )}
    </div>
  );
}
