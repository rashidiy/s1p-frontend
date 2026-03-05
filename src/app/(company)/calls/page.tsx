'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Spin, Button, Tag, Select, Pagination, Checkbox } from 'antd';
import { PhoneOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { PhoneIncoming, PhoneOutgoing } from '@/components/icons/custom-icons';
import { apiClient } from '@/lib/api';
import {
  CALL_DIRECTION_LABELS,
  CALL_DIRECTION_COLORS,
  CALL_STATUS_LABELS,
  CALL_STATUS_COLORS,
  CALL_DIRECTION_OPTIONS,
} from '@/lib/constants';
import type { CallEventResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';

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
  const [data, setData] = useState<PaginatedResponse<CallEventResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState('');
  const [outcome, setOutcome] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [myCalls, setMyCalls] = useState(false);

  useEffect(() => { loadCallHistory(); }, [page, direction, outcome, dateFrom, dateTo, myCalls]);

  const loadCallHistory = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getCallHistory({ page, page_size: 20, direction: direction || undefined, outcome: outcome || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined, my_calls: myCalls || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load call history:', error); }
    finally { setLoading(false); }
  };

  const handlePlayRecording = async (callId: string) => {
    try {
      const blobUrl = await apiClient.getCallRecording(callId);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Failed to load recording:', err);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Call History</h1>
        <p className="text-gray-500">View and filter call records</p>
      </div>

      <div className="glass-card p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Direction</label>
            <Select value={direction || undefined} onChange={(v) => { setDirection(v || ''); setPage(1); }} placeholder="All" allowClear style={{ width: '100%' }}
              options={CALL_DIRECTION_OPTIONS.map((o) => ({ label: o.label, value: o.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Outcome</label>
            <Select value={outcome || undefined} onChange={(v) => { setOutcome(v || ''); setPage(1); }} placeholder="All" allowClear style={{ width: '100%' }}
              options={OUTCOME_OPTIONS} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          </div>
          <div className="flex items-end">
            <Checkbox checked={myCalls} onChange={(e) => { setMyCalls(e.target.checked); setPage(1); }}>My Calls Only</Checkbox>
          </div>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center"><Spin size="large" /></div>
        ) : data && data.items.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.items.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 hover:bg-white/50 transition-colors cursor-pointer" onClick={() => router.push(`/calls/${call.id}`)}>
                <div className="flex items-center gap-4">
                  {getDirectionIcon(call.direction)}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{call.phone_1 || 'Unknown'} &rarr; {call.phone_2 || 'Unknown'}</span>
                      {call.direction && <Tag color={call.direction === 'inbound' ? 'green' : 'blue'}>{CALL_DIRECTION_LABELS[call.direction] || call.direction}</Tag>}
                      {call.state && <Tag>{CALL_STATUS_LABELS[call.state] || call.state}</Tag>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{new Date(call.created_at).toLocaleString()}</span>
                      {call.billing_sec != null && <span className="flex items-center gap-1"><ClockCircleOutlined /> {formatDuration(call.billing_sec)}</span>}
                      {(call as any).outcome && <Tag className="!text-xs">{(call as any).outcome}</Tag>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    size="small"
                    placeholder="Set outcome..."
                    value={(call as any).outcome || undefined}
                    style={{ width: 160 }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (value) => {
                      try {
                        await apiClient.setCallOutcome(String(call.id), { outcome: value });
                        loadCallHistory();
                      } catch (err) { console.error(err); }
                    }}
                    options={OUTCOME_OPTIONS}
                  />
                  {(call as any).record_url && <Button type="text" icon={<PlayCircleOutlined />} onClick={(e) => { e.stopPropagation(); handlePlayRecording(String(call.id)); }} />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center">
            <EmptyStateCharacter width={150} height={150} />
            <p className="mt-4 text-lg font-medium text-gray-700">No calls found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}
    </div>
  );
}
