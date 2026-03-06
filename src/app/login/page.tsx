'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.login({ email, password });

      if (response.must_change_password && response.temporary_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('temporary_token', response.temporary_token);
        }
        router.push('/set-password');
        return;
      }

      setUser(response, 'company_user');
      router.push('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="glass-input"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
            <Link href="/forgot-password" className="text-sm text-crm-indigo-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input.Password
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="glass-input"
          />
        </div>
        <Button type="primary" htmlType="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
        <p className="text-sm text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-crm-indigo-500 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
