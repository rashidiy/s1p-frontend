'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Search, Plus, DollarSign, TrendingUp, User } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { DealResponse, PaginatedResponse } from '@/types/api';
import Link from 'next/link';

export default function DealsPage() {
  const [data, setData] = useState<PaginatedResponse<DealResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadDeals();
  }, [page, search, stage]);

  const loadDeals = async () => {
    try {
      const result = await apiClient.getDeals({
        page,
        page_size: 20,
        search: search || undefined,
        stage: stage || undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to load deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage?: string | null) => {
    switch (stage?.toLowerCase()) {
      case 'prospecting':
        return 'bg-blue-100 text-blue-800';
      case 'qualification':
        return 'bg-yellow-100 text-yellow-800';
      case 'proposal':
        return 'bg-orange-100 text-orange-800';
      case 'negotiation':
        return 'bg-purple-100 text-purple-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading deals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-gray-500">Track your active opportunities</p>
        </div>
        <Link href="/deals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={stage} onValueChange={(value) => { setStage(value); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Stages</SelectItem>
            <SelectItem value="prospecting">Prospecting</SelectItem>
            <SelectItem value="qualification">Qualification</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((deal) => (
          <Card key={deal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{deal.title}</CardTitle>
                  {deal.contact_name && (
                    <CardDescription className="flex items-center mt-1">
                      <User className="mr-1 h-3 w-3" />
                      {deal.contact_name}
                    </CardDescription>
                  )}
                </div>
                {deal.stage && (
                  <Badge className={getStageColor(deal.stage)}>
                    {deal.stage}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      ${deal.value.toLocaleString()}
                    </span>
                  </div>
                  {deal.probability && (
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      <span className="font-medium">{deal.probability}%</span>
                    </div>
                  )}
                </div>
                {deal.expected_close_date && (
                  <div className="text-sm text-gray-600">
                    Close: {new Date(deal.expected_close_date).toLocaleDateString()}
                  </div>
                )}
                {deal.assigned_to_name && (
                  <div className="text-sm text-gray-600">
                    Owner: <span className="font-medium">{deal.assigned_to_name}</span>
                  </div>
                )}
                <div className="flex space-x-2 pt-2">
                  <Link href={`/deals/${deal.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  {deal.stage !== 'won' && deal.stage !== 'lost' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={async () => {
                        try {
                          await apiClient.markDealWon(deal.id);
                          loadDeals();
                        } catch (error) {
                          console.error('Failed to mark deal as won:', error);
                        }
                      }}
                    >
                      Win
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
            <Briefcase className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium">No deals found</p>
            <p className="text-sm text-gray-500">
              {search ? 'Try adjusting your search' : 'Get started by adding a deal'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
