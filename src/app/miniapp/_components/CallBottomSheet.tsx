'use client';

import type { ReactNode } from 'react';
import { Phone, Headphones, ArrowLeftRight } from 'lucide-react';
import { BottomSheet, BottomSheetOption } from './BottomSheet';
import type { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import type { useTranslations } from 'next-intl';

interface CallBottomSheetProps {
  phone: string;
  open: boolean;
  onClose: () => void;
  webApp: ReturnType<typeof useTelegramWebApp>['webApp'];
  router: { push: (url: string) => void };
  t: ReturnType<typeof useTranslations>;
}

function ColoredIcon({ children, bg, color }: { children: ReactNode; bg: string; color: string }) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

export function CallBottomSheet({
  phone,
  open,
  onClose,
  webApp,
  router,
  t,
}: CallBottomSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <BottomSheetOption
        icon={<ColoredIcon bg="rgba(16, 185, 129, 0.12)" color="#10B981"><Phone size={20} /></ColoredIcon>}
        label={t('calls.phoneCall')}
        onClick={() => {
          webApp?.HapticFeedback.impactOccurred('medium');
          onClose();
          try { webApp?.openLink(`tel:${phone}`); } catch { window.location.href = `tel:${phone}`; }
        }}
      />
      <BottomSheetOption
        icon={<ColoredIcon bg="rgba(59, 130, 246, 0.12)" color="#3B82F6"><Headphones size={20} /></ColoredIcon>}
        label={t('calls.sipCall')}
        onClick={() => {
          webApp?.HapticFeedback.impactOccurred('medium');
          onClose();
          router.push(`/miniapp/calls?number=${encodeURIComponent(phone)}&mode=sip`);
        }}
      />
      <BottomSheetOption
        icon={<ColoredIcon bg="rgba(139, 92, 246, 0.12)" color="#8B5CF6"><ArrowLeftRight size={20} /></ColoredIcon>}
        label={t('calls.externalCall')}
        onClick={() => {
          webApp?.HapticFeedback.impactOccurred('medium');
          onClose();
          router.push(`/miniapp/calls?number=${encodeURIComponent(phone)}&mode=external`);
        }}
      />
    </BottomSheet>
  );
}
