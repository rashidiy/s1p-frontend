'use client';

import { useEffect, useState } from 'react';
import { FileTextOutlined, TeamOutlined, CalendarOutlined, SafetyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert, Progress, Spin, Tag } from 'antd';
import { apiClient } from '@/lib/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import { CONTRACT_STATUS_COLORS, BILLING_PERIOD_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import type { ContractStatusResponse } from '@/types/api';

export default function ContractStatusPage() {
  const [contract, setContract] = useState<ContractStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContractStatus();
  }, []);

  const loadContractStatus = async () => {
    try {
      const data = await apiClient.getContractStatus();
      setContract(data);
    } catch (err) {
      setError('No active contract found or access denied');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-3 w-20 bg-gray-50 rounded animate-pulse mb-3" />
            <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-6 space-y-3">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3].map((j) => (
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

  if (!contract || error) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <p className="page-subtitle">View your active contract and billing status</p>
          </div>
        </div>
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={160} height={160} variant="thinking" />
          <p className="mt-4 text-lg font-medium text-gray-700">No Active Contract</p>
          <p className="text-sm text-gray-500">Please contact the platform administrator</p>
        </div>
      </div>
    );
  }

  const totalUsers = contract.current_admins + contract.current_managers + contract.current_operators;
  const maxUsers = contract.max_admins + contract.max_managers + contract.max_operators;
  const userUsage = maxUsers > 0 ? (totalUsers / maxUsers) * 100 : 0;
  const statusColor = CONTRACT_STATUS_COLORS[contract.status] || 'bg-gray-100 text-gray-800';
  const paymentColor = PAYMENT_STATUS_COLORS[contract.payment_status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="page-subtitle">View your active contract, usage limits, and billing status</p>
        </div>
      </div>

      {contract.warnings && contract.warnings.length > 0 && (
        <div className="space-y-2">
          {contract.warnings.map((warning, i) => (
            <Alert key={i} type="warning" message={warning} showIcon icon={<ExclamationCircleOutlined />} className="!rounded-xl" />
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-gray-400">Plan</p>
            <h3 className="text-base font-semibold leading-none tracking-tight text-2xl">{contract.name}</h3>
          </div>
          <div className="p-6 pt-0">
            <Tag className={statusColor}>{contract.status.replace('_', ' ')}</Tag>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-gray-400">Billing Period</p>
            <h3 className="text-base font-semibold leading-none tracking-tight text-xl capitalize">
              {BILLING_PERIOD_LABELS[contract.billing_period] || contract.billing_period}
            </h3>
          </div>
          <div className="p-6 pt-0">
            <Tag className={paymentColor}>
              {PAYMENT_STATUS_LABELS[contract.payment_status] || contract.payment_status}
            </Tag>
          </div>
        </div>

        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <p className="text-sm text-gray-400">Days Until Expiry</p>
            <h3 className="text-base font-semibold leading-none tracking-tight text-2xl flex items-center gap-2">
              <CalendarOutlined />
              {contract.days_until_expiry ?? '—'}
            </h3>
          </div>
          <div className="p-6 pt-0">
            <p className="text-xs text-gray-500">
              {new Date(contract.start_date).toLocaleDateString()} — {new Date(contract.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* User Limits */}
      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight flex items-center gap-2">
            <TeamOutlined />
            User Limits
          </h3>
        </div>
        <div className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Users</span>
              <span className="font-medium">{totalUsers} / {maxUsers}</span>
            </div>
            <Progress percent={userUsage} showInfo={false} size="small" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="font-bold text-purple-700">{contract.current_admins}/{contract.max_admins}</p>
              <p className="text-xs text-gray-500 mt-1">Admins</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-bold text-blue-700">{contract.current_managers}/{contract.max_managers}</p>
              <p className="text-xs text-gray-500 mt-1">Managers</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="font-bold text-green-700">{contract.current_operators}/{contract.max_operators}</p>
              <p className="text-xs text-gray-500 mt-1">Operators</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Details */}
      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight flex items-center gap-2">
            <SafetyOutlined />
            Contract Details
          </h3>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Auto Renew</span>
              <p className="font-medium">{contract.auto_renew ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-gray-500">Storage</span>
              <p className="font-medium">{contract.max_storage_gb} GB</p>
            </div>
            <div>
              <span className="text-gray-500">Start Date</span>
              <p className="font-medium">{new Date(contract.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">End Date</span>
              <p className="font-medium">{new Date(contract.end_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
