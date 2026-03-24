'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, MessageCircle, User, Clock, Play, Pause, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { Spin } from 'antd';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { CallWithDetails } from '@/types/api';
import { formatDuration, formatDate, formatTime, formatPhone, getAvatarColor, getInitials } from '../../_utils';
import { CallBottomSheet } from '../../_components/CallBottomSheet';

// ============================================================================
// Audio Player (compact — fits inside each call row)
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
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loadError, setLoadError] = useState(false);

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

  if (loadError) return null;
  if (!audioUrl) return <div style={{ padding: '8px 0', textAlign: 'center' }}><Spin size="small" /></div>;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="miniapp-audio-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="miniapp-audio-controls">
        <button className="miniapp-audio-play" onClick={togglePlay}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div className="miniapp-audio-progress" ref={progressRef} onClick={handleSeek} onTouchMove={handleSeek}>
          <div className="miniapp-audio-progress-fill" style={{ width: `${progress}%` }}>
            <div className="miniapp-audio-progress-handle" />
          </div>
        </div>
        <span className="miniapp-audio-time">{fmt(currentTime)} / {fmt(duration)}</span>
        <button className="miniapp-audio-speed" onClick={cycleSpeed}>{speed}x</button>
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

  const dur = isAnswered && call.duration ? formatDuration(call.duration) : null;

  return (
    <div className="miniapp-call-detail-row">
      <div className="miniapp-call-detail-row-icon" style={{ color: iconColor }}>
        <IconComponent size={18} />
      </div>
      <div className="miniapp-call-detail-row-info">
        <div className="miniapp-call-detail-row-top">
          <span className="miniapp-call-detail-row-date">
            {formatDate(call.created_at)} {formatTime(call.created_at)}
          </span>
          <span className={`miniapp-call-detail-row-state ${isMissed ? 'miniapp-text-missed' : ''}`}>
            {stateLabel}
          </span>
        </div>
        {(dur || call.operator_name) && (
          <div className="miniapp-call-detail-row-bottom">
            {dur && <span><Clock size={12} style={{ marginRight: 3, verticalAlign: -1 }} />{dur}</span>}
            {call.operator_name && <span style={{ marginLeft: dur ? 12 : 0 }}>{call.operator_name}</span>}
          </div>
        )}
        {call.has_recording && (
          <AudioPlayer callId={call.id} webApp={webApp} />
        )}
      </div>
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
