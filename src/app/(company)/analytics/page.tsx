'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, TrendingUp, CheckSquare, Briefcase, Activity, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { OperatorDashboard, AdminDashboard } from '@/types/api';

export default function AnalyticsPage() {
  const [operatorData, setOperatorData] = useState<OperatorDashboard | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isManager } = useAuthStore();

  const canViewTeamData = isAdmin() || isManager();

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
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
  };

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

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
                  {operatorData?.calls.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {operatorData?.calls.answered || 0} answered
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
                  {operatorData?.leads.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {operatorData?.leads.converted || 0} converted
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
                  {operatorData?.deals.total || 0}
                </div>
                <p className="text-xs text-green-600">
                  ${operatorData?.deals.total_value?.toLocaleString() || 0}
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
                  {operatorData?.tasks.completed || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {operatorData?.tasks.total || 0} total
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
                    {operatorData?.calls.total ?
                      Math.round((operatorData.calls.answered / operatorData.calls.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Duration</span>
                  <span className="font-semibold">
                    {operatorData?.calls.avg_duration ?
                      `${Math.floor(operatorData.calls.avg_duration / 60)}m ${operatorData.calls.avg_duration % 60}s` :
                      '0m 0s'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inbound</span>
                  <span className="font-semibold">{operatorData?.calls.inbound || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Outbound</span>
                  <span className="font-semibold">{operatorData?.calls.outbound || 0}</span>
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
                      {operatorData?.productivity_score || 0}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Total Activities: {operatorData?.total_activities || 0}
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
                    {adminData?.total_operators || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active operators
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
                    {adminData?.team_calls.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {adminData?.team_calls.answered || 0} answered
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
                    {adminData?.team_leads.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {adminData?.team_leads.converted || 0} converted
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
                    ${adminData?.team_deals.total_value?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {adminData?.team_deals.won || 0} deals won
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
                  {adminData?.top_performers?.map((performer, index) => (
                    <div key={performer.operator_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.operator_name}</p>
                          <p className="text-sm text-gray-500">
                            {performer.total_calls} calls, {performer.total_leads} leads
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          Score: {performer.performance_score}
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
