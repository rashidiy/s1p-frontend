'use client';

import { Button } from 'antd';
import { ErrorCharacter } from '@/components/illustrations/ErrorCharacter';
import { useTranslations } from 'next-intl';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <div className="flex items-center justify-center min-h-screen p-6" style={{ background: 'var(--surface-secondary)' }}>
      <div className="crm-card px-12 py-14 text-center max-w-md w-full page-fade-in">
        <ErrorCharacter width={160} height={160} className="mx-auto" />
        <h1 className="text-2xl font-bold mt-6" style={{ color: 'var(--text-primary)' }}>
          {t('somethingWentWrong')}
        </h1>
        <p className="text-sm mt-2 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {t('unexpectedError')}
        </p>
        <Button
          type="primary"
          size="large"
          onClick={reset}
          className="mt-6"
        >
          {t('tryAgain')}
        </Button>
      </div>
    </div>
  );
}
