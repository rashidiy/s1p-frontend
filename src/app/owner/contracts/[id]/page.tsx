'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftOutlined, FileTextOutlined, DollarOutlined, CalendarOutlined, TeamOutlined, PhoneOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { apiClient } from '@/lib/api';
import { CONTRACT_STATUS_COLORS, CONTRACT_STATUS_LABELS, BILLING_PERIOD_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import type { ContractDetailResponse } from '@/types/api';

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRenew, setShowRenew] = useState(false);
  const [renewDate, setRenewDate] = useState('');
  const [renewAmount, setRenewAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const loadContract = async () => {
    try {
      const data = await apiClient.getContract(contractId);
      setContract(data);
    } catch (error) {
      console.error('Failed to load contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!renewDate) return;
    setProcessing(true);
    try {
      await apiClient.renewContract(contractId, {
        end_date: renewDate,
        amount: renewAmount ? parseFloat(renewAmount) : undefined,
      });
      setShowRenew(false);
      loadContract();
    } catch (error) {
      console.error('Failed to renew contract:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this contract?')) return;
    setProcessing(true);
    try {
      await apiClient.cancelContract(contractId);
      loadContract();
    } catch (error) {
      console.error('Failed to cancel contract:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  if (!contract) return <div className="p-6">Contract not found</div>;

  const statusColor = CONTRACT_STATUS_COLORS[contract.status] || 'bg-gray-100 text-gray-800';
  const paymentColor = PAYMENT_STATUS_COLORS[contract.payment_status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
          <FileTextOutlined style={{ fontSize: 24, color: '#2563eb' }} />
          <h1 className="text-3xl font-bold gradient-text">{contract.name}</h1>
          <Badge className={statusColor}>{CONTRACT_STATUS_LABELS[contract.status]}</Badge>
        </div>
        <div className="flex gap-2">
          {contract.status === 'active' && (
            <>
              <Button variant="outline" onClick={() => setShowRenew(true)}>
                <ReloadOutlined style={{ marginRight: 8 }} />
                Renew
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={processing}>
                <CloseCircleOutlined style={{ marginRight: 8 }} />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {showRenew && (
        <Card>
          <CardHeader>
            <CardTitle>Renew Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New End Date *</Label>
                <Input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>New Amount (optional)</Label>
                <Input type="number" value={renewAmount} onChange={(e) => setRenewAmount(e.target.value)} placeholder="Keep current" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRenew} disabled={processing || !renewDate}>
                {processing ? 'Renewing...' : 'Confirm Renewal'}
              </Button>
              <Button variant="outline" onClick={() => setShowRenew(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <DollarOutlined style={{ fontSize: 20, color: '#16a34a' }} />
              <span className="text-2xl font-bold">{contract.price}</span>
            </div>
            <p className="text-xs text-gray-500">
              {contract.currency} / {BILLING_PERIOD_LABELS[contract.billing_period]?.toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Days Remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <CalendarOutlined style={{ fontSize: 20 }} />
              <span className="text-2xl font-bold">{contract.days_remaining}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <TeamOutlined style={{ fontSize: 20 }} />
              <span className="text-2xl font-bold">{contract.current_users} / {contract.max_users}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Calls This Month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <PhoneOutlined style={{ fontSize: 20 }} />
              <span className="text-2xl font-bold">{contract.current_calls_this_month} / {contract.max_calls_per_month}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Company</span>
                <span className="font-medium">{contract.company_name || contract.company_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge className={statusColor}>{CONTRACT_STATUS_LABELS[contract.status]}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <Badge className={paymentColor}>{PAYMENT_STATUS_LABELS[contract.payment_status]}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing Period</span>
                <span>{BILLING_PERIOD_LABELS[contract.billing_period]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Auto Renew</span>
                <span>{contract.auto_renew ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Start Date</span>
                <span>{new Date(contract.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">End Date</span>
                <span>{new Date(contract.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {contract.payment_history && contract.payment_history.length > 0 ? (
              <div className="space-y-3">
                {contract.payment_history.map((payment: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-xs text-gray-500">{new Date(payment.date || payment.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No payment history</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
