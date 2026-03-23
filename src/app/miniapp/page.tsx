'use client';

import { useEffect, useState } from 'react';
import {
  PhoneOutlined,
  WarningOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import { UserRole } from '@/types/api';
import type { OperatorDashboard, AdminDashboard } from '@/types/api';
import { formatTime, getInitials, getAvatarColor } from './_utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type Period = 'today' | 'this_week' | 'this_month';

/** Dashboard recent_calls have different fields than CallWithDetails */
interface DashboardCall {
  id: number;
  phone?: string;
  direction?: string;
  state?: string;
  duration?: number;
  started_at?: string;
  contact_name?: string;
}

/** Dashboard missed_calls_to_return */
interface MissedCall {
  id: number;
  phone?: string;
  contact_name?: string;
  contact_id?: string;
  created_at?: string;
}

function SkeletonDashboard() {
  return (
    <div>
      <div className="miniapp-skeleton-text" style={{ width: 140, height: 28, marginBottom: 16, borderRadius: 8 }} />
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
  const [teamData, setTeamData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<Period>('today');
  const { user } = useAuthStore();
  const { webApp } = useTelegramWebApp();
  const router = useRouter();
  const t = useTranslations('miniapp');

  const isManagerOrAdmin = user?.role === UserRole.COMPANY_ADMIN ||
    user?.role === UserRole.COMPANY_MANAGER ||
    user?.role === ('company_owner' as UserRole);

  useEffect(() => {
    async function load() {
      try {
        const [dashboard, team] = await Promise.all([
          apiClient.getMyDashboard(),
          isManagerOrAdmin ? apiClient.getAdminDashboard().catch(() => null) : Promise.resolve(null),
        ]);
        setData(dashboard);
        if (team) setTeamData(team);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isManagerOrAdmin]);

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
      tap: '/miniapp/pipeline',
    },
    {
      icon: <FundProjectionScreenOutlined />,
      bg: 'rgba(59, 130, 246, 0.1)',
      color: '#2563EB',
      value: data?.active_deals ?? 0,
      label: t('dashboard.activeDeals'),
      tap: '/miniapp/pipeline?tab=deals',
    },
  ];

  const greeting = user?.first_name ? t('dashboard.greeting', { name: user.first_name }) : '';
  const recentCalls = (data?.recent_calls ?? []) as unknown as DashboardCall[];
  const missedCalls = ((data as Record<string, unknown>)?.missed_calls_to_return ?? []) as unknown as MissedCall[];

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: t('dashboard.today') },
    { key: 'this_week', label: t('dashboard.thisWeek') },
    { key: 'this_month', label: t('dashboard.thisMonth') },
  ];

  const avatarUrl = user?.avatar_url
    ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE_URL}${user.avatar_url}`)
    : undefined;

  return (
    <div className="miniapp-page-enter">
      {/* Header bar: greeting + avatar */}
      <div className="miniapp-header-bar">
        <div className="miniapp-page-title" style={{ padding: '8px 4px 0', marginBottom: 0 }}>
          {greeting}
        </div>
        <button
          className="miniapp-avatar-btn"
          onClick={() => {
            webApp?.HapticFeedback.impactOccurred('light');
            router.push('/miniapp/profile');
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="miniapp-avatar-img" />
          ) : (
            <div
              className="miniapp-avatar-placeholder"
              style={{ background: getAvatarColor(user?.first_name || 'U') }}
            >
              {getInitials(user?.first_name, user?.last_name)}
            </div>
          )}
        </button>
      </div>

      {/* Period selector */}
      <div className="miniapp-period-selector" style={{ marginTop: 12 }}>
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
            <div className="miniapp-stat-top">
              <div className="miniapp-stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className="miniapp-stat-value">{s.value}</div>
            </div>
            <div className="miniapp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Needs Attention section */}
      {missedCalls.length > 0 && (
        <div className="miniapp-section">
          <div className="miniapp-section-header">{t('needsAttention')}</div>
          <div className="miniapp-list">
            {missedCalls.slice(0, 5).map((call, i) => {
              const phone = call.phone || '';
              const displayName = call.contact_name || phone || '—';
              return (
                <div
                  key={i}
                  className="miniapp-attention-item"
                  onClick={() => {
                    if (phone) {
                      webApp?.HapticFeedback.impactOccurred('medium');
                      window.open(`tel:${phone}`, '_self');
                    }
                  }}
                >
                  <div className="miniapp-call-icon miniapp-call-icon-missed">
                    <PhoneOutlined style={{ transform: 'rotate(135deg)' }} />
                  </div>
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-title miniapp-text-missed">
                      {displayName}
                    </div>
                    {call.contact_name && phone && (
                      <div className="miniapp-list-item-sub">{phone}</div>
                    )}
                  </div>
                  <div className="miniapp-list-item-right">
                    {call.created_at ? formatTime(call.created_at) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent calls */}
      {recentCalls.length > 0 && (
        <div className="miniapp-section">
          <div className="miniapp-section-header">{t('dashboard.recentCalls')}</div>
          <div className="miniapp-list">
            {recentCalls.slice(0, 4).map((call, i) => {
              const phone = call.phone || '—';
              const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL';
              const isInbound = call.direction === 'inbound';
              const displayName = call.contact_name || phone;
              return (
                <div key={i} className="miniapp-list-item" onClick={() => router.push('/miniapp/calls')}>
                  <div className={`miniapp-call-icon ${isMissed ? 'miniapp-call-icon-missed' : isInbound ? 'miniapp-call-icon-inbound' : 'miniapp-call-icon-outbound'}`}>
                    <PhoneOutlined style={{ transform: isInbound ? 'rotate(135deg)' : 'rotate(-45deg)' }} />
                  </div>
                  <div className="miniapp-list-item-content">
                    <div className={`miniapp-list-item-title ${isMissed ? 'miniapp-text-missed' : ''}`}>
                      {displayName}
                    </div>
                    {call.contact_name && (
                      <div className="miniapp-list-item-sub">{phone}</div>
                    )}
                  </div>
                  <div className="miniapp-list-item-right">
                    {call.started_at ? formatTime(call.started_at) : ''}
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

      {/* Team Today — manager/admin only */}
      {isManagerOrAdmin && teamData && (
        <div className="miniapp-section">
          <div className="miniapp-section-header">{t('teamToday')}</div>
          <div className="miniapp-list">
            {(teamData as Record<string, unknown>).operator_stats
              ? ((teamData as Record<string, unknown>).operator_stats as Array<Record<string, unknown>>).slice(0, 6).map((op, i) => (
                <div key={i} className="miniapp-team-row">
                  <div
                    className="miniapp-list-item-icon"
                    style={{ background: getAvatarColor(String(op.operator_name || '')), width: 32, height: 32, fontSize: 13 }}
                  >
                    {getInitials(String(op.operator_name || '').split(' ')[0], String(op.operator_name || '').split(' ')[1])}
                  </div>
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-title">{String(op.operator_name || t('unassigned'))}</div>
                  </div>
                  <div className="miniapp-list-item-right">
                    <PhoneOutlined style={{ fontSize: 12, marginRight: 4 }} />
                    {String(op.total_calls ?? 0)}
                  </div>
                </div>
              ))
              : (
                <div className="miniapp-team-row">
                  <UserOutlined style={{ fontSize: 16, color: 'var(--ma-hint)', marginRight: 8 }} />
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-sub">{t('dashboard.noActivity')}</div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}

      {!recentCalls.length && periodData?.calls?.total_calls === 0 && (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon">
            <PhoneOutlined />
          </div>
          <div className="miniapp-empty-sub">{t('dashboard.noActivity')}</div>
        </div>
      )}
    </div>
  );
}
