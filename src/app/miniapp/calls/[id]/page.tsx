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
// Audio Player — Telegram voice message style with waveform bars
// ============================================================================

function generateWaveformBars(callId: number, count: number = 45): number[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = callId * 31 + i * 17;
    return 20 + (((seed * 2654435761) >>> 0) % 80); // 20-100% height
  });
}

function AudioPlayer({
  callId,
  webApp,
}: {
  callId: number;
  webApp: ReturnType<typeof useTelegramWebApp>['webApp'];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loadError, setLoadError] = useState(false);

  const bars = useRef(generateWaveformBars(callId)).current;

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getCallRecording(String(callId))
      .then((url) => { if (!cancelled) setAudioUrl(url); })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, [callId]);

  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [audioUrl]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    webApp?.HapticFeedback.selectionChanged();
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
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
    const bar = waveformRef.current;
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

  if (loadError) return null;
  if (!audioUrl) return <div style={{ padding: '8px 0', textAlign: 'center' }}><Spin size="small" /></div>;

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div style={{ padding: '14px 16px' }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Play/Pause — filled circle with pulse while playing */}
        <button
          onClick={togglePlay}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: 'var(--ma-accent)', color: 'var(--ma-btn-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
            transition: 'transform 0.1s',
            animation: playing ? 'waveform-pulse 2s ease-in-out infinite' : 'none',
          }}
        >
          {playing ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
        </button>

        {/* Waveform bars + time */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            ref={waveformRef}
            onClick={handleSeek}
            onTouchMove={handleSeek}
            style={{ display: 'flex', alignItems: 'center', gap: 2, height: 32, cursor: 'pointer', touchAction: 'none' }}
          >
            {bars.map((height, i) => (
              <div
                key={i}
                style={{
                  width: 3, height: `${height}%`, borderRadius: 1.5, flexShrink: 0,
                  background: (i / bars.length) < progress ? 'var(--ma-accent)' : 'var(--ma-separator)',
                  transition: 'background 0.15s ease',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--ma-hint)', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(currentTime)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ma-hint)', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(duration)}
            </span>
          </div>
        </div>

        {/* Speed pill */}
        <button
          onClick={cycleSpeed}
          style={{
            padding: '3px 10px', border: '1px solid var(--ma-separator)', borderRadius: 100,
            background: speed !== 1 ? 'var(--ma-accent)' : 'transparent',
            color: speed !== 1 ? 'var(--ma-btn-text)' : 'var(--ma-hint)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent', flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          {speed}x
        </button>
      </div>

      <style>{`
        @keyframes waveform-pulse {
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ma-accent) 40%, transparent); }
          70% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--ma-accent) 0%, transparent); }
          100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ma-accent) 0%, transparent); }
        }
      `}</style>
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

  return (
    <div className="miniapp-call-detail-row">
      <div className="miniapp-call-detail-row-header">
        <div className="miniapp-call-detail-row-icon" style={{ color: iconColor }}>
          <IconComponent size={16} />
        </div>
        <div className="miniapp-call-detail-row-info">
          <div className="miniapp-call-detail-row-top">
            <span className="miniapp-call-detail-row-date">
              {formatDate(call.created_at)} {formatTime(call.created_at)}
            </span>
            <span className={`miniapp-call-detail-row-state ${stateClass}`}>
              {stateLabel}
            </span>
          </div>
          <div className="miniapp-call-detail-row-bottom">
            {dur && <span><Clock size={12} style={{ marginRight: 3, verticalAlign: -1 }} />{dur}</span>}
            {call.operator_name && <span>{call.operator_name}</span>}
            {!dur && !call.operator_name && isMissed && (
              <span style={{ color: '#EF4444' }}>{t('calls.missed')}</span>
            )}
          </div>
        </div>
      </div>
      {call.has_recording && (
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

  // Subtle gradient tint based on call type
  const headerGradient = isMissed
    ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, transparent 100%)'
    : isInbound
      ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.06) 0%, transparent 100%)'
      : 'linear-gradient(180deg, rgba(59, 130, 246, 0.06) 0%, transparent 100%)';

  return (
    <div className="miniapp-detail-enter">
      {/* Header with avatar */}
      <div className="miniapp-detail-header" style={{ background: headerGradient }}>
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
        <div className="miniapp-section" style={{ marginBottom: 8 }}>
          <div style={{ padding: '14px 16px', display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                webApp?.HapticFeedback.impactOccurred('medium');
                router.push(`/miniapp/contacts/new?phone=${encodeURIComponent(phone)}`);
              }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 0', border: '1.5px solid var(--ma-accent)', borderRadius: 10,
                background: 'transparent', color: 'var(--ma-accent)', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <UserPlus size={16} />
              {"Contact" /* TODO: i18n */}
            </button>
            <button
              onClick={() => {
                webApp?.HapticFeedback.impactOccurred('medium');
                router.push(`/miniapp/pipeline?new_lead=1&phone=${encodeURIComponent(phone)}`);
              }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 0', border: '1.5px solid var(--ma-accent)', borderRadius: 10,
                background: 'transparent', color: 'var(--ma-accent)', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <TrendingUp size={16} />
              {"Lead" /* TODO: i18n */}
            </button>
          </div>
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
