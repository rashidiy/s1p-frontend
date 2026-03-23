'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { DealResponse } from '@/types/api';
import { formatAmount, formatDate, STAGE_BADGE } from '../../_utils';

function Skeleton() {
  return (
    <div>
      <div className="miniapp-detail-header">
        <div className="miniapp-skeleton-text" style={{ width: 80, height: 28, borderRadius: 100, marginBottom: 8 }} />
        <div className="miniapp-skeleton-text" style={{ width: 180, height: 22, borderRadius: 8 }} />
        <div className="miniapp-skeleton-text" style={{ width: 120, height: 18, borderRadius: 6 }} />
      </div>
      <div className="miniapp-section">
        {[1,2,3,4,5].map(i => <div key={i} className="miniapp-info-row"><div className="miniapp-skeleton-text" style={{ width: '30%' }} /><div className="miniapp-skeleton-text" style={{ width: '45%' }} /></div>)}
      </div>
    </div>
  );
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tStatus = useTranslations('statuses');

  const goBack = useCallback(() => {
    router.push('/miniapp/deals');
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getDeal(id);
        setDeal(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (webApp) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(goBack);
      return () => {
        webApp.BackButton.offClick(goBack);
        webApp.BackButton.hide();
      };
    }
  }, [webApp, goBack]);

  if (loading) return <Skeleton />;

  if (error || !deal) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">!</div>
        <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
      </div>
    );
  }

  const stage = deal.stage || '';

  return (
    <div className="miniapp-detail-enter">
      {/* Header */}
      <div className="miniapp-detail-header">
        <span className={`miniapp-badge miniapp-detail-badge ${STAGE_BADGE[stage] || 'miniapp-badge-default'}`}>
          {tStatus(stage)}
        </span>
        <div className="miniapp-detail-name">{deal.title || t('detail.untitled')}</div>
        <div className="miniapp-detail-sub miniapp-detail-amount">
          {formatAmount(deal.amount, deal.currency)}
        </div>
      </div>

      {/* Details */}
      <div className="miniapp-section">
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('detail.stage')}</span>
          <span className="miniapp-info-value">{tStatus(stage)}</span>
        </div>
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('detail.amount')}</span>
          <span className="miniapp-info-value">{formatAmount(deal.amount, deal.currency)}</span>
        </div>
        {deal.probability != null && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.probability')}</span>
            <span className="miniapp-info-value">{deal.probability}%</span>
          </div>
        )}
        {deal.expected_close_date && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.closeDate')}</span>
            <span className="miniapp-info-value">{formatDate(String(deal.expected_close_date))}</span>
          </div>
        )}
        {deal.contact_name && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.contact')}</span>
            <span className="miniapp-info-value">{deal.contact_name}</span>
          </div>
        )}
        {deal.assigned_to_name && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.assignedTo')}</span>
            <span className="miniapp-info-value">
              <UserOutlined style={{ marginRight: 4, fontSize: 12 }} />
              {deal.assigned_to_name}
            </span>
          </div>
        )}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('detail.created')}</span>
          <span className="miniapp-info-value">{formatDate(deal.created_at)}</span>
        </div>
        {deal.closed_date && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.closed')}</span>
            <span className="miniapp-info-value">{formatDate(String(deal.closed_date))}</span>
          </div>
        )}
      </div>

      {/* Win/Loss reason */}
      {(deal.win_reason || deal.loss_reason) && (
        <>
          <div className="miniapp-section-header">
            {deal.win_reason ? t('detail.winReason') : t('detail.lossReason')}
          </div>
          <div className="miniapp-section" style={{ padding: '12px 16px' }}>
            <div className="miniapp-text-block">{deal.win_reason || deal.loss_reason}</div>
          </div>
        </>
      )}

      {/* Description */}
      {deal.description && (
        <>
          <div className="miniapp-section-header">
            {t('detail.notes')}
          </div>
          <div className="miniapp-section" style={{ padding: '12px 16px' }}>
            <div className="miniapp-text-block">{deal.description}</div>
          </div>
        </>
      )}
    </div>
  );
}
