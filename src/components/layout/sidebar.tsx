'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu, Avatar, Popover, Drawer } from 'antd';
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
import { useIsMobile } from '@/hooks/useIsMobile';
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

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const isMobile = useIsMobile();
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
    onMobileClose?.();
    apiLogout();
    logout();
    router.push(isOwner ? '/owner/login' : '/login');
  };

  const apiLogout = () => {
    import('@/lib/api').then(({ apiClient }) => apiClient.logout());
  };

  const getInitials = (firstName: string, lastName?: string | null) => {
    if (!lastName) return firstName.charAt(0).toUpperCase();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const activeKey = navigation.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )?.href;

  const handleMenuClick = (key: string) => {
    router.push(key);
    onMobileClose?.();
  };

  const menuItems: MenuProps['items'] = navigation.map((item) => ({
    key: item.href,
    icon: item.icon,
    label: item.name,
  }));

  const profileMenuContent = (
    <div style={{ width: 220, padding: '4px 0' }}>
      <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{user?.email || user?.phone || ''}</p>
      </div>
      <Link
        href={isOwner ? '/owner/profile' : '/profile'}
        onClick={() => { setPopoverOpen(false); onMobileClose?.(); }}
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

  const sidebarContent = (
    <div className="sidebar-inner">
      {/* Logo + brand header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
            S1P
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
            CRM Platform
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <Menu
          mode="inline"
          selectedKeys={activeKey ? [activeKey] : []}
          items={menuItems}
          onSelect={({ key }) => handleMenuClick(key)}
          style={{ background: 'transparent', border: 'none' }}
          className="crm-sidebar-menu"
        />
      </div>

      {/* User profile */}
      <div className="sidebar-profile">
        {user && (
          <Popover
            content={profileMenuContent}
            trigger="click"
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            placement={isMobile ? 'topRight' : 'rightTop'}
            overlayStyle={{ padding: 0 }}
            styles={{ container: { padding: 0, borderRadius: 12, overflow: 'hidden' } }}
          >
            <div className="sidebar-profile-trigger">
              <Avatar
                size={36}
                style={{
                  backgroundColor: '#E84040',
                  color: 'white',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {getInitials(user.first_name, user.last_name)}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <div className="sidebar-profile-name">
                  {user.first_name} {user.last_name}
                </div>
                <div className="sidebar-profile-email">
                  {user.email || user.phone || ''}
                </div>
              </div>
            </div>
          </Popover>
        )}
      </div>
    </div>
  );

  // Mobile: render as Drawer
  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        width={280}
        styles={{ body: { padding: 0 }, header: { display: 'none' } }}
        closable={false}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop: render as Sider
  return (
    <Sider
      width={240}
      trigger={null}
      className="sidebar-desktop"
    >
      {sidebarContent}
    </Sider>
  );
}
