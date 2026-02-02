import { create } from 'zustand';
import type { UserRole } from '@/types/api';

export type UserType = 'owner' | 'company_user';

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  role?: UserRole;
  company_id?: string;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: AuthUser | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isCompanyUser: boolean;

  setUser: (user: AuthUser | null, userType: UserType | null) => void;
  logout: () => void;
  initAuth: () => void;

  // Role checks for company users
  isAdmin: () => boolean;
  isManager: () => boolean;
  isOperator: () => boolean;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const roleHierarchy: Record<UserRole, number> = {
  [UserRole.OWNER]: 4,
  [UserRole.COMPANY_ADMIN]: 3,
  [UserRole.COMPANY_MANAGER]: 2,
  [UserRole.COMPANY_OPERATOR]: 1,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userType: null,
  isAuthenticated: false,
  isOwner: false,
  isCompanyUser: false,

  setUser: (user, userType) =>
    set({
      user,
      userType,
      isAuthenticated: !!user,
      isOwner: userType === 'owner',
      isCompanyUser: userType === 'company_user',
    }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_type');
    }
    set({
      user: null,
      userType: null,
      isAuthenticated: false,
      isOwner: false,
      isCompanyUser: false,
    });
  },

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const userType = localStorage.getItem('user_type') as UserType | null;

      if (userStr && userType) {
        try {
          const user = JSON.parse(userStr);
          set({
            user,
            userType,
            isAuthenticated: true,
            isOwner: userType === 'owner',
            isCompanyUser: userType === 'company_user',
          });
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
        }
      }
    }
  },

  // Role-based permission checks
  isAdmin: () => {
    const { user } = get();
    return user?.role === UserRole.COMPANY_ADMIN;
  },

  isManager: () => {
    const { user } = get();
    return user?.role === UserRole.COMPANY_MANAGER;
  },

  isOperator: () => {
    const { user } = get();
    return user?.role === UserRole.COMPANY_OPERATOR;
  },

  hasPermission: (requiredRole: UserRole) => {
    const { user, userType } = get();

    // Owners have all permissions
    if (userType === 'owner') return true;

    // Company users need role check
    if (!user?.role) return false;

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  },
}));
