'use client';

import Link from 'next/link';
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SafetyOutlined,
  KeyOutlined,
  RightOutlined,
} from '@ant-design/icons';

const SETTINGS_SECTIONS = [
  {
    title: 'Profile & Security',
    description: 'Update your personal information and change your password',
    href: '/owner/profile',
    icon: <UserOutlined className="text-lg" />,
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    title: 'Companies',
    description: 'Manage client companies, activate or deactivate them',
    href: '/owner/companies',
    icon: <BankOutlined className="text-lg" />,
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    title: 'Contracts',
    description: 'View, create, and manage billing contracts',
    href: '/owner/contracts',
    icon: <FileTextOutlined className="text-lg" />,
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    title: 'Analytics',
    description: 'Platform-wide usage statistics and performance metrics',
    href: '/owner/dashboard',
    icon: <BarChartOutlined className="text-lg" />,
    color: '#f97316',
    bg: '#fff7ed',
  },
  {
    title: 'Permissions',
    description: 'Configure owner-level access control and permissions',
    href: '/owner/dashboard',
    icon: <SafetyOutlined className="text-lg" />,
    color: '#8b5cf6',
    bg: '#f5f3ff',
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
      <div className="page-header">
        <p className="page-subtitle">Manage all platform-level configuration</p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map((section) => (
          <Link key={section.href + section.title} href={section.href}>
            <div className="glass-card p-5 cursor-pointer hover:shadow-md transition-all duration-200 group hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: section.bg, color: section.color }}
                >
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                    {section.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{section.description}</p>
                </div>
                <RightOutlined className="text-xs text-gray-300 group-hover:text-gray-500 transition-all duration-200 group-hover:translate-x-0.5 mt-1 flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Server environment settings — read-only info */}
      <div className="glass-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <KeyOutlined className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Server Environment Variables</h2>
            <p className="text-xs text-gray-400">
              Configured via <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">.env</code> file — requires server restart
            </p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {ENV_SETTINGS.map((item) => (
            <div key={item.key} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <code className="text-xs font-mono bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg shrink-0 border border-slate-100 w-fit">
                {item.key}
              </code>
              <span className="text-sm text-gray-400">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
