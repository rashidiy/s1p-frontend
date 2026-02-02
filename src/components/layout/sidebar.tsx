'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Phone,
  Settings,
  LogOut,
  Building2,
  BarChart3,
  Users,
  TrendingUp,
  Briefcase,
  CheckSquare,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import { apiClient } from '@/lib/api';

// Owner navigation
const ownerNavigation = [
  { name: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Companies', href: '/owner/companies', icon: Building2 },
  { name: 'Settings', href: '/owner/settings', icon: Settings },
];

// Company user navigation (all users see these)
const baseCompanyNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: User },
  { name: 'Leads', href: '/leads', icon: TrendingUp },
  { name: 'Deals', href: '/deals', icon: Briefcase },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Calls', href: '/calls', icon: Phone },
];

// Additional navigation for managers and admins
const managerNavigation = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

// Additional navigation for admins only
const adminNavigation = [
  { name: 'Team', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userType, isOwner, isAdmin, isManager, hasPermission, logout } = useAuthStore();

  // Build navigation based on user type and role
  const getNavigation = () => {
    if (isOwner) {
      return ownerNavigation;
    }

    // Company users
    let nav = [...baseCompanyNavigation];

    // Add analytics for managers and admins
    if (isManager() || isAdmin()) {
      nav = [...nav, ...managerNavigation];
    }

    // Add admin-only sections
    if (isAdmin()) {
      nav = [...nav, ...adminNavigation];
    }

    return nav;
  };

  const navigation = getNavigation();

  const handleLogout = () => {
    apiClient.logout();
    logout();

    // Redirect to appropriate login page
    if (isOwner) {
      router.push('/owner/login');
    } else {
      router.push('/login');
    }
  };

  const getInitials = (firstName: string, lastName?: string | null) => {
    if (!lastName) return firstName.charAt(0).toUpperCase();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadge = () => {
    if (isOwner) return { label: 'OWNER', color: 'bg-purple-500' };

    switch (user?.role) {
      case UserRole.COMPANY_ADMIN:
        return { label: 'ADMIN', color: 'bg-blue-500' };
      case UserRole.COMPANY_MANAGER:
        return { label: 'MANAGER', color: 'bg-green-500' };
      case UserRole.COMPANY_OPERATOR:
        return { label: 'OPERATOR', color: 'bg-gray-500' };
      default:
        return { label: 'USER', color: 'bg-gray-400' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">SIPCRM</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <Badge
                className={`${roleBadge.color} text-white text-xs mt-1`}
                variant="secondary"
              >
                {roleBadge.label}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
