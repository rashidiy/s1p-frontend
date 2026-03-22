'use client';

import { useEffect, useState } from 'react';
import { Spin, Result } from 'antd';
import {
  PhoneOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  ClockCircleOutlined,
  WarningOutlined,
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

  const stats = [
    {
      icon: <PhoneOutlined style={{ color: '#4338CA' }} />,
      value: data?.today?.calls?.total_calls ?? 0,
      label: 'Calls',
      tap: () => router.push('/miniapp/calls'),
    },
    {
      icon: <WarningOutlined style={{ color: '#EF4444' }} />,
      value: data?.today?.calls?.missed_calls ?? 0,
      label: 'Missed',
      tap: () => router.push('/miniapp/calls'),
    },
    {
      icon: <RiseOutlined style={{ color: '#10B981' }} />,
      value: data?.pending_leads ?? 0,
      label: 'Leads',
      tap: () => router.push('/miniapp/leads'),
    },
    {
      icon: <FundProjectionScreenOutlined style={{ color: '#2563EB' }} />,
      value: data?.active_deals ?? 0,
      label: 'Deals',
      tap: () => router.push('/miniapp/deals'),
    },
  ];

  const greeting = user?.first_name ? `${user.first_name}` : '';
  const recentCalls = data?.recent_calls ?? [];
  const recentTasks = data?.recent_tasks ?? [];

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

      {/* Recent calls */}
      {recentCalls.length > 0 && (
        <>
          <div className="miniapp-section-title" style={{ marginTop: 16 }}>
            Recent Calls
          </div>
          <div className="miniapp-list">
            {recentCalls.slice(0, 5).map((call, i) => (
              <div key={i} className="miniapp-list-item">
                <PhoneOutlined style={{ fontSize: 18, color: '#4338CA' }} />
                <div className="miniapp-list-item-content">
                  <div className="miniapp-list-item-title">
                    {(call.phone_1 as string) || (call.phone_2 as string) || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent tasks */}
      {recentTasks.length > 0 && (
        <>
          <div className="miniapp-section-title" style={{ marginTop: 16 }}>
            Tasks
          </div>
          <div className="miniapp-list">
            {recentTasks.slice(0, 5).map((task, i) => (
              <div key={i} className="miniapp-list-item">
                <ClockCircleOutlined style={{ fontSize: 18, color: '#F59E0B' }} />
                <div className="miniapp-list-item-content">
                  <div className="miniapp-list-item-title">{task.title as string}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!recentCalls.length && !recentTasks.length && data?.today?.calls?.total_calls === 0 && (
        <div className="miniapp-empty">No activity today</div>
      )}
    </div>
  );
}
