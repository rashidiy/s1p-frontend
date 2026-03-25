'use client';

import { useEffect, useState, useRef } from 'react';
import { Phone, AlertTriangle, TrendingUp, BarChart3, ChevronRight, User, Plus, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTranslations } from 'next-intl';
import { UserRole } from '@/types/api';
import type { OperatorDashboard, AdminDashboard } from '@/types/api';
import { formatTime, formatPhone, getInitials, getAvatarColor, groupConsecutive } from './_utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/** Animated number counter — counts up from 0 to target */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 600;
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);

  return <>{display}</>;
}

/** Time-based greeting key */
function getGreetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return 'dashboard.goodMorning';
  if (h < 18) return 'dashboard.goodAfternoon';
  return 'dashboard.goodEvening';
}

type Period = 'today' | 'this_week' | 'this_month';

/** Dashboard recent_calls have different fields than CallWithDetails */
interface DashboardCall {
  id: number;
  phone?: string;
  direction?: string;
  state?: string;
  duration?: number;
  started_at?: string;
  contact_name?: string;
}

/** Dashboard missed_calls_to_return */
interface MissedCall {
  id: number;
  phone?: string;
  contact_name?: string;
  contact_id?: string;
  created_at?: string;
}

function SkeletonDashboard() {
  return (
    <div>
      <div className="miniapp-skeleton-text" style={{ width: 140, height: 28, marginBottom: 16, borderRadius: 8 }} />
      <div className="miniapp-skeleton-stats">
        {[1,2,3,4].map(i => <div key={i} className="miniapp-skeleton-stat" />)}
      </div>
      <div className="miniapp-section" style={{ padding: 0 }}>
        {[1,2,3].map(i => (
          <div key={i} className="miniapp-skeleton-list-item">
            <div className="miniapp-skeleton-circle" />
            <div className="miniapp-skeleton-lines">
              <div className="miniapp-skeleton-text" style={{ width: '70%' }} />
              <div className="miniapp-skeleton-text" style={{ width: '40%', height: 11 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MiniAppDashboard() {
  const [data, setData] = useState<OperatorDashboard | null>(null);
  const [teamData, setTeamData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<Period>('today');
  const { user } = useAuthStore();
  const { webApp } = useTelegramWebApp();
  const router = useRouter();
  const t = useTranslations('miniapp');

  const isManagerOrAdmin = user?.role === UserRole.COMPANY_ADMIN ||
    user?.role === UserRole.COMPANY_MANAGER ||
    user?.role === ('company_owner' as UserRole);

  useEffect(() => {
    async function load() {
      try {
        const [dashboard, team] = await Promise.all([
          apiClient.getMyDashboard(),
          isManagerOrAdmin ? apiClient.getAdminDashboard().catch(() => null) : Promise.resolve(null),
        ]);
        setData(dashboard);
        if (team) setTeamData(team);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isManagerOrAdmin]);

  if (loading) return <SkeletonDashboard />;

  if (error) {
    return (
      <div className="miniapp-empty">
        <div className="miniapp-empty-icon">!</div>
        <div className="miniapp-empty-title">{t('error.loadFailed')}</div>
      </div>
    );
  }

  const periodData = data?.[period];
  const stats = [
    {
      icon: <Phone size={18} />,
      bg: 'rgba(67, 56, 202, 0.1)',
      color: '#4338CA',
      value: periodData?.calls?.total_calls ?? 0,
      label: t('dashboard.calls'),
      tap: '/miniapp/history',
    },
    {
      icon: <AlertTriangle size={18} />,
      bg: 'rgba(239, 68, 68, 0.1)',
      color: '#EF4444',
      value: periodData?.calls?.missed_calls ?? 0,
      label: t('dashboard.missed'),
      tap: '/miniapp/history',
    },
    {
      icon: <TrendingUp size={18} />,
      bg: 'rgba(16, 185, 129, 0.1)',
      color: '#10B981',
      value: data?.pending_leads ?? 0,
      label: t('dashboard.pendingLeads'),
      tap: '/miniapp/pipeline',
    },
    {
      icon: <BarChart3 size={18} />,
      bg: 'rgba(59, 130, 246, 0.1)',
      color: '#2563EB',
      value: data?.active_deals ?? 0,
      label: t('dashboard.activeDeals'),
      tap: '/miniapp/pipeline?tab=deals',
    },
  ];

  const greetingKey = getGreetingKey();
  const greeting = user?.first_name
    ? (t.has(greetingKey) ? t(greetingKey, { name: user.first_name }) : t('dashboard.greeting', { name: user.first_name }))
    : '';
  const recentCalls = (data?.recent_calls ?? []) as unknown as DashboardCall[];
  const missedCalls = ((data as Record<string, unknown>)?.missed_calls_to_return ?? []) as unknown as MissedCall[];

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: t('dashboard.today') },
    { key: 'this_week', label: t('dashboard.thisWeek') },
    { key: 'this_month', label: t('dashboard.thisMonth') },
  ];

  const avatarUrl = user?.avatar_url
    ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE_URL}${user.avatar_url}`)
    : undefined;

  return (
    <div className="miniapp-page-enter">
      {/* Header bar: greeting + avatar */}
      <div className="miniapp-header-bar">
        <div>
          <div className="miniapp-page-title" style={{ padding: '8px 4px 0', marginBottom: 0 }}>
            {greeting}
          </div>
          {(() => {
            try {
              const co = sessionStorage.getItem('miniapp_company');
              const name = co ? JSON.parse(co).name : null;
              if (name) return <div style={{ fontSize: 13, color: 'var(--ma-hint)', padding: '0 4px' }}>{name}</div>;
            } catch {}
            return null;
          })()}
        </div>
        <button
          className="miniapp-avatar-btn"
          onClick={() => {
            webApp?.HapticFeedback.impactOccurred('light');
            router.push('/miniapp/profile');
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="miniapp-avatar-img" />
          ) : (
            <div
              className="miniapp-avatar-placeholder"
              style={{ background: getAvatarColor(user?.first_name || 'U') }}
            >
              {getInitials(user?.first_name, user?.last_name)}
            </div>
          )}
        </button>
      </div>

      {/* Period selector */}
      <div className="miniapp-period-selector" style={{ marginTop: 12 }}>
        {periods.map((p) => (
          <button
            key={p.key}
            className={`miniapp-period-btn ${period === p.key ? 'active' : ''}`}
            onClick={() => {
              webApp?.HapticFeedback.selectionChanged();
              setPeriod(p.key);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="miniapp-stats miniapp-stagger">
        {stats.map((s, i) => (
          <div
            key={i}
            className="miniapp-stat-card"
            style={{ borderLeft: `3px solid ${s.color}`, position: 'relative' }}
            onClick={() => {
              webApp?.HapticFeedback.impactOccurred('light');
              router.push(s.tap);
            }}
          >
            <div className="miniapp-stat-top">
              <div className="miniapp-stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className="miniapp-stat-value" style={{ fontSize: 32, fontWeight: 700 }}><AnimatedNumber value={s.value} /></div>
            </div>
            <div className="miniapp-stat-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {s.label}
              <ChevronRight size={12} style={{ color: 'var(--ma-hint)', opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Needs Attention section */}
      {missedCalls.length > 0 && (() => {
        // Deduplicate by phone: group all missed calls by phone, keep latest, add count
        const phoneMap = new Map<string, { call: MissedCall; count: number }>();
        for (const call of missedCalls) {
          const phone = call.phone || '';
          const existing = phoneMap.get(phone);
          if (existing) {
            existing.count++;
            // Keep the latest call (compare created_at)
            if (call.created_at && existing.call.created_at && call.created_at > existing.call.created_at) {
              existing.call = call;
            }
          } else {
            phoneMap.set(phone, { call, count: 1 });
          }
        }
        const dedupedMissed = Array.from(phoneMap.values());

        return (
          <div className="miniapp-section miniapp-attention-section">
            <div className="miniapp-section-header">{t('needsAttention')}</div>
            <div className="miniapp-list">
              {dedupedMissed.slice(0, 5).map(({ call, count }, i) => {
                const phone = call.phone || '';
                const displayName = call.contact_name || formatPhone(phone) || '—';
                const quickActionStyle: React.CSSProperties = {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 28,
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                };
                return (
                  <div
                    key={i}
                    className="miniapp-attention-item"
                    onClick={() => {
                      webApp?.HapticFeedback.impactOccurred('medium');
                      try {
                        sessionStorage.setItem(`call_${call.id}`, JSON.stringify({
                          id: call.id,
                          phone_1: call.phone,
                          direction: 'inbound',
                          state: 'NOANSWER',
                          created_at: call.created_at,
                          contact_name: call.contact_name,
                        }));
                      } catch {}
                      router.push(`/miniapp/calls/${call.id}`);
                    }}
                  >
                    <div className="miniapp-call-icon miniapp-call-icon-missed">
                      <Phone size={16} />
                    </div>
                    <div className="miniapp-list-item-content">
                      <div className="miniapp-list-item-title miniapp-text-missed">
                        {displayName}{count > 1 ? ` (${count})` : ''}
                      </div>
                      {call.contact_name && phone && (
                        <div className="miniapp-list-item-sub">{formatPhone(phone)}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
                      {/* Call Back button */}
                      <button
                        style={{ ...quickActionStyle, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          webApp?.HapticFeedback.impactOccurred('medium');
                          router.push(`/miniapp/calls?dial=${encodeURIComponent(phone)}&mode=sip`);
                        }}
                        aria-label="Call back" /* TODO: i18n */
                      >
                        <Phone size={14} />
                      </button>
                      {/* Add contact button — only if no contact_name */}
                      {!call.contact_name && phone && (
                        <button
                          style={{ ...quickActionStyle, background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            webApp?.HapticFeedback.impactOccurred('light');
                            router.push(`/miniapp/contacts/new?phone=${encodeURIComponent(phone)}`);
                          }}
                          aria-label="Add contact" /* TODO: i18n */
                        >
                          <Plus size={14} />
                        </button>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--ma-hint)', whiteSpace: 'nowrap', minWidth: 40, textAlign: 'right' }}>
                        {call.created_at ? formatTime(call.created_at) : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Recent calls */}
      {recentCalls.length > 0 && (() => {
        const recentGroups = groupConsecutive(recentCalls, (call) => {
          const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL';
          return `${call.phone || '—'}:${isMissed ? 'missed' : 'answered'}`;
        });

        return (
          <div className="miniapp-section">
            <div className="miniapp-section-header">{t('dashboard.recentCalls')}</div>
            <div className="miniapp-list">
              {recentGroups.slice(0, 4).map((group, i) => {
                const call = group.items[0]; // first = most recent
                const phone = call.phone || '—';
                const isMissed = call.state === 'NOANSWER' || call.state === 'CANCEL';
                const isInbound = call.direction === 'inbound';
                const displayName = call.contact_name || formatPhone(phone);
                return (
                  <div key={i} className="miniapp-list-item" onClick={() => {
                    webApp?.HapticFeedback.impactOccurred('light');
                    try {
                      sessionStorage.setItem(`call_${call.id}`, JSON.stringify({
                        id: call.id,
                        phone_2: call.phone,
                        direction: call.direction,
                        state: call.state,
                        duration: call.duration,
                        created_at: call.started_at,
                        contact_name: call.contact_name,
                      }));
                    } catch {}
                    router.push(`/miniapp/calls/${call.id}`);
                  }}>
                    <div className={`miniapp-call-icon ${isMissed ? 'miniapp-call-icon-missed' : isInbound ? 'miniapp-call-icon-inbound' : 'miniapp-call-icon-outbound'}`} style={{ position: 'relative' }}>
                      <Phone size={16} style={{ transform: isInbound ? 'rotate(135deg)' : 'rotate(-45deg)' }} />
                    </div>
                    <div className="miniapp-list-item-content">
                      <div className={`miniapp-list-item-title ${isMissed ? 'miniapp-text-missed' : ''}`}>
                        {displayName}{group.count > 1 ? ` (${group.count})` : ''}
                      </div>
                      {call.contact_name && (
                        <div className="miniapp-list-item-sub">{formatPhone(phone)}</div>
                      )}
                    </div>
                    <div className="miniapp-list-item-right">
                      {call.started_at ? formatTime(call.started_at) : ''}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="miniapp-section-footer" onClick={() => router.push('/miniapp/history')}>
              {t('dashboard.viewAll')} <ChevronRight size={14} style={{ marginLeft: 4 }} />
            </div>
          </div>
        );
      })()}

      {/* Team Today — manager/admin only */}
      {isManagerOrAdmin && teamData && (
        <div className="miniapp-section">
          <div className="miniapp-section-header">{t('teamToday')}</div>
          <div className="miniapp-list">
            {(teamData as Record<string, unknown>).operator_stats
              ? (() => {
                  const operators = ((teamData as Record<string, unknown>).operator_stats as Array<Record<string, unknown>>).slice(0, 6);
                  const maxCalls = Math.max(...operators.map(op => Number(op.total_calls ?? 0)), 1);
                  return operators.map((op, i) => {
                    const calls = Number(op.total_calls ?? 0);
                    const pct = Math.round((calls / maxCalls) * 100);
                    return (
                      <div key={i} className="miniapp-team-row">
                        <div
                          className="miniapp-list-item-icon"
                          style={{ background: getAvatarColor(String(op.operator_name || '')), width: 32, height: 32, fontSize: 13 }}
                        >
                          {getInitials(String(op.operator_name || '').split(' ')[0], String(op.operator_name || '').split(' ')[1])}
                        </div>
                        <div className="miniapp-list-item-content" style={{ minWidth: 0 }}>
                          <div className="miniapp-list-item-title">{String(op.operator_name || t('unassigned'))}</div>
                          {/* Mini progress bar */}
                          <div style={{ height: 4, borderRadius: 2, background: 'var(--ma-border)', marginTop: 4, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${pct}%`,
                              borderRadius: 2,
                              background: 'var(--ma-accent)',
                              transition: 'width 0.6s ease-out',
                            }} />
                          </div>
                        </div>
                        <div className="miniapp-list-item-right">
                          <Phone size={12} style={{ marginRight: 4 }} />
                          {String(calls)}
                        </div>
                      </div>
                    );
                  });
                })()
              : (
                <div className="miniapp-team-row">
                  <User size={16} style={{ color: 'var(--ma-hint)', marginRight: 8 }} />
                  <div className="miniapp-list-item-content">
                    <div className="miniapp-list-item-sub">{t('dashboard.noActivity')}</div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}

      {!recentCalls.length && missedCalls.length === 0 && (
        <div className="miniapp-empty">
          <div className="miniapp-empty-icon" style={{ color: '#10B981' }}>
            <CheckCircle size={32} />
          </div>
          <div className="miniapp-empty-title" style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>
            {"All caught up!"  /* TODO: i18n */}
          </div>
          <div className="miniapp-empty-sub" style={{ marginTop: 4 }}>
            {"No missed calls or pending items" /* TODO: i18n */}
          </div>
        </div>
      )}
    </div>
  );
}
