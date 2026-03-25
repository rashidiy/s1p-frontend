'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, BarChart3, ChevronRight, X, Plus } from 'lucide-react';
import { Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { LeadResponse, DealResponse } from '@/types/api';
import { formatAmount, formatPhone, formatDate, STATUS_BADGE, ALL_STATUSES, STAGE_BADGE, ALL_STAGES } from '../_utils';

const PAGE_SIZE = 30;

type ViewMode = 'leads' | 'deals';

const SOURCE_OPTIONS = ['phone', 'website', 'referral', 'other'];

function formatRelativeTime(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now'; /* TODO: i18n */
    if (diffMin < 60) return `${diffMin}m ago`; /* TODO: i18n */
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`; /* TODO: i18n */
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `${diffD}d ago`; /* TODO: i18n */
    const diffMo = Math.floor(diffD / 30);
    return `${diffMo}mo ago`; /* TODO: i18n */
  } catch {
    return '';
  }
}

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

interface NewLeadFormProps {
  phone: string;
  onSave: (data: { title: string; source?: string; estimated_value?: number }) => Promise<void>;
  onCancel: () => void;
  t: ReturnType<typeof useTranslations>;
}

function NewLeadForm({ phone, onSave, onCancel, t }: NewLeadFormProps) {
  const defaultTitle = phone ? t('pipeline.leadFrom', { phone: formatPhone(phone) }) : '';
  const [title, setTitle] = useState(defaultTitle);
  const [source, setSource] = useState('phone');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        source: source || undefined,
        estimated_value: estimatedValue ? parseFloat(estimatedValue) : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="miniapp-create-contact-form">
      <div className="miniapp-create-contact-header">
        <span style={{ fontWeight: 600, fontSize: 15 }}>{t('pipeline.newLead')}</span>
        <button className="miniapp-create-contact-close" onClick={onCancel}>
          <X size={14} />
        </button>
      </div>
      {phone && <div className="miniapp-create-contact-phone">{formatPhone(phone)}</div>}

      <label style={{ fontSize: 13, color: 'var(--ma-hint)', marginBottom: 4, display: 'block' }}>
        {t('pipeline.leadTitle')} *
      </label>
      <input
        className="miniapp-create-contact-input"
        placeholder={t('pipeline.leadTitle')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />

      <label style={{ fontSize: 13, color: 'var(--ma-hint)', marginBottom: 4, marginTop: 12, display: 'block' }}>
        {t('pipeline.source')}
      </label>
      <select
        className="miniapp-create-contact-input"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        style={{ appearance: 'auto' }}
      >
        <option value="">—</option>
        {SOURCE_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <label style={{ fontSize: 13, color: 'var(--ma-hint)', marginBottom: 4, marginTop: 12, display: 'block' }}>
        {t('pipeline.estimatedValue')}
      </label>
      <input
        className="miniapp-create-contact-input"
        placeholder={t('pipeline.estimatedValue')}
        value={estimatedValue}
        onChange={(e) => setEstimatedValue(e.target.value)}
        type="number"
        inputMode="numeric"
      />

      <button
        className="miniapp-note-submit"
        onClick={handleSubmit}
        disabled={!title.trim() || saving}
        style={{ marginTop: 12 }}
      >
        {saving ? '...' : t('pipeline.createLead')}
      </button>
    </div>
  );
}

export default function PipelinePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'deals' ? 'deals' : 'leads';
  const newLeadParam = searchParams.get('new_lead') === '1';
  const phoneParam = searchParams.get('phone') || '';
  const [viewMode, setViewMode] = useState<ViewMode>(initialTab);
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string>('');
  const [showNewLeadForm, setShowNewLeadForm] = useState(newLeadParam);
  const { webApp } = useTelegramWebApp();
  const router = useRouter();
  const t = useTranslations('miniapp');
  const tStatus = useTranslations('statuses');

  const loadLeads = useCallback(async (statusFilter?: string, pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(false);
    try {
      const res = await apiClient.getLeads({
        page: pageNum,
        page_size: PAGE_SIZE,
        status_filter: statusFilter || undefined,
      });
      const items = res.items || [];
      if (pageNum === 1) setLeads(items);
      else setLeads(prev => [...prev, ...items]);
      setHasMore(items.length === PAGE_SIZE);
      setPage(pageNum);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadDeals = useCallback(async (stageFilter?: string, pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(false);
    try {
      const res = await apiClient.getDeals({
        page: pageNum,
        page_size: PAGE_SIZE,
        stage: stageFilter || undefined,
      });
      const items = res.items || [];
      if (pageNum === 1) setDeals(items);
      else setDeals(prev => [...prev, ...items]);
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
    setFilter('');
    setPage(1);
    if (viewMode === 'leads') loadLeads();
    else loadDeals();
  }, [viewMode, loadLeads, loadDeals]);

  function handleFilter(value: string) {
    webApp?.HapticFeedback.selectionChanged();
    const newFilter = filter === value ? '' : value;
    setFilter(newFilter);
    if (viewMode === 'leads') loadLeads(newFilter);
    else loadDeals(newFilter);
  }

  function handleLoadMore() {
    webApp?.HapticFeedback.selectionChanged();
    if (viewMode === 'leads') loadLeads(filter, page + 1);
    else loadDeals(filter, page + 1);
  }

  function switchView(mode: ViewMode) {
    if (mode === viewMode) return;
    webApp?.HapticFeedback.selectionChanged();
    setViewMode(mode);
  }

  function dismissNewLeadForm() {
    setShowNewLeadForm(false);
    // Remove query params from URL without navigation
    router.replace('/miniapp/pipeline', { scroll: false });
  }

  async function handleCreateLead(data: { title: string; source?: string; estimated_value?: number }) {
    try {
      const created = await apiClient.createLead({
        title: data.title,
        source: data.source || null,
        estimated_value: data.estimated_value || null,
        currency: 'UZS',
      });
      webApp?.HapticFeedback.notificationOccurred('success');
      router.replace(`/miniapp/leads/${created.id}`);
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
      try {
        webApp?.showPopup({ message: t('error.loadFailed') });
      } catch { /* showPopup may not be available */ }
    }
  }

  function handleFabClick() {
    webApp?.HapticFeedback.impactOccurred('medium');
    setShowNewLeadForm(true);
  }

  const filterOptions = viewMode === 'leads' ? ALL_STATUSES : ALL_STAGES;
  const badgeMap = viewMode === 'leads' ? STATUS_BADGE : STAGE_BADGE;

  return (
    <div className="miniapp-page-enter">
      <div className="miniapp-page-title">{t('pipeline.title')}</div>

      {/* New lead creation form */}
      {showNewLeadForm && (
        <div className="miniapp-section" style={{ marginBottom: 8 }}>
          <NewLeadForm
            phone={phoneParam}
            onSave={handleCreateLead}
            onCancel={dismissNewLeadForm}
            t={t}
          />
        </div>
      )}

      {/* Segmented control */}
      <div className="miniapp-segment">
        <button
          className={`miniapp-segment-btn ${viewMode === 'leads' ? 'active' : ''}`}
          onClick={() => switchView('leads')}
        >
          {t('pipeline.leads')}
        </button>
        <button
          className={`miniapp-segment-btn ${viewMode === 'deals' ? 'active' : ''}`}
          onClick={() => switchView('deals')}
        >
          {t('pipeline.deals')}
        </button>
      </div>

      {/* Filter chips */}
      <div className="miniapp-chips">
        <button
          className={`miniapp-chip ${!filter ? 'active' : ''}`}
          onClick={() => {
            setFilter('');
            webApp?.HapticFeedback.selectionChanged();
            if (viewMode === 'leads') loadLeads();
            else loadDeals();
          }}
        >
          {viewMode === 'leads' ? t('leads.all') : t('deals.all')}
        </button>
        {filterOptions.map((s) => (
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
      ) : viewMode === 'leads' ? (
        leads.length === 0 ? (
          <div className="miniapp-empty">
            <div className="miniapp-empty-icon"><TrendingUp size={24} /></div>
            <div className="miniapp-empty-title">{t('leads.noLeads')}</div>
            <div className="miniapp-empty-sub">{t('leads.emptyDescription')}</div>
          </div>
        ) : (
          <div className="miniapp-section">
            <div className="miniapp-list">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="miniapp-list-item"
                  onClick={() => {
                    webApp?.HapticFeedback.impactOccurred('light');
                    router.push(`/miniapp/leads/${lead.id}`);
                  }}
                >
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-title">{lead.title || t('detail.untitled')}</div>
                    <div className="miniapp-list-item-sub">
                      {[
                        lead.source,
                        lead.estimated_value ? formatAmount(lead.estimated_value) : null,
                      ].filter(Boolean).join(' · ')}
                    </div>
                    {/* Rich metadata */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                      {lead.contact_name && (
                        <span style={{ fontSize: 11, color: 'var(--ma-hint, #999)' }}>
                          {lead.contact_name}
                        </span>
                      )}
                      {lead.assigned_to_name && (
                        <span style={{ fontSize: 11, color: 'var(--ma-hint, #999)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <span style={{
                            width: 14, height: 14, borderRadius: '50%',
                            background: 'var(--ma-accent, #2563eb)', color: '#fff',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, fontWeight: 600, flexShrink: 0,
                          }}>
                            {lead.assigned_to_name.charAt(0).toUpperCase()}
                          </span>
                          {lead.assigned_to_name}
                        </span>
                      )}
                      {lead.created_at && (
                        <span style={{ fontSize: 11, color: 'var(--ma-hint, #999)' }}>
                          {formatRelativeTime(lead.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`miniapp-badge ${STATUS_BADGE[lead.status || ''] || 'miniapp-badge-default'}`}>
                    {tStatus(lead.status || 'new')}
                  </span>
                  <div className="miniapp-list-item-chevron"><ChevronRight size={16} /></div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="miniapp-section-footer" onClick={handleLoadMore}>
                {loadingMore ? <Spin size="small" /> : t('loadMore')}
              </div>
            )}
          </div>
        )
      ) : (
        deals.length === 0 ? (
          <div className="miniapp-empty">
            <div className="miniapp-empty-icon"><BarChart3 size={24} /></div>
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
                      {/* Rich metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                        {deal.contact_name && (
                          <span style={{ fontSize: 11, color: 'var(--ma-hint, #999)' }}>
                            {deal.contact_name}
                          </span>
                        )}
                        {deal.probability != null && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ma-hint, #999)' }}>
                            <span style={{
                              width: 40, height: 4, borderRadius: 2,
                              background: 'var(--ma-border, #eee)', overflow: 'hidden',
                              display: 'inline-block',
                            }}>
                              <span style={{
                                display: 'block', height: '100%', borderRadius: 2,
                                width: `${Math.min(100, Math.max(0, deal.probability))}%`,
                                background: deal.probability >= 70 ? '#22c55e' : deal.probability >= 40 ? '#f59e0b' : '#ef4444',
                              }} />
                            </span>
                            {deal.probability}%
                          </span>
                        )}
                        {deal.expected_close_date && (
                          <span style={{ fontSize: 11, color: 'var(--ma-hint, #999)' }}>
                            {formatDate(String(deal.expected_close_date))}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`miniapp-badge ${badgeMap[stage] || 'miniapp-badge-default'}`}>
                      {tStatus(stage)}
                    </span>
                    <div className="miniapp-list-item-chevron"><ChevronRight size={16} /></div>
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
        )
      )}

      {/* FAB — quick create lead (only on leads tab) */}
      {viewMode === 'leads' && !showNewLeadForm && (
        <button
          onClick={handleFabClick}
          style={{
            position: 'fixed', bottom: 90, right: 20,
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--ma-accent, #2563eb)', color: '#fff',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            zIndex: 50,
          }}
          aria-label="Create lead" /* TODO: i18n */
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
