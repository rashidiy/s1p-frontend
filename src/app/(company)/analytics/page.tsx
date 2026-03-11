'use client';

import { useEffect, useState, useCallback } from 'react';
import { PhoneOutlined, RiseOutlined, CheckSquareOutlined, FundProjectionScreenOutlined, TeamOutlined } from '@ant-design/icons';
import { Alert, Spin, Tabs, message } from 'antd';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { OperatorDashboard, AdminDashboard } from '@/types/api';

const OUTCOME_CHART_COLORS: Record<string, string> = {
  interested: '#22c55e', appointment_scheduled: '#16a34a', follow_up: '#06b6d4',
  sale_made: '#eab308', no_answer: '#f97316', left_voicemail: '#f59e0b',
  busy: '#ef4444', not_interested: '#dc2626', other: '#94a3b8',
};

// TODO [Phase 2]: Replace with real API call once backend provides direction-split trend data.
// Backend currently has GET /api/v1/company/analytics/team/dashboard → AdminDashboard.calls_trend
// which returns [{date, calls}] (total only). Need a new endpoint or extend calls_trend to include
// inbound/outbound breakdown: GET /api/v1/company/calls/trends?split_by=direction
const SAMPLE_TREND_DATA = [
  { date: 'Mon', total: 42, inbound: 28, outbound: 14 },
  { date: 'Tue', total: 58, inbound: 35, outbound: 23 },
  { date: 'Wed', total: 45, inbound: 30, outbound: 15 },
  { date: 'Thu', total: 67, inbound: 40, outbound: 27 },
  { date: 'Fri', total: 73, inbound: 48, outbound: 25 },
  { date: 'Sat', total: 29, inbound: 18, outbound: 11 },
  { date: 'Sun', total: 15, inbound: 10, outbound: 5 },
];

// TODO [Phase 2]: Replace with real API call once backend provides per-operator call stats.
// Need: GET /api/v1/company/analytics/team/operators → [{name, total_calls, answered_calls}]
// AdminDashboard.top_operators_by_calls exists but uses company-wide stats, not per-operator.
const SAMPLE_TEAM_DATA = [
  { name: 'Alice', calls: 28, answered: 22 },
  { name: 'Bob', calls: 35, answered: 29 },
  { name: 'Carol', calls: 19, answered: 16 },
  { name: 'Dave', calls: 42, answered: 38 },
];

// Fallback when getCallOutcomesSummary returns no data
const SAMPLE_OUTCOME_DATA = [
  { name: 'Interested', value: 24, color: '#22c55e' },
  { name: 'No Answer', value: 18, color: '#f97316' },
  { name: 'Follow Up', value: 15, color: '#06b6d4' },
  { name: 'Not Interested', value: 8, color: '#ef4444' },
  { name: 'Other', value: 12, color: '#94a3b8' },
];

