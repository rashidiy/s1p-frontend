'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect /miniapp/leads to /miniapp/pipeline (leads tab).
 * Kept as a route for backward compatibility.
 */
export default function LeadsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/miniapp/pipeline');
  }, [router]);
  return null;
}
