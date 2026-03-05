'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from 'antd';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function OwnerSetPasswordPage() {
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
        router.push('/owner/login');
        return;
      }

      const response = await apiClient.ownerSetPassword({ token, new_password: password });
      localStorage.removeItem('temporary_token');
      setUser(response, 'owner');
      router.push('/owner/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to set password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set New Password" subtitle="Please set a new password to continue">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-gray-400">
            At least 8 characters, one uppercase letter, and one number
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button htmlType="submit" className="w-full" disabled={loading}>
          {loading ? 'Setting password...' : 'Set Password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
