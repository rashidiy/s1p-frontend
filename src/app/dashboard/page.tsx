'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { SipuniResponse } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [integrations, setIntegrations] = useState<SipuniResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await apiClient.getSipuniList();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock statistics data (would come from API in production)
  const stats = [
    {
      title: 'Total Calls Today',
      value: '156',
      change: '+12%',
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Incoming Calls',
      value: '89',
      change: '+8%',
      icon: PhoneIncoming,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Outgoing Calls',
      value: '67',
      change: '+15%',
      icon: PhoneOutgoing,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Missed Calls',
      value: '12',
      change: '-5%',
      icon: PhoneMissed,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  // Mock recent activity
  const recentActivity = [
    { id: 1, type: 'incoming', phone: '+1 (555) 123-4567', duration: '5m 23s', time: '10 minutes ago', status: 'completed' },
    { id: 2, type: 'outgoing', phone: '+1 (555) 987-6543', duration: '2m 15s', time: '25 minutes ago', status: 'completed' },
    { id: 3, type: 'missed', phone: '+1 (555) 456-7890', duration: '-', time: '1 hour ago', status: 'missed' },
    { id: 4, type: 'incoming', phone: '+1 (555) 321-0987', duration: '8m 42s', time: '2 hours ago', status: 'completed' },
  ];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here&apos;s an overview of your call activity.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                        {stat.change}
                      </span>{' '}
                      from yesterday
                    </p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest call interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'incoming' ? 'bg-green-50 text-green-600' :
                        activity.type === 'outgoing' ? 'bg-blue-50 text-blue-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {activity.type === 'incoming' ? <PhoneIncoming className="h-5 w-5" /> :
                         activity.type === 'outgoing' ? <PhoneOutgoing className="h-5 w-5" /> :
                         <PhoneMissed className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.phone}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.status === 'missed' ? 'destructive' : 'secondary'}>
                        {activity.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connected SIPUNI accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : integrations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No integrations configured yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {integrations.slice(0, 5).map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {integration.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Cabinet: {integration.cabinet_id}
                        </p>
                      </div>
                      <Badge variant="success" className="shrink-0">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
