'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu, Avatar, Popover } from 'antd';
import {
  DashboardOutlined,
  PhoneOutlined,
  SettingOutlined,
  LogoutOutlined,
  BankOutlined,
  BarChartOutlined,
  TeamOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  CheckSquareOutlined,
  UserOutlined,
  SafetyOutlined,
  FileTextOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import { apiClient } from '@/lib/api';
import type { MenuProps } from 'antd';
import { useState } from 'react';
import Link from 'next/link';

const { Sider } = Layout;

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

const ownerNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/owner/dashboard', icon: <DashboardOutlined /> },
  { name: 'Companies', href: '/owner/companies', icon: <BankOutlined /> },
  { name: 'Contracts', href: '/owner/contracts', icon: <FileTextOutlined /> },
  { name: 'Settings', href: '/owner/settings', icon: <SettingOutlined /> },
];

const baseCompanyNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <DashboardOutlined /> },
  { name: 'Contacts', href: '/contacts', icon: <UserOutlined />, permission: 'contacts.read' },
  { name: 'Leads', href: '/leads', icon: <RiseOutlined />, permission: 'leads.read' },
  { name: 'Deals', href: '/deals', icon: <FundProjectionScreenOutlined />, permission: 'deals.read' },
  { name: 'Tasks', href: '/tasks', icon: <CheckSquareOutlined />, permission: 'tasks.read' },
  { name: 'Calls', href: '/calls', icon: <PhoneOutlined />, permission: 'calls.read' },
];

const managerNavigation: NavItem[] = [
  { name: 'Analytics', href: '/analytics', icon: <BarChartOutlined /> },
];

const adminNavigation: NavItem[] = [
  { name: 'Team', href: '/users', icon: <TeamOutlined /> },
  { name: 'Permission Groups', href: '/settings/permission-groups', icon: <SafetyOutlined /> },
  { name: 'Contract', href: '/settings/contract', icon: <FileTextOutlined /> },
  { name: 'Telegram', href: '/settings/telegram', icon: <SendOutlined /> },
  { name: 'Settings', href: '/settings', icon: <SettingOutlined /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isOwner, isAdmin, isManager, hasPermissionString, logout } = useAuthStore();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const getNavigation = () => {
    if (isOwner) return ownerNavigation;

    let nav = baseCompanyNavigation.filter(
      (item) => !item.permission || hasPermissionString(item.permission)
    );

    if (isManager() || isAdmin()) {
      nav = [...nav, ...managerNavigation];
    }

    if (isAdmin()) {
      nav = [...nav, ...adminNavigation];
    }

    return nav;
  };

  const navigation = getNavigation();

  const handleLogout = () => {
    setPopoverOpen(false);
    apiClient.logout();
    logout();
    router.push(isOwner ? '/owner/login' : '/login');
  };

  const getInitials = (firstName: string, lastName?: string | null) => {
    if (!lastName) return firstName.charAt(0).toUpperCase();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const activeKey = navigation.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )?.href;

  const menuItems: MenuProps['items'] = navigation.map((item) => ({
    key: item.href,
    icon: item.icon,
    label: item.name,
  }));

  const profileMenuContent = (
    <div style={{ width: 220, padding: '4px 0' }}>
      <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{user?.email}</p>
      </div>
      <Link
        href={isOwner ? '/owner/profile' : '/profile'}
        onClick={() => setPopoverOpen(false)}
      >
        <div className="profile-menu-item">
          <UserOutlined /> Profile
        </div>
      </Link>
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', margin: '4px 0' }} />
      <div className="profile-menu-item profile-menu-item--danger" onClick={handleLogout}>
        <LogoutOutlined /> Log out
      </div>
    </div>
  );

  return (
    <Sider
      collapsed
      collapsedWidth={64}
      trigger={null}
      style={{
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'relative', width: 32, height: 32 }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 20,
              height: 20,
              borderRadius: 4,
              background: '#E84040',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              borderRadius: 4,
              background: '#2563EB',
              opacity: 0.85,
            }}
          />
        </div>
      </div>

      {/* Navigation — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        <Menu
          mode="inline"
          inlineCollapsed={true}
          selectedKeys={activeKey ? [activeKey] : []}
          items={menuItems}
          onSelect={({ key }) => router.push(key)}
          style={{
            background: 'transparent',
            border: 'none',
          }}
          className="crm-sidebar-menu"
        />
      </div>

      {/* Bottom section — dots + avatar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          paddingTop: 12,
          paddingBottom: 16,
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8B5CF6' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EC4899' }} />

        {user && (
          <Popover
            content={profileMenuContent}
            trigger="click"
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            placement="rightTop"
            overlayStyle={{ padding: 0 }}
            overlayInnerStyle={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
          >
            <Avatar
              size={36}
              style={{
                backgroundColor: '#E84040',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 4,
                flexShrink: 0,
              }}
            >
              {getInitials(user.first_name, user.last_name)}
            </Avatar>
          </Popover>
        )}
      </div>

      <style jsx global>{`
        .crm-sidebar-menu .ant-layout-sider-children {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .crm-sidebar-menu .ant-menu-item {
          color: #64748b !important;
          margin: 2px 8px !important;
          border-radius: 10px !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .crm-sidebar-menu .ant-menu-item:hover {
          color: #0f172a !important;
          background: #f1f5f9 !important;
        }
        .crm-sidebar-menu .ant-menu-item-selected {
          color: #e84040 !important;
          background: #fff0f0 !important;
          font-weight: 500;
        }
        .crm-sidebar-menu .ant-menu-item-selected::after {
          display: none !important;
        }
        .crm-sidebar-menu .ant-menu-item .anticon {
          font-size: 18px !important;
        }
        .profile-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: background 0.15s;
        }
        .profile-menu-item:hover {
          background: #f5f5f5;
        }
        .profile-menu-item--danger {
          color: #ef4444;
        }
        .profile-menu-item--danger:hover {
          background: #fef2f2;
        }
      `}</style>
    </Sider>
  );
}
