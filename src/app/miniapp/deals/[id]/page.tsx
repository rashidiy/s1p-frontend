'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, ChevronRight, Check, X as XIcon } from 'lucide-react';
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

const DEAL_STEPS = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'];

function DealProgressSteps({ stage }: { stage: string }) {
  const isWon = stage === 'closed_won';
  const isLost = stage === 'closed_lost';
  const currentIndex = DEAL_STEPS.indexOf(stage);

  if (isLost) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', gap: 6 }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#ef4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <XIcon size={10} color="#fff" />
        </div>
        <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
          Closed Lost {/* TODO: i18n */}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', gap: 0 }}>
      {DEAL_STEPS.map((step, i) => {
        const isCompleted = currentIndex >= 0 && i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = currentIndex >= 0 ? i > currentIndex : true;
        const isLastStep = i === DEAL_STEPS.length - 1;

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 20 }}>
              {isLastStep && isWon ? (
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#22c55e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={10} color="#fff" />
                </div>
              ) : isCompleted ? (
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
                fontSize: 8, marginTop: 3,
                color: isFuture && !isWon ? 'var(--ma-hint, #999)' : (isWon && isLastStep ? '#22c55e' : 'var(--ma-accent, #2563eb)'),
                fontWeight: isCurrent || (isWon && isLastStep) ? 600 : 400,
                textTransform: 'capitalize', whiteSpace: 'nowrap',
              }}>
                {isLastStep ? 'Won' : step} {/* TODO: i18n */}
              </span>
            </div>
            {/* Connector line */}
            {i < DEAL_STEPS.length - 1 && (
              <div style={{
                width: 20, height: 2, marginBottom: 14,
                background: isCompleted ? 'var(--ma-accent, #2563eb)' : 'var(--ma-hint, #ddd)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tStatus = useTranslations('statuses');

  const goBack = useCallback(() => {
    router.push('/miniapp/pipeline');
  }, [router]);

  const loadDeal = useCallback(async () => {
    try {
      const data = await apiClient.getDeal(id);
      setDeal(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDeal();
  }, [loadDeal]);

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

  // Close Deal action handler
  const handleCloseDeal = useCallback(async () => {
    if (!deal || !webApp || actionLoading) return;

    webApp.showPopup(
      {
        title: t('actions.closeDeal'),
        message: deal.title || t('detail.untitled'),
        buttons: [
          { id: 'won', type: 'default', text: t('actions.won') },
          { id: 'lost', type: 'destructive', text: t('actions.lost') },
          { id: 'cancel', type: 'cancel' },
        ],
      },
      async (buttonId: string) => {
        if (buttonId === 'cancel') return;
        setActionLoading(true);
        try {
          if (buttonId === 'won') {
            await apiClient.markDealWon(deal.id);
          } else if (buttonId === 'lost') {
            await apiClient.markDealLost(deal.id);
          }
          webApp.HapticFeedback.notificationOccurred('success');
          const updated = await apiClient.getDeal(id);
          setDeal(updated);
        } catch {
          webApp.HapticFeedback.notificationOccurred('error');
        } finally {
          setActionLoading(false);
        }
      }
    );
  }, [deal, webApp, actionLoading, id, t]);

  // MainButton for closing deals in negotiation stage
  useEffect(() => {
    if (!webApp || loading) return;
    const stage = deal?.stage || '';
    const isCloseable = stage === 'negotiation' || stage === 'proposal' || stage === 'qualification';

    if (deal && isCloseable) {
      webApp.MainButton.setText(t('actions.closeDeal'));
      webApp.MainButton.show();
      webApp.MainButton.onClick(handleCloseDeal);
      if (actionLoading) {
        webApp.MainButton.showProgress(true);
      } else {
        webApp.MainButton.hideProgress();
      }
      return () => {
        webApp.MainButton.offClick(handleCloseDeal);
        webApp.MainButton.hide();
      };
    } else {
      webApp.MainButton.hide();
    }
  }, [webApp, loading, deal, handleCloseDeal, actionLoading, t]);

  async function handleSaveNote() {
    if (!noteText.trim() || !deal || savingNote) return;
    setSavingNote(true);
    try {
      await apiClient.createNote({
        entity_type: 'deal',
        entity_id: deal.id,
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

        {/* Progress steps */}
        <DealProgressSteps stage={stage} />

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
          <div
            className="miniapp-info-row"
            style={{ cursor: deal.contact_id ? 'pointer' : 'default' }}
            onClick={() => {
              if (deal.contact_id) {
                webApp?.HapticFeedback.impactOccurred('light');
                router.push(`/miniapp/contacts/${deal.contact_id}`);
              }
            }}
          >
            <span className="miniapp-info-label">{t('detail.contact')}</span>
            <span className="miniapp-info-value" style={{ color: deal.contact_id ? 'var(--ma-link)' : undefined }}>
              {deal.contact_name}
              {deal.contact_id && <ChevronRight size={14} style={{ marginLeft: 4 }} />}
            </span>
          </div>
        )}
        {deal.assigned_to_name && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">{t('detail.assignedTo')}</span>
            <span className="miniapp-info-value">
              <User size={12} style={{ marginRight: 4 }} />
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
