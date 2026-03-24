'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Phone, XCircle, Delete, Search, ChevronDown } from 'lucide-react';
import { Spin } from 'antd';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import type { SipuniOperator, ContactResponse } from '@/types/api';
import { getInitials, getAvatarColor } from '../_utils';

const DIAL_KEYS = ['1','2','3','4','5','6','7','8','9','+','0','#'];

function formatPhone(raw: string): string {
  if (!raw) return '';
  if (raw.startsWith('+998') && raw.length > 4) {
    const rest = raw.slice(4);
    let f = '+998';
    if (rest.length > 0) f += ' ' + rest.slice(0, 2);
    if (rest.length > 2) f += ' ' + rest.slice(2, 5);
    if (rest.length > 5) f += ' ' + rest.slice(5, 7);
    if (rest.length > 7) f += ' ' + rest.slice(7, 9);
    if (rest.length > 9) f += rest.slice(9);
    return f;
  }
  return raw;
}

export default function MiniAppCalls() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const { user } = useAuthStore();

  const [phone2, setPhone2] = useState(searchParams.get('number') || '');
  const [phone1, setPhone1] = useState('');
  const [mode, setMode] = useState<'sip' | 'external'>(
    (searchParams.get('mode') as 'sip' | 'external') || 'sip'
  );
  const [calling, setCalling] = useState(false);
  const [operators, setOperators] = useState<SipuniOperator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [activeInput, setActiveInput] = useState<'to' | 'from'>('to');
  const [fromCleared, setFromCleared] = useState(false);
  const hasSipExtension = !!user?.sip_extension;

  // Contact search state
  const [searchMode, setSearchMode] = useState<'to' | 'from' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContactResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'external' && !phone1 && !fromCleared && user?.phone) {
      setPhone1(user.phone);
    }
  }, [mode, phone1, fromCleared, user?.phone]);

  useEffect(() => {
    if (mode === 'sip') setFromCleared(false);
  }, [mode]);

  useEffect(() => {
    if (!hasSipExtension) {
      apiClient.getSipuniOperators().then(setOperators).catch(() => {});
    }
  }, [hasSipExtension]);

  const sipExtension = hasSipExtension ? user!.sip_extension! : selectedOperator;

  // Contact search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await apiClient.getContacts({ page: 1, page_size: 8, search: q });
      setSearchResults(res.items || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    // If it looks like a phone number, set it directly
    if (/^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, '').length >= 3) {
      const clean = value.replace(/[^\d+]/g, '');
      if (searchMode === 'from') setPhone1(clean);
      else setPhone2(clean);
    }
    searchTimeout.current = setTimeout(() => doSearch(value), 300);
  }

  function selectContact(contact: ContactResponse) {
    const phone = contact.phone || '';
    if (searchMode === 'from') {
      setPhone1(phone);
      setFromCleared(false);
    } else {
      setPhone2(phone);
    }
    setSearchMode(null);
    setSearchQuery('');
    setSearchResults([]);
    webApp?.HapticFeedback.impactOccurred('light');
  }

  function openSearch(field: 'to' | 'from') {
    setSearchMode(field);
    setSearchQuery('');
    setSearchResults([]);
    webApp?.HapticFeedback.selectionChanged();
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }

  function handleKeyPress(digit: string) {
    webApp?.HapticFeedback.selectionChanged();
    const setter = mode === 'external' && activeInput === 'from' ? setPhone1 : setPhone2;
    setter((prev) => {
      if (prev === '' && digit !== '+' && digit !== '#') return '+998' + digit;
      return prev + digit;
    });
  }

  function handleBackspace() {
    webApp?.HapticFeedback.selectionChanged();
    const setter = mode === 'external' && activeInput === 'from' ? setPhone1 : setPhone2;
    setter((prev) => prev.slice(0, -1));
  }

  async function handleCall() {
    if (!phone2.trim() || calling) return;
    if (mode === 'sip' && !sipExtension) return;
    if (mode === 'external' && !phone1.trim()) return;
    setCalling(true);
    webApp?.HapticFeedback.impactOccurred('medium');
    try {
      const result = mode === 'sip'
        ? await apiClient.callNumber({ phone: phone2, operator_id: sipExtension, reverse: false, antiaon: false })
        : await apiClient.callExternal({ phone_1: phone1, phone_2: phone2, operator_id: sipExtension || phone1 });
      webApp?.HapticFeedback.notificationOccurred('success');
      try { webApp?.showPopup({ title: t('calls.callInitiated'), message: `ID: ${result?.call_id || '\u2014'}`, buttons: [{ type: 'ok' }] }); } catch {}
    } catch {
      webApp?.HapticFeedback.notificationOccurred('error');
      try { webApp?.showPopup({ message: t('error.loadFailed'), buttons: [{ type: 'ok' }] }); } catch {}
    } finally {
      setCalling(false);
    }
  }

  const currentNumber = mode === 'external' && activeInput === 'from' ? phone1 : phone2;
  const canCall = mode === 'sip' ? phone2.trim() && sipExtension : phone2.trim() && phone1.trim();
  const operatorLabel = hasSipExtension
    ? `${user!.first_name || t('calls.operator')} · ${user!.sip_extension}`
    : selectedOperator
      ? `${operators.find(o => o.extension === selectedOperator)?.name || ''} · ${selectedOperator}`
      : t('calls.operator');

  // Contact search overlay
  if (searchMode) {
    return (
      <div className="miniapp-dialer">
        <div className="miniapp-dialer-search">
          <div className="miniapp-dialer-search-bar">
            <Search size={16} className="miniapp-dialer-search-icon" />
            <input
              ref={searchInputRef}
              className="miniapp-dialer-search-input"
              placeholder={t('calls.searchContact')}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              autoFocus
            />
            <button className="miniapp-dialer-search-cancel" onClick={() => { setSearchMode(null); setSearchQuery(''); setSearchResults([]); }}>
              <XCircle size={18} />
            </button>
          </div>

          {searching && <div style={{ padding: 16, textAlign: 'center' }}><Spin size="small" /></div>}

          {searchResults.length > 0 && (
            <div className="miniapp-dialer-search-results">
              {searchResults.map((c) => {
                const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.phone || '—';
                return (
                  <div key={c.id} className="miniapp-dialer-search-item" onClick={() => selectContact(c)}>
                    <div className="miniapp-dialer-search-avatar" style={{ background: getAvatarColor(name) }}>
                      {getInitials(c.first_name, c.last_name, c.phone)}
                    </div>
                    <div className="miniapp-dialer-search-info">
                      <div className="miniapp-dialer-search-name">{name}</div>
                      {c.phone && <div className="miniapp-dialer-search-phone">{c.phone}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery && !searching && searchResults.length === 0 && searchQuery.replace(/\D/g, '').length >= 3 && (
            <div className="miniapp-dialer-search-results">
              <div className="miniapp-dialer-search-item" onClick={() => {
                const clean = searchQuery.replace(/[^\d+]/g, '');
                if (searchMode === 'from') setPhone1(clean);
                else setPhone2(clean);
                setSearchMode(null);
                setSearchQuery('');
                webApp?.HapticFeedback.impactOccurred('light');
              }}>
                <div className="miniapp-dialer-search-avatar" style={{ background: 'var(--ma-separator)' }}>
                  <Phone size={16} />
                </div>
                <div className="miniapp-dialer-search-info">
                  <div className="miniapp-dialer-search-name">{formatPhone(searchQuery.replace(/[^\d+]/g, ''))}</div>
                  <div className="miniapp-dialer-search-phone">{t('calls.enterNumber')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="miniapp-dialer">
      {/* Top section: operator + toggle + fields */}
      <div className="miniapp-dialer-top">
        {/* Operator label */}
        <div className="miniapp-dialer-operator-bar">
          <span className="miniapp-dialer-operator-label">{operatorLabel}</span>
          {!hasSipExtension && (
            <button className="miniapp-dialer-operator-change" onClick={() => {
              webApp?.HapticFeedback.selectionChanged();
              // Cycle through operators
              const idx = operators.findIndex(o => o.extension === selectedOperator);
              const next = operators[(idx + 1) % operators.length];
              if (next) setSelectedOperator(next.extension);
            }}>
              <ChevronDown size={14} />
            </button>
          )}
        </div>

        {/* Mode toggle */}
        <div className="miniapp-dialer-mode">
          <button className={`miniapp-dialer-mode-btn ${mode === 'sip' ? 'active' : ''}`}
            onClick={() => { webApp?.HapticFeedback.selectionChanged(); setMode('sip'); setActiveInput('to'); }}>
            {t('calls.sipMode')}
          </button>
          <button className={`miniapp-dialer-mode-btn ${mode === 'external' ? 'active' : ''}`}
            onClick={() => { webApp?.HapticFeedback.selectionChanged(); setMode('external'); }}>
            {t('calls.externalMode')}
          </button>
        </div>

        {/* Phone fields */}
        <div className="miniapp-dialer-fields">
          {mode === 'external' && (
            <div
              className={`miniapp-dialer-field ${activeInput === 'from' ? 'active' : ''}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.miniapp-dialer-clear')) return;
                webApp?.HapticFeedback.selectionChanged();
                setActiveInput('from');
              }}
            >
              <span className="miniapp-dialer-field-label">{t('calls.from')}</span>
              {phone1 ? (
                <>
                  <span className="miniapp-dialer-field-value">{formatPhone(phone1)}</span>
                  <button className="miniapp-dialer-clear" onClick={() => { setPhone1(''); setFromCleared(true); webApp?.HapticFeedback.selectionChanged(); }}>
                    <XCircle size={16} />
                  </button>
                </>
              ) : (
                <span className="miniapp-dialer-field-placeholder" onClick={() => openSearch('from')}>{t('calls.searchContact')}</span>
              )}
            </div>
          )}
          <div
            className={`miniapp-dialer-field ${activeInput === 'to' || mode === 'sip' ? 'active' : ''}`}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('.miniapp-dialer-clear')) return;
              webApp?.HapticFeedback.selectionChanged();
              setActiveInput('to');
            }}
          >
            <span className="miniapp-dialer-field-label">{mode === 'external' ? t('calls.to') : ''}</span>
            {phone2 ? (
              <>
                <span className="miniapp-dialer-field-value">{formatPhone(phone2)}</span>
                <button className="miniapp-dialer-clear" onClick={() => { setPhone2(''); webApp?.HapticFeedback.selectionChanged(); }}>
                  <XCircle size={16} />
                </button>
              </>
            ) : (
              <span className="miniapp-dialer-field-placeholder" onClick={() => openSearch(mode === 'external' ? 'to' : 'to')}>{t('calls.searchContact')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom: pad + call */}
      <div className="miniapp-dialer-fixed">
        <div className="miniapp-dialer-grid">
          {DIAL_KEYS.map((d) => (
            <button key={d} className="miniapp-dialer-key" onClick={() => handleKeyPress(d)}>{d}</button>
          ))}
        </div>
        <div className="miniapp-dialer-bottom">
          <div />
          <button className="miniapp-dialer-call" onClick={handleCall} disabled={!canCall || calling}>
            {calling ? <Spin size="small" /> : <Phone size={24} />}
          </button>
          {currentNumber ? (
            <button className="miniapp-dialer-backspace" onClick={handleBackspace}><Delete size={22} /></button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
