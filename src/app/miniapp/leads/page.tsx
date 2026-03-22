'use client';

import { useEffect, useState } from 'react';
import { Spin, Tag, Result } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import type { LeadResponse } from '@/types/api';

const STATUS_COLORS: Record<string, string> = {
  new: 'blue',
  contacted: 'cyan',
  qualified: 'green',
  unqualified: 'orange',
  converted: 'purple',
  lost: 'red',
};

export default function MiniAppLeads() {
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { webApp } = useTelegramWebApp();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.getLeads({ page: 1, page_size: 30 });
        setLeads(res.items || []);
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
    return <Result status="error" subTitle="Failed to load leads" />;
  }

  if (leads.length === 0) {
    return <div className="miniapp-empty">No leads yet</div>;
  }

  return (
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
          <RiseOutlined style={{ fontSize: 18, color: '#10B981', flexShrink: 0 }} />
          <div className="miniapp-list-item-content">
            <div className="miniapp-list-item-title">{lead.title || 'Untitled'}</div>
            <div className="miniapp-list-item-sub">
              {lead.source || ''}{lead.estimated_value ? ` · ${Number(lead.estimated_value).toLocaleString()}` : ''}
            </div>
          </div>
          <Tag color={STATUS_COLORS[lead.status as string] || 'default'} style={{ margin: 0 }}>
            {lead.status}
          </Tag>
        </div>
      ))}
    </div>
  );
}
