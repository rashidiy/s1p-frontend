'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  PhoneOutlined,
  MessageOutlined,
  UserOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { CallWithDetails } from '@/types/api';
import { formatDuration, formatDate, formatTime, getAvatarColor, getInitials } from '../../_utils';

function Skeleton() {
  return (
    <div>
      <div className="miniapp-detail-header">
        <div className="miniapp-skeleton-text" style={{ width: 160, height: 24, borderRadius: 8 }} />
        <div className="miniapp-skeleton-text" style={{ width: 120, height: 14, borderRadius: 6, marginTop: 4 }} />
        <div className="miniapp-skeleton-text" style={{ width: 80, height: 24, borderRadius: 100, marginTop: 8 }} />
      </div>
      <div className="miniapp-section">
        {[1, 2, 3, 4].map(i => <div key={i} className="miniapp-info-row"><div className="miniapp-skeleton-text" style={{ width: '30%' }} /><div className="miniapp-skeleton-text" style={{ width: '45%' }} /></div>)}
      </div>
    </div>
  );
}

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [call, setCall] = useState<CallWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tFields = useTranslations('fields');

  const goBack = useCallback(() => {
    router.push('/miniapp/calls');
  }, [router]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`call_${id}`);
      if (stored) {
        setCall(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
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

  if (!call) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">!</div>
        <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
      </div>
    );
  }

  const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL';
  const isInbound = call.direction === 'inbound';
  const phone = call.phone_2 || call.phone_1 || '';
  const displayName = call.contact_name || phone || '—';

  const directionLabel = isInbound ? t('calls.inbound') : t('calls.outbound');
  const stateLabel = isMissed
    ? t('calls.missed')
    : (call.state === 'ANSWER' ? t('calls.answered') : (call.state || '—'));

  // Check if contact has telegram username (we'd need it from contact data)
  // For now, telegram deep link uses phone number
  const hasTelegramLink = !!phone;

  return (
    <div className="miniapp-detail-enter">
      {/* Header — name, phone, badge */}
      <div className="miniapp-detail-header">
        <div className={`miniapp-detail-name ${isMissed ? 'miniapp-text-missed' : ''}`}>
          {displayName}
        </div>
        {call.contact_name && (
          <div className="miniapp-detail-sub">{phone}</div>
        )}
        {!call.contact_name && (
          <div className="miniapp-detail-sub">{phone}</div>
        )}
        <span className={`miniapp-badge ${isMissed ? 'miniapp-badge-red' : isInbound ? 'miniapp-badge-green' : 'miniapp-badge-blue'}`}>
          {directionLabel} · {stateLabel}
        </span>
      </div>

      {/* 3 Action buttons */}
      <div className="miniapp-detail-actions" style={{ justifyContent: 'center', padding: '8px 0 16px' }}>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="miniapp-detail-action-btn"
            onClick={() => webApp?.HapticFeedback.impactOccurred('medium')}
          >
            <div className="miniapp-detail-action-icon">
              <PhoneOutlined />
            </div>
            <span className="miniapp-detail-action-label">{t('actions.call')}</span>
          </a>
        )}
        {hasTelegramLink && (
          <a
            href={`https://t.me/${phone.replace(/[^0-9]/g, '')}`}
            className="miniapp-detail-action-btn"
            onClick={() => webApp?.HapticFeedback.impactOccurred('medium')}
          >
            <div className="miniapp-detail-action-icon">
              <MessageOutlined />
            </div>
            <span className="miniapp-detail-action-label">{t('actions.message') || 'Message'}</span>
          </a>
        )}
        {call.contact_id && (
          <button
            className="miniapp-detail-action-btn"
            onClick={() => {
              webApp?.HapticFeedback.impactOccurred('light');
              router.push(`/miniapp/contacts/${call.contact_id}`);
            }}
          >
            <div className="miniapp-detail-action-icon">
              <UserOutlined />
            </div>
            <span className="miniapp-detail-action-label">{t('detail.contact')}</span>
          </button>
        )}
      </div>

      {/* Call info */}
      <div className="miniapp-section">
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">
            <SwapOutlined style={{ marginRight: 6 }} />
            {tFields('direction') || 'Direction'}
          </span>
          <span className="miniapp-info-value">{directionLabel}</span>
        </div>
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">
            <PhoneOutlined style={{ marginRight: 6 }} />
            {t('detail.status')}
          </span>
          <span className={`miniapp-info-value ${isMissed ? 'miniapp-text-missed' : ''}`}>
            {stateLabel}
          </span>
        </div>
        {!isMissed && call.duration != null && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">
              <ClockCircleOutlined style={{ marginRight: 6 }} />
              {tFields('duration') || 'Duration'}
            </span>
            <span className="miniapp-info-value">{formatDuration(call.duration)}</span>
          </div>
        )}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">
            <CalendarOutlined style={{ marginRight: 6 }} />
            {t('detail.created')}
          </span>
          <span className="miniapp-info-value">
            {formatDate(call.created_at)} {formatTime(call.created_at)}
          </span>
        </div>
        {call.operator_name && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">
              <UserOutlined style={{ marginRight: 6 }} />
              {t('detail.operator')}
            </span>
            <span className="miniapp-info-value">{call.operator_name}</span>
          </div>
        )}
      </div>

      {/* Contact card if linked */}
      {call.contact_name && call.contact_id && (
        <>
          <div className="miniapp-section-header">{t('detail.contact')}</div>
          <div className="miniapp-section">
            <div
              className="miniapp-list-item"
              onClick={() => {
                webApp?.HapticFeedback.impactOccurred('light');
                router.push(`/miniapp/contacts/${call.contact_id}`);
              }}
            >
              <div
                className="miniapp-list-item-icon"
                style={{ background: getAvatarColor(call.contact_name) }}
              >
                {getInitials(call.contact_name.split(' ')[0], call.contact_name.split(' ')[1])}
              </div>
              <div className="miniapp-list-item-content">
                <div className="miniapp-list-item-title">{call.contact_name}</div>
                <div className="miniapp-list-item-sub">{phone}</div>
              </div>
              <div className="miniapp-list-item-chevron">→</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
