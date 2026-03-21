'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input, Select, Spin, Tag, message } from 'antd';
import { ArrowLeftOutlined, PhoneOutlined, LinkOutlined, SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { PhoneIncoming, PhoneOutgoing } from '@/components/icons/custom-icons';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { CALL_DIRECTION_KEYS, CALL_STATUS_KEYS } from '@/lib/constants';
import type { CallEventResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

interface SearchResult { id: string; label: string; }

interface AutoLinkSuggestions {
  contacts?: Array<{ id: string; first_name?: string; last_name?: string; phone?: string }>;
  leads?: Array<{ id: string; title?: string }>;
  deals?: Array<{ id: string; title?: string }>;
}

const OUTCOME_KEYS = [
  { value: 'interested', key: 'interested', group: 'positive' },
  { value: 'appointment_scheduled', key: 'appointmentScheduled', group: 'positive' },
  { value: 'follow_up', key: 'followUp', group: 'positive' },
  { value: 'sale_made', key: 'saleMade', group: 'positive' },
  { value: 'no_answer', key: 'noAnswer', group: 'neutral' },
  { value: 'left_voicemail', key: 'leftVoicemail', group: 'neutral' },
  { value: 'busy', key: 'busy', group: 'neutral' },
  { value: 'callback_requested', key: 'callbackRequested', group: 'neutral' },
  { value: 'information_provided', key: 'informationProvided', group: 'neutral' },
  { value: 'not_interested', key: 'notInterested', group: 'negative' },
  { value: 'wrong_number', key: 'wrongNumber', group: 'negative' },
  { value: 'do_not_call', key: 'doNotCall', group: 'negative' },
  { value: 'customer_complaint', key: 'customerComplaint', group: 'negative' },
  { value: 'other', key: 'other', group: 'other' },
];

const outcomeColors: Record<string, string> = {
  interested: 'green',
  appointment_scheduled: 'green',
  follow_up: 'cyan',
  sale_made: 'gold',
  no_answer: 'orange',
  left_voicemail: 'orange',
  busy: 'orange',
  callback_requested: 'blue',
  information_provided: 'blue',
  not_interested: 'red',
  wrong_number: 'red',
  do_not_call: 'volcano',
  customer_complaint: 'magenta',
  other: 'default',
};

const stateColors: Record<string, string> = {
  ANSWER: 'green',
  NOANSWER: 'orange',
  BUSY: 'red',
  CANCEL: 'default',
  CONGESTION: 'red',
  CHANUNAVAIL: 'default',
};

export default function CallDetailPage() {
  const params = useParams()!;
  const router = useRouter();
  const callId = params.id as string;
  const t = useTranslations('calls');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tEntities = useTranslations('entities');
  const tDirections = useTranslations('directions');
  const tStatuses = useTranslations('statuses');

  const [call, setCall] = useState<CallEventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState('');
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [savingOutcome, setSavingOutcome] = useState(false);
  const [linkType, setLinkType] = useState<'contact' | 'lead' | 'deal'>('contact');
  const [linkEntityId, setLinkEntityId] = useState('');
  const [linkSearchResults, setLinkSearchResults] = useState<SearchResult[]>([]);
  const [linking, setLinking] = useState(false);
  const [suggestions, setSuggestions] = useState<AutoLinkSuggestions | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [loadingRecording, setLoadingRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioElRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadCall();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when ID changes
  }, [callId]);

  // Auto-load recording — try direct URL (native seeking), fall back to blob on error
  useEffect(() => {
    if (call?.has_recording && !loadedRef.current) {
      loadedRef.current = true;
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      setRecordingUrl(`${apiBase}/api/v1/company/recordings/${callId}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call?.has_recording]);

  // If direct URL fails (401 — cookies not sent), fall back to blob
  const handleAudioError = useCallback(() => {
    if (recordingUrl && !recordingUrl.startsWith('blob:')) {
      apiClient.getCallRecording(callId)
        .then(setRecordingUrl)
        .catch(() => {});
    }
  }, [recordingUrl, callId]);

  const togglePlay = useCallback(() => {
    const el = audioElRef.current;
    if (!el) return;
    if (el.paused) { el.play(); } else { el.pause(); }
  }, []);

  const seekToPosition = useCallback((clientX: number) => {
    const el = audioElRef.current;
    const bar = progressRef.current;
    if (!el || !bar || !el.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    el.currentTime = ratio * el.duration;
    setCurrentTime(el.currentTime);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    seekToPosition(e.clientX);
  }, [seekToPosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0 && e.pressure === 0) return;
    seekToPosition(e.clientX);
  }, [seekToPosition]);

  const formatTime = (secs: number) => {
    if (!secs || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const loadCall = async () => {
    setError(false);
    try {
      const data = await apiClient.getCall(callId);
      setCall(data);
      if (data.outcome) setOutcome(data.outcome);
      if (data.disposition_notes) setDispositionNotes(data.disposition_notes);
      const phone = data.phone_2 || data.phone_1;
      if (phone) {
        try {
          const sugg = await apiClient.getAutoLinkSuggestions(phone);
          setSuggestions(sugg);
        } catch {
          // Auto-link suggestions are optional — silently skip
        }
      }
    } catch {
      setError(true);
      message.error(tErrors('failedToLoadCall'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutcome = async () => {
    setSavingOutcome(true);
    try {
      await apiClient.setCallOutcome(callId, { outcome, disposition_notes: dispositionNotes || null });
      message.success(t('outcomeSaved'));
      loadCall();
    } catch (err) {
      message.error(tErrors('failedToSetOutcome'));
    } finally {
      setSavingOutcome(false);
    }
  };

  const handleLink = async () => {
    if (!linkEntityId) return;
    setLinking(true);
    try {
      const linkData: Record<string, string> = {};
      linkData[linkType + '_id'] = linkEntityId;
      await apiClient.linkCall(callId, linkData);
      message.success(t('callLinked'));
      setLinkEntityId('');
      setLinkSearchResults([]);
      loadCall();
    } catch (err) {
      message.error(tErrors('failedToLinkCall'));
    } finally {
      setLinking(false);
    }
  };

  const handleLinkSuggestion = async (type: string, id: string) => {
    try {
      const linkData: Record<string, string> = {};
      linkData[type + '_id'] = id;
      await apiClient.linkCall(callId, linkData);
      message.success(t('callLinked'));
      loadCall();
    } catch (err) {
      message.error(tErrors('failedToLinkCall'));
    }
  };

  const searchEntities = async (query: string) => {
    if (!query || query.length < 2) {
      setLinkSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      let results: SearchResult[] = [];
      if (linkType === 'contact') {
        const res = await apiClient.getContacts({ search: query, page: 1, page_size: 10 });
        results = res.items.map((c) => ({ id: c.id, label: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || c.phone || tCommon('unknown') }));
      } else if (linkType === 'lead') {
        const res = await apiClient.getLeads({ search: query, page: 1, page_size: 10 });
        results = res.items.map((l) => ({ id: l.id, label: l.title || tCommon('unknown') }));
      } else if (linkType === 'deal') {
        const res = await apiClient.getDeals({ search: query, page: 1, page_size: 10 });
        results = res.items.map((d) => ({ id: d.id, label: d.title || tCommon('unknown') }));
      }
      setLinkSearchResults(results);
    } catch {
      setLinkSearchResults([]);
      message.error(tErrors('failedToSearchEntities'));
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '\u2014';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) return `${hrs}:${pad(mins)}:${pad(secs)}`;
    return `${mins}:${pad(secs)}`;
  };

  const formatTimestamp = (ts?: number | null) => {
    if (!ts) return '\u2014';
    return new Date(ts * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-6 w-32 bg-gray-50 rounded animate-pulse" />
                <div className="h-5 w-5 bg-gray-50 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-12 bg-gray-50 rounded animate-pulse mb-2" />
                    <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 space-y-3">
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-9 bg-gray-50 rounded-lg animate-pulse" />
              <div className="h-20 bg-gray-50 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="glass-card p-6 space-y-3">
            <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-16 bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <EmptyStateCharacter height={115} variant="confused" />
        <h3 className="mt-5 text-lg font-semibold text-gray-800">{error ? tCommon('somethingWentWrong') : tErrors('notFoundTitle')}</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">{error ? tErrors('failedToLoadCall') : tErrors('notFoundSubtitle')}</p>
        <div className="flex gap-3 mt-4">
          {error && (
            <Button onClick={() => { setLoading(true); loadCall(); }}>{tCommon('tryAgain')}</Button>
          )}
          <Button type="primary" onClick={() => router.push('/calls')}>{tErrors('goBack')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 flex-wrap">
          <Button size="small" type="text"   onClick={() => router.push('/calls')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            {t('backToCalls')}
          </Button>
          {call.direction && (
            <Tag color={call.direction === 'inbound' ? 'blue' : call.direction === 'outbound' ? 'green' : 'default'}>
              {CALL_DIRECTION_KEYS[call.direction] ? tDirections(CALL_DIRECTION_KEYS[call.direction]) : call.direction}
            </Tag>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Call Information */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('callInformation')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-lg">{call.phone_1 || tCommon('unknown')}</span>
                {call.direction === 'inbound' ? (
                  <PhoneIncoming style={{ color: '#10b981', fontSize: 20 }} />
                ) : (
                  <PhoneOutgoing style={{ color: '#3b82f6', fontSize: 20 }} />
                )}
                <span className="font-medium text-lg">{call.phone_2 || tCommon('unknown')}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500 block">{tFields('status')}</span>
                  {call.state ? (
                    <Tag color={stateColors[call.state] || 'default'}>{CALL_STATUS_KEYS[call.state] ? tStatuses(CALL_STATUS_KEYS[call.state]) : call.state}</Tag>
                  ) : (
                    <span className="text-gray-400">{'\u2014'}</span>
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">{tFields('duration')}</span>
                  <span className="font-medium">{formatDuration(call.billing_sec)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">{tFields('created')}</span>
                  <span className="font-medium">{formatTimestamp(call.call_start_timestamp)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">{tFields('provider')}</span>
                  <Tag>{call.provider_type}</Tag>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">{t('attempts')}</span>
                  <span className="font-medium">{call.attempts ?? '\u2014'}</span>
                </div>
              </div>

              {call.has_recording && (
                <div className="mt-4 space-y-2">
                  <span className="text-sm text-gray-500 block">{tFields('recording')}</span>
                  {recordingUrl ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-secondary)] px-3 py-2.5">
                      {/* Hidden native audio element — browser handles buffering & playback */}
                      <audio
                        ref={audioElRef}
                        src={recordingUrl}
                        preload="auto"
                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
                        onError={handleAudioError}
                        className="hidden"
                      />
                      <button
                        onClick={togglePlay}
                        className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors border"
                        style={{
                          borderColor: 'hsl(var(--primary))',
                          color: 'hsl(var(--primary))',
                          background: 'transparent',
                        }}
                      >
                        {isPlaying ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12" rx="1" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" /></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5a.5.5 0 0 1 .75-.43l9 5.5a.5.5 0 0 1 0 .86l-9 5.5A.5.5 0 0 1 3 12.5v-11z" /></svg>
                        )}
                      </button>
                      <div
                        ref={progressRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        className="flex-1 py-3 cursor-pointer relative touch-none select-none"
                      >
                        <div className="h-1 rounded-full relative" style={{ background: 'var(--border-light)' }}>
                          <div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ width: `${progress}%`, background: 'hsl(var(--primary))' }}
                          />
                        </div>
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                          style={{
                            left: `calc(${progress}% - 6px)`,
                            background: 'hsl(var(--primary))',
                          }}
                        />
                      </div>
                      <span className="text-xs tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(currentTime)}/{formatTime(duration)}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
              {!call.has_recording && (
                <div className="mt-4">
                  <span className="text-sm text-gray-500">{t('noRecording')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Set Call Outcome */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('setCallOutcome')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              {call.outcome && (
                <div>
                  <span className="text-sm text-gray-500 mr-2">{tFields('outcome')}:</span>
                  <Tag color={outcomeColors[call.outcome] || 'default'}>
                    {(() => { const ok = OUTCOME_KEYS.find(o => o.value === call.outcome); return ok ? t(ok.key) : call.outcome; })()}
                  </Tag>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">{tFields('outcome')}</label>
                <Select
                  value={outcome || undefined}
                  onChange={(v) => setOutcome(v)}
                  placeholder={tCommon('setOutcome')}
                  style={{ width: '100%' }}
                  options={[
                    { label: t('positive'), options: OUTCOME_KEYS.filter(o => o.group === 'positive').map(o => ({ value: o.value, label: t(o.key) })) },
                    { label: t('neutral'), options: OUTCOME_KEYS.filter(o => o.group === 'neutral').map(o => ({ value: o.value, label: t(o.key) })) },
                    { label: t('negative'), options: OUTCOME_KEYS.filter(o => o.group === 'negative').map(o => ({ value: o.value, label: t(o.key) })) },
                    { label: t('other'), options: OUTCOME_KEYS.filter(o => o.group === 'other').map(o => ({ value: o.value, label: t(o.key) })) },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('dispositionNotes')}</label>
                <Input.TextArea
                  value={dispositionNotes}
                  onChange={(e) => setDispositionNotes(e.target.value)}
                  placeholder={t('dispositionNotes')}
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveOutcome} disabled={!outcome || savingOutcome}>
                {savingOutcome ? tActions('saving') : tActions('save')}
              </Button>
            </div>
          </div>

          {/* Link to CRM Entity */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('linkToEntity')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex flex-wrap gap-2">
                {call.contact_id && (
                  <Link href={`/contacts/${call.contact_id}`}>
                    <Tag color="blue" className="cursor-pointer">{tEntities('contact')}: {call.contact_id}</Tag>
                  </Link>
                )}
                {call.lead_id && (
                  <Link href={`/leads/${call.lead_id}`}>
                    <Tag color="green" className="cursor-pointer">{tEntities('lead')}: {call.lead_id}</Tag>
                  </Link>
                )}
                {call.deal_id && (
                  <Link href={`/deals/${call.deal_id}`}>
                    <Tag color="purple" className="cursor-pointer">{tEntities('deal')}: {call.deal_id}</Tag>
                  </Link>
                )}
                {!call.contact_id && !call.lead_id && !call.deal_id && (
                  <span className="text-sm text-gray-500">{tCommon('noDataFound')}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tFields('entityType')}</label>
                  <Select
                    value={linkType}
                    onChange={(v) => { setLinkType(v); setLinkEntityId(''); setLinkSearchResults([]); }}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'contact', label: tEntities('contact') },
                      { value: 'lead', label: tEntities('lead') },
                      { value: 'deal', label: tEntities('deal') },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('searchEntities')}</label>
                  <Select
                    showSearch
                    value={linkEntityId || undefined}
                    placeholder={t('searchEntities')}
                    filterOption={false}
                    onSearch={searchEntities}
                    onChange={(v) => setLinkEntityId(v)}
                    loading={searchLoading}
                    style={{ width: '100%' }}
                    options={linkSearchResults.map(r => ({ value: r.id, label: r.label }))}
                    notFoundContent={searchLoading ? <Spin size="small" /> : null}
                  />
                </div>
                <Button onClick={handleLink} disabled={!linkEntityId || linking}>
                  <LinkOutlined style={{ marginRight: 8 }} />
                  {linking ? tActions('saving') : tActions('connect')}
                </Button>
              </div>
            </div>
          </div>

          {/* Auto-Link Suggestions */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('autoLinkSuggestions')}</h3>
            </div>
            <div className="p-6 pt-0">
              {suggestions ? (
                <div className="space-y-3">
                  {(suggestions.contacts?.length ?? 0) > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">{tEntities('contacts')}</span>
                      {suggestions.contacts!.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <span>{c.first_name || ''} {c.last_name || ''} {c.phone ? `(${c.phone})` : ''}</span>
                          <Button size="small" type="default"   onClick={() => handleLinkSuggestion('contact', c.id)}>
                            <LinkOutlined style={{ marginRight: 4 }} /> {tActions('connect')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(suggestions.leads?.length ?? 0) > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">{tEntities('leads')}</span>
                      {suggestions.leads!.map((l) => (
                        <div key={l.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <span>{l.title || tCommon('unknown')}</span>
                          <Button size="small" type="default"   onClick={() => handleLinkSuggestion('lead', l.id)}>
                            <LinkOutlined style={{ marginRight: 4 }} /> {tActions('connect')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(suggestions.deals?.length ?? 0) > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">{tEntities('deals')}</span>
                      {suggestions.deals!.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <span>{d.title || tCommon('unknown')}</span>
                          <Button size="small" type="default"   onClick={() => handleLinkSuggestion('deal', d.id)}>
                            <LinkOutlined style={{ marginRight: 4 }} /> {tActions('connect')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!suggestions.contacts?.length && !suggestions.leads?.length && !suggestions.deals?.length) && (
                    <p className="text-sm text-gray-500 text-center py-4">{tCommon('noDataFound')}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">{tCommon('noDataFound')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Call Summary */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{tCommon('summary')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{tFields('outcome')}</span>
                {call.outcome ? (
                  <Tag color={outcomeColors[call.outcome] || 'default'}>
                    {(() => { const ok = OUTCOME_KEYS.find(o => o.value === call.outcome); return ok ? t(ok.key) : call.outcome; })()}
                  </Tag>
                ) : (
                  <span className="text-gray-400">{'\u2014'}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{tFields('duration')}</span>
                <span className="font-medium">{formatDuration(call.billing_sec)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{tFields('direction')}</span>
                <span className="font-medium">{call.direction ? (CALL_DIRECTION_KEYS[call.direction] ? tDirections(CALL_DIRECTION_KEYS[call.direction]) : call.direction) : '\u2014'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{tFields('status')}</span>
                {call.state ? (
                  <Tag color={stateColors[call.state] || 'default'}>{CALL_STATUS_KEYS[call.state] ? tStatuses(CALL_STATUS_KEYS[call.state]) : call.state}</Tag>
                ) : (
                  <span className="text-gray-400">{'\u2014'}</span>
                )}
              </div>
              <div className="border-t pt-3 mt-3 space-y-2">
                <span className="text-sm text-gray-500 block">{tFields('linkedEntity')}:</span>
                {call.contact_id ? (
                  <Link href={`/contacts/${call.contact_id}`} className="text-sm text-blue-600 hover:underline block">
                    {tEntities('contact')}
                  </Link>
                ) : null}
                {call.lead_id ? (
                  <Link href={`/leads/${call.lead_id}`} className="text-sm text-blue-600 hover:underline block">
                    {tEntities('lead')}
                  </Link>
                ) : null}
                {call.deal_id ? (
                  <Link href={`/deals/${call.deal_id}`} className="text-sm text-blue-600 hover:underline block">
                    {tEntities('deal')}
                  </Link>
                ) : null}
                {!call.contact_id && !call.lead_id && !call.deal_id && (
                  <span className="text-sm text-gray-400">{'\u2014'}</span>
                )}
              </div>
            </div>
          </div>

          {/* UTM Tracking */}
          {(call.utm_source || call.utm_medium || call.utm_campaign) && (
            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">{t('utmTracking')}</h3>
              </div>
              <div className="p-6 pt-0 space-y-3">
                {call.utm_source && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{tFields('source')}</span>
                    <Tag bordered>{call.utm_source}</Tag>
                  </div>
                )}
                {call.utm_medium && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('medium')}</span>
                    <Tag bordered>{call.utm_medium}</Tag>
                  </div>
                )}
                {call.utm_campaign && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('campaign')}</span>
                    <Tag bordered>{call.utm_campaign}</Tag>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
