'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from 'antd';
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
    <AuthLayout title="Owner Login" subtitle="Platform Administrator Portal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" />}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="owner@example.com"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/owner/forgot-password" className="text-sm text-crm-indigo-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
          />
        </div>
        <Button htmlType="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        <div className="text-center text-sm space-y-2">
          <p className="text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/owner/register" className="text-crm-indigo-500 hover:underline font-medium">
              Register
            </Link>
          </p>
          <p>
            <Link href="/login" className="text-gray-400 hover:underline">
              Company User Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
