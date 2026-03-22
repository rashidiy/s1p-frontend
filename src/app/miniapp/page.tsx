'use client';

import { useEffect, useState } from 'react';
import { Spin, Tag } from 'antd';
import {
  PhoneOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import type { OperatorDashboard } from '@/types/api';

export default function MiniAppDashboard() {
  const [data, setData] = useState<OperatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { webApp } = useTelegramWebApp();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const dashboard = await apiClient.getMyDashboard();
        setData(dashboard);
      } catch {
        // Silent — show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="miniapp-loading" style={{ height: 'auto', padding: 40 }}>
        <Spin />
      </div>
    );
  }

  const stats = [
    {
      icon: <PhoneOutlined style={{ color: '#4338CA' }} />,
      value: data?.today?.total_calls ?? 0,
      label: 'Calls',
      tap: () => router.push('/miniapp/calls'),
    },
    {
      icon: <WarningOutlined style={{ color: '#EF4444' }} />,
      value: data?.today?.missed_calls ?? 0,
      label: 'Missed',
      tap: () => router.push('/miniapp/calls'),
    },
    {
      icon: <RiseOutlined style={{ color: '#10B981' }} />,
      value: data?.today?.new_leads ?? 0,
      label: 'Leads',
      tap: () => router.push('/miniapp/leads'),
    },
    {
      icon: <FundProjectionScreenOutlined style={{ color: '#2563EB' }} />,
      value: data?.today?.active_deals ?? 0,
      label: 'Deals',
      tap: () => router.push('/miniapp/deals'),
    },
  ];

  const greeting = user?.first_name ? `${user.first_name}` : '';

  return (
    <div>
      {greeting && (
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
          {greeting} 👋
        </div>
      )}

      {/* Today's stats */}
      <div className="miniapp-stats">
        {stats.map((s, i) => (
          <div
            key={i}
            className="miniapp-stat-card"
            onClick={() => {
              webApp?.HapticFeedback.impactOccurred('light');
              s.tap();
            }}
          >
            <div className="miniapp-stat-icon">{s.icon}</div>
            <div className="miniapp-stat-value">{s.value}</div>
            <div className="miniapp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent leads */}
      {data?.recent_leads && data.recent_leads.length > 0 && (
        <>
          <div className="miniapp-section-title" style={{ marginTop: 16 }}>
            Recent Leads
          </div>
          <div className="miniapp-list">
            {data.recent_leads.slice(0, 5).map((lead: any) => (
              <div
                key={lead.id}
                className="miniapp-list-item"
                onClick={() => router.push(`/miniapp/leads/${lead.id}`)}
              >
                <RiseOutlined style={{ fontSize: 18, color: '#10B981' }} />
                <div className="miniapp-list-item-content">
                  <div className="miniapp-list-item-title">{lead.title || 'Untitled'}</div>
                  <div className="miniapp-list-item-sub">{lead.source || ''}</div>
                </div>
                <div className="miniapp-list-item-right">
                  <ArrowRightOutlined />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent tasks */}
      {data?.upcoming_tasks && data.upcoming_tasks.length > 0 && (
        <>
          <div className="miniapp-section-title" style={{ marginTop: 16 }}>
            Tasks
          </div>
          <div className="miniapp-list">
            {data.upcoming_tasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className="miniapp-list-item">
                <ClockCircleOutlined style={{ fontSize: 18, color: '#F59E0B' }} />
                <div className="miniapp-list-item-content">
                  <div className="miniapp-list-item-title">{task.title}</div>
                  <div className="miniapp-list-item-sub">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}
                  </div>
                </div>
                <Tag color={task.status === 'completed' ? 'green' : 'default'} style={{ margin: 0 }}>
                  {task.status}
                </Tag>
              </div>
            ))}
          </div>
        </>
      )}

      {!data?.recent_leads?.length && !data?.upcoming_tasks?.length && (
        <div className="miniapp-empty">No activity today</div>
      )}
    </div>
  );
}
