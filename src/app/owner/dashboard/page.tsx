'use client';

import { useEffect, useState } from 'react';
import { Button, Spin } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { OwnerDashboard } from '@/types/api';
import { WelcomeCharacter } from '@/components/illustrations';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function OwnerDashboardPage() {
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await apiClient.getOwnerDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-6 flex items-center justify-between overflow-hidden">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="gradient-text">{user?.first_name || 'Owner'}</span>
          </h1>
          <p className="text-gray-500 mt-1">Platform overview and company management</p>
          <Link href="/owner/companies/new" className="mt-3 inline-block">
            <Button type="primary" icon={<PlusOutlined />}>Add Company</Button>
          </Link>
        </div>
        <WelcomeCharacter width={120} height={120} className="hidden md:block" />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-indigo rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-90">Total Companies</span>
            <BankOutlined className="text-2xl opacity-80" />
          </div>
          <div className="text-3xl font-bold">{dashboard?.this_month?.total_companies || 0}</div>
          <p className="text-sm opacity-75 mt-1">{dashboard?.this_month?.active_companies || 0} active</p>
        </div>

        <div className="bg-gradient-blue rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-90">Total Users</span>
            <TeamOutlined className="text-2xl opacity-80" />
          </div>
          <div className="text-3xl font-bold">{dashboard?.this_month?.total_users || 0}</div>
          <p className="text-sm opacity-75 mt-1">Across all companies</p>
        </div>

        <div className="bg-gradient-teal rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-90">Total Calls (30d)</span>
            <ThunderboltOutlined className="text-2xl opacity-80" />
          </div>
          <div className="text-3xl font-bold">{dashboard?.this_month?.total_calls || 0}</div>
          <p className="text-sm opacity-75 mt-1">This month</p>
        </div>

        <div className="bg-gradient-orange rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-90">Revenue</span>
            <RiseOutlined className="text-2xl opacity-80" />
          </div>
          <div className="text-3xl font-bold">${dashboard?.this_month?.total_revenue?.toLocaleString() || 0}</div>
          <p className="text-sm opacity-75 mt-1">This month</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-1">Top Companies</h3>
          <p className="text-sm text-gray-500 mb-4">Best performing companies</p>
          <div className="space-y-3">
            {dashboard?.this_month?.top_companies?.map((company: { company_id: string; company_name: string; total_calls: number }) => (
              <div key={company.company_id} className="flex items-center justify-between p-3 rounded-xl bg-white/50">
                <div>
                  <p className="font-medium text-gray-900">{company.company_name}</p>
                  <p className="text-sm text-gray-500">{company.total_calls} calls</p>
                </div>
                <Link href={`/owner/companies/${company.company_id}`}>
                  <Button size="small">View</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-1">Platform Analytics</h3>
          <p className="text-sm text-gray-500 mb-4">System-wide metrics</p>
          <div className="space-y-4">
            {[
              { label: 'Total Leads', value: dashboard?.this_month?.total_leads || 0 },
              { label: 'Total Deals', value: dashboard?.this_month?.total_deals || 0 },
              { label: 'New Companies', value: dashboard?.this_month?.new_companies || 0 },
              { label: 'New Users', value: dashboard?.this_month?.new_users || 0 },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
