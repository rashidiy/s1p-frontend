'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from 'antd';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.forgotPassword({ email });
    } catch {
      // Always show success to prevent email enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle={submitted ? 'Check your email for instructions' : 'Enter your email to receive a password reset link'}
    >
      {submitted ? (
        <div className="space-y-4">
          <Alert
            type="success"
            message="If an account with that email exists, we've sent password reset instructions."
            showIcon
            className="!rounded-xl"
          />
          <div className="text-center">
            <Link href="/login" className="text-sm text-crm-indigo-500 hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button htmlType="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
          <div className="text-center">
            <Link href="/login" className="text-sm text-crm-indigo-500 hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
