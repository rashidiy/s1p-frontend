'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, MessageCircle, User, Clock, Play, Pause, PhoneIncoming, PhoneOutgoing, PhoneMissed, UserPlus, TrendingUp } from 'lucide-react';
import { Spin } from 'antd';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { CallWithDetails } from '@/types/api';
import { formatDuration, formatDate, formatTime, formatPhone, getAvatarColor, getInitials } from '../../_utils';
import { CallBottomSheet } from '../../_components/CallBottomSheet';

// ============================================================================
// Audio Player — lazy-load on play, clean progress bar (no fake waveform)
// ============================================================================

function AudioPlayer({
  callId,
  webApp,
}: {
  callId: number;
  webApp: ReturnType<typeof useTelegramWebApp>['webApp'];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  // Wire up audio events when URL is available
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => { setDuration(audio.duration); setState('ready'); };
    const onEnd = () => setPlaying(false);
    const onCanPlay = () => {
      setState('ready');
      // Auto-play once loaded (user already pressed play)
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };
    const onError = () => setState('error');
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onError);
    };
  }, [audioUrl]);

  // Lazy load: fetch recording only when user taps play
  async function loadAndPlay() {
    if (state === 'loading') return;
    setState('loading');
    webApp?.HapticFeedback.selectionChanged();
    try {
      const url = await apiClient.getCallRecording(String(callId));
      setAudioUrl(url);
      // Audio will auto-play via canplay event
    } catch {
      setState('error');
      webApp?.HapticFeedback.notificationOccurred('error');
    }
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || state !== 'ready') return;
    webApp?.HapticFeedback.selectionChanged();
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  function cycleSpeed() {
    const audio = audioRef.current;
    if (!audio) return;
    webApp?.HapticFeedback.selectionChanged();
    const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(next);
    audio.playbackRate = next;
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  }

  function fmt(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLoading = state === 'loading';
  const isReady = state === 'ready';

  // Error state — recording unavailable
  if (state === 'error') {
    return (
      <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--ma-hint)', textAlign: 'center' }}>
        {"Recording unavailable" /* TODO: i18n */}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 8 }}>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Play/Pause — compact circle */}
        <button
          onClick={isReady ? togglePlay : loadAndPlay}
          disabled={isLoading}
          style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: isLoading ? 'var(--ma-separator)' : 'rgba(128,128,128,0.15)',
            color: 'var(--ma-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isLoading ? 'default' : 'pointer',
            WebkitTapHighlightColor: 'transparent', flexShrink: 0,
          }}
        >
          {isLoading ? (
            <Spin size="small" />
          ) : playing ? (
            <Pause size={14} />
          ) : (
            <Play size={14} style={{ marginLeft: 1 }} />
          )}
        </button>

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={isReady ? handleSeek : undefined}
          onTouchMove={isReady ? handleSeek : undefined}
          style={{
            flex: 1, height: 4, borderRadius: 2, cursor: isReady ? 'pointer' : 'default',
            background: 'var(--ma-separator)', touchAction: 'none',
          }}
        >
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'var(--ma-hint)',
            width: `${progress}%`,
            transition: playing ? 'width 0.2s linear' : 'none',
          }} />
        </div>

        {/* Time */}
        <span style={{ fontSize: 11, color: 'var(--ma-hint)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: 32 }}>
          {isReady ? fmt(currentTime) : '0:00'}
        </span>

        {/* Speed pill — only when not 1x */}
        {isReady && speed !== 1 && (
          <button
            onClick={cycleSpeed}
            style={{
              padding: '1px 6px', border: '1px solid var(--ma-separator)', borderRadius: 100,
              background: 'transparent', color: 'var(--ma-hint)',
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent', flexShrink: 0,
            }}
          >
            {speed}x
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Single Call Row (iPhone-style — icon, time, duration, recording)
// ============================================================================

function CallRow({
  call,
  webApp,
  t,
  tFields,
}: {
  call: CallWithDetails;
  webApp: ReturnType<typeof useTelegramWebApp>['webApp'];
  t: ReturnType<typeof useTranslations>;
  tFields: ReturnType<typeof useTranslations>;
}) {
  const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL';
  const isInbound = call.direction === 'inbound';
  const isAnswered = call.state === 'ANSWER';

  const IconComponent = isMissed ? PhoneMissed : isInbound ? PhoneIncoming : PhoneOutgoing;
  const iconColor = isMissed ? '#EF4444' : isInbound ? '#10B981' : '#3B82F6';

  const stateLabel = isMissed
    ? t('calls.missed')
    : isAnswered
      ? t('calls.answered')
      : (call.state || '\u2014');

  const stateClass = isMissed
    ? 'miniapp-call-detail-row-state-missed'
    : isAnswered
      ? 'miniapp-call-detail-row-state-answered'
      : '';

  const dur = isAnswered && call.duration ? formatDuration(call.duration) : null;
  const showRecording = isAnswered && call.has_recording;

  return (
    <div style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--ma-separator)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: iconColor, flexShrink: 0 }}>
          <IconComponent size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--ma-text)' }}>
              {formatDate(call.created_at)} {formatTime(call.created_at)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: isMissed ? '#EF4444' : '#10B981' }}>
              {stateLabel}
            </span>
          </div>
          {(dur || call.operator_name) && (
            <div style={{ fontSize: 12, color: 'var(--ma-hint)', marginTop: 2, display: 'flex', gap: 8 }}>
              {dur && <span>{dur}</span>}
              {call.operator_name && <span>{call.operator_name}</span>}
            </div>
          )}
        </div>
      </div>
      {showRecording && (
        <AudioPlayer callId={call.id} webApp={webApp} />
      )}
    </div>
  );
}

