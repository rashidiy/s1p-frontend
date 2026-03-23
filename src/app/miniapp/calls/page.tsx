'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  PhoneOutlined,
  PlusOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import type { CallWithDetails, SipuniOperator } from '@/types/api';
import { formatDuration, formatTime, getDateGroup } from '../_utils';

const PAGE_SIZE = 50;

const DIAL_KEYS = [
  { digit: '1', sub: '' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: '' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: '' },
];

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
          <CloseOutlined />
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

// ============================================================================
// Dialer View
// ============================================================================

function DialerView({ webApp, t }: {
  webApp: ReturnType<typeof useTelegramWebApp>['webApp'];
  t: ReturnType<typeof useTranslations>;
}) {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [number, setNumber] = useState(searchParams.get('number') || '');
  const [mode, setMode] = useState<'sip' | 'external'>(
    (searchParams.get('mode') as 'sip' | 'external') || 'sip'
  );
  const [calling, setCalling] = useState(false);
  const [operators, setOperators] = useState<SipuniOperator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const hasSipExtension = !!user?.sip_extension;

  useEffect(() => {
    if (!hasSipExtension) {
      apiClient.getSipuniOperators().then(setOperators).catch(() => {});
    }
  }, [hasSipExtension]);

  const sipExtension = hasSipExtension
    ? user!.sip_extension!
    : selectedOperator;

  function handleKeyPress(digit: string) {
    webApp?.HapticFeedback.selectionChanged();
    setNumber((prev) => prev + digit);
  }

  function handleBackspace() {
    webApp?.HapticFeedback.selectionChanged();
    setNumber((prev) => prev.slice(0, -1));
  }

  function handleLongPressZero() {
    webApp?.HapticFeedback.selectionChanged();
    setNumber((prev) => prev + '+');
  }

  async function handleCall() {
    if (!number.trim() || !sipExtension || calling) return;
    setCalling(true);
    webApp?.HapticFeedback.impactOccurred('medium');
    try {
      let result;
      if (mode === 'sip') {
        result = await apiClient.callNumber({ phone: number, operator_id: sipExtension });
      } else {
        result = await apiClient.callExternal({ phone_1: sipExtension, phone_2: number, operator_id: sipExtension });
      }
      webApp?.HapticFeedback.notificationOccurred('success');
      try {
        webApp?.showPopup({
          title: t('calls.callInitiated'),
          message: `ID: ${result?.id || '—'}`,
          buttons: [{ type: 'ok' }],
        });
      } catch { /* popup may not be available */ }
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
      try {
        webApp?.showPopup({
          message: t('error.loadFailed'),
          buttons: [{ type: 'ok' }],
        });
      } catch { /* popup may not be available */ }
    } finally {
      setCalling(false);
    }
  }

  let zeroTimer: ReturnType<typeof setTimeout> | null = null;

  return (
    <div className="miniapp-dialer">
      {/* Number display */}
      <div
        className="miniapp-dialer-display"
        onClick={async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (text) {
              webApp?.HapticFeedback.selectionChanged();
              setNumber(text.replace(/[^\d+*#]/g, ''));
            }
          } catch { /* clipboard not available */ }
        }}
      >
        {number || (
          <span className="miniapp-dialer-display-placeholder">
            {t('calls.enterNumber')}
          </span>
        )}
      </div>

      {/* SIP / External toggle */}
      <div className="miniapp-dialer-mode">
        <button
          className={`miniapp-dialer-mode-btn ${mode === 'sip' ? 'active' : ''}`}
          onClick={() => {
            webApp?.HapticFeedback.selectionChanged();
            setMode('sip');
          }}
        >
          SIP
        </button>
        <button
          className={`miniapp-dialer-mode-btn ${mode === 'external' ? 'active' : ''}`}
          onClick={() => {
            webApp?.HapticFeedback.selectionChanged();
            setMode('external');
          }}
        >
          External
        </button>
      </div>

      {/* Operator info */}
      {hasSipExtension ? (
        <div className="miniapp-dialer-operator">
          {t('calls.via', { ext: user!.sip_extension! })}
        </div>
      ) : (
        <div className="miniapp-dialer-operator">
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
          >
            <option value="">{t('calls.selectOperator')}</option>
            {operators.map((op) => (
              <option key={op.extension} value={op.extension}>
                {op.name} ({op.extension})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Number pad */}
      <div className="miniapp-dialer-grid">
        {DIAL_KEYS.map(({ digit, sub }) => (
          <button
            key={digit}
            className="miniapp-dialer-key"
            onClick={() => handleKeyPress(digit)}
            onTouchStart={digit === '0' ? () => {
              zeroTimer = setTimeout(() => {
                handleLongPressZero();
                zeroTimer = null;
              }, 500);
            } : undefined}
            onTouchEnd={digit === '0' ? () => {
              if (zeroTimer) {
                clearTimeout(zeroTimer);
                zeroTimer = null;
                handleKeyPress('0');
              }
            } : undefined}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span>{digit}</span>
              {sub && <span className="miniapp-dialer-key-sub">{sub}</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom row: empty, call, backspace */}
      <div className="miniapp-dialer-bottom">
        <div />
        <button
          className="miniapp-dialer-call"
          onClick={handleCall}
          disabled={!number.trim() || !sipExtension || calling}
        >
          {calling ? <Spin size="small" /> : <PhoneOutlined />}
        </button>
        {number ? (
          <button className="miniapp-dialer-backspace" onClick={handleBackspace}>
            <DeleteOutlined />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// History View
// ============================================================================

function HistoryView({
  webApp,
  t,
}: {
  webApp: ReturnType<typeof useTelegramWebApp>['webApp'];
  t: ReturnType<typeof useTranslations>;
}) {
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

  if (loading) {
    return <SkeletonList />;
  }

  if (error) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">!</div>
        <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">
          <PhoneOutlined />
        </div>
        <div className="miniapp-empty-title">{t('calls.noCalls')}</div>
        <div className="miniapp-empty-sub">{t('calls.emptyDescription')}</div>
      </div>
    );
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
                      <PhoneOutlined
                        style={{
                          transform: isInbound ? 'rotate(135deg)' : 'rotate(-45deg)',
                        }}
                      />
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
                          <PlusOutlined />
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
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function MiniAppCalls() {
  const searchParams = useSearchParams();
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');

  // Default to history unless URL says tab=dial
  const [activeTab, setActiveTab] = useState<'history' | 'dial'>(
    searchParams.get('tab') === 'dial' ? 'dial' : 'history'
  );

  return (
    <div className="miniapp-page-enter">
      <div className="miniapp-page-title">{t('calls.title')}</div>

      {/* Segmented toggle */}
      <div className="miniapp-segment">
        <button
          className={`miniapp-segment-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            webApp?.HapticFeedback.selectionChanged();
            setActiveTab('history');
          }}
        >
          {t('calls.history')}
        </button>
        <button
          className={`miniapp-segment-btn ${activeTab === 'dial' ? 'active' : ''}`}
          onClick={() => {
            webApp?.HapticFeedback.selectionChanged();
            setActiveTab('dial');
          }}
        >
          {t('calls.makeCall')}
        </button>
      </div>

      {activeTab === 'history' ? (
        <HistoryView webApp={webApp} t={t} />
      ) : (
        <DialerView webApp={webApp} t={t} />
      )}
    </div>
  );
}
