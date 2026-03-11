'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
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
      icon={<KeyOutlined style={{ fontSize: 28 }} />}
    >
      {submitted ? (
        <div className="space-y-4">
          <Alert
            type="success"
            title="If an account with that email exists, we've sent password reset instructions."
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
        <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="pt-1">
            <Button type="primary" htmlType="submit" className="w-full" size="large" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </div>
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
