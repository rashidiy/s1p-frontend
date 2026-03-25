'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, ChevronRight, ChevronDown, X as XIcon, Check } from 'lucide-react';
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

const LEAD_STEPS = ['new', 'contacted', 'qualified', 'converted'];

const LEAD_NEXT_STATUSES: Record<string, string[]> = {
  new: ['contacted', 'unqualified', 'lost'],
  contacted: ['qualified', 'unqualified', 'lost'],
  qualified: ['convert', 'lost'],
};

function LeadProgressSteps({ status }: { status: string }) {
  const isTerminal = status === 'lost' || status === 'unqualified';
  const currentIndex = LEAD_STEPS.indexOf(status);

  if (isTerminal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', gap: 6 }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#ef4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <XIcon size={10} color="#fff" />
        </div>
        <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
          {status === 'lost' ? 'Lost' : 'Unqualified'} {/* TODO: i18n */}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', gap: 0 }}>
      {LEAD_STEPS.map((step, i) => {
        const isCompleted = currentIndex >= 0 && i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = currentIndex >= 0 ? i > currentIndex : true;

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 20 }}>
              {isCompleted ? (
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: 'var(--ma-accent, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={8} color="#fff" />
                </div>
              ) : isCurrent ? (
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '2px solid var(--ma-accent, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--ma-accent, #2563eb)',
                  }} />
                </div>
              ) : (
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: '2px solid var(--ma-hint, #999)',
                }} />
              )}
              <span style={{
                fontSize: 9, marginTop: 3,
                color: isFuture ? 'var(--ma-hint, #999)' : 'var(--ma-accent, #2563eb)',
                fontWeight: isCurrent ? 600 : 400,
                textTransform: 'capitalize',
              }}>
                {step}
              </span>
            </div>
            {/* Connector line */}
            {i < LEAD_STEPS.length - 1 && (
              <div style={{
                width: 28, height: 2, marginBottom: 14,
                background: isCompleted ? 'var(--ma-accent, #2563eb)' : 'var(--ma-hint, #ddd)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<LeadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tStatus = useTranslations('statuses');

  const goBack = useCallback(() => {
    router.push('/miniapp/pipeline');
  }, [router]);

  const loadLead = useCallback(async () => {
    try {
      const data = await apiClient.getLead(id);
      setLead(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

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

  // MainButton for status actions
  const getMainButtonConfig = useCallback(() => {
    if (!lead) return null;
    const status = lead.status || '';
    switch (status) {
      case 'new':
        return { text: t('actions.markContacted'), nextStatus: 'contacted' };
      case 'contacted':
        return { text: t('actions.markQualified'), nextStatus: 'qualified' };
      case 'qualified':
        return { text: t('actions.convertToDeal'), nextStatus: 'convert' };
      default:
        return null;
    }
  }, [lead, t]);

  const handleMainButtonClick = useCallback(async () => {
    const config = getMainButtonConfig();
    if (!config || !lead || actionLoading) return;

    setActionLoading(true);
    try {
      if (config.nextStatus === 'convert') {
        await apiClient.convertLead(lead.id, true);
      } else {
        await apiClient.updateLead(lead.id, { status: config.nextStatus });
      }
      webApp?.HapticFeedback.notificationOccurred('success');
      // Refresh lead data
      const updated = await apiClient.getLead(id);
      setLead(updated);
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
      try {
        webApp?.showPopup({ message: t('error.loadFailed') });
      } catch {
        // showPopup may not be available
      }
    } finally {
      setActionLoading(false);
    }
  }, [getMainButtonConfig, lead, actionLoading, webApp, id, t]);

  useEffect(() => {
    if (!webApp || loading) return;
    const config = getMainButtonConfig();
    if (config) {
      webApp.MainButton.setText(config.text);
      webApp.MainButton.show();
      webApp.MainButton.onClick(handleMainButtonClick);
      if (actionLoading) {
        webApp.MainButton.showProgress(true);
      } else {
        webApp.MainButton.hideProgress();
      }
      return () => {
        webApp.MainButton.offClick(handleMainButtonClick);
        webApp.MainButton.hide();
      };
    } else {
      webApp.MainButton.hide();
    }
  }, [webApp, loading, getMainButtonConfig, handleMainButtonClick, actionLoading]);

  async function handleSaveNote() {
    if (!noteText.trim() || !lead || savingNote) return;
    setSavingNote(true);
    try {
      await apiClient.createNote({
        entity_type: 'lead',
        entity_id: lead.id,
        content: noteText.trim(),
      });
      webApp?.HapticFeedback.notificationOccurred('success');
      setNoteText('');
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setSavingNote(false);
    }
  }

  async function handleStatusChange(nextStatus: string) {
    if (!lead || actionLoading) return;
    setStatusDropdownOpen(false);
    setActionLoading(true);
    try {
      if (nextStatus === 'convert') {
        await apiClient.convertLead(lead.id, true);
      } else {
        await apiClient.updateLead(lead.id, { status: nextStatus });
      }
      webApp?.HapticFeedback.notificationOccurred('success');
      const updated = await apiClient.getLead(id);
      setLead(updated);
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setActionLoading(false);
    }
  }

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
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span
            className={`miniapp-badge miniapp-detail-badge ${STATUS_BADGE[status] || 'miniapp-badge-default'}`}
            style={{ cursor: LEAD_NEXT_STATUSES[status] ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() => {
              if (LEAD_NEXT_STATUSES[status]) {
                webApp?.HapticFeedback.selectionChanged();
                setStatusDropdownOpen(!statusDropdownOpen);
              }
            }}
          >
            {tStatus(status)}
            {LEAD_NEXT_STATUSES[status] && <ChevronDown size={12} />}
          </span>
          {/* Status change dropdown */}
          {statusDropdownOpen && LEAD_NEXT_STATUSES[status] && (
            <>
              <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                onClick={() => setStatusDropdownOpen(false)}
              />
              <div style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                marginTop: 4, background: 'var(--ma-card-bg, #fff)', borderRadius: 10,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100,
                minWidth: 160, overflow: 'hidden',
              }}>
                {LEAD_NEXT_STATUSES[status].map((ns) => {
                  const label = ns === 'convert' ? (t('actions.convertToDeal')) : tStatus(ns);
                  const badgeClass = ns === 'convert' ? 'miniapp-badge-purple' : (STATUS_BADGE[ns] || 'miniapp-badge-default');
                  return (
                    <div
                      key={ns}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', fontSize: 14,
                        display: 'flex', alignItems: 'center', gap: 8,
                        borderBottom: '1px solid var(--ma-border, #eee)',
                      }}
                      onClick={() => handleStatusChange(ns)}
                    >
                      <span className={`miniapp-badge ${badgeClass}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Progress steps */}
        <LeadProgressSteps status={status} />

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
          <div
            className="miniapp-info-row"
            style={{ cursor: lead.contact_id ? 'pointer' : 'default' }}
            onClick={() => {
              if (lead.contact_id) {
                webApp?.HapticFeedback.impactOccurred('light');
                router.push(`/miniapp/contacts/${lead.contact_id}`);
              }
            }}
          >
            <span className="miniapp-info-label">{t('detail.contact')}</span>
            <span className="miniapp-info-value" style={{ color: lead.contact_id ? 'var(--ma-link)' : undefined }}>
              {lead.contact_name}
              {lead.contact_id && <ChevronRight size={14} style={{ marginLeft: 4 }} />}
            </span>
          </div>
        )}
        {lead.assigned_to_name && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.assignedTo')}</span>
            <span className="miniapp-info-value">
              <User size={12} style={{ marginRight: 4 }} />
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

      {/* Add note input */}
      <div className="miniapp-section-header">{t('actions.addNote')}</div>
      <div className="miniapp-section" style={{ padding: '12px 16px' }}>
        <textarea
          className="miniapp-note-input"
          placeholder={t('actions.addNote')}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
        />
        {noteText.trim() && (
          <button
            className="miniapp-note-submit"
            onClick={handleSaveNote}
            disabled={savingNote}
          >
            {savingNote ? '...' : t('actions.save')}
          </button>
        )}
      </div>
    </div>
  );
}
