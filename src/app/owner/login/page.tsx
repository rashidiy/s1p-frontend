'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Input } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

export default function OwnerLoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await apiClient.ownerLogin({ email, password });

      if (response.must_change_password && response.temporary_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('temporary_token', response.temporary_token);
        }
        router.push('/owner/set-password');
        return;
      }

      setUser(response, 'owner');
      router.push('/owner/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Owner Login" subtitle="Platform Administrator Portal" icon={<SafetyOutlined style={{ fontSize: 28 }} />}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="owner@example.com"
            required
            size="large"
            disabled={isLoading}
            className="glass-input"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <Link href="/owner/forgot-password" className="text-sm text-crm-indigo-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input.Password
            id="password"
            name="password"
            placeholder="Enter your password"
            required
            size="large"
            disabled={isLoading}
            className="glass-input"
          />
        </div>
        <div className="pt-1">
          <Button type="primary" htmlType="submit" className="w-full" size="large" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
        <p className="text-sm text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/owner/register" className="text-crm-indigo-500 hover:underline font-medium">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
