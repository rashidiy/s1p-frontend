'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Account Registration"
      subtitle="How to get access to the platform"
      icon={<MailOutlined style={{ fontSize: 28 }} />}
    >
      <div className="space-y-5">
        <Alert
          type="info"
          showIcon
          icon={<MailOutlined />}
          className="!rounded-xl"
          title="Invitation required"
          description="New user accounts are created by your company administrator. You cannot self-register — please contact your admin to receive an invitation email."
        />

        <div className="text-sm text-gray-500 space-y-3">
          <p className="font-medium text-gray-700">What to do next:</p>
          <div className="space-y-2">
            {[
              'Contact your company administrator',
              'Ask them to invite you from the Users Management section',
              'Check your email for an invitation with a temporary password',
              'Log in and set your permanent password',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-crm-indigo-50 text-crm-indigo-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-600 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/login">
          <Button type="primary" className="w-full" size="large">Go to Login</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
