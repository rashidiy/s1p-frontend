'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Alert } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

export default function OwnerRegisterPage() {
  return (
    <AuthLayout
      title="Owner Registration"
      subtitle="Platform administrator accounts"
    >
      <div className="space-y-5">
        <Alert
          type="warning"
          showIcon
          icon={<ToolOutlined />}
          className="!rounded-xl"
          message="CLI-only registration"
          description="Owner (platform administrator) accounts can only be created via the server CLI. There is no web registration endpoint for owners."
        />

        <div className="text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">To create an owner account, run on the server:</p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-800 overflow-x-auto">
            make createsuperuser
          </pre>
          <p>Or inside the Docker container:</p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-800 overflow-x-auto">
            python manage.py createsuperuser
          </pre>
        </div>

        <Link href="/owner/login">
          <Button className="w-full">Go to Owner Login</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
