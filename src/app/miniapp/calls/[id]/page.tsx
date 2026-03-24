'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, MessageCircle, User, ArrowLeftRight, Clock, Calendar, Play, Pause } from 'lucide-react';
import { Spin } from 'antd';
import { apiClient } from '@/lib/api';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import type { CallWithDetails } from '@/types/api';
import { formatDuration, formatDate, formatTime, getAvatarColor, getInitials } from '../../_utils';
import { CallBottomSheet } from '../../_components/CallBottomSheet';

function Skeleton() {
  return (
    <div>
      <div className="miniapp-detail-header">
        <div className="miniapp-skeleton-circle" style={{ width: 72, height: 72 }} />
        <div className="miniapp-skeleton-text" style={{ width: 160, height: 24, borderRadius: 8, marginTop: 8 }} />
        <div className="miniapp-skeleton-text" style={{ width: 120, height: 14, borderRadius: 6 }} />
      </div>
      <div className="miniapp-section">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="miniapp-info-row">
            <div className="miniapp-skeleton-text" style={{ width: '30%' }} />
            <div className="miniapp-skeleton-text" style={{ width: '45%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Audio Player
// ============================================================================

function AudioPlayer({
  callId,
  webApp,
  t,
}: {
  callId: number;
  webApp: ReturnType<typeof useTelegramWebApp>['webApp'];
  t: ReturnType<typeof useTranslations>;
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
      .then((url) => {
        if (!cancelled) setAudioUrl(url);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [callId]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onTimeUpdate() {
      setCurrentTime(audio!.currentTime);
    }
    function onLoadedMetadata() {
      setDuration(audio!.duration);
    }
    function onEnded() {
      setPlaying(false);
    }

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    webApp?.HapticFeedback.selectionChanged();
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
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

  function formatAudioTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  if (loadError) return null;
  if (!audioUrl) {
    return (
      <div className="miniapp-audio-player" style={{ textAlign: 'center' }}>
        <Spin size="small" />
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="miniapp-audio-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="miniapp-audio-controls">
        <button className="miniapp-audio-play" onClick={togglePlay}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <div
          className="miniapp-audio-progress"
          ref={progressRef}
          onClick={handleSeek}
          onTouchMove={handleSeek}
        >
          <div className="miniapp-audio-progress-fill" style={{ width: `${progress}%` }}>
            <div className="miniapp-audio-progress-handle" />
          </div>
        </div>
        <span className="miniapp-audio-time">
          {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
        </span>
        <button className="miniapp-audio-speed" onClick={cycleSpeed}>
          {speed}x
        </button>
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
  const [loading, setLoading] = useState(true);
  const [showCallSheet, setShowCallSheet] = useState(false);
  const { webApp } = useTelegramWebApp();
  const t = useTranslations('miniapp');
  const tFields = useTranslations('fields');

  const goBack = useCallback(() => {
    router.push('/miniapp/history');
  }, [router]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`call_${id}`);
      if (stored) {
        setCall(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
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

  if (loading) return <Skeleton />;

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
  const displayName = call.contact_name || phone || '\u2014';
  const hasContact = !!call.contact_name && !!call.contact_id;

  const directionLabel = isInbound ? t('calls.inbound') : t('calls.outbound');
  const stateLabel = isMissed
    ? t('calls.missed')
    : call.state === 'ANSWER'
      ? t('calls.answered')
      : (call.state || '\u2014');

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
        <div className="miniapp-detail-sub">{phone}</div>
        <span
          className={`miniapp-badge ${isMissed ? 'miniapp-badge-red' : isInbound ? 'miniapp-badge-green' : 'miniapp-badge-blue'}`}
        >
          {directionLabel} · {stateLabel}
        </span>

        {/* Action buttons — 3 icons in a row */}
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

      {/* Call info */}
      <div className="miniapp-section">
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">
            <ArrowLeftRight size={15} style={{ marginRight: 6 }} />
            {tFields('direction') || 'Direction'}
          </span>
          <span className="miniapp-info-value">{directionLabel}</span>
        </div>
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">
            <Phone size={15} style={{ marginRight: 6 }} />
            {t('detail.status')}
          </span>
          <span className={`miniapp-info-value ${isMissed ? 'miniapp-text-missed' : ''}`}>
            {stateLabel}
          </span>
        </div>
        {!isMissed && call.duration != null && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">
              <Clock size={15} style={{ marginRight: 6 }} />
              {tFields('duration') || 'Duration'}
            </span>
            <span className="miniapp-info-value">{formatDuration(call.duration)}</span>
          </div>
        )}
        <div className="miniapp-info-row">
          <span className="miniapp-info-label">
            <Calendar size={15} style={{ marginRight: 6 }} />
            {t('detail.created')}
          </span>
          <span className="miniapp-info-value">
            {formatDate(call.created_at)} {formatTime(call.created_at)}
          </span>
        </div>
        {call.operator_name && (
          <div className="miniapp-info-row">
            <span className="miniapp-info-label">
              <User size={15} style={{ marginRight: 6 }} />
              {t('detail.operator')}
            </span>
            <span className="miniapp-info-value">{call.operator_name}</span>
          </div>
        )}
      </div>

      {/* Recording section */}
      {call.has_recording && (
        <div className="miniapp-section" style={{ marginTop: 8 }}>
          <div className="miniapp-section-header">{t('calls.recording')}</div>
          <AudioPlayer callId={call.id} webApp={webApp} t={t} />
        </div>
      )}

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
