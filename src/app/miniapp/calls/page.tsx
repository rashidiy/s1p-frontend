'use client';

import { useEffect, useState } from 'react';
import {
  PhoneOutlined,
} from '@ant-design/icons';
import { Spin } from 'antd';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import type { SipuniOperator } from '@/types/api';

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
    if (mode === 'external' && activeInput === 'from') {
      setPhone1((prev) => prev + digit);
    } else {
      setPhone2((prev) => prev + digit);
    }
  }

  function handleBackspace() {
    webApp?.HapticFeedback.selectionChanged();
    if (mode === 'external' && activeInput === 'from') {
      setPhone1((prev) => prev.slice(0, -1));
    } else {
      setPhone2((prev) => prev.slice(0, -1));
    }
  }

  function handleLongPressZero() {
    webApp?.HapticFeedback.selectionChanged();
    if (mode === 'external' && activeInput === 'from') {
      setPhone1((prev) => prev + '+');
    } else {
      setPhone2((prev) => prev + '+');
    }
  }

  async function handleCall() {
    if (!phone2.trim() || calling) return;
    if (mode === 'sip' && !sipExtension) return;
    if (mode === 'external' && !phone1.trim()) return;

    setCalling(true);
    webApp?.HapticFeedback.impactOccurred('medium');
    try {
      let result;
      if (mode === 'sip') {
        result = await apiClient.callNumber({ phone: phone2, operator_id: sipExtension, reverse: false, antiaon: false });
      } else {
        result = await apiClient.callExternal({ phone_1: phone1, phone_2: phone2, operator_id: sipExtension || phone1 });
      }
      webApp?.HapticFeedback.notificationOccurred('success');
      try {
        webApp?.showPopup({
          title: t('calls.callInitiated'),
          message: `ID: ${result?.call_id || '\u2014'}`,
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

  const currentNumber = mode === 'external' && activeInput === 'from' ? phone1 : phone2;

  const canCall = mode === 'sip'
    ? phone2.trim() && sipExtension
    : phone2.trim() && phone1.trim();

  return (
      <div className="miniapp-dialer">
        {/* External mode: dual display */}
        {mode === 'external' ? (
          <div className="miniapp-dialer-dual">
            <div
              className={`miniapp-dialer-from ${activeInput === 'from' ? 'miniapp-dialer-input-active' : ''}`}
              onClick={() => {
                webApp?.HapticFeedback.selectionChanged();
                setActiveInput('from');
              }}
            >
              <span className="miniapp-dialer-input-label">{t('calls.from')}</span>
              <span className="miniapp-dialer-from-number">
                {phone1 || (
                  <span className="miniapp-dialer-display-placeholder" style={{ fontSize: 16 }}>
                    {t('calls.enterNumber')}
                  </span>
                )}
              </span>
            </div>
            <div
              className={`miniapp-dialer-to ${activeInput === 'to' ? 'miniapp-dialer-input-active' : ''}`}
              onClick={() => {
                webApp?.HapticFeedback.selectionChanged();
                setActiveInput('to');
              }}
            >
              <span className="miniapp-dialer-input-label">{t('calls.to')}</span>
              <span className="miniapp-dialer-to-number">
                {phone2 || (
                  <span className="miniapp-dialer-display-placeholder" style={{ fontSize: 20 }}>
                    {t('calls.enterNumber')}
                  </span>
                )}
              </span>
            </div>
          </div>
        ) : (
          /* SIP mode: single display */
          <div
            className="miniapp-dialer-display"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text) {
                  webApp?.HapticFeedback.selectionChanged();
                  setPhone2(text.replace(/[^\d+*#]/g, ''));
                }
              } catch { /* clipboard not available */ }
            }}
          >
            {phone2 || (
              <span className="miniapp-dialer-display-placeholder">
                {t('calls.enterNumber')}
              </span>
            )}
          </div>
        )}

        {/* SIP / External toggle */}
        <div className="miniapp-dialer-mode">
          <button
            className={`miniapp-dialer-mode-btn ${mode === 'sip' ? 'active' : ''}`}
            onClick={() => {
              webApp?.HapticFeedback.selectionChanged();
              setMode('sip');
              setActiveInput('to');
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

        {/* Operator info — only in SIP mode */}
        {mode === 'sip' && (
          hasSipExtension ? (
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
          )
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
            disabled={!canCall || calling}
          >
            {calling ? <Spin size="small" /> : <PhoneOutlined />}
          </button>
          {currentNumber ? (
            <button className="miniapp-dialer-backspace" onClick={handleBackspace}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{'\u232B'}</span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
  );
}
