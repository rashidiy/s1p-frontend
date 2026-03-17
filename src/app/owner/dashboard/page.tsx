'use client';

import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { OwnerDashboard } from '@/types/api';
import { WelcomeCharacter, ErrorCharacter } from '@/components/illustrations';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

export default function OwnerDashboardPage() {
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user } = useAuthStore();
  const t = useTranslations();

  useEffect(() => {
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadDashboard = async () => {
    setError(false);
    try {
      const data = await apiClient.getOwnerDashboard();
      setDashboard(data);
    } catch (error) {
      setError(true);
      message.error(t('errors.failedToLoadDashboard'));
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <ErrorCharacter height={115} />
        <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('errors.somethingWentWrong')}</h3>
        <p className="text-sm text-gray-400 mt-1">{t('errors.tryAgainLater')}</p>
        <Button type="primary" className="mt-4" onClick={() => { setError(false); setLoading(true); loadDashboard(); }}>
          {t('actions.tryAgain')}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-7 flex items-center justify-between">
          <div>
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-56 bg-gray-100 rounded-lg mt-2 animate-pulse" />
            <div className="h-4 w-64 bg-gray-50 rounded mt-2 animate-pulse" />
            <div className="h-10 w-36 bg-gray-100 rounded-lg mt-4 animate-pulse" />
          </div>
          <div className="w-[120px] h-[120px] bg-gray-50 rounded-full animate-pulse hidden md:block" />
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-gray-50 rounded mt-2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-5 sm:p-7 flex items-center justify-between overflow-hidden">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{t('dashboard.goodToSeeYouBack')}</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t.rich('dashboard.welcome', {
              name: user?.first_name || 'Owner',
              gradient: (chunks) => <span className="gradient-text">{chunks}</span>,
            })}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t('dashboard.platformOverview')}</p>
          <Link href="/owner/companies/new" className="mt-4 inline-block">
            <Button type="primary" icon={<PlusOutlined />} size="large">{t('dashboard.addCompany')}</Button>
          </Link>
        </div>
        <WelcomeCharacter width={120} height={120} className="hidden md:block" />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('dashboard.totalCompanies'), value: dashboard?.this_month?.total_companies || 0, sub: t('dashboard.activeCount', { count: dashboard?.this_month?.active_companies || 0 }), icon: <BankOutlined />, color: '#6366f1', href: '/owner/companies' },
          { label: t('dashboard.totalUsers'), value: dashboard?.this_month?.total_users || 0, sub: t('dashboard.acrossAllCompanies'), icon: <TeamOutlined />, color: '#3b82f6', href: '/owner/companies' },
          { label: t('dashboard.totalCalls30d'), value: dashboard?.this_month?.total_calls || 0, sub: t('dashboard.last30Days'), icon: <ThunderboltOutlined />, color: '#14b8a6', href: '/owner/companies' },
          { label: t('dashboard.revenueMRR'), value: formatCurrency(dashboard?.this_month?.total_revenue || 0), sub: t('dashboard.monthlyRecurring'), icon: <RiseOutlined />, color: '#f97316', href: '/owner/contracts' },
        ].map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="glass-card p-5 group hover:shadow-lg transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">{card.label}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`, boxShadow: `0 4px 12px ${card.color}30` }}>
                  {card.icon}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{card.value}</div>
              <p className="text-sm text-gray-400 mt-1">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.topCompanies')}</h3>
              <p className="text-sm text-gray-400">{t('dashboard.bestPerforming')}</p>
            </div>
            <Link href="/owner/companies">
              <Button type="link" size="small" className="!text-gray-400 !text-xs">{t('actions.viewAll')}</Button>
            </Link>
          </div>
          {dashboard?.this_month?.top_companies?.length ? (
            <div className="space-y-2">
              {dashboard.this_month.top_companies.map((company: { company_id: string; company_name: string; total_calls: number }, i: number) => (
                <Link key={company.company_id} href={`/owner/companies/${company.company_id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{company.company_name}</p>
                      <p className="text-xs text-gray-400">{t('dashboard.callsCount', { count: company.total_calls })}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <BankOutlined className="text-xl text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">{t('dashboard.noCompaniesYet')}</p>
              <p className="text-xs text-gray-300 mt-1">{t('dashboard.companiesWillAppear')}</p>
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.platformAnalytics')}</h3>
            <p className="text-sm text-gray-400">{t('dashboard.systemWideMetrics')}</p>
          </div>
          <div className="space-y-4">
            {[
              { label: t('dashboard.totalLeads'), value: dashboard?.this_month?.total_leads || 0, color: '#6366f1' },
              { label: t('dashboard.totalDeals'), value: dashboard?.this_month?.total_deals || 0, color: '#14b8a6' },
              { label: t('dashboard.newCompanies'), value: dashboard?.this_month?.new_companies || 0, color: '#f97316' },
              { label: t('dashboard.newUsers'), value: dashboard?.this_month?.new_users || 0, color: '#3b82f6' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-sm text-gray-500 flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
