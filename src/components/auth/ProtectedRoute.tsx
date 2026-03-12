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
  const pathname = usePathname() ?? '/';
  const { isAuthenticated, isInitializing, isOwner, userType, hasPermission, hasPermissionString, initAuth, mustChangePassword } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isInitializing) return; // Wait for session check to complete
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
    isInitializing,
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

  if (isInitializing || (requireAuth && !isAuthenticated)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="text-center app-loading-screen">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] mb-4 shadow-lg shadow-indigo-200/50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="text-lg font-bold text-gray-800 tracking-tight">S1P</div>
          <div className="mt-3">
            <Spin size="small" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
