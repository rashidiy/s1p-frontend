'use client';

import { Button } from 'antd';
import { ErrorCharacter } from '@/components/illustrations/ErrorCharacter';

export default function CompanyPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px' }}>
      <ErrorCharacter width={160} height={160} />
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '20px', color: '#1f2937' }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', textAlign: 'center', maxWidth: '400px' }}>
        There was an error loading this page. Please try again.
      </p>
      <Button
        type="primary"
        onClick={reset}
        style={{ marginTop: '20px' }}
      >
        Try again
      </Button>
    </div>
  );
}
