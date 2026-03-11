'use client';

import Link from 'next/link';
import {
  SafetyOutlined,
  FileTextOutlined,
  SettingOutlined,
  RightOutlined,
  UserOutlined,
  LockOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';

const settingsLinks = [
  {
    href: '/profile',
    icon: <UserOutlined style={{ fontSize: 22, color: '#6366f1' }} />,
    title: 'My Profile',
    description: 'Update your personal information and password',
    bg: 'bg-indigo-50',
    adminOnly: false,
  },
  {
    href: '/settings/permission-groups',
    icon: <SafetyOutlined style={{ fontSize: 22, color: '#7c3aed' }} />,
    title: 'Permission Groups',
    description: 'Manage role-based permission groups for your team',
    bg: 'bg-purple-50',
    adminOnly: true,
  },
  {
    href: '/settings/contract',
    icon: <FileTextOutlined style={{ fontSize: 22, color: '#0891b2' }} />,
    title: 'Contract & Billing',
    description: 'View your active contract, usage limits, and billing status',
    bg: 'bg-cyan-50',
    adminOnly: true,
  },
  {
    href: '/settings/telegram',
    icon: <SendOutlined style={{ fontSize: 22, color: '#0ea5e9' }} />,
    title: 'Telegram Bot',
    description: 'Connect and configure Telegram bot notifications',
    bg: 'bg-sky-50',
    adminOnly: true,
  },
];

export default function SettingsPage() {
  const { hasPermission } = useAuthStore();
  const isAdmin = hasPermission(UserRole.COMPANY_ADMIN);

  const visibleLinks = settingsLinks.filter((l) => !l.adminOnly || isAdmin);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <div>
          <p className="page-subtitle">Manage your account, team permissions, and billing.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {visibleLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="glass-card p-5 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${link.bg}`}>
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{link.title}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{link.description}</p>
                  </div>
                </div>
                <RightOutlined className="text-xs text-gray-300 group-hover:text-gray-500 transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isAdmin && (
        <div className="glass-card p-5 border border-amber-200 bg-amber-50/50">
          <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
            <LockOutlined />
            Admin-only settings
          </h3>
          <p className="text-xs text-amber-600 mt-1">
            Permission groups and contract settings are only accessible to Company Admins.
          </p>
        </div>
      )}
    </div>
  );
}
