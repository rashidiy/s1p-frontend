'use client';

import { useEffect, useState } from 'react';
import { PhoneOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Spin } from 'antd';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import type { SipuniOperator } from '@/types/api';

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
  const hasSipExtension = !!user?.sip_extension;

  // Prefill phone1 with user's phone when switching to external
  useEffect(() => {
    if (mode === 'external' && !phone1 && user?.phone) {
      setPhone1(user.phone);
    }
  }, [mode, phone1, user?.phone]);

  useEffect(() => {
    if (!hasSipExtension) {
      apiClient.getSipuniOperators().then(setOperators).catch(() => {});
    }
  }, [hasSipExtension]);

  const sipExtension = hasSipExtension ? user!.sip_extension! : selectedOperator;

  function handleKeyPress(digit: string) {
    webApp?.HapticFeedback.selectionChanged();
    const setter = mode === 'external' && activeInput === 'from' ? setPhone1 : setPhone2;
    setter((prev) => {
      if (prev === '' && digit !== '+' && digit !== '#') {
        return '+998' + digit;
      }
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

  return (
    <div className="miniapp-dialer">
      {/* Display area — always same height for both modes */}
      <div className="miniapp-dialer-display-area">
        {mode === 'external' ? (
          <>
            <div
              className={`miniapp-dialer-ext-from ${activeInput === 'from' ? 'active' : ''}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.miniapp-dialer-clear')) return;
                webApp?.HapticFeedback.selectionChanged(); setActiveInput('from');
              }}
            >
              {phone1 ? formatPhone(phone1) : <span className="miniapp-dialer-hint">{t('calls.from')}</span>}
              {phone1 && (
                <button className="miniapp-dialer-clear" onClick={() => { setPhone1(''); webApp?.HapticFeedback.selectionChanged(); }}>
                  <CloseCircleFilled />
                </button>
              )}
            </div>
            <div
              className={`miniapp-dialer-ext-to ${activeInput === 'to' ? 'active' : ''}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.miniapp-dialer-clear')) return;
                webApp?.HapticFeedback.selectionChanged(); setActiveInput('to');
              }}
            >
              {phone2 ? formatPhone(phone2) : <span className="miniapp-dialer-hint">{t('calls.to')}</span>}
              {phone2 && (
                <button className="miniapp-dialer-clear" onClick={() => { setPhone2(''); webApp?.HapticFeedback.selectionChanged(); }}>
                  <CloseCircleFilled />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="miniapp-dialer-number">
            {phone2 ? formatPhone(phone2) : <span className="miniapp-dialer-hint">{t('calls.enterNumber')}</span>}
            {phone2 && (
              <button className="miniapp-dialer-clear" onClick={() => { setPhone2(''); webApp?.HapticFeedback.selectionChanged(); }}>
                <CloseCircleFilled />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="miniapp-dialer-controls">
        <div className="miniapp-dialer-mode">
          <button className={`miniapp-dialer-mode-btn ${mode === 'sip' ? 'active' : ''}`}
            onClick={() => { webApp?.HapticFeedback.selectionChanged(); setMode('sip'); setActiveInput('to'); }}>SIP</button>
          <button className={`miniapp-dialer-mode-btn ${mode === 'external' ? 'active' : ''}`}
            onClick={() => { webApp?.HapticFeedback.selectionChanged(); setMode('external'); }}>External</button>
        </div>
        {hasSipExtension ? (
          <div className="miniapp-dialer-operator">{t('calls.via', { ext: user!.sip_extension! })}</div>
        ) : (
          <select className="miniapp-dialer-operator-select" value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}>
            <option value="">{t('calls.selectOperator')}</option>
            {operators.map((op) => (
              <option key={op.extension} value={op.extension}>{op.name} ({op.extension})</option>
            ))}
          </select>
        )}
      </div>

      {/* Number pad */}
      <div className="miniapp-dialer-grid">
        {DIAL_KEYS.map((d) => (
          <button key={d} className="miniapp-dialer-key" onClick={() => handleKeyPress(d)}>{d}</button>
        ))}
      </div>

      {/* Bottom: call + backspace */}
      <div className="miniapp-dialer-bottom">
        <div />
        <button className="miniapp-dialer-call" onClick={handleCall} disabled={!canCall || calling}>
          {calling ? <Spin size="small" /> : <PhoneOutlined />}
        </button>
        {currentNumber ? (
          <button className="miniapp-dialer-backspace" onClick={handleBackspace}>{'\u232B'}</button>
        ) : <div />}
      </div>
    </div>
  );
}
