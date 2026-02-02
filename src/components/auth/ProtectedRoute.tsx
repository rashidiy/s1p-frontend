'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOwner?: boolean;
  requireRole?: UserRole;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireOwner = false,
  requireRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isOwner, userType, hasPermission, initAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Skip protection for public routes
    if (!requireAuth) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      if (requireOwner || pathname.startsWith('/owner')) {
        router.push('/owner/login');
      } else {
        router.push('/login');
      }
      return;
    }

    // Check owner requirement
    if (requireOwner && !isOwner) {
      router.push('/dashboard');
      return;
    }

    // Check if company user trying to access owner routes
    if (pathname.startsWith('/owner') && !isOwner) {
      router.push('/dashboard');
      return;
    }

    // Check if owner trying to access company routes
    if (isOwner && !pathname.startsWith('/owner') && pathname !== '/') {
      router.push('/owner/dashboard');
      return;
    }

    // Check role-based permissions for company users
    if (requireRole && !hasPermission(requireRole)) {
      router.push('/dashboard');
      return;
    }
  }, [
    isAuthenticated,
    isOwner,
    userType,
    pathname,
    requireAuth,
    requireOwner,
    requireRole,
    hasPermission,
    router,
  ]);

  // Show loading state while checking auth
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
