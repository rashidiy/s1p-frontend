'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Spin } from 'antd';
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
    label: 'Total Calls',
    icon: <PhoneOutlined />,
    href: '/calls',
    iconBg: '#FFF0F0',
    iconColor: '#E84040',
    sparkColor: '#E84040',
  },
  {
    key: 'leads',
    label: 'Total Leads',
    icon: <RiseOutlined />,
    href: '/leads',
    iconBg: '#F0FDF4',
    iconColor: '#10B981',
    sparkColor: '#10B981',
  },
  {
    key: 'deals',
    label: 'Total Deals',
    icon: <FundProjectionScreenOutlined />,
    href: '/deals',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    sparkColor: '#2563EB',
  },
  {
    key: 'tasks',
    label: 'Completed Tasks',
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
  const { user } = useAuthStore();

  const loadDashboard = useCallback(async () => {
    try {
      const data = await apiClient.getMyDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const stats = dashboard?.this_month;

  const getStatValue = (key: string) => {
    switch (key) {
      case 'calls':
        return {
          value: stats?.calls.total_calls || 0,
          sub: `${stats?.calls.answered_calls || 0} answered`,
        };
      case 'leads':
        return {
          value: stats?.leads.total_leads || 0,
          sub: `${stats?.leads.converted_leads || 0} converted`,
        };
      case 'deals':
        return {
          value: stats?.deals.total_deals || 0,
          sub: `$${stats?.deals.total_value?.toLocaleString() || 0}`,
        };
      case 'tasks':
        return {
          value: stats?.tasks.completed_tasks || 0,
          sub: `of ${stats?.tasks.total_tasks || 0} total`,
        };
      default:
        return { value: 0, sub: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab bar row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {['Overview', 'Calls', 'Leads'].map((tab, i) => (
            <button
              key={tab}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: i === 0 ? '#E84040' : 'transparent',
                color: i === 0 ? '#ffffff' : '#6B7280',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            icon={<PlusOutlined />}
            style={{ borderColor: '#E5E7EB', color: '#374151', borderRadius: 8 }}
          >
            Add Widget
          </Button>
          <Button
            icon={<FilterOutlined />}
            style={{ borderColor: '#E5E7EB', color: '#374151', borderRadius: 8 }}
          >
            Filter
          </Button>
          <Button
            type="primary"
            style={{ background: '#0F172A', borderColor: '#0F172A', borderRadius: 8 }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  {card.label}
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
                  <div style={{ marginTop: 4 }}>
                    <span className="crm-badge-positive">+0%</span>
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
                  See Details <ArrowRightOutlined style={{ fontSize: 10 }} />
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
            Quick Actions
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            Common tasks and activities
          </p>
          <div className="space-y-2">
            {[
              { href: '/contacts', label: 'Manage Contacts', icon: <TeamOutlined /> },
              { href: '/leads', label: 'View Leads', icon: <RiseOutlined /> },
              { href: '/deals', label: 'Track Deals', icon: <FundProjectionScreenOutlined /> },
              { href: '/calls', label: 'Call History', icon: <PhoneOutlined /> },
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
            Performance
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            Your productivity metrics
          </p>
          <div className="space-y-4">
            {[
              {
                label: 'Productivity Score',
                value: stats?.productivity_score || 0,
                highlight: true,
              },
              { label: 'Total Activities', value: stats?.total_activities || 0 },
              {
                label: 'Call Answer Rate',
                value: `${Math.round(stats?.calls.success_rate || 0)}%`,
              },
              {
                label: 'Lead Conversion',
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
