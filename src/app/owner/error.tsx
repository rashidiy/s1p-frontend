'use client';

import { Button } from 'antd';
import { ErrorCharacter } from '@/components/illustrations/ErrorCharacter';

export default function OwnerPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="crm-card px-10 py-12 text-center max-w-sm w-full page-fade-in">
        <ErrorCharacter width={140} height={140} className="mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 mt-5">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
          There was an error loading this page. Please try again.
        </p>
        <Button
          type="primary"
          onClick={reset}
          className="mt-5"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
