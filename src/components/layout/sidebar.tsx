'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu, Avatar, Popover, Drawer, Segmented } from 'antd';
import {
  DashboardOutlined,
  PhoneOutlined,
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
  SunOutlined,
  MoonOutlined,
  LaptopOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n/config';
import type { MenuProps } from 'antd';
import { useState } from 'react';
import Link from 'next/link';

const { Sider } = Layout;

interface NavItem {
  nameKey: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

const ownerNavigation: NavItem[] = [
  { nameKey: 'dashboard', href: '/owner/dashboard', icon: <DashboardOutlined /> },
  { nameKey: 'companies', href: '/owner/companies', icon: <BankOutlined /> },
  { nameKey: 'contracts', href: '/owner/contracts', icon: <FileTextOutlined /> },
];

const baseCompanyNavigation: NavItem[] = [
  { nameKey: 'dashboard', href: '/dashboard', icon: <DashboardOutlined /> },
  { nameKey: 'contacts', href: '/contacts', icon: <UserOutlined />, permission: 'contacts.read' },
  { nameKey: 'leads', href: '/leads', icon: <RiseOutlined />, permission: 'leads.read' },
  { nameKey: 'deals', href: '/deals', icon: <FundProjectionScreenOutlined />, permission: 'deals.read' },
  { nameKey: 'tasks', href: '/tasks', icon: <CheckSquareOutlined />, permission: 'tasks.read' },
  { nameKey: 'calls', href: '/calls', icon: <PhoneOutlined />, permission: 'calls.read' },
];

const managerNavigation: NavItem[] = [
  { nameKey: 'analytics', href: '/analytics', icon: <BarChartOutlined /> },
];

const adminNavigation: NavItem[] = [
  { nameKey: 'team', href: '/users', icon: <TeamOutlined /> },
  { nameKey: 'permissionGroups', href: '/settings/permission-groups', icon: <SafetyOutlined /> },
  { nameKey: 'contract', href: '/settings/contract', icon: <FileTextOutlined /> },
  { nameKey: 'telegram', href: '/settings/telegram', icon: <SendOutlined /> },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  uz: 'UZ',
};

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user, isOwner, isAdmin, isManager, hasPermissionString, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const locale = useLocale() as Locale;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const t = useTranslations('nav');
  const tSettings = useTranslations('settings');
  const tCommon = useTranslations('common');

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };

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
    label: t(item.nameKey),
  }));

  const profileMenuContent = (
    <div style={{ width: 240, padding: '4px 0' }}>
      <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid var(--popover-border)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{user?.phone || user?.email || ''}</p>
      </div>
      <Link
        href={isOwner ? '/owner/profile' : '/profile'}
        onClick={() => { setPopoverOpen(false); onMobileClose?.(); }}
      >
        <div className="profile-menu-item">
          <UserOutlined /> {t('profile')}
        </div>
      </Link>
      <div style={{ borderTop: '1px solid var(--popover-border)', margin: '4px 0' }} />

      {/* Theme */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tSettings('appearance')}</div>
        <Segmented
          block
          size="small"
          value={mode}
          onChange={(val) => setMode(val as 'light' | 'dark' | 'system')}
          options={[
            { value: 'light', icon: <SunOutlined /> },
            { value: 'dark', icon: <MoonOutlined /> },
            { value: 'system', icon: <LaptopOutlined /> },
          ]}
        />
      </div>

      {/* Language */}
      <div style={{ padding: '4px 16px 8px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <GlobalOutlined style={{ marginRight: 4 }} />{tSettings('language')}
        </div>
        <Segmented
          block
          size="small"
          value={locale}
          onChange={(val) => handleLocaleChange(val as string)}
          options={locales.map((loc) => ({ value: loc, label: LOCALE_LABELS[loc] }))}
        />
      </div>

      <div style={{ borderTop: '1px solid var(--popover-border)', margin: '4px 0' }} />
      <div className="profile-menu-item profile-menu-item--danger" onClick={handleLogout}>
        <LogoutOutlined /> {t('logout')}
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
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            S1P
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
            {tCommon('crmPlatform')}
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
                  backgroundColor: '#4338CA',
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
                  {user.phone || user.email || ''}
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
