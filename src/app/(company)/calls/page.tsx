'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DatePicker, Input, Button, Tag, Select, Pagination, Checkbox, Modal, message, Segmented, Switch } from 'antd';
import dayjs from 'dayjs';
import { PhoneOutlined, LoadingOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { PhoneIncoming, PhoneOutgoing } from '@/components/icons/custom-icons';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth';
import {
  CALL_DIRECTION_KEYS,
  CALL_DIRECTION_COLORS,
  CALL_STATUS_KEYS,
  CALL_STATUS_COLORS,
  CALL_DIRECTION_OPTIONS,
} from '@/lib/constants';
import type { CallEventResponse, ContactResponse, PaginatedResponse, SipuniOperator } from '@/types/api';
import { EmptyStateCharacter, ErrorCharacter } from '@/components/illustrations';

type CallType = 'external' | 'number' | 'tree';

export default function CallsPage() {
  const router = useRouter();
  const t = useTranslations('calls');
  const tFields = useTranslations('fields');
  const tDirections = useTranslations('directions');
  const tStatuses = useTranslations('statuses');

  const outcomeOptions = [
    { value: 'interested', label: t('interested') },
    { value: 'appointment_scheduled', label: t('appointmentScheduled') },
    { value: 'follow_up', label: t('followUp') },
    { value: 'sale_made', label: t('saleMade') },
    { value: 'no_answer', label: t('noAnswer') },
    { value: 'left_voicemail', label: t('leftVoicemail') },
    { value: 'busy', label: t('busy') },
    { value: 'callback_requested', label: t('callbackRequested') },
    { value: 'information_provided', label: t('informationProvided') },
    { value: 'not_interested', label: t('notInterested') },
    { value: 'wrong_number', label: t('wrongNumber') },
    { value: 'do_not_call', label: t('doNotCall') },
    { value: 'customer_complaint', label: t('customerComplaint') },
    { value: 'other', label: t('other') },
  ];
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const [data, setData] = useState<PaginatedResponse<CallEventResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState('');
  const [outcome, setOutcome] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [myCalls, setMyCalls] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callType, setCallType] = useState<CallType>('external');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [operatorSip, setOperatorSip] = useState('');
  const [reverse, setReverse] = useState(false);
  const [antiaon, setAntiaon] = useState(false);
  const [treeId, setTreeId] = useState('');
  const [attemptDuration, setAttemptDuration] = useState(30);
  const [phoneError, setPhoneError] = useState('');
  const [contactSearchValue, setContactSearchValue] = useState('');
  const [contactOptions, setContactOptions] = useState<{ label: string; value: string }[]>([]);
  const [contactSearching, setContactSearching] = useState(false);
  const [sipOperators, setSipOperators] = useState<SipuniOperator[]>([]);
  const [operatorsLoading, setOperatorsLoading] = useState(false);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user, isOperator } = useAuthStore();

  useEffect(() => {
    if (!searchInput) return;
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filters change
  useEffect(() => { loadCallHistory(); }, [page, search, direction, outcome, dateFrom, dateTo, myCalls]);

  // Auto-refresh every 5 seconds to show ringing/answer states quickly
  useEffect(() => {
    const interval = setInterval(() => { loadCallHistory(true); }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, direction, outcome, dateFrom, dateTo, myCalls]);

  const loadCallHistory = async (silent = false) => {
    if (!silent) { setLoading(true); setError(false); }
    try {
      const result = await apiClient.getCallHistory({ page, page_size: 20, search: search || undefined, direction: direction || undefined, outcome: outcome || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined, my_calls: myCalls || undefined });
      setData(result);
    } catch { if (!silent) { setError(true); message.error(tErrors('failedToLoadCalls')); } }
    finally { if (!silent) setLoading(false); }
  };

  const recentNumbers = useMemo(() => {
    if (!data?.items) return [];
    const seen = new Set<string>();
    const nums: string[] = [];
    for (const call of data.items) {
      for (const ph of [call.phone_2, call.phone_1]) {
        if (ph && !seen.has(ph)) {
          seen.add(ph);
          nums.push(ph);
          if (nums.length >= 5) return nums;
        }
      }
    }
    return nums;
  }, [data]);

  const isValidPhone = (phone: string) => /^\+\d{7,15}$/.test(phone);

  // Phone formatting helpers — store national digits only, display with spaces
  const formatNational = (digits: string) => {
    const d = digits.replace(/\D/g, '').slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
    if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
    return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
  };
  const toNationalDigits = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('998') && clean.length > 3) return clean.slice(3);
    return clean;
  };
  const toFullPhone = (national: string) => {
    const digits = national.replace(/\D/g, '');
    return digits ? `+998${digits}` : '';
  };
  const handlePhoneInput = (value: string, setter: (v: string) => void) => {
    setter(value.replace(/\D/g, '').slice(0, 9));
  };

  const contactSearchTimer = useRef<ReturnType<typeof setTimeout>>();
  const contactSearchCounter = useRef(0);

  const handleContactSearch = useCallback((value: string) => {
    setContactSearchValue(value);
    if (value.length < 2) { setContactOptions([]); setContactSearching(false); return; }
    setContactSearching(true);
    clearTimeout(contactSearchTimer.current);
    contactSearchTimer.current = setTimeout(async () => {
      const requestId = ++contactSearchCounter.current;
      try {
        const result = await apiClient.getContacts({ search: value, page: 1, page_size: 10 });
        if (requestId !== contactSearchCounter.current) return;
        setContactOptions(
          result.items.map((c: ContactResponse) => {
            const phone = c.phone || '';
            return { label: `${c.first_name || ''} ${c.last_name || ''} ${phone}`.trim(), value: phone };
          }).filter((o: { value: string }) => o.value)
        );
      } catch {
        if (requestId === contactSearchCounter.current) setContactOptions([]);
      } finally {
        if (requestId === contactSearchCounter.current) setContactSearching(false);
      }
    }, 300);
  }, []);

  const loadSipOperators = useCallback(async () => {
    setOperatorsLoading(true);
    try {
      const ops = await apiClient.getSipuniOperators();
      setSipOperators(ops);
    } catch {
      setSipOperators([]);
    } finally {
      setOperatorsLoading(false);
    }
  }, []);

  const openCallModal = useCallback(() => {
    setCallModalVisible(true);
    loadSipOperators();
    if (isOperator() && user?.sip_extension) {
      setOperatorSip(user.sip_extension);
    }
  }, [isOperator, user, loadSipOperators]);

  const resetCallModal = () => {
    setCallType('external');
    setPhone1('');
    setPhone2('');
    setOperatorSip('');
    setReverse(false);
    setAntiaon(false);
    setTreeId('');
    setAttemptDuration(30);
    setPhoneError('');
    setContactSearchValue('');
    setContactOptions([]);
    setSipOperators([]);
  };

  const handleMakeCall = async () => {
    setPhoneError('');

    const fullPhone1 = toFullPhone(phone1);
    const fullPhone2 = toFullPhone(phone2);

    if (callType === 'external') {
      if (!isValidPhone(fullPhone1) || !isValidPhone(fullPhone2)) {
        setPhoneError(t('invalidPhone'));
        return;
      }
    } else {
      if (!isValidPhone(fullPhone2)) {
        setPhoneError(t('invalidPhone'));
        return;
      }
      if (callType === 'tree' && !treeId.trim()) {
        setPhoneError(t('treeId') + ' required');
        return;
      }
    }

    if (!operatorSip.trim()) {
      setPhoneError(t('operatorSip') + ' required');
      return;
    }

    setCalling(true);
    try {
      let result;
      if (callType === 'external') {
        result = await apiClient.callExternal({ phone_1: fullPhone1, phone_2: fullPhone2, operator_id: operatorSip });
      } else if (callType === 'number') {
        result = await apiClient.callNumber({
          phone: fullPhone2,
          operator_id: operatorSip,
          reverse,
          antiaon,
        });
      } else {
        result = await apiClient.callTree({
          phone: fullPhone2,
          operator_id: operatorSip,
          tree: treeId,
          reverse,
          call_attempt_time: attemptDuration,
        });
      }

      if (result.success) {
        message.success(t('callSuccess', { callId: result.call_id ?? '' }));
        setCallModalVisible(false);
        resetCallModal();
        loadCallHistory();
      } else {
        message.error(result.error || result.message || tErrors('failedToMakeCall'));
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      message.error(detail || tErrors('failedToMakeCall'));
    } finally {
      setCalling(false);
    }
  };

  const handlePlayRecording = async (callId: string) => {
    // Toggle off
    if (playingCallId === callId) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingCallId(null);
      return;
    }
    // Stop previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setLoadingAudio(callId);
    setPlayingCallId(callId);
    try {
      const blobUrl = await apiClient.getCallRecording(callId);
      // Create a real DOM audio element for reliable mobile playback
      const el = document.createElement('audio');
      el.src = blobUrl;
      el.preload = 'auto';
      el.onended = () => { setPlayingCallId(null); audioRef.current = null; };
      audioRef.current = el;
      await el.play();
    } catch {
      message.error(tErrors('failedToLoadRecording'));
      setPlayingCallId(null);
    } finally {
      setLoadingAudio(null);
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhone = (phone?: string | null) => {
    if (!phone) return null;
    // +998XXYYYXXYY → +998 XX YYY XX XX
    const match = phone.match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (match) return `+998 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    return phone;
  };

  const getDirectionIcon = (dir?: string | null, state?: string | null) => {
    if (dir === 'inbound') {
      const isMissed = state === 'NOANSWER' || state === 'BUSY' || state === 'CANCEL';
      return <PhoneIncoming style={{ color: isMissed ? '#ef4444' : '#10b981' }} />;
    }
    if (dir === 'outbound') return <PhoneOutgoing style={{ color: '#3b82f6' }} />;
    return <PhoneOutlined />;
  };

  const tActions = useTranslations('actions');

  if (error) {
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <ErrorCharacter height={115} />
        <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
        <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
        <Button type="primary" className="mt-4" onClick={() => { setError(false); setLoading(true); loadCallHistory(); }}>
          {tActions('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="page-subtitle">{t('subtitle')}</p>
        <Button type="primary" icon={<PhoneOutgoing style={{ color: '#fff' }} />} onClick={openCallModal}>
          {tActions('makeCall')}
        </Button>
      </div>

      <Input.Search
        placeholder={t('searchCalls')}
        value={searchInput}
        onChange={(e) => {
          const v = e.target.value;
          setSearchInput(v);
          if (!v) { setSearch(''); setPage(1); }
        }}
        allowClear
        size="large"
        className="w-full md:max-w-lg"
      />

      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">{tFields('direction')}</label>
            <Select value={direction || undefined} onChange={(v) => { setDirection(v || ''); setPage(1); }} placeholder={t('allDirections')} allowClear style={{ width: '100%' }}
              options={CALL_DIRECTION_OPTIONS.map((o) => ({ label: tDirections(o.key), value: o.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">{tFields('outcome')}</label>
            <Select value={outcome || undefined} onChange={(v) => { setOutcome(v || ''); setPage(1); }} placeholder={t('allOutcomes')} allowClear style={{ width: '100%' }}
              options={outcomeOptions} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">{tFields('from')}</label>
            <DatePicker className="w-full" format="YYYY-MM-DD" value={dateFrom ? dayjs(dateFrom) : null} onChange={(date) => { setDateFrom(date ? date.format('YYYY-MM-DD') : ''); setPage(1); }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">{tFields('to')}</label>
            <DatePicker className="w-full" format="YYYY-MM-DD" value={dateTo ? dayjs(dateTo) : null} onChange={(date) => { setDateTo(date ? date.format('YYYY-MM-DD') : ''); setPage(1); }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">{t('filter')}</label>
            <Checkbox checked={myCalls} onChange={(e) => { setMyCalls(e.target.checked); setPage(1); }} className="mt-1">{t('myCalls')}</Checkbox>
          </div>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 bg-gray-100 rounded animate-pulse shrink-0" />
                  <div>
                    <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-36 bg-gray-50 rounded mt-1.5 animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-8 sm:pl-0">
                  <div className="h-7 w-32 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.items.map((call) => (
              <div key={call.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/calls/${call.id}`)}>
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                  <span className="shrink-0 mt-0.5 sm:mt-0">{getDirectionIcon(call.direction, call.state)}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm sm:text-base" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatPhone(call.phone_1) || tCommon('unknown')} &rarr; {formatPhone(call.phone_2) || tCommon('unknown')}</span>
                      {call.direction && <Tag color={call.direction === 'inbound' ? 'green' : 'blue'}>{CALL_DIRECTION_KEYS[call.direction] ? tDirections(CALL_DIRECTION_KEYS[call.direction]) : call.direction}</Tag>}
                      {call.state && <Tag color={call.state === 'ANSWER' ? 'green' : (call.state === 'NOANSWER' || call.state === 'BUSY' || call.state === 'CANCEL') ? 'red' : undefined}>{CALL_STATUS_KEYS[call.state] ? tStatuses(CALL_STATUS_KEYS[call.state]) : call.state}</Tag>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      <span>{new Date(call.created_at).toLocaleString()}</span>
                      {call.billing_sec != null && <span className="flex items-center gap-1"><ClockCircleOutlined /> {formatDuration(call.billing_sec)}</span>}
                      {call.outcome && <Tag className="!text-xs">{call.outcome}</Tag>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-8 sm:pl-0 shrink-0">
                  <Select
                    size="small"
                    placeholder={tCommon('setOutcome')}
                    value={call.outcome || undefined}
                    className="w-[140px] sm:w-[160px]"
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (value) => {
                      try {
                        await apiClient.setCallOutcome(String(call.id), { outcome: value });
                        loadCallHistory();
                      } catch { message.error(tErrors('failedToSetOutcome')); }
                    }}
                    options={outcomeOptions}
                  />
                  {call.has_recording && call.state === 'ANSWER' && (
                    <button
                      className="relative flex items-center justify-center w-7 h-7 rounded-full border transition-colors"
                      style={{
                        borderColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary))',
                        background: 'transparent',
                      }}
                      onClick={(e) => { e.stopPropagation(); handlePlayRecording(String(call.id)); }}
                    >
                      {loadingAudio === String(call.id) ? (
                        <LoadingOutlined style={{ fontSize: 12 }} />
                      ) : playingCallId === String(call.id) ? (
                        <>
                          <span className="absolute inset-[-3px] rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: 'hsl(var(--primary))' }} />
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12" rx="1" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" /></svg>
                        </>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5a.5.5 0 0 1 .75-.43l9 5.5a.5.5 0 0 1 0 .86l-9 5.5A.5.5 0 0 1 3 12.5v-11z" /></svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center">
            <EmptyStateCharacter height={115} variant="no-calls" />
            <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('noCallsFound')}</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
              {search || direction || outcome || dateFrom || dateTo || myCalls ? tCommon('tryAdjustingFilters') : t('getStarted')}
            </p>
          </div>
        )}
      </div>

      {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      <Modal
        title={tActions('makeCall')}
        open={callModalVisible}
        onCancel={() => { setCallModalVisible(false); resetCallModal(); }}
        footer={null}
        width={520}
      >
        <div className="space-y-4">
          <Segmented
            block
            value={callType}
            onChange={(v) => { setCallType(v as CallType); setPhoneError(''); }}
            options={[
              { label: t('quickCall'), value: 'external' },
              { label: t('sipCall'), value: 'number' },
              { label: t('ivrTree'), value: 'tree' },
            ]}
          />

          <div className="space-y-1">
            <label className="text-xs text-gray-500">{t('searchContact')}</label>
            <Select
              showSearch
              value={contactSearchValue || undefined}
              placeholder={t('searchContact')}
              filterOption={false}
              onSearch={handleContactSearch}
              onChange={(value) => {
                setPhone2(value ? toNationalDigits(value) : '');
                setContactSearchValue('');
                setContactOptions([]);
              }}
              loading={contactSearching}
              options={contactOptions}
              notFoundContent={contactSearching ? null : undefined}
              style={{ width: '100%' }}
              suffixIcon={<SearchOutlined />}
              allowClear
            />
          </div>

          {recentNumbers.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('recentNumbers')}</label>
              <div className="flex flex-wrap gap-1">
                {recentNumbers.map((num) => (
                  <Tag
                    key={num}
                    className="cursor-pointer"
                    onClick={() => setPhone2(toNationalDigits(num))}
                  >
                    {formatPhone(num) || num}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {callType === 'external' && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('callerPhone')}</label>
                <Input addonBefore="+998" value={formatNational(phone1)} onChange={(e) => handlePhoneInput(e.target.value, setPhone1)} placeholder="90 123 45 67" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('receiverPhone')}</label>
                <Input addonBefore="+998" value={formatNational(phone2)} onChange={(e) => handlePhoneInput(e.target.value, setPhone2)} placeholder="90 123 45 67" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('operatorSip')}</label>
                <Select
                  showSearch
                  value={operatorSip || undefined}
                  onChange={(v) => setOperatorSip(v || '')}
                  placeholder={t('selectOperator')}
                  disabled={isOperator()}
                  loading={operatorsLoading}
                  options={sipOperators.map((op) => ({
                    value: op.extension,
                    label: `${op.extension} — ${op.name}`,
                  }))}
                  style={{ width: '100%' }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
            </>
          )}

          {callType === 'number' && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('destinationPhone')}</label>
                <Input addonBefore="+998" value={formatNational(phone2)} onChange={(e) => handlePhoneInput(e.target.value, setPhone2)} placeholder="90 123 45 67" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('operatorSip')}</label>
                <Select
                  showSearch
                  value={operatorSip || undefined}
                  onChange={(v) => setOperatorSip(v || '')}
                  placeholder={t('selectOperator')}
                  disabled={isOperator()}
                  loading={operatorsLoading}
                  options={sipOperators.map((op) => ({
                    value: op.extension,
                    label: `${op.extension} — ${op.name}`,
                  }))}
                  style={{ width: '100%' }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch size="small" checked={reverse} onChange={setReverse} />
                  {t('reverseCallOrder')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch size="small" checked={antiaon} onChange={setAntiaon} />
                  {t('hideCallerId')}
                </label>
              </div>
            </>
          )}

          {callType === 'tree' && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('destinationPhone')}</label>
                <Input addonBefore="+998" value={formatNational(phone2)} onChange={(e) => handlePhoneInput(e.target.value, setPhone2)} placeholder="90 123 45 67" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('operatorSip')}</label>
                <Select
                  showSearch
                  value={operatorSip || undefined}
                  onChange={(v) => setOperatorSip(v || '')}
                  placeholder={t('selectOperator')}
                  disabled={isOperator()}
                  loading={operatorsLoading}
                  options={sipOperators.map((op) => ({
                    value: op.extension,
                    label: `${op.extension} — ${op.name}`,
                  }))}
                  style={{ width: '100%' }}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('treeId')}</label>
                <Input value={treeId} onChange={(e) => setTreeId(e.target.value)} placeholder="000-913898" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch size="small" checked={reverse} onChange={setReverse} />
                  {t('reverseCallOrder')}
                </label>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('attemptDuration')}</label>
                <Input type="number" min={30} value={attemptDuration} onChange={(e) => setAttemptDuration(Math.max(30, Number(e.target.value) || 30))} />
              </div>
            </>
          )}

          <p className="text-xs text-gray-400">{t('phoneHint')}</p>
          {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}

          <Button
            type="primary"
            block
            disabled={calling}
            loading={calling}
            onClick={handleMakeCall}
          >
            <PhoneOutgoing style={{ marginRight: 8 }} />
            {calling ? tActions('changing') : tActions('makeCall')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
