'use client';

import { Button } from 'antd';
import { ErrorCharacter } from '@/components/illustrations/ErrorCharacter';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', background: '#F8F9FA' }}>
      <ErrorCharacter width={180} height={180} />
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginTop: '24px', color: '#1f2937' }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', textAlign: 'center', maxWidth: '400px' }}>
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <Button
        type="primary"
        size="large"
        onClick={reset}
        style={{ marginTop: '24px' }}
      >
        Try again
      </Button>
    </div>
  );
}
