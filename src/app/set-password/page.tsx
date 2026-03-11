'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function SetPasswordPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError('Password must be at least 8 characters, contain at least one uppercase letter and one number');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('temporary_token');
      if (!token) {
        setError('No temporary token found. Please login again.');
        router.push('/login');
        return;
      }

      const response = await apiClient.setPassword({ token, new_password: password });
      localStorage.removeItem('temporary_token');
      setUser(response, 'company_user');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set New Password" subtitle="Please set a new password to continue" icon={<LockOutlined style={{ fontSize: 28 }} />}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">New Password</label>
          <Input.Password
            id="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="large"
            className="glass-input"
          />
          <p className="text-xs text-gray-400">
            At least 8 characters, one uppercase letter, and one number
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
          <Input.Password
            id="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            size="large"
            className="glass-input"
          />
        </div>
        <div className="pt-1">
          <Button type="primary" htmlType="submit" className="w-full" size="large" disabled={loading}>
            {loading ? 'Setting password...' : 'Set Password'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
