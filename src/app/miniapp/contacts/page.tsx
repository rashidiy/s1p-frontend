'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { SearchOutlined, UserOutlined, RightOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { ContactResponse } from '@/types/api';
import { getInitials, getAvatarColor } from '../_utils';

const PAGE_SIZE = 30;

function SkeletonList() {
  return (
    <div className="miniapp-section" style={{ padding: 0 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} className="miniapp-skeleton-list-item">
          <div className="miniapp-skeleton-circle" />
          <div className="miniapp-skeleton-lines">
            <div className="miniapp-skeleton-text" style={{ width: '60%' }} />
            <div className="miniapp-skeleton-text" style={{ width: '40%', height: 11 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MiniAppContacts() {
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { webApp } = useTelegramWebApp();
  const router = useRouter();
  const t = useTranslations('miniapp');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async (q?: string, pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(false);
    try {
      const res = await apiClient.getContacts({
        page: pageNum,
        page_size: PAGE_SIZE,
        search: q || undefined,
      });
      const items = res.items || [];
      if (pageNum === 1) {
        setContacts(items);
      } else {
        setContacts(prev => [...prev, ...items]);
      }
      setHasMore(items.length === PAGE_SIZE);
      setPage(pageNum);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => load(value), 300);
  }

  function handleLoadMore() {
    webApp?.HapticFeedback.selectionChanged();
    load(search, page + 1);
  }

  return (
    <div className="miniapp-page-enter">
      <div className="miniapp-page-title">{t('contacts.title')}</div>

      <div className="miniapp-search" style={{ position: 'relative' }}>
        <SearchOutlined className="miniapp-search-icon" />
        <input
          placeholder={t('contacts.search')}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon">!</div>
          <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon"><UserOutlined /></div>
          <div className="miniapp-empty-title">
            {search ? t('contacts.noContacts') : t('contacts.emptyTitle')}
          </div>
          {!search && <div className="miniapp-empty-sub">{t('contacts.emptyDescription')}</div>}
        </div>
      ) : (
        <div className="miniapp-section">
          <div className="miniapp-list">
            {contacts.map((c) => {
              const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.phone || '—';
              const initials = getInitials(c.first_name, c.last_name, c.phone);
              return (
                <div
                  key={c.id}
                  className="miniapp-list-item"
                  onClick={() => {
                    webApp?.HapticFeedback.impactOccurred('light');
                    router.push(`/miniapp/contacts/${c.id}`);
                  }}
                >
                  <div
                    className="miniapp-list-item-icon"
                    style={{ background: getAvatarColor(name) }}
                  >
                    {initials}
                  </div>
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-title">{name}</div>
                    {c.phone && (
                      <div className="miniapp-list-item-sub">{c.phone}</div>
                    )}
                  </div>
                  <div className="miniapp-list-item-chevron">
                    <RightOutlined />
                  </div>
                </div>
              );
            })}
          </div>
          {hasMore && (
            <div className="miniapp-section-footer" onClick={handleLoadMore}>
              {loadingMore ? <Spin size="small" /> : t('loadMore')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
