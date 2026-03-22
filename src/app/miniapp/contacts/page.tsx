'use client';

import { useEffect, useState } from 'react';
import { Spin, Input, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function MiniAppContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { webApp } = useTelegramWebApp();
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  async function load(q?: string) {
    setLoading(true);
    try {
      const res = await apiClient.getContacts({
        page: 1,
        page_size: 30,
        search: q || undefined,
      });
      setContacts(res.items || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    load(value);
  }

  return (
    <div>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 12, borderRadius: 10 }}
      />

      {loading ? (
        <div className="miniapp-loading" style={{ height: 'auto', padding: 40 }}>
          <Spin />
        </div>
      ) : contacts.length === 0 ? (
        <div className="miniapp-empty">No contacts found</div>
      ) : (
        <div className="miniapp-list">
          {contacts.map((c) => {
            const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.phone || '—';
            return (
              <div
                key={c.id}
                className="miniapp-list-item"
                onClick={() => {
                  webApp?.HapticFeedback.impactOccurred('light');
                  router.push(`/miniapp/contacts/${c.id}`);
                }}
              >
                <Avatar
                  size={36}
                  icon={<UserOutlined />}
                  style={{ flexShrink: 0 }}
                />
                <div className="miniapp-list-item-content">
                  <div className="miniapp-list-item-title">{name}</div>
                  {c.phone && (
                    <div className="miniapp-list-item-sub">
                      <PhoneOutlined style={{ marginRight: 4 }} />{c.phone}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
