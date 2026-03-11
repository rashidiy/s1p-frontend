'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, message } from 'antd';
import {
  PhoneOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  FilterOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import type { OperatorDashboard } from '@/types/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

const SPARKLINE_DATA: Record<string, Array<{ v: number }>> = {
  calls: [{ v: 4 }, { v: 7 }, { v: 5 }, { v: 9 }, { v: 6 }, { v: 11 }, { v: 8 }],
  leads: [{ v: 2 }, { v: 5 }, { v: 4 }, { v: 7 }, { v: 6 }, { v: 8 }, { v: 10 }],
  deals: [{ v: 1 }, { v: 3 }, { v: 2 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 7 }],
  tasks: [{ v: 3 }, { v: 6 }, { v: 8 }, { v: 5 }, { v: 9 }, { v: 7 }, { v: 10 }],
};

const statCards = [
  {
    key: 'calls',
    labelKey: 'totalCalls' as const,
    icon: <PhoneOutlined />,
    href: '/calls',
    iconBg: '#FFF0F0',
    iconColor: '#E84040',
    sparkColor: '#E84040',
  },
  {
    key: 'leads',
    labelKey: 'totalLeads' as const,
    icon: <RiseOutlined />,
    href: '/leads',
    iconBg: '#F0FDF4',
    iconColor: '#10B981',
    sparkColor: '#10B981',
  },
  {
    key: 'deals',
    labelKey: 'totalDeals' as const,
    icon: <FundProjectionScreenOutlined />,
    href: '/deals',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    sparkColor: '#2563EB',
  },
  {
    key: 'tasks',
    labelKey: 'completedTasks' as const,
    icon: <CheckSquareOutlined />,
    href: '/tasks',
    iconBg: '#FFFBEB',
    iconColor: '#F59E0B',
    sparkColor: '#F59E0B',
  },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<OperatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuthStore();
  const t = useTranslations('dashboard');
  const tActions = useTranslations('actions');

  const loadDashboard = useCallback(async () => {
    try {
      const data = await apiClient.getMyDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      message.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse hidden sm:block" />
            <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="crm-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-7 w-12 bg-gray-100 rounded-lg animate-pulse" />
              </div>
              <div className="h-11 bg-gray-50 rounded animate-pulse" />
              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboard?.this_month;

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
          sub: `$${stats?.deals.total_value?.toLocaleString() || 0}`,
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
      {/* Tab bar row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto pb-1 -mb-1">
          {[{ key: 'overview', label: t('overview') }, { key: 'calls', label: t('totalCalls') }, { key: 'leads', label: t('totalLeads') }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="shrink-0 px-4 py-2 text-sm font-medium rounded-lg border-none cursor-pointer transition-all"
              style={{
                background: activeTab === tab.key ? '#E84040' : 'transparent',
                color: activeTab === tab.key ? '#ffffff' : '#6B7280',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<PlusOutlined />}
            className="!hidden sm:!inline-flex"
            style={{ borderColor: '#E5E7EB', color: '#374151', borderRadius: 8 }}
          >
            {tActions('addWidget')}
          </Button>
          <Button
            icon={<FilterOutlined />}
            style={{ borderColor: '#E5E7EB', color: '#374151', borderRadius: 8 }}
          >
            {tActions('filter')}
          </Button>
          <Button
            type="primary"
            className="!hidden sm:!inline-flex"
            style={{ background: '#0F172A', borderColor: '#0F172A', borderRadius: 8 }}
          >
            {tActions('export')}
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const { value, sub } = getStatValue(card.key);
          return (
            <div
              key={card.key}
              className="crm-card p-5"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Card header: label + info icon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}
                >
                  {t(card.labelKey)}
                </span>
                <InfoCircleOutlined
                  style={{ color: '#D1D5DB', fontSize: 14 }}
                />
              </div>

              {/* Icon + value + badge row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {/* Icon in colored circle */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.iconColor,
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#0F172A',
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </div>
                </div>
              </div>

              {/* Mini sparkline */}
              <div style={{ height: 44, marginLeft: -4, marginRight: -4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SPARKLINE_DATA[card.key] || SPARKLINE_DATA.calls}>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={card.sparkColor}
                      fill={`${card.sparkColor}18`}
                      strokeWidth={1.5}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      }}
                      formatter={(v: number) => [v, '']}
                      labelFormatter={() => ''}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sub text + See Details link */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #F3F4F6',
                  paddingTop: 10,
                }}
              >
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</span>
                <Link
                  href={card.href}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#E84040',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    textDecoration: 'none',
                  }}
                >
                  {tActions('seeDetails')} <ArrowRightOutlined style={{ fontSize: 10 }} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="crm-card p-6">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#0F172A',
              margin: 0,
              marginBottom: 4,
            }}
          >
            {t('quickActions')}
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            {t('commonTasks')}
          </p>
          <div className="space-y-2">
            {[
              { href: '/contacts', label: t('manageContacts'), icon: <TeamOutlined /> },
              { href: '/leads', label: t('viewLeads'), icon: <RiseOutlined /> },
              { href: '/deals', label: t('trackDeals'), icon: <FundProjectionScreenOutlined /> },
              { href: '/calls', label: t('callHistory'), icon: <PhoneOutlined /> },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  type="default"
                  block
                  className="!h-11 !text-left !flex !items-center !justify-start !gap-2"
                  icon={action.icon}
                >
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="crm-card p-6">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#0F172A',
              margin: 0,
              marginBottom: 4,
            }}
          >
            {t('performance')}
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            {t('yourProductivityMetrics')}
          </p>
          <div className="space-y-4">
            {[
              {
                label: t('productivityScore'),
                value: stats?.productivity_score || 0,
                highlight: true,
              },
              { label: t('totalActivities'), value: stats?.total_activities || 0 },
              {
                label: t('callAnswerRate'),
                value: `${Math.round(stats?.calls.success_rate || 0)}%`,
              },
              {
                label: t('leadConversion'),
                value: `${Math.round(stats?.leads.conversion_rate || 0)}%`,
              },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span style={{ fontSize: 13, color: '#6B7280' }}>{item.label}</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: item.highlight ? 18 : 14,
                    color: item.highlight ? '#E84040' : '#0F172A',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
