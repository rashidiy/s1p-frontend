'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DatePicker, Input, Button, Tag, Select, Pagination, Checkbox, message } from 'antd';
import dayjs from 'dayjs';
import { PhoneOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { PhoneIncoming, PhoneOutgoing } from '@/components/icons/custom-icons';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import {
  CALL_DIRECTION_LABELS,
  CALL_DIRECTION_COLORS,
  CALL_STATUS_LABELS,
  CALL_STATUS_COLORS,
  CALL_DIRECTION_OPTIONS,
} from '@/lib/constants';
import type { CallEventResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter, ErrorCharacter } from '@/components/illustrations';

const OUTCOME_OPTIONS = [
  { value: 'interested', label: 'Interested' },
  { value: 'appointment_scheduled', label: 'Appointment Scheduled' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'sale_made', label: 'Sale Made' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'left_voicemail', label: 'Left Voicemail' },
  { value: 'busy', label: 'Busy' },
  { value: 'callback_requested', label: 'Callback Requested' },
  { value: 'information_provided', label: 'Information Provided' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'wrong_number', label: 'Wrong Number' },
  { value: 'do_not_call', label: 'Do Not Call' },
  { value: 'customer_complaint', label: 'Customer Complaint' },
  { value: 'other', label: 'Other' },
];

export default function CallsPage() {
  const router = useRouter();
  const t = useTranslations('calls');
  const tFields = useTranslations('fields');
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

  const loadCallHistory = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await apiClient.getCallHistory({ page, page_size: 20, search: search || undefined, direction: direction || undefined, outcome: outcome || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined, my_calls: myCalls || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load call history:', error); setError(true); message.error(tErrors('failedToLoadCalls')); }
    finally { setLoading(false); }
  };

  const handlePlayRecording = async (callId: string) => {
    try {
      const blobUrl = await apiClient.getCallRecording(callId);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to load recording:', err);
      message.error(tErrors('failedToLoadRecording'));
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDirectionIcon = (dir?: string | null) => {
    if (dir === 'inbound') return <PhoneIncoming style={{ color: '#10b981' }} />;
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
      <p className="page-subtitle">{t('subtitle')}</p>

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
              options={CALL_DIRECTION_OPTIONS.map((o) => ({ label: o.label, value: o.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">{tFields('outcome')}</label>
            <Select value={outcome || undefined} onChange={(v) => { setOutcome(v || ''); setPage(1); }} placeholder={t('allOutcomes')} allowClear style={{ width: '100%' }}
              options={OUTCOME_OPTIONS} />
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
                  <span className="shrink-0 mt-0.5 sm:mt-0">{getDirectionIcon(call.direction)}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm sm:text-base">{call.phone_1 || tCommon('unknown')} &rarr; {call.phone_2 || tCommon('unknown')}</span>
                      {call.direction && <Tag color={call.direction === 'inbound' ? 'green' : 'blue'}>{CALL_DIRECTION_LABELS[call.direction] || call.direction}</Tag>}
                      {call.state && <Tag>{CALL_STATUS_LABELS[call.state] || call.state}</Tag>}
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
                      } catch (err) { console.error(err); message.error(tErrors('failedToSetOutcome')); }
                    }}
                    options={OUTCOME_OPTIONS}
                  />
                  {call.has_recording && <Button type="text" icon={<PlayCircleOutlined />} onClick={(e) => { e.stopPropagation(); handlePlayRecording(String(call.id)); }} />}
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
    </div>
  );
}
