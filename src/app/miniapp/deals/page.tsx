'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect /miniapp/deals to /miniapp/pipeline (deals tab).
 * Kept as a route for backward compatibility.
 */
export default function DealsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/miniapp/pipeline');
  }, [router]);
  return null;
}
