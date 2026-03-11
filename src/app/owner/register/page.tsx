'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

export default function OwnerRegisterPage() {
  return (
    <AuthLayout
      title="Owner Registration"
      subtitle="Platform administrator accounts"
      icon={<ToolOutlined style={{ fontSize: 28 }} />}
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

        <div className="text-sm text-gray-500 space-y-3">
          <p className="font-medium text-gray-700">To create an owner account, run on the server:</p>
          <pre className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto border border-gray-800">
            <span className="text-gray-500 select-none">$ </span>make createsuperuser
          </pre>
          <p>Or inside the Docker container:</p>
          <pre className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto border border-gray-800">
            <span className="text-gray-500 select-none">$ </span>python manage.py createsuperuser
          </pre>
        </div>

        <Link href="/owner/login">
          <Button type="primary" className="w-full" size="large">Go to Owner Login</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
