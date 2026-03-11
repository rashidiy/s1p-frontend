'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle owner impersonation token
  useEffect(() => {
    const impersonateToken = searchParams?.get('impersonate');
    if (impersonateToken) {
      apiClient.consumeImpersonationToken(impersonateToken);
      // Load profile and redirect to dashboard
      apiClient.getMyProfile().then((profile) => {
        setUser({
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          role: profile.role as any,
          company_id: profile.company_id ?? undefined,
          is_active: profile.is_active,
          credentials: { access: impersonateToken },
          permissions: profile.permissions,
        }, 'company_user');
        router.replace('/dashboard');
      }).catch(() => {
        setError('Impersonation token is invalid or expired');
        // Clean up bad token
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_type');
      });
    }
  }, [searchParams]);

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
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account" icon={<LoginOutlined style={{ fontSize: 28 }} />}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            size="large"
            className="glass-input"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
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
            size="large"
            className="glass-input"
          />
        </div>
        <div className="pt-1">
          <Button type="primary" htmlType="submit" className="w-full" size="large" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
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
