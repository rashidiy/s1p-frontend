'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, FileTextOutlined, DollarOutlined, CalendarOutlined, TeamOutlined, PhoneOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Input, Tag, message, Modal } from 'antd';
import { apiClient } from '@/lib/api';
import { CONTRACT_STATUS_COLORS, CONTRACT_STATUS_LABELS, BILLING_PERIOD_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import type { ContractDetailResponse } from '@/types/api';

export default function ContractDetailPage() {
  const params = useParams()!;
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
      message.error('Failed to load contract');
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
      message.error('Failed to renew contract');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Are you sure you want to cancel this contract?',
      okText: 'Yes, cancel',
      cancelText: 'No',
      okButtonProps: { danger: true },
      onOk: async () => {
        setProcessing(true);
        try {
          await apiClient.cancelContract(contractId);
          loadContract();
        } catch (error) {
          console.error('Failed to cancel contract:', error);
          message.error('Failed to cancel contract');
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-56 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-3 w-16 bg-gray-50 rounded animate-pulse mb-3" />
            <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-6 space-y-3">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex justify-between">
                <div className="h-4 w-24 bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  if (!contract) return <div className="p-6">Contract not found</div>;

  const statusColor = CONTRACT_STATUS_COLORS[contract.status] || 'bg-gray-100 text-gray-800';
  const paymentColor = PAYMENT_STATUS_COLORS[contract.payment_status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <Button size="small" type="text" onClick={() => router.push('/owner/contracts')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
          <Tag className={statusColor}>{CONTRACT_STATUS_LABELS[contract.status]}</Tag>
        </div>
        <div className="flex gap-2">
          {contract.status === 'active' && (
            <>
              <Button type="default" onClick={() => setShowRenew(true)}>
                <ReloadOutlined style={{ marginRight: 8 }} />
                <span className="hidden sm:inline">Renew</span>
              </Button>
              <Button type="primary" danger onClick={handleCancel} disabled={processing}>
                <CloseCircleOutlined style={{ marginRight: 8 }} />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {showRenew && (
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">Renew Contract</h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">New End Date *</label>
                <Input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} required size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">New Amount (optional)</label>
                <Input type="number" value={renewAmount} onChange={(e) => setRenewAmount(e.target.value)} placeholder="Keep current" size="large" />
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button type="primary" onClick={handleRenew} loading={processing} disabled={!renewDate}>Confirm Renewal</Button>
              <Button type="default" onClick={() => setShowRenew(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
            <p className="text-sm text-gray-400">Amount</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1">
              <DollarOutlined style={{ fontSize: 20, color: '#16a34a' }} />
              <span className="text-xl sm:text-2xl font-bold">{contract.price}</span>
            </div>
            <p className="text-xs text-gray-500">
              {contract.currency} / {BILLING_PERIOD_LABELS[contract.billing_period]?.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
            <p className="text-sm text-gray-400">Days Remaining</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1">
              <CalendarOutlined style={{ fontSize: 20 }} />
              <span className="text-xl sm:text-2xl font-bold">{contract.days_until_expiry ?? '\u2014'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
            <p className="text-sm text-gray-400">Users</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1">
              <TeamOutlined style={{ fontSize: 20 }} />
              <span className="text-xl sm:text-2xl font-bold">{contract.current_admins + contract.current_managers + contract.current_operators} / {contract.max_admins + contract.max_managers + contract.max_operators}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6 pb-2">
            <p className="text-sm text-gray-400">Storage</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1">
              <PhoneOutlined style={{ fontSize: 20 }} />
              <span className="text-xl sm:text-2xl font-bold">{contract.max_storage_gb} GB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">Contract Details</h3>
          </div>
          <div className="p-4 sm:p-6 pt-0">
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
          <div className="flex flex-col space-y-1.5 p-4 sm:p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">Payment Info</h3>
          </div>
          <div className="p-4 sm:p-6 pt-0">
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
