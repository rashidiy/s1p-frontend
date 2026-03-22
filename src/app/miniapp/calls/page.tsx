'use client';

import { useEffect, useState } from 'react';
import { Spin, Result } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { CallEventResponse } from '@/types/api';

export default function MiniAppCalls() {
  const [calls, setCalls] = useState<CallEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.getCallHistory({ page: 1, page_size: 30 });
        setCalls(res.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="miniapp-loading" style={{ height: 'auto', padding: 40 }}><Spin /></div>;
  }

  if (error) {
    return <Result status="error" subTitle="Failed to load calls" />;
  }

  if (calls.length === 0) {
    return <div className="miniapp-empty">No calls yet</div>;
  }

  function formatDuration(sec: number | null | undefined): string {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="miniapp-list">
      {calls.map((call) => {
        const isMissed = call.status === 'missed' || !call.duration_sec;
        const isInbound = call.direction === 'inbound';
        const phone = call.phone_1 || call.phone_2 || '—';
        const name = (call as Record<string, unknown>).contact_name as string || phone;

        return (
          <div key={call.id} className="miniapp-list-item">
            <PhoneOutlined
              style={{
                fontSize: 18,
                color: isMissed ? '#EF4444' : isInbound ? '#10B981' : '#2563EB',
                flexShrink: 0,
                transform: isInbound ? 'rotate(135deg)' : 'rotate(-45deg)',
              }}
            />
            <div className="miniapp-list-item-content">
              <div className="miniapp-list-item-title" style={{ color: isMissed ? '#EF4444' : undefined }}>
                {name}
              </div>
              <div className="miniapp-list-item-sub">
                {phone !== name ? `${phone} · ` : ''}{formatDuration(call.duration_sec)}
              </div>
            </div>
            <div className="miniapp-list-item-right">
              {call.created_at ? formatTime(call.created_at) : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}
