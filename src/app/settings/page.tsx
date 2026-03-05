// This file is a redirect shim.
// The real settings hub lives at src/app/(company)/settings/page.tsx
// and is served at the /settings URL inside the company layout group.
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
