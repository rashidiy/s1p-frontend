'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Account Registration"
      subtitle="How to get access to the platform"
    >
      <div className="space-y-5">
        <Alert
          type="info"
          showIcon
          icon={<MailOutlined />}
          className="!rounded-xl"
          message="Invitation required"
          description="New user accounts are created by your company administrator. You cannot self-register — please contact your admin to receive an invitation email."
        />

        <div className="text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">What to do next:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Contact your company administrator</li>
            <li>Ask them to invite you from the Users Management section</li>
            <li>Check your email for an invitation with a temporary password</li>
            <li>Log in and set your permanent password</li>
          </ol>
        </div>

        <Link href="/login">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
