'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, FileTextOutlined, DollarOutlined, CalendarOutlined, TeamOutlined, PhoneOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Input, Spin, Tag } from 'antd';
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
        new_end_date: renewDate,
        price: renewAmount ? parseFloat(renewAmount) : undefined,
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
          <Button size="small" type="text"   onClick={() => router.back()}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
          <FileTextOutlined style={{ fontSize: 24, color: '#2563eb' }} />
          <h1 className="text-3xl font-bold gradient-text">{contract.name}</h1>
          <Tag className={statusColor}>{CONTRACT_STATUS_LABELS[contract.status]}</Tag>
        </div>
        <div className="flex gap-2">
          {contract.status === 'active' && (
            <>
              <Button type="default"  onClick={() => setShowRenew(true)}>
                <ReloadOutlined style={{ marginRight: 8 }} />
                Renew
              </Button>
              <Button type="primary" danger  onClick={handleCancel} disabled={processing}>
                <CloseCircleOutlined style={{ marginRight: 8 }} />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {showRenew && (
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Renew Contract</h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New End Date *</label>
                <Input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Amount (optional)</label>
                <Input type="number" value={renewAmount} onChange={(e) => setRenewAmount(e.target.value)} placeholder="Keep current" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRenew} disabled={processing || !renewDate}>
                {processing ? 'Renewing...' : 'Confirm Renewal'}
              </Button>
              <Button type="default"  onClick={() => setShowRenew(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-muted-foreground">Amount</p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex items-center gap-1">
              <DollarOutlined style={{ fontSize: 20, color: '#16a34a' }} />
              <span className="text-2xl font-bold">{contract.price}</span>
            </div>
            <p className="text-xs text-gray-500">
              {contract.currency} / {BILLING_PERIOD_LABELS[contract.billing_period]?.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-muted-foreground">Days Remaining</p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex items-center gap-1">
              <CalendarOutlined style={{ fontSize: 20 }} />
              <span className="text-2xl font-bold">{contract.days_until_expiry ?? '\u2014'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-muted-foreground">Users</p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex items-center gap-1">
              <TeamOutlined style={{ fontSize: 20 }} />
              <span className="text-2xl font-bold">{contract.current_admins + contract.current_managers + contract.current_operators} / {contract.max_admins + contract.max_managers + contract.max_operators}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-muted-foreground">Storage</p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex items-center gap-1">
              <PhoneOutlined style={{ fontSize: 20 }} />
              <span className="text-2xl font-bold">{contract.max_storage_gb} GB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Contract Details</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Company</span>
                <span className="font-medium">{contract.company_name || contract.company_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Tag className={statusColor}>{CONTRACT_STATUS_LABELS[contract.status]}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <Tag className={paymentColor}>{PAYMENT_STATUS_LABELS[contract.payment_status]}</Tag>
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
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Payment Info</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Next Payment</span>
                <span>{contract.next_payment_date ? new Date(contract.next_payment_date).toLocaleDateString() : '\u2014'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Grace Period</span>
                <span>{contract.grace_period_days} days</span>
              </div>
              {contract.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Notes</span>
                  <span>{contract.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
