'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, TrendingUp, Briefcase, CheckSquare, Users, Activity } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { OperatorDashboard } from '@/types/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<OperatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await apiClient.getMyDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-gray-500">Your personal performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.calls.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.calls.answered || 0} answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.leads.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.leads.converted || 0} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.deals.total || 0}</div>
            <p className="text-xs text-green-600">
              ${dashboard?.deals.total_value?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.tasks.completed || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {dashboard?.tasks.total || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/contacts">
              <Badge className="w-full cursor-pointer justify-start p-3 text-sm" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Contacts
              </Badge>
            </Link>
            <Link href="/leads">
              <Badge className="w-full cursor-pointer justify-start p-3 text-sm" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Leads
              </Badge>
            </Link>
            <Link href="/deals">
              <Badge className="w-full cursor-pointer justify-start p-3 text-sm" variant="outline">
                <Briefcase className="mr-2 h-4 w-4" />
                Track Deals
              </Badge>
            </Link>
            <Link href="/calls">
              <Badge className="w-full cursor-pointer justify-start p-3 text-sm" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call History
              </Badge>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Your productivity metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Productivity Score</span>
              <span className="text-lg font-bold text-blue-600">
                {dashboard?.productivity_score || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Activities</span>
              <span className="font-semibold">{dashboard?.total_activities || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Call Answer Rate</span>
              <span className="font-semibold">
                {dashboard?.calls.total ?
                  Math.round((dashboard.calls.answered / dashboard.calls.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lead Conversion</span>
              <span className="font-semibold">
                {dashboard?.leads.total ?
                  Math.round((dashboard.leads.converted / dashboard.leads.total) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
