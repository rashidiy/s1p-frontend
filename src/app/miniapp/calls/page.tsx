'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Phone, XCircle, Delete, Search, ChevronDown, ArrowLeft, Check } from 'lucide-react';
import { Spin } from 'antd';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import type { SipuniOperator, ContactResponse } from '@/types/api';
import { formatPhone, getInitials, getAvatarColor } from '../_utils';

const DIAL_KEYS = ['1','2','3','4','5','6','7','8','9','+','0','#'];

export default function MiniAppCalls() {
  const searchParams = useSearchParams();
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const { user } = useAuthStore();

  const [phone2, setPhone2] = useState(searchParams.get('dial') || searchParams.get('number') || '');
  const [phone1, setPhone1] = useState('');
  const [mode, setMode] = useState<'sip' | 'external'>(
    (searchParams.get('mode') as 'sip' | 'external') || 'sip'
  );
  const [calling, setCalling] = useState(false);
  const [operators, setOperators] = useState<SipuniOperator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [activeInput, setActiveInput] = useState<'to' | 'from'>('to');
  const [fromCleared, setFromCleared] = useState(false);
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const hasSipExtension = !!user?.sip_extension;

  // Contact search
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

  useEffect(() => { if (mode === 'sip') setFromCleared(false); }, [mode]);

  useEffect(() => {
    if (!hasSipExtension) {
      apiClient.getSipuniOperators().then(setOperators).catch(() => {});
    }
  }, [hasSipExtension]);

  const sipExtension = hasSipExtension ? user!.sip_extension! : selectedOperator;

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await apiClient.getContacts({ page: 1, page_size: 8, search: q });
      setSearchResults(res.items || []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, []);

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (/^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, '').length >= 3) {
      const clean = value.replace(/[^\d+]/g, '');
      if (searchMode === 'from') setPhone1(clean); else setPhone2(clean);
    }
    searchTimeout.current = setTimeout(() => doSearch(value), 300);
  }

  function selectContact(contact: ContactResponse) {
    const phone = contact.phone || '';
    if (searchMode === 'from') { setPhone1(phone); setFromCleared(false); }
    else setPhone2(phone);
    closeSearch();
    webApp?.HapticFeedback.impactOccurred('light');
  }

  function closeSearch() { setSearchMode(null); setSearchQuery(''); setSearchResults([]); }

  function openSearch(field: 'to' | 'from') {
    setSearchMode(field); setSearchQuery(''); setSearchResults([]);
    webApp?.HapticFeedback.selectionChanged();
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }

  // Throttle haptic — Telegram SDK call is synchronous and blocks main thread
  const lastHaptic = useRef(0);
  function hapticLight() {
    const now = Date.now();
    if (now - lastHaptic.current > 100) {
      lastHaptic.current = now;
      try { webApp?.HapticFeedback.selectionChanged(); } catch {}
    }
  }

  function handleKeyPress(digit: string) {
    // No haptic on keypad — causes lag in Telegram WebView at rapid press speeds
    const setter = mode === 'external' && activeInput === 'from' ? setPhone1 : setPhone2;
    setter((prev) => prev === '' && digit !== '+' && digit !== '#' ? '+998' + digit : prev + digit);
  }

  function handleBackspace() {
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
    } finally { setCalling(false); }
  }

  const currentNumber = mode === 'external' && activeInput === 'from' ? phone1 : phone2;
  const canCall = mode === 'sip'
    ? phone2.trim() && sipExtension
    : phone2.trim() && phone1.trim() && sipExtension;
  const operatorName = hasSipExtension
    ? `${user!.first_name || t('calls.operator')} · ${user!.sip_extension}`
    : selectedOperator
      ? `${operators.find(o => o.extension === selectedOperator)?.name || ''} · ${selectedOperator}`
      : t('calls.selectOperator');

  // ── Search overlay ──
  if (searchMode) {
    return (
      <div className="miniapp-dialer">
        <div className="miniapp-dialer-search">
          <div className="miniapp-dialer-search-bar">
            <button className="miniapp-dialer-search-back" onClick={closeSearch}><ArrowLeft size={20} /></button>
            <input ref={searchInputRef} className="miniapp-dialer-search-input"
              placeholder={t('calls.searchContact')} value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)} autoFocus />
            {searchQuery && (
              <button className="miniapp-dialer-search-cancel" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                <XCircle size={18} />
              </button>
            )}
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
                      {c.phone && <div className="miniapp-dialer-search-phone">{formatPhone(c.phone)}</div>}
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
                if (searchMode === 'from') setPhone1(clean); else setPhone2(clean);
                closeSearch(); webApp?.HapticFeedback.impactOccurred('light');
              }}>
                <div className="miniapp-dialer-search-avatar" style={{ background: 'var(--ma-separator)', color: 'var(--ma-hint)' }}>
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

  // ── Main dialer ──
  return (
    <div className="miniapp-dialer">
      {/* === TOP: operator + toggle === */}
      <div className="miniapp-dialer-header">
        <div className="miniapp-dialer-operator-wrap">
          {!hasSipExtension ? (
            <span className="miniapp-dialer-operator-text"
              onClick={() => { webApp?.HapticFeedback.selectionChanged(); setShowOperatorDropdown(!showOperatorDropdown); }}>
              {operatorName} <ChevronDown size={12} />
            </span>
          ) : (
            <span className="miniapp-dialer-operator-text">{operatorName}</span>
          )}
          {showOperatorDropdown && (
            <>
              <div className="miniapp-dialer-dropdown-backdrop" onClick={() => setShowOperatorDropdown(false)} />
              <div className="miniapp-dialer-dropdown">
                {operators.map((op) => (
                  <div key={op.extension} className="miniapp-dialer-dropdown-item"
                    onClick={() => { setSelectedOperator(op.extension); setShowOperatorDropdown(false); webApp?.HapticFeedback.impactOccurred('light'); }}>
                    <span className="miniapp-dialer-dropdown-name">{op.name}</span>
                    <span className="miniapp-dialer-dropdown-ext">{op.extension}</span>
                    {selectedOperator === op.extension && <Check size={16} style={{ color: 'var(--ma-accent)' }} />}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
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
      </div>

      {/* === MIDDLE: big centered numbers === */}
      <div className="miniapp-dialer-middle">
        {mode === 'external' && (
          <div className="miniapp-dialer-num-block" onClick={() => { webApp?.HapticFeedback.selectionChanged(); setActiveInput('from'); }}>
            <div className="miniapp-dialer-num-label">{t('calls.from')}</div>
            <div className={`miniapp-dialer-num-row ${activeInput === 'from' ? 'active' : ''}`}>
              {phone1 ? (
                <>
                  <span className="miniapp-dialer-num">{formatPhone(phone1)}</span>
                  <button className="miniapp-dialer-num-action" onClick={(e) => { e.stopPropagation(); setPhone1(''); setFromCleared(true); }}><XCircle size={16} /></button>
                  <button className="miniapp-dialer-num-action" onClick={(e) => { e.stopPropagation(); openSearch('from'); }}><Search size={16} /></button>
                </>
              ) : (
                <>
                  <span className="miniapp-dialer-num-placeholder">{t('calls.enterNumber')}</span>
                  <button className="miniapp-dialer-num-action" onClick={(e) => { e.stopPropagation(); openSearch('from'); }}><Search size={14} /></button>
                </>
              )}
            </div>
          </div>
        )}
        <div className="miniapp-dialer-num-block" onClick={() => { webApp?.HapticFeedback.selectionChanged(); setActiveInput('to'); }}>
          {mode === 'external' && <div className="miniapp-dialer-num-label">{t('calls.to')}</div>}
          <div className={`miniapp-dialer-num-row ${activeInput === 'to' || mode === 'sip' ? 'active' : ''}`}>
            {phone2 ? (
              <>
                <span className="miniapp-dialer-num">{formatPhone(phone2)}</span>
                <button className="miniapp-dialer-num-action" onClick={(e) => { e.stopPropagation(); setPhone2(''); }}><XCircle size={16} /></button>
                <button className="miniapp-dialer-num-action" onClick={(e) => { e.stopPropagation(); openSearch('to'); }}><Search size={16} /></button>
              </>
            ) : (
              <>
                <span className="miniapp-dialer-num-placeholder">{t('calls.enterNumber')}</span>
                <button className="miniapp-dialer-num-action" onClick={(e) => { e.stopPropagation(); openSearch('to'); }}><Search size={14} /></button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* === BOTTOM: pad + call (never moves) === */}
      <div className="miniapp-dialer-fixed">
        <div className="miniapp-dialer-grid" onPointerDown={(e) => {
          const key = (e.target as HTMLElement).closest('[data-key]')?.getAttribute('data-key');
          if (key) { e.preventDefault(); handleKeyPress(key); }
        }}>
          <button className="miniapp-dialer-key" data-key="1">1</button>
          <button className="miniapp-dialer-key" data-key="2">2</button>
          <button className="miniapp-dialer-key" data-key="3">3</button>
          <button className="miniapp-dialer-key" data-key="4">4</button>
          <button className="miniapp-dialer-key" data-key="5">5</button>
          <button className="miniapp-dialer-key" data-key="6">6</button>
          <button className="miniapp-dialer-key" data-key="7">7</button>
          <button className="miniapp-dialer-key" data-key="8">8</button>
          <button className="miniapp-dialer-key" data-key="9">9</button>
          <button className="miniapp-dialer-key" data-key="+">+</button>
          <button className="miniapp-dialer-key" data-key="0">0</button>
          <button className="miniapp-dialer-key" data-key="#">#</button>
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
