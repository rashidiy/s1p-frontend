'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { LeadResponse } from '@/types/api';
import { formatAmount, formatDate, STATUS_BADGE } from '../../_utils';

function Skeleton() {
  return (
    <div>
      <div className="miniapp-detail-header">
        <div className="miniapp-skeleton-text" style={{ width: 80, height: 28, borderRadius: 100, marginBottom: 8 }} />
        <div className="miniapp-skeleton-text" style={{ width: 180, height: 22, borderRadius: 8 }} />
        <div className="miniapp-skeleton-text" style={{ width: 100, height: 14, borderRadius: 6 }} />
      </div>
      <div className="miniapp-section">
        {[1,2,3,4].map(i => <div key={i} className="miniapp-info-row"><div className="miniapp-skeleton-text" style={{ width: '30%' }} /><div className="miniapp-skeleton-text" style={{ width: '45%' }} /></div>)}
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<LeadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tStatus = useTranslations('statuses');

  const goBack = useCallback(() => {
    router.push('/miniapp/leads');
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getLead(id);
        setLead(data);
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

  if (error || !lead) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">!</div>
        <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
      </div>
    );
  }

  const status = lead.status || '';

  return (
    <div className="miniapp-detail-enter">
      {/* Header */}
      <div className="miniapp-detail-header">
        <span className={`miniapp-badge miniapp-detail-badge ${STATUS_BADGE[status] || 'miniapp-badge-default'}`}>
          {tStatus(status)}
        </span>
        <div className="miniapp-detail-name">{lead.title || t('detail.untitled')}</div>
        {lead.estimated_value ? (
          <div className="miniapp-detail-sub">
            {formatAmount(lead.estimated_value, lead.currency)}
          </div>
        ) : null}
      </div>

      {/* Details */}
      <div className="miniapp-section">
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('detail.status')}</span>
          <span className="miniapp-info-value">{tStatus(status)}</span>
        </div>
        {lead.source && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.source')}</span>
            <span className="miniapp-info-value">{lead.source}</span>
          </div>
        )}
        {lead.estimated_value != null && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.value')}</span>
            <span className="miniapp-info-value">{formatAmount(lead.estimated_value, lead.currency)}</span>
          </div>
        )}
        {lead.contact_name && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.contact')}</span>
            <span className="miniapp-info-value">{lead.contact_name}</span>
          </div>
        )}
        {lead.assigned_to_name && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.assignedTo')}</span>
            <span className="miniapp-info-value">
              <UserOutlined style={{ marginRight: 4, fontSize: 12 }} />
              {lead.assigned_to_name}
            </span>
          </div>
        )}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('detail.created')}</span>
          <span className="miniapp-info-value">{formatDate(lead.created_at)}</span>
        </div>
      </div>

      {/* Description / Notes */}
      {lead.description && (
        <>
          <div className="miniapp-section-header">
            {t('detail.notes')}
          </div>
          <div className="miniapp-section" style={{ padding: '12px 16px' }}>
            <div className="miniapp-text-block">{lead.description}</div>
          </div>
        </>
      )}
    </div>
  );
}
