'use client';

import { useEffect, useState, useCallback } from 'react';
import { PhoneOutlined, RiseOutlined, CheckSquareOutlined, FundProjectionScreenOutlined, TeamOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Spin, Tabs, Tooltip as AntTooltip, message } from 'antd';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ErrorCharacter } from '@/components/illustrations/ErrorCharacter';
import type { OperatorDashboard, AdminDashboard } from '@/types/api';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';

const OUTCOME_CHART_COLORS: Record<string, string> = {
  interested: '#22c55e', appointment_scheduled: '#16a34a', follow_up: '#06b6d4',
  sale_made: '#eab308', no_answer: '#f97316', left_voicemail: '#f59e0b',
  busy: '#ef4444', not_interested: '#dc2626', other: '#94a3b8',
};


export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tDashboard = useTranslations('dashboard');

  const [operatorData, setOperatorData] = useState<OperatorDashboard | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    callTrends: [] as Array<{ date: string; total: number; inbound: number; outbound: number }>,
    teamPerformance: [] as Array<{ name: string; calls: number; answered: number }>,
    outcomeDistribution: [] as Array<{ name: string; value: number; color: string }>,
  });
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { hasPermissionString } = useAuthStore();

  const canViewTeamData = hasPermissionString('stats.read');

  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid var(--border-light)',
    boxShadow: '0 4px 20px var(--tooltip-shadow)',
    backgroundColor: 'var(--tooltip-bg)',
    color: 'var(--text-primary)',
  };

  const loadDashboards = useCallback(async () => {
    try {
      const myData = await apiClient.getMyDashboard();
      setOperatorData(myData);

      if (canViewTeamData) {
        const teamData = await apiClient.getAdminDashboard();
        setAdminData(teamData);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- tErrors is a stable reference from next-intl
  }, [canViewTeamData]);

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  useEffect(() => {
    loadChartData();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadChartData = async () => {
    setChartsLoading(true);
    try {
      const summary = await apiClient.getCallOutcomesSummary({});
      const outcomeData = summary?.by_outcome
        ? Object.entries(summary.by_outcome).map(([key, val]) => ({
            name: key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            value: val as number,
            color: OUTCOME_CHART_COLORS[key] || '#94a3b8',
          }))
        : [];

      setChartData(prev => ({ ...prev, outcomeDistribution: outcomeData }));
    } catch {
      message.error(tErrors('failedToLoadChartData'));
    } finally {
      setChartsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-gray-50 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5">
              <div className="h-3 w-20 bg-gray-50 rounded animate-pulse mb-3" />
              <div className="h-7 w-12 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="h-5 w-36 bg-gray-100 rounded animate-pulse mb-4" />
              <div className="h-[250px] bg-gray-50 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <ErrorCharacter height={115} />
        <h3 className="mt-5 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{tErrors('somethingWentWrong')}</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{tErrors('tryAgainLater')}</p>
        <Button type="primary" className="mt-4" onClick={() => { setError(false); setLoading(true); loadDashboards(); }}>
          {tActions('tryAgain')}
        </Button>
      </div>
    );
  }

  // Use this_month data for display
  const myStats = operatorData?.this_month;
  const teamStats = adminData?.this_month;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="page-subtitle">
            {t('subtitle')}
            <AntTooltip title={t('analyticsHelp')}>
              <QuestionCircleOutlined className="text-gray-400 cursor-help ml-2" />
            </AntTooltip>
          </p>
        </div>
      </div>


      <Tabs
        defaultActiveKey="my"
        items={[
          {
            key: 'my',
            label: t('myPerformance'),
            children: (<div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-0">
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">{t('totalCalls')}</h3>
                <PhoneOutlined style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {(myStats?.calls.total_calls || 0).toLocaleString()}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {(myStats?.calls.answered_calls || 0).toLocaleString()} {t('answered')}
                </p>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">{t('totalLeads')}</h3>
                <RiseOutlined style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {(myStats?.leads.total_leads || 0).toLocaleString()}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {(myStats?.leads.converted_leads || 0).toLocaleString()} {t('converted')}
                </p>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">{t('totalDeals')}</h3>
                <FundProjectionScreenOutlined style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {(myStats?.deals.total_deals || 0).toLocaleString()}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(myStats?.deals.total_value || 0)}
                </p>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">{t('totalTasks')}</h3>
                <CheckSquareOutlined style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {(myStats?.tasks.completed_tasks || 0).toLocaleString()}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {tDashboard('ofTotal', { count: myStats?.tasks.total_tasks || 0 })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">{t('callStatistics')}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('yourCallingPerformance')}</p>
              </div>
              <div className="p-6 pt-0 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('answerRate')}</span>
                  <span className="font-semibold">
                    {Math.round(myStats?.calls.success_rate || 0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('avgDuration')}</span>
                  <span className="font-semibold">
                    {myStats?.calls.average_duration ?
                      `${Math.floor(myStats.calls.average_duration / 60)}m ${myStats.calls.average_duration % 60}s` :
                      '0m 0s'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('inbound')}</span>
                  <span className="font-semibold">{myStats?.calls.inbound_calls || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('outbound')}</span>
                  <span className="font-semibold">{myStats?.calls.outbound_calls || 0}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">{t('performanceScore')}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('overallProductivity')}</p>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600">
                      {myStats?.productivity_score || 0}
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                      {tDashboard('totalActivities')}: {myStats?.total_activities || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Call Trends Line Chart */}
            <div className="glass-card p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold gradient-text mb-4">{t('callVolumeTrends')}</h3>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]"><Spin /></div>
              ) : chartData.callTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.callTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#6366f1" name={t('totalCalls')} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="inbound" stroke="#22c55e" name={t('inbound')} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="outbound" stroke="#f97316" name={t('outbound')} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-sm" style={{ color: 'var(--text-muted)' }}>{t('noDataAvailable')}</div>
              )}
            </div>

            {/* Chart 2: Team Performance Bar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold gradient-text mb-4">{t('teamPerformance')}</h3>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[280px]"><Spin /></div>
              ) : chartData.teamPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData.teamPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="calls" fill="#6366f1" name={t('totalCalls')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="answered" fill="#22c55e" name={t('answered')} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-sm" style={{ color: 'var(--text-muted)' }}>{t('noDataAvailable')}</div>
              )}
            </div>

            {/* Chart 3: Outcome Distribution Pie Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold gradient-text mb-4">{t('callOutcomeDistribution')}</h3>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[280px]"><Spin /></div>
              ) : chartData.outcomeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={chartData.outcomeDistribution}
                      cx="50%" cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.outcomeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-sm" style={{ color: 'var(--text-muted)' }}>{t('noDataAvailable')}</div>
              )}
            </div>
          </div>
        </div>),
          },
          ...(canViewTeamData ? [{
            key: 'team',
            label: t('teamOverview'),
            children: (<div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-0">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">{t('teamMembers')}</h3>
                  <TeamOutlined style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold">
                    {(teamStats?.total_operators || 0).toLocaleString()}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {(teamStats?.active_operators || 0).toLocaleString()} {t('active')}
                  </p>
                </div>
              </div>

              <div className="glass-card p-0">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">{t('totalCalls')}</h3>
                  <PhoneOutlined style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold">
                    {(teamStats?.calls.total_calls || 0).toLocaleString()}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {(teamStats?.calls.answered_calls || 0).toLocaleString()} {t('answered')}
                  </p>
                </div>
              </div>

              <div className="glass-card p-0">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">{t('teamLeads')}</h3>
                  <RiseOutlined style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold">
                    {(teamStats?.leads.total_leads || 0).toLocaleString()}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {(teamStats?.leads.converted_leads || 0).toLocaleString()} {t('converted')}
                  </p>
                </div>
              </div>

              <div className="glass-card p-0">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">{t('revenue')}</h3>
                  <FundProjectionScreenOutlined style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold">
                    {formatCurrency(teamStats?.deals.total_value || 0)}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('dealsWon', { count: teamStats?.deals.won || 0 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">{t('topPerformers')}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('operatorsRankedByPerformance')}</p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  {teamStats?.top_operators_by_calls?.map((performer, index) => (
                    <div key={performer.user_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {performer.calls.total_calls} {t('totalCalls').toLowerCase()}, {performer.leads.total_leads} {t('totalLeads').toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {t('performanceScore')}: {performer.productivity_score}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>),
          }] : []),
        ]}
      />
    </div>
  );
}
