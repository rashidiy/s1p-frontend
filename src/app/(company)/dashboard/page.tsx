'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, TrendingUp, Briefcase, CheckSquare, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { OperatorDashboard } from '@/types/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<OperatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <div className="p-6">Loading dashboard...</div>;
  }

  // Use this_month data for display
  const stats = dashboard?.this_month;

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
            <div className="text-2xl font-bold">{stats?.calls.total_calls || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.calls.answered_calls || 0} answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.leads.total_leads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.leads.converted_leads || 0} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deals.total_deals || 0}</div>
            <p className="text-xs text-green-600">
              ${stats?.deals.total_value?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tasks.completed_tasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {stats?.tasks.total_tasks || 0} total
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
                {stats?.productivity_score || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Activities</span>
              <span className="font-semibold">{stats?.total_activities || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Call Answer Rate</span>
              <span className="font-semibold">
                {Math.round(stats?.calls.success_rate || 0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lead Conversion</span>
              <span className="font-semibold">
                {Math.round(stats?.leads.conversion_rate || 0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
