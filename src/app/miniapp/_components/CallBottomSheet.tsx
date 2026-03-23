'use client';

import {
  PhoneFilled,
  CustomerServiceOutlined,
  SwapOutlined,
} from '@ant-design/icons';
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
        icon={<PhoneFilled />}
        label={t('calls.phoneCall')}
        onClick={() => {
          onClose();
          webApp?.HapticFeedback.impactOccurred('medium');
          try {
            webApp?.openLink(`tel:${phone}`);
          } catch {
            window.location.href = `tel:${phone}`;
          }
        }}
      />
      <BottomSheetOption
        icon={<CustomerServiceOutlined />}
        label={t('calls.sipCall')}
        onClick={() => {
          onClose();
          webApp?.HapticFeedback.impactOccurred('medium');
          router.push(`/miniapp/calls?number=${encodeURIComponent(phone)}&mode=sip`);
        }}
      />
      <BottomSheetOption
        icon={<SwapOutlined />}
        label={t('calls.externalCall')}
        onClick={() => {
          onClose();
          webApp?.HapticFeedback.impactOccurred('medium');
          router.push(`/miniapp/calls?number=${encodeURIComponent(phone)}&mode=external`);
        }}
      />
    </BottomSheet>
  );
}
