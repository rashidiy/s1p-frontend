import Link from 'next/link';
import { SearchCharacter } from '@/components/illustrations/SearchCharacter';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', background: '#F8F9FA' }}>
      <SearchCharacter width={200} height={200} />
      <h1 style={{ fontSize: '72px', fontWeight: 800, color: '#e5e7eb', marginTop: '16px', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', color: '#1f2937' }}>
        Page not found
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', textAlign: 'center', maxWidth: '400px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 24px',
          borderRadius: '8px',
          background: '#E84040',
          color: 'white',
          fontWeight: 600,
          fontSize: '14px',
          textDecoration: 'none',
        }}
      >
        Go home
      </Link>
    </div>
  );
}
