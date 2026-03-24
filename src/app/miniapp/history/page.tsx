'use client';

import { useEffect, useState, useCallback } from 'react';
import { Phone, Plus, X } from 'lucide-react';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { CallWithDetails } from '@/types/api';
import { formatDuration, formatTime, getDateGroup } from '../_utils';

const PAGE_SIZE = 50;

function SkeletonList() {
  return (
    <div className="miniapp-section" style={{ padding: 0 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="miniapp-skeleton-list-item">
          <div className="miniapp-skeleton-circle" />
          <div className="miniapp-skeleton-lines">
            <div className="miniapp-skeleton-text" style={{ width: '55%' }} />
            <div className="miniapp-skeleton-text" style={{ width: '30%', height: 11 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface CreateContactFormProps {
  phone: string;
  onSave: (firstName: string, lastName: string) => Promise<void>;
  onCancel: () => void;
  t: ReturnType<typeof useTranslations>;
}

function CreateContactForm({ phone, onSave, onCancel, t }: CreateContactFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!firstName.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(firstName.trim(), lastName.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="miniapp-create-contact-form">
      <div className="miniapp-create-contact-header">
        <span style={{ fontWeight: 600, fontSize: 15 }}>{t('createContact.title')}</span>
        <button className="miniapp-create-contact-close" onClick={onCancel}>
          <X size={14} />
        </button>
      </div>
      <div className="miniapp-create-contact-phone">{phone}</div>
      <input
        className="miniapp-create-contact-input"
        placeholder={t('createContact.firstName')}
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        autoFocus
      />
      <input
        className="miniapp-create-contact-input"
        placeholder={t('createContact.lastName')}
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <button
        className="miniapp-note-submit"
        onClick={handleSubmit}
        disabled={!firstName.trim() || saving}
        style={{ marginTop: 8 }}
      >
        {saving ? '...' : t('actions.save')}
      </button>
    </div>
  );
}

export default function MiniAppHistory() {
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const [calls, setCalls] = useState<CallWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [createContactForPhone, setCreateContactForPhone] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(false);
    try {
      const res = await apiClient.getCallHistory({ page: pageNum, page_size: PAGE_SIZE });
      const items = res.items || [];
      if (pageNum === 1) {
        setCalls(items);
      } else {
        setCalls((prev) => [...prev, ...items]);
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

  function handleLoadMore() {
    webApp?.HapticFeedback.selectionChanged();
    load(page + 1);
  }

  async function handleCreateContact(firstName: string, lastName: string) {
    if (!createContactForPhone) return;
    const phone = createContactForPhone;
    try {
      await apiClient.createContact({
        first_name: firstName,
        last_name: lastName || undefined,
        phone,
      });
      webApp?.HapticFeedback.notificationOccurred('success');
      setCreateContactForPhone(null);

      const contactName = [firstName, lastName].filter(Boolean).join(' ');
      setCalls((prev) =>
        prev.map((c) => {
          if ((c.phone_1 === phone || c.phone_2 === phone) && !c.contact_name) {
            return { ...c, contact_name: contactName };
          }
          return c;
        })
      );

      try {
        webApp?.showPopup({
          title: '\u2713',
          message: `${contactName} — ${t('createContact.title')}`,
          buttons: [{ type: 'ok' }],
        });
      } catch { /* showPopup may not be available */ }
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
    }
  }

  // Build set of phone numbers that already have a contact linked
  const phonesWithContact = new Set<string>();
  for (const call of calls) {
    if (call.contact_name) {
      if (call.phone_1) phonesWithContact.add(call.phone_1);
      if (call.phone_2) phonesWithContact.add(call.phone_2);
    }
  }

  // Group calls by date
  const groups: { key: string; label: string; calls: CallWithDetails[] }[] = [];
  const groupMap = new Map<string, CallWithDetails[]>();

  for (const call of calls) {
    const group = getDateGroup(call.created_at);
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push(call);
  }

  const groupOrder: Array<'today' | 'yesterday' | 'thisWeek' | 'earlier'> = [
    'today',
    'yesterday',
    'thisWeek',
    'earlier',
  ];
  for (const key of groupOrder) {
    const items = groupMap.get(key);
    if (items?.length) {
      groups.push({ key, label: t(`calls.${key}`), calls: items });
    }
  }

  return (
    <div className="miniapp-page-enter">
      <div className="miniapp-page-title">{t('calls.history')}</div>

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon">!</div>
          <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
        </div>
      ) : calls.length === 0 ? (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon">
            <Phone size={24} />
          </div>
          <div className="miniapp-empty-title">{t('calls.noCalls')}</div>
          <div className="miniapp-empty-sub">{t('calls.emptyDescription')}</div>
        </div>
      ) : (
        <>
          {/* Inline create contact form */}
          {createContactForPhone && (
            <div className="miniapp-section" style={{ marginBottom: 8 }}>
              <CreateContactForm
                phone={createContactForPhone}
                onSave={handleCreateContact}
                onCancel={() => setCreateContactForPhone(null)}
                t={t}
              />
            </div>
          )}

          {groups.map((group) => (
            <div key={group.key}>
              <div className="miniapp-date-group">{group.label}</div>
              <div className="miniapp-section">
                <div className="miniapp-list">
                  {group.calls.map((call) => {
                    const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL';
                    const isInbound = call.direction === 'inbound';
                    const phone = call.phone_2 || call.phone_1 || '\u2014';
                    const hasContact = !!call.contact_name;
                    const displayTitle = hasContact ? call.contact_name! : phone;
                    const displaySub = hasContact
                      ? phone
                      : isMissed
                        ? t('calls.missed')
                        : formatDuration(call.duration);

                    return (
                      <div
                        key={call.id}
                        className="miniapp-list-item"
                        onClick={() => {
                          webApp?.HapticFeedback.impactOccurred('light');
                          try {
                            sessionStorage.setItem(`call_${call.id}`, JSON.stringify(call));
                          } catch { /* ignore */ }
                          router.push(`/miniapp/calls/${call.id}`);
                        }}
                      >
                        <div
                          className={`miniapp-call-icon ${isMissed ? 'miniapp-call-icon-missed' : isInbound ? 'miniapp-call-icon-inbound' : 'miniapp-call-icon-outbound'}`}
                        >
                          <Phone size={16} style={{ transform: isInbound ? 'rotate(135deg)' : 'none' }} />
                        </div>
                        <div className="miniapp-list-item-content">
                          <div
                            className={`miniapp-list-item-title ${isMissed ? 'miniapp-text-missed' : ''}`}
                          >
                            {displayTitle}
                          </div>
                          <div className="miniapp-list-item-sub">{displaySub}</div>
                        </div>
                        <div className="miniapp-list-item-right" style={{ gap: 8 }}>
                          {formatTime(call.created_at)}
                          {!hasContact && phone !== '\u2014' && !phonesWithContact.has(phone) && (
                            <button
                              className="miniapp-add-contact-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                webApp?.HapticFeedback.impactOccurred('light');
                                setCreateContactForPhone(phone);
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="miniapp-section" style={{ marginTop: 0 }}>
              <div className="miniapp-section-footer" onClick={handleLoadMore}>
                {loadingMore ? <Spin size="small" /> : t('loadMore')}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
