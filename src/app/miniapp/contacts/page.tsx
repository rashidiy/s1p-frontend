'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Search, User, ChevronRight } from 'lucide-react';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { ContactResponse } from '@/types/api';
import { formatPhone, getInitials, getAvatarColor } from '../_utils';

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

const sectionHeaderStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  padding: '6px 16px',
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--ma-hint)',
  background: 'var(--ma-bg)',
  letterSpacing: '0.5px',
};

export default function MiniAppContacts() {
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState<number | null>(null);
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
      // Track total count if API provides it
      if (res.total !== undefined) {
        setTotalCount(res.total);
      } else {
        // Estimate from loaded items
        if (pageNum === 1) {
          setTotalCount(items.length + (items.length === PAGE_SIZE ? 1 : 0));
        }
      }
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

  // Group contacts by first letter for alphabetical sections
  const groupedContacts = useMemo(() => {
    if (search) return null; // Don't group when searching

    const groups: { letter: string; items: ContactResponse[] }[] = [];
    const letterMap = new Map<string, ContactResponse[]>();

    for (const c of contacts) {
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.phone || '';
      const firstChar = name.charAt(0).toUpperCase();
      const letter = /[A-ZА-ЯЁ]/.test(firstChar) ? firstChar : '#';
      if (!letterMap.has(letter)) {
        letterMap.set(letter, []);
      }
      letterMap.get(letter)!.push(c);
    }

    // Sort letters: A-Z first, then Cyrillic, then #
    const sortedLetters = Array.from(letterMap.keys()).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    for (const letter of sortedLetters) {
      groups.push({ letter, items: letterMap.get(letter)! });
    }

    return groups;
  }, [contacts, search]);

  // Count display
  const displayCount = totalCount !== null
    ? totalCount
    : contacts.length;

  function renderContactItem(c: ContactResponse) {
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.phone || '\u2014';
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
            <div className="miniapp-list-item-sub">{formatPhone(c.phone)}</div>
          )}
        </div>
        <div className="miniapp-list-item-chevron">
          <ChevronRight size={16} />
        </div>
      </div>
    );
  }

  return (
    <div className="miniapp-page-enter">
      <div className="miniapp-page-title">{t('contacts.title')}</div>

      <div className="miniapp-search" style={{ position: 'relative' }}>
        <Search size={15} className="miniapp-search-icon" />
        <input
          placeholder={t('contacts.search')}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Contact count */}
      {!loading && !error && contacts.length > 0 && (
        <div style={{
          fontSize: 13,
          color: 'var(--ma-hint)',
          padding: '4px 16px 0',
        }}>
          {displayCount}{hasMore && totalCount === null ? '+' : ''} {'contacts' /* TODO: i18n */}
        </div>
      )}

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon">!</div>
          <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon"><User size={24} /></div>
          <div className="miniapp-empty-title">
            {search ? t('contacts.noContacts') : t('contacts.emptyTitle')}
          </div>
          {!search && <div className="miniapp-empty-sub">{t('contacts.emptyDescription')}</div>}
        </div>
      ) : groupedContacts ? (
        /* Alphabetical sections — only when not searching */
        <div className="miniapp-section" style={{ padding: 0 }}>
          <div className="miniapp-list">
            {groupedContacts.map(group => (
              <div key={group.letter}>
                <div style={sectionHeaderStyle}>
                  {group.letter}
                </div>
                {group.items.map(c => renderContactItem(c))}
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="miniapp-section-footer" onClick={handleLoadMore}>
              {loadingMore ? <Spin size="small" /> : t('loadMore')}
            </div>
          )}
        </div>
      ) : (
        /* Flat list — when searching */
        <div className="miniapp-section">
          <div className="miniapp-list">
            {contacts.map(c => renderContactItem(c))}
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
