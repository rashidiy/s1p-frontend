'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Tag, message } from 'antd';
import {
  PhoneOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  CheckSquareOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import type { OperatorDashboard } from '@/types/api';
import { useAuthStore } from '@/store/auth';
import { ErrorCharacter } from '@/components/illustrations';
import Link from 'next/link';

const statCards = [
  {
    key: 'calls',
    labelKey: 'totalCalls' as const,
    icon: <PhoneOutlined />,
    href: '/calls',
    iconBgVar: 'var(--icon-bg-indigo)',
    iconColor: '#4338CA',
  },
  {
    key: 'leads',
    labelKey: 'totalLeads' as const,
    icon: <RiseOutlined />,
    href: '/leads',
    iconBgVar: 'var(--icon-bg-green)',
    iconColor: '#10B981',
  },
  {
    key: 'deals',
    labelKey: 'totalDeals' as const,
    icon: <FundProjectionScreenOutlined />,
    href: '/deals',
    iconBgVar: 'var(--icon-bg-blue)',
    iconColor: '#2563EB',
  },
  {
    key: 'tasks',
    labelKey: 'completedTasks' as const,
    icon: <CheckSquareOutlined />,
    href: '/tasks',
    iconBgVar: 'var(--icon-bg-amber)',
    iconColor: '#F59E0B',
  },
];

const taskStatusColors: Record<string, string> = {
  pending: 'gold',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'default',
};

function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTimeAgo(dateStr: string, t: any): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('justNow');
  if (mins < 60) return t('minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('daysAgo', { count: days });
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<OperatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user } = useAuthStore();
  const t = useTranslations('dashboard');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tStatuses = useTranslations('statuses');

  const loadDashboard = useCallback(async () => {
    try {
      setError(false);
      const data = await apiClient.getMyDashboard();
      setDashboard(data);
    } catch {
      setError(true);
      message.error(tErrors('failedToLoadDashboard'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tErrors is a stable reference from next-intl
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (error) {
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <ErrorCharacter height={115} />
        <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
        <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
        <Button type="primary" className="mt-4" onClick={() => { setError(false); setLoading(true); loadDashboard(); }}>
          {tActions('tryAgain')}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="crm-card p-5 space-y-3">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-7 w-12 bg-gray-100 rounded-lg animate-pulse" />
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="crm-card p-6 space-y-4">
              <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboard?.this_month;
  const recentCalls = (dashboard as any)?.recent_calls || [];
  const recentTasks = (dashboard as any)?.recent_tasks || [];
  const upcomingTasks = (dashboard as any)?.upcoming_tasks || 0;
  const pendingLeads = (dashboard as any)?.pending_leads || 0;
  const activeDeals = (dashboard as any)?.active_deals || 0;

  const getStatValue = (key: string) => {
    switch (key) {
      case 'calls':
        return {
          value: stats?.calls.total_calls || 0,
          sub: t('answered', { count: stats?.calls.answered_calls || 0 }),
        };
      case 'leads':
        return {
          value: stats?.leads.total_leads || 0,
          sub: t('convertedCount', { count: stats?.leads.converted_leads || 0 }),
        };
      case 'deals':
        return {
          value: stats?.deals.total_deals || 0,
          sub: formatCurrency(stats?.deals.total_value || 0),
        };
      case 'tasks':
        return {
          value: stats?.tasks.completed_tasks || 0,
          sub: t('ofTotal', { count: stats?.tasks.total_tasks || 0 }),
        };
      default:
        return { value: 0, sub: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {t('welcomeBack')}, {user?.first_name || ''}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {t('hereIsWhatsHappening')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const { value, sub } = getStatValue(card.key);
          return (
            <div key={card.key} className="crm-card p-5" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {t(card.labelKey)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: card.iconBgVar,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: card.iconColor, fontSize: 20, flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {value}
                </div>
              </div>
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-light)', paddingTop: 10,
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>
                <Link
                  href={card.href}
                  style={{
                    fontSize: 12, fontWeight: 500, color: 'var(--accent-link)',
                    display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none',
                  }}
                >
                  {tActions('seeDetails')} <ArrowRightOutlined style={{ fontSize: 10 }} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* At a Glance badges */}
      {(upcomingTasks > 0 || pendingLeads > 0 || activeDeals > 0) && (
        <div className="flex flex-wrap gap-3">
          {upcomingTasks > 0 && (
            <Link href="/tasks">
              <div className="crm-card px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                <ClockCircleOutlined style={{ color: '#F59E0B' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {t('upcomingTasksBadge', { count: upcomingTasks })}
                </span>
              </div>
            </Link>
          )}
          {pendingLeads > 0 && (
            <Link href="/leads?status=new">
              <div className="crm-card px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                <RiseOutlined style={{ color: '#10B981' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {t('pendingLeadsBadge', { count: pendingLeads })}
                </span>
              </div>
            </Link>
          )}
          {activeDeals > 0 && (
            <Link href="/deals">
              <div className="crm-card px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                <FundProjectionScreenOutlined style={{ color: '#2563EB' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {t('activeDealsBadge', { count: activeDeals })}
                </span>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Bottom Section: Recent Calls + Tasks / Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Calls */}
        <div className="crm-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {t('recentCalls')}
              </h3>
            </div>
            <Link href="/calls" style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-link)', textDecoration: 'none' }}>
              {tActions('viewAll')}
            </Link>
          </div>
          {recentCalls.length > 0 ? (
            <div className="space-y-1">
              {recentCalls.slice(0, 5).map((call: any) => (
                <Link key={call.id} href={`/calls/${call.id}`}>
                  <div
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ margin: '0 -12px' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: call.direction === 'inbound' ? 'var(--icon-bg-green)' : 'var(--icon-bg-indigo)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: call.direction === 'inbound' ? '#10B981' : '#4338CA',
                          fontSize: 14,
                        }}
                      >
                        {call.direction === 'inbound' ? <PhoneOutlined /> : <PhoneOutlined rotate={135} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                          {call.phone || '—'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {formatTimeAgo(call.started_at, t)}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatDuration(call.duration || 0)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PhoneOutlined style={{ fontSize: 24, color: 'var(--text-muted)' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{t('noCalls')}</p>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="crm-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {t('myTasks')}
              </h3>
            </div>
            <Link href="/tasks" style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-link)', textDecoration: 'none' }}>
              {tActions('viewAll')}
            </Link>
          </div>
          {recentTasks.length > 0 ? (
            <div className="space-y-1">
              {recentTasks.slice(0, 5).map((task: any) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ margin: '0 -12px' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'var(--icon-bg-amber)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#F59E0B', fontSize: 14, flexShrink: 0,
                        }}
                      >
                        <CheckSquareOutlined />
                      </div>
                      <div className="min-w-0">
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }} className="truncate">
                          {task.title}
                        </div>
                        {task.due_date && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <Tag color={taskStatusColors[task.status] || 'default'} style={{ marginRight: 0 }}>
                      {tStatuses(task.status)}
                    </Tag>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquareOutlined style={{ fontSize: 24, color: 'var(--text-muted)' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{t('noTasks')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance */}
      <div className="crm-card p-6">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 16 }}>
          {t('performance')}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('productivityScore'), value: stats?.productivity_score || 0, color: 'var(--accent-link)' },
            { label: t('totalActivities'), value: stats?.total_activities || 0, color: 'var(--text-primary)' },
            { label: t('callAnswerRate'), value: `${Math.round(stats?.calls.success_rate || 0)}%`, color: 'var(--text-primary)' },
            { label: t('leadConversion'), value: `${Math.round(stats?.leads.conversion_rate || 0)}%`, color: 'var(--text-primary)' },
          ].map((item) => (
            <div key={item.label} className="text-center py-3">
              <div style={{ fontSize: 28, fontWeight: 700, color: item.color, lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
