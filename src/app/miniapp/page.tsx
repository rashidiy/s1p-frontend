'use client';

import { useEffect, useState } from 'react';
import { Spin, Tag, Result } from 'antd';
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
  const [error, setError] = useState(false);
  const { user } = useAuthStore();
  const { webApp } = useTelegramWebApp();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const dashboard = await apiClient.getMyDashboard();
        setData(dashboard);
      } catch {
        setError(true);
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

  if (error) {
    return <Result status="error" subTitle="Failed to load dashboard" />;
  }

  const today = data?.today as Record<string, number> | undefined;
  const recentLeads = (data?.recent_leads ?? []) as Array<Record<string, unknown>>;
  const upcomingTasks = (data?.upcoming_tasks ?? []) as Array<Record<string, unknown>>;

  const stats = [
    {
      icon: <PhoneOutlined style={{ color: '#4338CA' }} />,
      value: today?.total_calls ?? 0,
      label: 'Calls',
      tap: () => router.push('/miniapp/calls'),
    },
    {
      icon: <WarningOutlined style={{ color: '#EF4444' }} />,
      value: today?.missed_calls ?? 0,
      label: 'Missed',
      tap: () => router.push('/miniapp/calls'),
    },
    {
      icon: <RiseOutlined style={{ color: '#10B981' }} />,
      value: today?.new_leads ?? 0,
      label: 'Leads',
      tap: () => router.push('/miniapp/leads'),
    },
    {
      icon: <FundProjectionScreenOutlined style={{ color: '#2563EB' }} />,
      value: today?.active_deals ?? 0,
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
      {recentLeads.length > 0 && (
        <>
          <div className="miniapp-section-title" style={{ marginTop: 16 }}>
            Recent Leads
          </div>
          <div className="miniapp-list">
            {recentLeads.slice(0, 5).map((lead) => (
              <div
                key={lead.id as string}
                className="miniapp-list-item"
                onClick={() => router.push(`/miniapp/leads/${lead.id}`)}
              >
                <RiseOutlined style={{ fontSize: 18, color: '#10B981' }} />
                <div className="miniapp-list-item-content">
                  <div className="miniapp-list-item-title">{(lead.title as string) || 'Untitled'}</div>
                  <div className="miniapp-list-item-sub">{(lead.source as string) || ''}</div>
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
      {upcomingTasks.length > 0 && (
        <>
          <div className="miniapp-section-title" style={{ marginTop: 16 }}>
            Tasks
          </div>
          <div className="miniapp-list">
            {upcomingTasks.slice(0, 5).map((task) => (
              <div key={task.id as string} className="miniapp-list-item">
                <ClockCircleOutlined style={{ fontSize: 18, color: '#F59E0B' }} />
                <div className="miniapp-list-item-content">
                  <div className="miniapp-list-item-title">{task.title as string}</div>
                  <div className="miniapp-list-item-sub">
                    {task.due_date ? new Date(task.due_date as string).toLocaleDateString() : ''}
                  </div>
                </div>
                <Tag color={task.status === 'completed' ? 'green' : 'default'} style={{ margin: 0 }}>
                  {task.status as string}
                </Tag>
              </div>
            ))}
          </div>
        </>
      )}

      {!recentLeads.length && !upcomingTasks.length && (
        <div className="miniapp-empty">No activity today</div>
      )}
    </div>
  );
}
