'use client';

import { Avatar, Button } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function MiniAppProfile() {
  const { user } = useAuthStore();
  const { webApp } = useTelegramWebApp();

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User';
  const avatarUrl = user?.avatar_url
    ? `${API_BASE_URL}${user.avatar_url}`
    : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, gap: 16 }}>
      <Avatar
        size={80}
        src={avatarUrl}
        icon={!avatarUrl ? <UserOutlined /> : undefined}
      />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>{fullName}</div>
        {user?.phone && (
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            {user.phone}
          </div>
        )}
        {user?.role && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {user.role.replace('company_', '').replace('_', ' ')}
          </div>
        )}
      </div>

      <div style={{ width: '100%', marginTop: 16 }}>
        <div className="miniapp-list">
          {webApp && (
            <div
              className="miniapp-list-item"
              onClick={() => webApp.close()}
            >
              <LogoutOutlined style={{ fontSize: 18, color: '#EF4444' }} />
              <div className="miniapp-list-item-content">
                <div className="miniapp-list-item-title">Close App</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
