'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BarChartOutlined, RiseOutlined, FallOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiClient } from '@/lib/api';
import type { SipuniResponse, RepresentEnum } from '@/types/api';

type IconComponentType = typeof BarChartOutlined;

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: string;
  icon: IconComponentType;
}

export default function StatisticsPage() {
  const [integrations, setIntegrations] = useState<SipuniResponse[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [timeRange, setTimeRange] = useState<RepresentEnum>('day');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await apiClient.getSipuniList();
      setIntegrations(data);
      if (data.length > 0) {
        setSelectedIntegration(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const loadStatistics = async () => {
    if (!selectedIntegration) return;

    setLoading(true);
    setStatsError('');
    try {
      const data = await apiClient.getCallStatistics({
        sipuni_id: selectedIntegration,
        represent: timeRange,
      });
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
      setStatsError(error.response?.data?.detail || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const totalCalls = stats?.total_calls ?? stats?.total ?? 0;
  const answeredCalls = stats?.answered ?? stats?.answered_calls ?? 0;
  const missedCalls = stats?.missed ?? stats?.missed_calls ?? 0;
  const avgDuration = stats?.avg_duration ?? stats?.average_duration ?? 0;
  const successRate = totalCalls > 0 ? ((answeredCalls / totalCalls) * 100).toFixed(1) : '0';

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  const statsCards: StatCard[] = [
    {
      title: 'Total Calls',
      value: totalCalls.toLocaleString(),
      change: stats ? '' : '--',
      trend: 'neutral',
      icon: ThunderboltOutlined,
    },
    {
      title: 'Average Duration',
      value: stats ? formatDuration(avgDuration) : '--',
      change: stats ? '' : '--',
      trend: 'neutral',
      icon: RiseOutlined,
    },
    {
      title: 'Success Rate',
      value: stats ? `${successRate}%` : '--',
      change: stats ? '' : '--',
      trend: Number(successRate) >= 90 ? 'up' : Number(successRate) >= 70 ? 'neutral' : 'down',
      icon: BarChartOutlined,
    },
    {
      title: 'Missed Calls',
      value: stats ? missedCalls.toLocaleString() : '--',
      change: stats ? '' : '--',
      trend: missedCalls > 0 ? 'down' : 'neutral',
      icon: FallOutlined,
    },
  ];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Statistics</h1>
          <p className="text-muted-foreground mt-2">
            View call statistics and analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Integration</Label>
            <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
              <SelectTrigger>
                <SelectValue placeholder="Select integration" />
              </SelectTrigger>
              <SelectContent>
                {integrations.map((integration) => (
                  <SelectItem key={integration.id} value={integration.id}>
                    {integration.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as RepresentEnum)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <Button onClick={loadStatistics} disabled={loading || !selectedIntegration}>
            {loading ? 'Loading...' : 'Load Statistics'}
          </Button>
          {statsError && (
            <span className="text-sm text-red-600">{statsError}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${
                      stat.trend === 'up' ? 'bg-green-50 text-green-600' :
                      stat.trend === 'down' ? 'bg-red-50 text-red-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      <IconComponent style={{ fontSize: 20 }} />
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Call Volume Trend</CardTitle>
              <CardDescription>
                Call volume over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.daily_breakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart data={stats.daily_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#6366f1" name="Total Calls" strokeWidth={2} />
                    <Line type="monotone" dataKey="answered" stroke="#22c55e" name="Answered" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {stats ? 'No chart data available' : 'Load statistics to view chart'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Distribution</CardTitle>
              <CardDescription>
                Breakdown by call type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const inbound = stats?.inbound ?? stats?.incoming ?? 0;
                  const outbound = stats?.outbound ?? stats?.outgoing ?? 0;
                  const missed = missedCalls;
                  const distTotal = inbound + outbound + missed || 1;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Incoming</span>
                        </div>
                        <span className="font-medium">{inbound.toLocaleString()} ({((inbound / distTotal) * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm">Outgoing</span>
                        </div>
                        <span className="font-medium">{outbound.toLocaleString()} ({((outbound / distTotal) * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm">Missed</span>
                        </div>
                        <span className="font-medium">{missed.toLocaleString()} ({((missed / distTotal) * 100).toFixed(0)}%)</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Contact Numbers</CardTitle>
              <CardDescription>
                Most frequently called numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { number: '+1 (555) 123-4567', calls: 45 },
                  { number: '+1 (555) 987-6543', calls: 38 },
                  { number: '+1 (555) 456-7890', calls: 32 },
                  { number: '+1 (555) 321-0987', calls: 28 },
                  { number: '+1 (555) 654-3210', calls: 24 },
                ].map((contact, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm font-medium">{contact.number}</span>
                    <span className="text-sm text-muted-foreground">{contact.calls} calls</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Answer Rate</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Avg. Wait Time</span>
                    <span className="text-sm font-medium">12s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">First Call Resolution</span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