// ============================================================================
// Call Detail Page
// ============================================================================

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [call, setCall] = useState<CallWithDetails | null>(null);
  const [groupCalls, setGroupCalls] = useState<CallWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallSheet, setShowCallSheet] = useState(false);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tFields = useTranslations('fields');

  const goBack = useCallback(() => {
    router.push('/miniapp/history');
  }, [router]);

  useEffect(() => {
    // Load from sessionStorage first for instant display
    try {
      const stored = sessionStorage.getItem(`call_${id}`);
      if (stored) {
        setCall(JSON.parse(stored));
        setLoading(false);
      }
      // Load grouped calls if available
      const groupStored = sessionStorage.getItem(`call_group_${id}`);
      if (groupStored) {
        const items = JSON.parse(groupStored) as CallWithDetails[];
        setGroupCalls(items);
      }
    } catch { /* ignore */ }

    // Fetch primary call from API for full data
    apiClient.getCall(id).then((data) => {
      setCall((prev) => prev ? { ...prev, ...data } : data);
    }).catch(() => {
      setCall((prev) => prev ?? null);
    }).finally(() => {
      setLoading(false);
    });

    // Fetch full data for each grouped call (to get has_recording etc.)
    try {
      const groupStored = sessionStorage.getItem(`call_group_${id}`);
      if (groupStored) {
        const items = JSON.parse(groupStored) as CallWithDetails[];
        // Fetch each call's full data in parallel
        Promise.all(
          items.map((item) =>
            apiClient.getCall(String(item.id))
              .then((full) => ({ ...item, ...full }))
              .catch(() => item)
          )
        ).then(setGroupCalls);
      }
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    if (webApp) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(goBack);
      return () => {
        webApp.BackButton.offClick(goBack);
        webApp.BackButton.hide();
      };
    }
  }, [webApp, goBack]);

  if (loading) {
    return (
      <div>
        <div className="miniapp-detail-header">
          <div className="miniapp-skeleton-circle" style={{ width: 72, height: 72 }} />
          <div className="miniapp-skeleton-text" style={{ width: 160, height: 24, borderRadius: 8, marginTop: 8 }} />
          <div className="miniapp-skeleton-text" style={{ width: 120, height: 14, borderRadius: 6 }} />
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">!</div>
        <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
      </div>
    );
  }

  const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL';
  const isInbound = call.direction === 'inbound';
  const phone = isInbound ? (call.phone_1 || call.phone_2 || '') : (call.phone_2 || call.phone_1 || '');
  const displayName = call.contact_name || formatPhone(phone) || '\u2014';
  const hasContact = !!call.contact_name && !!call.contact_id;

  // Use grouped calls if available, otherwise just the single call
  const allCalls = groupCalls.length > 0 ? groupCalls : [call];

  function handlePhoneSheet() {
    webApp?.HapticFeedback.impactOccurred('medium');
    setShowCallSheet(true);
  }

  function handleMessage() {
    if (!phone) return;
    webApp?.HapticFeedback.impactOccurred('medium');
    const cleanPhone = phone.startsWith('+') ? phone : `+${phone}`;
    try {
      webApp?.openTelegramLink(`https://t.me/${cleanPhone}`);
    } catch {
      window.open(`https://t.me/${cleanPhone}`, '_blank');
    }
  }

  function handleContactNav() {
    if (!hasContact) return;
    webApp?.HapticFeedback.impactOccurred('light');
    router.push(`/miniapp/contacts/${call!.contact_id}`);
  }

  return (
    <div className="miniapp-detail-enter">
      {/* Header with avatar */}
      <div className="miniapp-detail-header">
        {hasContact ? (
          <div
            className="miniapp-detail-avatar"
            style={{ background: getAvatarColor(call.contact_name!) }}
          >
            {getInitials(call.contact_name!.split(' ')[0], call.contact_name!.split(' ')[1])}
          </div>
        ) : (
          <div
            className="miniapp-detail-avatar"
            style={{
              background: isMissed
                ? 'rgba(239, 68, 68, 0.15)'
                : isInbound
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(59, 130, 246, 0.15)',
              color: isMissed ? '#EF4444' : isInbound ? '#10B981' : '#3B82F6',
            }}
          >
            <Phone size={28} style={{ transform: isInbound ? 'rotate(135deg)' : 'none' }} />
          </div>
        )}
        <div className={`miniapp-detail-name ${isMissed ? 'miniapp-text-missed' : ''}`}>
          {displayName}
        </div>
        <div className="miniapp-detail-sub">{formatPhone(phone)}</div>

        {/* Action buttons */}
        <div className="miniapp-detail-actions">
          {phone && (
            <button className="miniapp-detail-action-btn" onClick={handlePhoneSheet}>
              <div className="miniapp-detail-action-icon">
                <Phone size={20} />
              </div>
              <span className="miniapp-detail-action-label">{t('actions.call')}</span>
            </button>
          )}
          {phone && (
            <button className="miniapp-detail-action-btn" onClick={handleMessage}>
              <div className="miniapp-detail-action-icon">
                <MessageCircle size={20} />
              </div>
              <span className="miniapp-detail-action-label">{t('actions.message')}</span>
            </button>
          )}
          {hasContact && (
            <button className="miniapp-detail-action-btn" onClick={handleContactNav}>
              <div className="miniapp-detail-action-icon">
                <User size={20} />
              </div>
              <span className="miniapp-detail-action-label">{t('detail.contact')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Unknown caller — quick create actions */}
      {!hasContact && phone && (
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              webApp?.HapticFeedback.impactOccurred('medium');
              router.push(`/miniapp/contacts/new?phone=${encodeURIComponent(phone)}`);
            }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 0', border: '1px solid var(--ma-separator)', borderRadius: 8,
              background: 'transparent', color: 'var(--ma-text)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <UserPlus size={14} />
            {"Contact" /* TODO: i18n */}
          </button>
          <button
            onClick={() => {
              webApp?.HapticFeedback.impactOccurred('medium');
              router.push(`/miniapp/pipeline?new_lead=1&phone=${encodeURIComponent(phone)}`);
            }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 0', border: '1px solid var(--ma-separator)', borderRadius: 8,
              background: 'transparent', color: 'var(--ma-text)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <TrendingUp size={14} />
            {"Lead" /* TODO: i18n */}
          </button>
        </div>
      )}

      {/* Call list — each call in the group */}
      <div className="miniapp-section">
        <div className="miniapp-section-header">
          {allCalls.length > 1
            ? `${t('calls.history')} (${allCalls.length})`
            : t('calls.callInfo')
          }
        </div>
        {allCalls.map((c) => (
          <CallRow key={c.id} call={c} webApp={webApp} t={t} tFields={tFields} />
        ))}
      </div>

      {/* Bottom sheet for call options */}
      <CallBottomSheet
        phone={phone}
        open={showCallSheet}
        onClose={() => setShowCallSheet(false)}
        webApp={webApp}
        router={router}
        t={t}
      />
    </div>
  );
}
