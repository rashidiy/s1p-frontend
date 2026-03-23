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
        <div className="miniapp-skeleton-circle" style={{ width: 72, height: 72 }} />
        <div className="miniapp-skeleton-text" style={{ width: 160, height: 24, borderRadius: 8, marginTop: 8 }} />
        <div className="miniapp-skeleton-text" style={{ width: 120, height: 14, borderRadius: 6 }} />
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
  const hasContact = !!call.contact_name && !!call.contact_id;

  const directionLabel = isInbound ? t('calls.inbound') : t('calls.outbound');
  const stateLabel = isMissed
    ? t('calls.missed')
    : (call.state === 'ANSWER' ? t('calls.answered') : (call.state || '—'));

  function handleCall() {
    if (!phone) return;
    webApp?.HapticFeedback.impactOccurred('medium');
    // tel: links don't work in Telegram WebView, use openLink
    try {
      webApp?.openLink(`tel:${phone}`);
    } catch {
      window.location.href = `tel:${phone}`;
    }
  }

  function handleMessage() {
    if (!phone) return;
    webApp?.HapticFeedback.impactOccurred('medium');
    // t.me/+phone format for Telegram phone lookup
    const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;
    try {
      webApp?.openTelegramLink(`https://t.me/${cleanPhone}`);
    } catch {
      window.open(`https://t.me/${cleanPhone}`, '_blank');
    }
  }

  return (
    <div className="miniapp-detail-enter">
      {/* Header with avatar */}
      <div className="miniapp-detail-header">
        {hasContact ? (
          <div
            className="miniapp-detail-avatar"
            style={{ background: getAvatarColor(call.contact_name!) }}
          >
            {getInitials(call.contact_name!.split(' ')[0], call.contact_name!.split(' ')[1])}
          </div>
        ) : (
          <div
            className="miniapp-detail-avatar"
            style={{
              background: isMissed
                ? 'rgba(239, 68, 68, 0.15)'
                : isInbound
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(59, 130, 246, 0.15)',
              color: isMissed ? '#EF4444' : isInbound ? '#10B981' : '#3B82F6',
            }}
          >
            <PhoneOutlined style={{ fontSize: 28, transform: isInbound ? 'rotate(135deg)' : 'rotate(-45deg)' }} />
          </div>
        )}
        <div className={`miniapp-detail-name ${isMissed ? 'miniapp-text-missed' : ''}`}>
          {displayName}
        </div>
        <div className="miniapp-detail-sub">{phone}</div>
        <span className={`miniapp-badge ${isMissed ? 'miniapp-badge-red' : isInbound ? 'miniapp-badge-green' : 'miniapp-badge-blue'}`}>
          {directionLabel} · {stateLabel}
        </span>

        {/* Action buttons — no labels, icon only */}
        <div className="miniapp-detail-actions">
          {phone && (
            <button className="miniapp-detail-action-btn" onClick={handleCall}>
              <div className="miniapp-detail-action-icon">
                <PhoneOutlined />
              </div>
            </button>
          )}
          {phone && (
            <button className="miniapp-detail-action-btn" onClick={handleMessage}>
              <div className="miniapp-detail-action-icon">
                <MessageOutlined />
              </div>
            </button>
          )}
          {hasContact && (
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
            </button>
          )}
        </div>
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
    </div>
  );
}
