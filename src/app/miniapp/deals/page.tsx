'use client';

import { useEffect, useState } from 'react';
import { Spin, Tag } from 'antd';
import { FundProjectionScreenOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

const STAGE_COLORS: Record<string, string> = {
  prospecting: 'default',
  qualification: 'blue',
  proposal: 'cyan',
  negotiation: 'orange',
  closed_won: 'green',
  closed_lost: 'red',
};

export default function MiniAppDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { webApp } = useTelegramWebApp();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.getDeals({ page: 1, page_size: 30 });
        setDeals(res.items || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="miniapp-loading" style={{ height: 'auto', padding: 40 }}><Spin /></div>;
  }

  if (deals.length === 0) {
    return <div className="miniapp-empty">No deals yet</div>;
  }

  return (
    <div className="miniapp-list">
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="miniapp-list-item"
          onClick={() => {
            webApp?.HapticFeedback.impactOccurred('light');
            router.push(`/miniapp/deals/${deal.id}`);
          }}
        >
          <FundProjectionScreenOutlined style={{ fontSize: 18, color: '#2563EB', flexShrink: 0 }} />
          <div className="miniapp-list-item-content">
            <div className="miniapp-list-item-title">{deal.title || 'Untitled'}</div>
            <div className="miniapp-list-item-sub">
              {deal.amount ? `${deal.amount.toLocaleString()} ${deal.currency || ''}` : ''}
            </div>
          </div>
          <Tag color={STAGE_COLORS[deal.stage] || 'default'} style={{ margin: 0 }}>
            {deal.stage?.replace('_', ' ')}
          </Tag>
        </div>
      ))}
    </div>
  );
}
