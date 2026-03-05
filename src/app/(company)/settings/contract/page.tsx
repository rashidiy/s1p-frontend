'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileTextOutlined, TeamOutlined, CalendarOutlined, SafetyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Spin, Alert } from 'antd';
import { apiClient } from '@/lib/api';
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

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  if (!contract || error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold gradient-text">Contract</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileTextOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
            <p className="mt-4 text-lg font-medium">No Active Contract</p>
            <p className="text-sm text-gray-500">Please contact the platform administrator</p>
          </CardContent>
        </Card>
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
      <h1 className="text-3xl font-bold gradient-text">Contract</h1>

      {contract.warnings && contract.warnings.length > 0 && (
        <div className="space-y-2">
          {contract.warnings.map((warning, i) => (
            <Alert key={i} type="warning" message={warning} showIcon icon={<ExclamationCircleOutlined />} className="!rounded-xl" />
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan</CardDescription>
            <CardTitle className="text-2xl">{contract.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={statusColor}>{contract.status.replace('_', ' ')}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Billing Period</CardDescription>
            <CardTitle className="text-xl capitalize">
              {BILLING_PERIOD_LABELS[contract.billing_period] || contract.billing_period}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={paymentColor}>
              {PAYMENT_STATUS_LABELS[contract.payment_status] || contract.payment_status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Days Until Expiry</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CalendarOutlined />
              {contract.days_until_expiry ?? '—'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {new Date(contract.start_date).toLocaleDateString()} — {new Date(contract.end_date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TeamOutlined />
            User Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Users</span>
              <span className="font-medium">{totalUsers} / {maxUsers}</span>
            </div>
            <Progress value={userUsage} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
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
        </CardContent>
      </Card>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SafetyOutlined />
            Contract Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
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
        </CardContent>
      </Card>
    </div>
  );
}
