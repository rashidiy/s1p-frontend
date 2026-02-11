'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Search, Plus, User, DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { LeadResponse, PaginatedResponse } from '@/types/api';
import Link from 'next/link';

export default function LeadsPage() {
  const [data, setData] = useState<PaginatedResponse<LeadResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLeads();
  }, [page, search, status]);

  const loadLeads = async () => {
    try {
      const result = await apiClient.getLeads({
        page,
        page_size: 20,
        search: search || undefined,
        status_filter: status || undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading leads...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-gray-500">Manage your sales pipeline</p>
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((lead) => (
          <Card key={lead.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{lead.title}</CardTitle>
                  {lead.contact_name && (
                    <CardDescription className="flex items-center mt-1">
                      <User className="mr-1 h-3 w-3" />
                      {lead.contact_name}
                    </CardDescription>
                  )}
                </div>
                {lead.status && (
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lead.estimated_value && (
                  <div className="flex items-center text-sm">
                    <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                    <span className="font-semibold">
                      ${lead.estimated_value.toLocaleString()}
                    </span>
                  </div>
                )}
                {lead.pipeline_stage && (
                  <div className="text-sm text-gray-600">
                    Stage: <span className="font-medium">{lead.pipeline_stage}</span>
                  </div>
                )}
                {lead.assigned_to_name && (
                  <div className="text-sm text-gray-600">
                    Assigned to: <span className="font-medium">{lead.assigned_to_name}</span>
                  </div>
                )}
                {lead.source && (
                  <Badge variant="outline" className="text-xs">
                    {lead.source}
                  </Badge>
                )}
                <div className="flex space-x-2 pt-2">
                  <Link href={`/leads/${lead.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  {lead.status !== 'converted' && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await apiClient.convertLead(lead.id, true);
                          loadLeads();
                        } catch (error) {
                          console.error('Failed to convert lead:', error);
                        }
                      }}
                    >
                      Convert
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.total_pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
            disabled={page === data.total_pages}
          >
            Next
          </Button>
        </div>
      )}

      {data?.items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium">No leads found</p>
            <p className="text-sm text-gray-500">
              {search ? 'Try adjusting your search' : 'Get started by adding a lead'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
