'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, Mail, MessageCircle, TrendingUp, BarChart3, Headphones, ArrowLeftRight, Pencil, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { ContactResponse, ContactUpdateRequest } from '@/types/api';
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

const editInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  fontSize: 15,
  color: 'var(--ma-text)',
  background: 'var(--ma-bg2)',
  border: '1px solid var(--ma-separator)',
  borderRadius: 'var(--ma-radius-sm)',
  outline: 'none',
  fontFamily: 'inherit',
};

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

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ContactResponse>>({});
  const [saving, setSaving] = useState(false);

  const goBack = useCallback(() => {
    router.push('/miniapp/contacts');
  }, [router]);

  const loadContact = useCallback(async () => {
    try {
      const data = await apiClient.getContact(id);
      setContact(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

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

  // Enter edit mode
  function startEditing() {
    if (!contact) return;
    webApp?.HapticFeedback.impactOccurred('light');
    setEditData({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      position: contact.position || '',
      company_name: contact.company_name || '',
    });
    setEditing(true);
  }

  // Cancel edit
  function cancelEditing() {
    webApp?.HapticFeedback.impactOccurred('light');
    setEditing(false);
    setEditData({});
  }

  // Save handler — stable ref for MainButton
  const handleSaveRef = useRef<() => void>();
  handleSaveRef.current = async () => {
    if (!contact || saving) return;
    setSaving(true);

    // Build update payload with only changed fields
    const updates: ContactUpdateRequest = {};
    if (editData.first_name !== undefined && editData.first_name !== contact.first_name) {
      updates.first_name = editData.first_name || undefined;
    }
    if (editData.last_name !== undefined && editData.last_name !== (contact.last_name || '')) {
      updates.last_name = editData.last_name || null;
    }
    if (editData.phone !== undefined && editData.phone !== (contact.phone || '')) {
      updates.phone = editData.phone || null;
    }
    if (editData.email !== undefined && editData.email !== (contact.email || '')) {
      updates.email = editData.email || null;
    }
    if (editData.position !== undefined && editData.position !== (contact.position || '')) {
      updates.position = editData.position || null;
    }
    if (editData.company_name !== undefined && editData.company_name !== (contact.company_name || '')) {
      updates.company_name = editData.company_name || null;
    }

    // If nothing changed, just exit edit mode
    if (Object.keys(updates).length === 0) {
      setEditing(false);
      setSaving(false);
      return;
    }

    try {
      await apiClient.updateContact(id, updates);
      webApp?.HapticFeedback.notificationOccurred('success');
      setEditing(false);
      setEditData({});
      // Refresh data
      const refreshed = await apiClient.getContact(id);
      setContact(refreshed);
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
      try {
        webApp?.showPopup({ message: 'Failed to save changes' /* TODO: i18n */ });
      } catch { /* showPopup may not be available */ }
    } finally {
      setSaving(false);
    }
  };

  // Telegram MainButton for Save in edit mode
  useEffect(() => {
    if (!webApp || !editing) return;

    const onSave = () => handleSaveRef.current?.();

    webApp.MainButton.setText('Save' /* TODO: i18n */);
    webApp.MainButton.show();
    webApp.MainButton.onClick(onSave);

    return () => {
      webApp.MainButton.offClick(onSave);
      webApp.MainButton.hide();
    };
  }, [webApp, editing]);

  // Update MainButton loading state
  useEffect(() => {
    if (!webApp || !editing) return;
    if (saving) {
      webApp.MainButton.showProgress(false);
    } else {
      webApp.MainButton.hideProgress();
    }
  }, [webApp, editing, saving]);

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

  function updateField(field: keyof ContactResponse, value: string) {
    setEditData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="miniapp-detail-enter">
      {/* Header with avatar */}
      <div className="miniapp-detail-header">
        <div className="miniapp-detail-avatar" style={{ background: getAvatarColor(fullName) }}>
          {initials}
        </div>
        <div className="miniapp-detail-name">{fullName}</div>
        {contact.company_name && !editing && (
          <div className="miniapp-detail-sub">{contact.company_name}</div>
        )}

        {/* Quick action buttons */}
        <div className="miniapp-detail-actions">
          {contact.phone && !editing && (
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

          {/* Edit button — between call and message */}
          {!editing && (
            <button className="miniapp-detail-action-btn" onClick={startEditing}>
              <div className="miniapp-detail-action-icon">
                <Pencil size={20} />
              </div>
              <span className="miniapp-detail-action-label">{'Edit' /* TODO: i18n */}</span>
            </button>
          )}

          {/* Cancel edit link */}
          {editing && (
            <button
              className="miniapp-detail-action-btn"
              onClick={cancelEditing}
              style={{ color: 'var(--ma-hint)' }}
            >
              <div className="miniapp-detail-action-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                <X size={20} />
              </div>
              <span className="miniapp-detail-action-label">{'Cancel' /* TODO: i18n */}</span>
            </button>
          )}

          {contact.phone && !editing && (
            <button className="miniapp-detail-action-btn" onClick={handleMessage}>
              <div className="miniapp-detail-action-icon">
                <MessageCircle size={20} />
              </div>
              <span className="miniapp-detail-action-label">{t('actions.message')}</span>
            </button>
          )}
          {contact.email && !editing && (
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
        {/* First Name */}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('contacts.firstName')}</span>
          {editing ? (
            <input
              style={editInputStyle}
              value={editData.first_name || ''}
              onChange={(e) => updateField('first_name', e.target.value)}
              placeholder={t('contacts.firstName')}
              autoFocus
            />
          ) : (
            <span className="miniapp-info-value">{contact.first_name || '\u2014'}</span>
          )}
        </div>

        {/* Last Name */}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('contacts.lastName')}</span>
          {editing ? (
            <input
              style={editInputStyle}
              value={editData.last_name || ''}
              onChange={(e) => updateField('last_name', e.target.value)}
              placeholder={t('contacts.lastName')}
            />
          ) : (
            <span className="miniapp-info-value">{contact.last_name || '\u2014'}</span>
          )}
        </div>

        {/* Phone */}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('detail.phone')}</span>
          {editing ? (
            <input
              style={editInputStyle}
              value={editData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder={t('detail.phone')}
              type="tel"
            />
          ) : contact.phone ? (
            <span className="miniapp-info-value">
              <a href={`tel:${contact.phone}`}>{formatPhone(contact.phone)}</a>
            </span>
          ) : (
            <span className="miniapp-info-value">{'\u2014'}</span>
          )}
        </div>

        {/* Email */}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{t('detail.email')}</span>
          {editing ? (
            <input
              style={editInputStyle}
              value={editData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder={t('detail.email')}
              type="email"
            />
          ) : contact.email ? (
            <span className="miniapp-info-value">
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </span>
          ) : (
            <span className="miniapp-info-value">{'\u2014'}</span>
          )}
        </div>

        {/* Position */}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{tFields('position')}</span>
          {editing ? (
            <input
              style={editInputStyle}
              value={editData.position || ''}
              onChange={(e) => updateField('position', e.target.value)}
              placeholder={tFields('position')}
            />
          ) : (
            <span className="miniapp-info-value">{contact.position || '\u2014'}</span>
          )}
        </div>

        {/* Company Name */}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">{'Company' /* TODO: i18n */}</span>
          {editing ? (
            <input
              style={editInputStyle}
              value={editData.company_name || ''}
              onChange={(e) => updateField('company_name', e.target.value)}
              placeholder={'Company' /* TODO: i18n */}
            />
          ) : (
            <span className="miniapp-info-value">{contact.company_name || '\u2014'}</span>
          )}
        </div>

        {/* Source — view only */}
        {!editing && contact.source && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.source')}</span>
            <span className="miniapp-info-value">{contact.source}</span>
          </div>
        )}

        {/* Created — view only */}
        {!editing && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.created')}</span>
            <span className="miniapp-info-value">{formatDate(contact.created_at)}</span>
          </div>
        )}
      </div>

      {/* Related counts — hide in edit mode */}
      {!editing && (
        <>
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
        </>
      )}
    </div>
  );
}
