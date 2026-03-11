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
    <div className="flex items-center justify-center min-h-screen p-6 bg-[#F8F9FA]">
      <div className="crm-card px-12 py-14 text-center max-w-md w-full page-fade-in">
        <ErrorCharacter width={160} height={160} className="mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900 mt-6">
          {t('somethingWentWrong')}
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
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
