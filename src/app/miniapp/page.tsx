'use client';

import { useEffect, useState } from 'react';
import {
  PhoneOutlined,
  WarningOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { OperatorDashboard } from '@/types/api';
import { formatTime } from './_utils';

type Period = 'today' | 'this_week' | 'this_month';

function SkeletonDashboard() {
  return (
    <div>
      <div className="miniapp-skeleton-text" style={{ width: 140, height: 28, marginBottom: 16, borderRadius: 8 }} />
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[1,2,3].map(i => <div key={i} className="miniapp-skeleton-text" style={{ width: 72, height: 32, borderRadius: 8 }} />)}
      </div>
      <div className="miniapp-skeleton-stats">
        {[1,2,3,4].map(i => <div key={i} className="miniapp-skeleton-stat" />)}
      </div>
      <div className="miniapp-section" style={{ padding: 0 }}>
        {[1,2,3].map(i => (
          <div key={i} className="miniapp-skeleton-list-item">
            <div className="miniapp-skeleton-circle" />
            <div className="miniapp-skeleton-lines">
              <div className="miniapp-skeleton-text" style={{ width: '70%' }} />
              <div className="miniapp-skeleton-text" style={{ width: '40%', height: 11 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MiniAppDashboard() {
  const [data, setData] = useState<OperatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<Period>('today');
  const { user } = useAuthStore();
  const { webApp } = useTelegramWebApp();
  const router = useRouter();
  const t = useTranslations('miniapp');

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

  if (loading) return <SkeletonDashboard />;

  if (error) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">!</div>
        <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
      </div>
    );
  }

  const periodData = data?.[period];
  const stats = [
    {
      icon: <PhoneOutlined />,
      bg: 'rgba(67, 56, 202, 0.1)',
      color: '#4338CA',
      value: periodData?.calls?.total_calls ?? 0,
      label: t('dashboard.calls'),
      tap: '/miniapp/calls',
    },
    {
      icon: <WarningOutlined />,
      bg: 'rgba(239, 68, 68, 0.1)',
      color: '#EF4444',
      value: periodData?.calls?.missed_calls ?? 0,
      label: t('dashboard.missed'),
      tap: '/miniapp/calls',
    },
    {
      icon: <RiseOutlined />,
      bg: 'rgba(16, 185, 129, 0.1)',
      color: '#10B981',
      value: data?.pending_leads ?? 0,
      label: t('dashboard.pendingLeads'),
      tap: '/miniapp/leads',
    },
    {
      icon: <FundProjectionScreenOutlined />,
      bg: 'rgba(59, 130, 246, 0.1)',
      color: '#2563EB',
      value: data?.active_deals ?? 0,
      label: t('dashboard.activeDeals'),
      tap: '/miniapp/deals',
    },
  ];

  const greeting = user?.first_name ? t('dashboard.greeting', { name: user.first_name }) : '';
  const recentCalls = data?.recent_calls ?? [];
  const recentTasks = data?.recent_tasks ?? [];

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: t('dashboard.today') },
    { key: 'this_week', label: t('dashboard.thisWeek') },
    { key: 'this_month', label: t('dashboard.thisMonth') },
  ];

  return (
    <div className="miniapp-page-enter">
      {greeting && <div className="miniapp-page-title">{greeting}</div>}

      {/* Period selector */}
      <div className="miniapp-period-selector">
        {periods.map((p) => (
          <button
            key={p.key}
            className={`miniapp-period-btn ${period === p.key ? 'active' : ''}`}
            onClick={() => {
              webApp?.HapticFeedback.selectionChanged();
              setPeriod(p.key);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="miniapp-stats miniapp-stagger">
        {stats.map((s, i) => (
          <div
            key={i}
            className="miniapp-stat-card"
            onClick={() => {
              webApp?.HapticFeedback.impactOccurred('light');
              router.push(s.tap);
            }}
          >
            <div className="miniapp-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="miniapp-stat-value">{s.value}</div>
            <div className="miniapp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent calls */}
      {recentCalls.length > 0 && (
        <div className="miniapp-section">
          <div className="miniapp-section-header">{t('dashboard.recentCalls')}</div>
          <div className="miniapp-list">
            {recentCalls.slice(0, 4).map((call, i) => {
              const phone = (call.phone_1 as string) || (call.phone_2 as string) || '—';
              const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL' || !call.billing_sec;
              const isInbound = call.direction === 'inbound';
              return (
                <div key={i} className="miniapp-list-item" onClick={() => router.push('/miniapp/calls')}>
                  <div className={`miniapp-call-icon ${isMissed ? 'miniapp-call-icon-missed' : isInbound ? 'miniapp-call-icon-inbound' : 'miniapp-call-icon-outbound'}`}>
                    <PhoneOutlined style={{ transform: isInbound ? 'rotate(135deg)' : 'rotate(-45deg)' }} />
                  </div>
                  <div className="miniapp-list-item-content">
                    <div className={`miniapp-list-item-title ${isMissed ? 'miniapp-text-missed' : ''}`}>
                      {phone}
                    </div>
                  </div>
                  <div className="miniapp-list-item-right">
                    {formatTime(call.created_at as string)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="miniapp-section-footer" onClick={() => router.push('/miniapp/calls')}>
            {t('dashboard.viewAll')} <RightOutlined style={{ fontSize: 11, marginLeft: 4 }} />
          </div>
        </div>
      )}

      {/* Recent tasks */}
      {recentTasks.length > 0 && (
        <div className="miniapp-section">
          <div className="miniapp-section-header">{t('dashboard.recentTasks')}</div>
          <div className="miniapp-list">
            {recentTasks.slice(0, 4).map((task, i) => (
              <div key={i} className="miniapp-list-item">
                <div className="miniapp-call-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                  <ClockCircleOutlined />
                </div>
                <div className="miniapp-list-item-content">
                  <div className="miniapp-list-item-title">{task.title as string}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!recentCalls.length && !recentTasks.length && periodData?.calls?.total_calls === 0 && (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon">
            <ClockCircleOutlined />
          </div>
          <div className="miniapp-empty-sub">{t('dashboard.noActivity')}</div>
        </div>
      )}
    </div>
  );
}

