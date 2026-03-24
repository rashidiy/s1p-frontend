'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, Mail, MessageCircle, TrendingUp, BarChart3, Headphones, ArrowLeftRight } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { ContactResponse } from '@/types/api';
import { formatPhone, getInitials, getAvatarColor, formatDate } from '../../_utils';

function Skeleton() {
  return (
    <div>
      <div className="miniapp-detail-header">
        <div className="miniapp-skeleton-circle" style={{ width: 72, height: 72 }} />
        <div className="miniapp-skeleton-text" style={{ width: 140, height: 22, borderRadius: 8, marginTop: 8 }} />
        <div className="miniapp-skeleton-text" style={{ width: 100, height: 14, borderRadius: 6 }} />
      </div>
      <div className="miniapp-section">
        {[1,2,3].map(i => <div key={i} className="miniapp-info-row"><div className="miniapp-skeleton-text" style={{ width: '30%' }} /><div className="miniapp-skeleton-text" style={{ width: '45%' }} /></div>)}
      </div>
    </div>
  );
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<ContactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCallMenu, setShowCallMenu] = useState(false);
  const callMenuRef = useRef<HTMLDivElement>(null);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tFields = useTranslations('fields');

  const goBack = useCallback(() => {
    router.push('/miniapp/contacts');
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getContact(id);
        setContact(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Telegram BackButton
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

  // Close dropdown on outside tap
  useEffect(() => {
    if (!showCallMenu) return;
    function handleTap(e: MouseEvent) {
      if (callMenuRef.current && !callMenuRef.current.contains(e.target as Node)) {
        setShowCallMenu(false);
      }
    }
    document.addEventListener('pointerdown', handleTap);
    return () => document.removeEventListener('pointerdown', handleTap);
  }, [showCallMenu]);

  if (loading) return <Skeleton />;

  if (error || !contact) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">!</div>
        <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
      </div>
    );
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.phone || '\u2014';
  const initials = getInitials(contact.first_name, contact.last_name, contact.phone);

  function handleCallPress() {
    webApp?.HapticFeedback.impactOccurred('medium');
    setShowCallMenu(prev => !prev);
  }

  function handleMessage() {
    if (!contact?.phone) return;
    webApp?.HapticFeedback.impactOccurred('medium');
    const cleanPhone = contact.phone.startsWith('+') ? contact.phone : `+${contact.phone}`;
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
        <div className="miniapp-detail-avatar" style={{ background: getAvatarColor(fullName) }}>
          {initials}
        </div>
        <div className="miniapp-detail-name">{fullName}</div>
        {contact.company_name && (
          <div className="miniapp-detail-sub">{contact.company_name}</div>
        )}

        {/* Quick action buttons */}
        <div className="miniapp-detail-actions">
          {contact.phone && (
            <div style={{ position: 'relative' }} ref={callMenuRef}>
              <button className="miniapp-detail-action-btn" onClick={handleCallPress}>
                <div className="miniapp-detail-action-icon">
                  <Phone size={20} />
                </div>
                <span className="miniapp-detail-action-label">{t('actions.call')}</span>
              </button>

              {/* Dropdown menu — goes DOWN from button */}
              {showCallMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 6,
                  background: 'var(--ma-section)',
                  borderRadius: 'var(--ma-radius-sm)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  zIndex: 100,
                  minWidth: 180,
                  border: '0.5px solid var(--ma-separator)',
                }}>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: '14px 16px', border: 'none', background: 'none',
                      color: 'var(--ma-text)', fontSize: 15, cursor: 'pointer',
                      borderBottom: '0.5px solid var(--ma-separator)',
                    }}
                    onClick={() => {
                      setShowCallMenu(false);
                      webApp?.HapticFeedback.impactOccurred('medium');
                      try { webApp?.openLink(`tel:${contact.phone}`); } catch { window.location.href = `tel:${contact.phone}`; }
                    }}
                  >
                    <Phone size={18} /> {t('calls.phoneCall')}
                  </button>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: '14px 16px', border: 'none', background: 'none',
                      color: 'var(--ma-text)', fontSize: 15, cursor: 'pointer',
                      borderBottom: '0.5px solid var(--ma-separator)',
                    }}
                    onClick={() => {
                      setShowCallMenu(false);
                      webApp?.HapticFeedback.impactOccurred('medium');
                      router.push(`/miniapp/calls?number=${encodeURIComponent(contact.phone!)}&mode=sip`);
                    }}
                  >
                    <Headphones size={18} /> {t('calls.sipCall')}
                  </button>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: '14px 16px', border: 'none', background: 'none',
                      color: 'var(--ma-text)', fontSize: 15, cursor: 'pointer',
                    }}
                    onClick={() => {
                      setShowCallMenu(false);
                      webApp?.HapticFeedback.impactOccurred('medium');
                      router.push(`/miniapp/calls?number=${encodeURIComponent(contact.phone!)}&mode=external`);
                    }}
                  >
                    <ArrowLeftRight size={18} /> {t('calls.externalCall')}
                  </button>
                </div>
              )}
            </div>
          )}
          {contact.phone && (
            <button className="miniapp-detail-action-btn" onClick={handleMessage}>
              <div className="miniapp-detail-action-icon">
                <MessageCircle size={20} />
              </div>
              <span className="miniapp-detail-action-label">{t('actions.message')}</span>
            </button>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="miniapp-detail-action-btn" onClick={() => webApp?.HapticFeedback.impactOccurred('medium')}>
              <div className="miniapp-detail-action-icon">
                <Mail size={20} />
              </div>
              <span className="miniapp-detail-action-label">{t('detail.email')}</span>
            </a>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="miniapp-section">
        {contact.phone && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.phone')}</span>
            <span className="miniapp-info-value">
              <a href={`tel:${contact.phone}`}>{formatPhone(contact.phone)}</a>
            </span>
          </div>
        )}
        {contact.email && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.email')}</span>
            <span className="miniapp-info-value">
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </span>
          </div>
        )}
        {contact.position && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{tFields('position')}</span>
            <span className="miniapp-info-value">{contact.position}</span>
          </div>
        )}
        {contact.source && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.source')}</span>
            <span className="miniapp-info-value">{contact.source}</span>
          </div>
        )}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('detail.created')}</span>
          <span className="miniapp-info-value">{formatDate(contact.created_at)}</span>
        </div>
      </div>

      {/* Related counts */}
      <div className="miniapp-section-header">
        {t('detail.linkedLeads')} & {t('detail.linkedDeals')}
      </div>
      <div className="miniapp-section">
        <div
          className="miniapp-list-item"
          onClick={() => {
            webApp?.HapticFeedback.impactOccurred('light');
            router.push('/miniapp/pipeline');
          }}
        >
          <div className="miniapp-call-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <TrendingUp size={16} />
          </div>
          <div className="miniapp-list-item-content">
            <div className="miniapp-list-item-title">{t('detail.linkedLeads')}</div>
          </div>
          <div className="miniapp-list-item-right">
            {contact.total_leads || 0}
          </div>
        </div>
        <div
          className="miniapp-list-item"
          onClick={() => {
            webApp?.HapticFeedback.impactOccurred('light');
            router.push('/miniapp/pipeline');
          }}
        >
          <div className="miniapp-call-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}>
            <BarChart3 size={16} />
          </div>
          <div className="miniapp-list-item-content">
            <div className="miniapp-list-item-title">{t('detail.linkedDeals')}</div>
          </div>
          <div className="miniapp-list-item-right">
            {contact.total_deals || 0}
          </div>
        </div>
        <div className="miniapp-list-item">
          <div className="miniapp-call-icon" style={{ background: 'rgba(67, 56, 202, 0.1)', color: '#4338CA' }}>
            <Phone size={20} />
          </div>
          <div className="miniapp-list-item-content">
            <div className="miniapp-list-item-title">{t('detail.recentCalls')}</div>
          </div>
          <div className="miniapp-list-item-right">
            {contact.total_calls || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
