'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOwner?: boolean;
  requireRole?: UserRole;
  requiredPermission?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireOwner = false,
  requireRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isOwner, userType, hasPermission, hasPermissionString, initAuth, mustChangePassword } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!requireAuth) return;

    if (!isAuthenticated) {
      if (requireOwner || pathname.startsWith('/owner')) {
        router.push('/owner/login');
      } else {
        router.push('/login');
      }
      return;
    }

    if (mustChangePassword) {
      if (isOwner) {
        router.push('/owner/set-password');
      } else {
        router.push('/set-password');
      }
      return;
    }

    if (requireOwner && !isOwner) {
      router.push('/dashboard');
      return;
    }

    if (pathname.startsWith('/owner') && !isOwner) {
      router.push('/dashboard');
      return;
    }

    if (isOwner && !pathname.startsWith('/owner') && pathname !== '/') {
      router.push('/owner/dashboard');
      return;
    }

    if (requireRole && !hasPermission(requireRole)) {
      router.push('/dashboard');
      return;
    }

    if (requiredPermission && !hasPermissionString(requiredPermission)) {
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
    requiredPermission,
    hasPermission,
    hasPermissionString,
    mustChangePassword,
    router,
  ]);

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f2ff]">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
