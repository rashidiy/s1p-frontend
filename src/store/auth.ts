import { create } from 'zustand';
import { UserRole } from '@/types/api';

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
  created_at?: string;
}

interface AuthState {
  user: AuthUser | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isCompanyUser: boolean;
  permissions: string[];
  mustChangePassword: boolean;

  setUser: (user: AuthUser | null, userType: UserType | null) => void;
  logout: () => void;
  initAuth: () => void;

  // Role checks for company users
  isAdmin: () => boolean;
  isManager: () => boolean;
  isOperator: () => boolean;
  hasPermission: (requiredRole: UserRole) => boolean;
  hasPermissionString: (perm: string) => boolean;
  setMustChangePassword: (val: boolean) => void;
}

const roleHierarchy: Record<UserRole, number> = {
  [UserRole.OWNER]: 4,
  [UserRole.COMPANY_ADMIN]: 3,
  [UserRole.COMPANY_MANAGER]: 2,
  [UserRole.COMPANY_OPERATOR]: 1,
};

function parseJwtPermissions(token: string): { permissions: string[]; role?: string } {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      permissions: payload.permissions || [],
      role: payload.role,
    };
  } catch {
    return { permissions: [] };
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userType: null,
  isAuthenticated: false,
  isOwner: false,
  isCompanyUser: false,
  permissions: [],
  mustChangePassword: false,

  setUser: (user, userType) => {
    let permissions: string[] = [];
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        const parsed = parseJwtPermissions(token);
        permissions = parsed.permissions;
      }
    }
    set({
      user,
      userType,
      isAuthenticated: !!user,
      isOwner: userType === 'owner',
      isCompanyUser: userType === 'company_user',
      permissions,
      mustChangePassword: false,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_type');
      localStorage.removeItem('temporary_token');
    }
    set({
      user: null,
      userType: null,
      isAuthenticated: false,
      isOwner: false,
      isCompanyUser: false,
      permissions: [],
      mustChangePassword: false,
    });
  },

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const userType = localStorage.getItem('user_type') as UserType | null;
      const token = localStorage.getItem('access_token');

      if (userStr && userType) {
        try {
          const user = JSON.parse(userStr);
          let permissions: string[] = [];
          if (token) {
            const parsed = parseJwtPermissions(token);
            permissions = parsed.permissions;
          }
          set({
            user,
            userType,
            isAuthenticated: true,
            isOwner: userType === 'owner',
            isCompanyUser: userType === 'company_user',
            permissions,
          });
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
        }
      }
    }
  },

  setMustChangePassword: (val: boolean) => {
    set({ mustChangePassword: val });
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

  hasPermissionString: (perm: string) => {
    const { permissions, userType, user } = get();

    // Owners have all permissions
    if (userType === 'owner') return true;

    // Admins have all permissions
    if (user?.role === UserRole.COMPANY_ADMIN) return true;

    return permissions.includes(perm);
  },
}));
