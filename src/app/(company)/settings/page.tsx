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
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
          <SettingOutlined />
          Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account, team permissions, and billing.</p>
      </div>

      <div className="grid gap-4">
        {visibleLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="glass-card p-0 hover:shadow-md transition-all cursor-pointer border-0">
              <div className="p-6 pt-0 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${link.bg}`}>
                      {link.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold leading-none tracking-tight text-base">{link.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
                    </div>
                  </div>
                  <RightOutlined className="text-gray-400" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isAdmin && (
        <div className="glass-card p-0 border-amber-200 bg-amber-50/50">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight text-sm text-amber-700 flex items-center gap-2">
              <LockOutlined />
              Admin-only settings
            </h3>
            <p className="text-sm text-muted-foreground text-amber-600 text-xs">
              Permission groups and contract settings are only accessible to Company Admins.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