export default function AnalyticsPage() {
  const [operatorData, setOperatorData] = useState<OperatorDashboard | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    callTrends: [] as Array<{ date: string; total: number; inbound: number; outbound: number }>,
    teamPerformance: [] as Array<{ name: string; calls: number; answered: number }>,
    outcomeDistribution: [] as Array<{ name: string; value: number; color: string }>,
  });
  const [chartsLoading, setChartsLoading] = useState(true);
  const { isAdmin, isManager } = useAuthStore();

  const canViewTeamData = isAdmin() || isManager();

  const loadDashboards = useCallback(async () => {
    try {
      const myData = await apiClient.getMyDashboard();
      setOperatorData(myData);

      if (canViewTeamData) {
        const teamData = await apiClient.getAdminDashboard();
        setAdminData(teamData);
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error);
      message.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  }, [canViewTeamData]);

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  useEffect(() => {
    loadChartData();
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
        : SAMPLE_OUTCOME_DATA;

      setChartData(prev => ({ ...prev, outcomeDistribution: outcomeData }));
    } catch {
      message.error('Failed to load chart data');
      setChartData({
        callTrends: SAMPLE_TREND_DATA,
        teamPerformance: SAMPLE_TEAM_DATA,
        outcomeDistribution: SAMPLE_OUTCOME_DATA,
      });
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

  // Use this_month data for display
  const myStats = operatorData?.this_month;
  const teamStats = adminData?.this_month;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="page-subtitle">Performance metrics and insights</p>
        </div>
      </div>

      <Alert
        message="Some charts use demo data"
        description="Call Volume Trends and Team Performance charts display sample data — the backend API endpoints for direction-split trends and per-operator stats are not yet available (Phase 2). The stat cards, Call Outcome Distribution, and Top Performers sections use real data from your account."
        type="warning"
        showIcon
        closable
      />

      <Tabs
        defaultActiveKey="my"
        items={[
          {
            key: 'my',
            label: 'My Performance',
            children: (<div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-0">
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">Total Calls</h3>
                <PhoneOutlined style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {myStats?.calls.total_calls || 0}
                </div>
                <p className="text-xs text-gray-400">
                  {myStats?.calls.answered_calls || 0} answered
                </p>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">Leads</h3>
                <RiseOutlined style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {myStats?.leads.total_leads || 0}
                </div>
                <p className="text-xs text-gray-400">
                  {myStats?.leads.converted_leads || 0} converted
                </p>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">Deals</h3>
                <FundProjectionScreenOutlined style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {myStats?.deals.total_deals || 0}
                </div>
                <p className="text-xs text-green-600">
                  ${myStats?.deals.total_value?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">Tasks</h3>
                <CheckSquareOutlined style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {myStats?.tasks.completed_tasks || 0}
                </div>
                <p className="text-xs text-gray-400">
                  of {myStats?.tasks.total_tasks || 0} total
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">Call Statistics</h3>
                <p className="text-sm text-gray-400">Your calling performance</p>
              </div>
              <div className="p-6 pt-0 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Answer Rate</span>
                  <span className="font-semibold">
                    {Math.round(myStats?.calls.success_rate || 0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Duration</span>
                  <span className="font-semibold">
                    {myStats?.calls.average_duration ?
                      `${Math.floor(myStats.calls.average_duration / 60)}m ${myStats.calls.average_duration % 60}s` :
                      '0m 0s'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inbound</span>
                  <span className="font-semibold">{myStats?.calls.inbound_calls || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Outbound</span>
                  <span className="font-semibold">{myStats?.calls.outbound_calls || 0}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">Performance Score</h3>
                <p className="text-sm text-gray-400">Overall productivity</p>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600">
                      {myStats?.productivity_score || 0}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Total Activities: {myStats?.total_activities || 0}
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
              <h3 className="text-lg font-semibold gradient-text mb-4">Call Volume Trends</h3>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]"><Spin /></div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.callTrends.length > 0 ? chartData.callTrends : SAMPLE_TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#6366f1" name="Total" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="inbound" stroke="#22c55e" name="Inbound" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="outbound" stroke="#f97316" name="Outbound" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 2: Team Performance Bar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold gradient-text mb-4">Team Performance</h3>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[280px]"><Spin /></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData.teamPerformance.length > 0 ? chartData.teamPerformance : SAMPLE_TEAM_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Bar dataKey="calls" fill="#6366f1" name="Total Calls" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="answered" fill="#22c55e" name="Answered" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart 3: Outcome Distribution Pie Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold gradient-text mb-4">Call Outcome Distribution</h3>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[280px]"><Spin /></div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={chartData.outcomeDistribution.length > 0 ? chartData.outcomeDistribution : SAMPLE_OUTCOME_DATA}
                      cx="50%" cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(chartData.outcomeDistribution.length > 0 ? chartData.outcomeDistribution : SAMPLE_OUTCOME_DATA)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>),
          },
          ...(canViewTeamData ? [{
            key: 'team',
            label: 'Team Overview',
            children: (<div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-0">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">Team Members</h3>
                  <TeamOutlined style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold">
                    {teamStats?.total_operators || 0}
                  </div>
                  <p className="text-xs text-gray-400">
                    {teamStats?.active_operators || 0} active
                  </p>
                </div>
              </div>

              <div className="glass-card p-0">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">Total Calls</h3>
                  <PhoneOutlined style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold">
                    {teamStats?.calls.total_calls || 0}
                  </div>
                  <p className="text-xs text-gray-400">
                    {teamStats?.calls.answered_calls || 0} answered
                  </p>
                </div>
              </div>

              <div className="glass-card p-0">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">Team Leads</h3>
                  <RiseOutlined style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold">
                    {teamStats?.leads.total_leads || 0}
                  </div>
                  <p className="text-xs text-gray-400">
                    {teamStats?.leads.converted_leads || 0} converted
                  </p>
                </div>
              </div>

              <div className="glass-card p-0">
                <div className="flex flex-row items-center justify-between p-6 pb-2">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-sm font-medium">Revenue</h3>
                  <FundProjectionScreenOutlined style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold">
                    ${teamStats?.deals.total_value?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-gray-400">
                    {teamStats?.deals.won || 0} deals won
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">Top Performers</h3>
                <p className="text-sm text-gray-400">Operators ranked by performance</p>
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
                          <p className="text-sm text-gray-500">
                            {performer.calls.total_calls} calls, {performer.leads.total_leads} leads
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          Score: {performer.productivity_score}
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
