import { create } from 'zustand';
import { UserRole } from '@/types/api';
import { apiClient } from '@/lib/api';

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
  isInitializing: boolean;
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
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { permissions: [] };
    }
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
  isInitializing: true,
  isOwner: false,
  isCompanyUser: false,
  permissions: [],
  mustChangePassword: false,

  setUser: (user, userType) => {
    let permissions: string[] = [];
    if (user) {
      // From login response: decode JWT for permissions
      const credentials = (user as any)?.credentials;
      if (credentials?.access) {
        const parsed = parseJwtPermissions(credentials.access);
        permissions = parsed.permissions;
      }
      // From /me endpoint response: use permissions array directly
      else if (Array.isArray((user as any)?.permissions)) {
        permissions = (user as any).permissions;
      }
    }
    set({
      user,
      userType,
      isAuthenticated: !!user,
      isInitializing: false,
      isOwner: userType === 'owner',
      isCompanyUser: userType === 'company_user',
      permissions,
      mustChangePassword: false,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      // Clean up any legacy tokens and session hints
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
      isInitializing: false,
      isOwner: false,
      isCompanyUser: false,
      permissions: [],
      mustChangePassword: false,
    });
  },

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    // Skip if already initialized
    if (!get().isInitializing) return;

    try {
      const userType = localStorage.getItem('user_type') as UserType | null;

      if (userType === 'owner') {
        const profile = await apiClient.getOwnerProfile();
        set({
          user: {
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            is_active: profile.is_active,
            created_at: profile.created_at,
          },
          userType: 'owner',
          isAuthenticated: true,
          isInitializing: false,
          isOwner: true,
          isCompanyUser: false,
          permissions: [],
        });
      } else {
        // Default: try company user endpoint
        const profile = await apiClient.getMyProfile();
        set({
          user: {
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            role: profile.role as UserRole,
            company_id: profile.company_id ?? undefined,
            is_active: profile.is_active,
            created_at: profile.created_at,
          },
          userType: 'company_user',
          isAuthenticated: true,
          isInitializing: false,
          isOwner: false,
          isCompanyUser: true,
          permissions: profile.permissions || [],
        });
      }
    } catch {
      // Session invalid (401) or no session — user not authenticated
      set({
        user: null,
        userType: null,
        isAuthenticated: false,
        isInitializing: false,
        isOwner: false,
        isCompanyUser: false,
        permissions: [],
      });
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
