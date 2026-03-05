'use client';

import Link from 'next/link';
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SafetyOutlined,
  KeyOutlined,
} from '@ant-design/icons';

const SETTINGS_SECTIONS = [
  {
    title: 'Profile & Security',
    description: 'Update your personal information and change your password',
    href: '/owner/profile',
    icon: <UserOutlined className="text-2xl text-indigo-500" />,
  },
  {
    title: 'Companies',
    description: 'Manage client companies, activate or deactivate them',
    href: '/owner/companies',
    icon: <BankOutlined className="text-2xl text-blue-500" />,
  },
  {
    title: 'Contracts',
    description: 'View, create, and manage billing contracts',
    href: '/owner/contracts',
    icon: <FileTextOutlined className="text-2xl text-green-500" />,
  },
  {
    title: 'Analytics',
    description: 'Platform-wide usage statistics and performance metrics',
    href: '/owner/dashboard',
    icon: <BarChartOutlined className="text-2xl text-orange-500" />,
  },
  {
    title: 'Permissions',
    description: 'Configure owner-level access control and permissions',
    href: '/owner/dashboard',
    icon: <SafetyOutlined className="text-2xl text-purple-500" />,
  },
];

const ENV_SETTINGS = [
  { key: 'WEBHOOK_IP_WHITELIST_ENABLED', description: 'Enable IP allowlist for incoming webhooks' },
  { key: 'SIPUNI_ALLOWED_IPS', description: 'Comma-separated Sipuni webhook IP allowlist' },
  { key: 'BINOTEL_ALLOWED_IPS', description: 'Comma-separated Binotel webhook IP allowlist' },
  { key: 'JWT_SIGNING_KEY', description: 'Secret key used for JWT token signing' },
  { key: 'BASE_URL', description: 'Public base URL of the API server' },
];

export default function OwnerSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Manage all platform-level configuration</p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map((section) => (
          <Link key={section.href + section.title} href={section.href}>
            <div className="glass-card p-5 cursor-pointer hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-white/60 group-hover:bg-white transition-colors">
                  {section.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {section.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Server environment settings — read-only info */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyOutlined className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Server Environment Variables</h2>
        </div>
        <p className="text-sm text-gray-500">
          The following settings are configured via environment variables on the server.
          They cannot be changed from the web UI — edit the <code className="bg-gray-100 px-1 rounded">.env</code> file
          and restart the server to apply changes.
        </p>
        <div className="divide-y divide-gray-100">
          {ENV_SETTINGS.map((item) => (
            <div key={item.key} className="py-3 flex items-start gap-3">
              <code className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded shrink-0">
                {item.key}
              </code>
              <span className="text-sm text-gray-500">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
