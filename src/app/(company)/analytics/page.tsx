'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, TrendingUp, CheckSquare, Briefcase, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { OperatorDashboard, AdminDashboard } from '@/types/api';

export default function AnalyticsPage() {
  const [operatorData, setOperatorData] = useState<OperatorDashboard | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  }, [canViewTeamData]);

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  // Use this_month data for display
  const myStats = operatorData?.this_month;
  const teamStats = adminData?.this_month;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-500">Performance metrics and insights</p>
      </div>

      <Tabs defaultValue="my" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my">My Performance</TabsTrigger>
          {canViewTeamData && <TabsTrigger value="team">Team Overview</TabsTrigger>}
        </TabsList>

        <TabsContent value="my" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myStats?.calls.total_calls || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {myStats?.calls.answered_calls || 0} answered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myStats?.leads.total_leads || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {myStats?.leads.converted_leads || 0} converted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deals</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myStats?.deals.total_deals || 0}
                </div>
                <p className="text-xs text-green-600">
                  ${myStats?.deals.total_value?.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myStats?.tasks.completed_tasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {myStats?.tasks.total_tasks || 0} total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Call Statistics</CardTitle>
                <CardDescription>Your calling performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
                <CardDescription>Overall productivity</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {canViewTeamData && (
          <TabsContent value="team" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamStats?.total_operators || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {teamStats?.active_operators || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamStats?.calls.total_calls || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {teamStats?.calls.answered_calls || 0} answered
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Leads</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamStats?.leads.total_leads || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {teamStats?.leads.converted_leads || 0} converted
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${teamStats?.deals.total_value?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {teamStats?.deals.won || 0} deals won
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Operators ranked by performance</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
