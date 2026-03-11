import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';

// Mock the apiClient import used by auth store
vi.mock('@/lib/api', () => ({
  apiClient: {
    getMyProfile: vi.fn(),
    getOwnerProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    userType: null,
    isAuthenticated: false,
    isInitializing: true,
    isOwner: false,
    isCompanyUser: false,
    permissions: [],
    mustChangePassword: false,
  });
  localStorage.clear();
});

describe('Auth Store', () => {
  describe('setUser', () => {
    it('sets isCompanyUser, isAuthenticated, and caches to state with company user', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: UserRole.COMPANY_OPERATOR,
        company_id: 'c1',
        is_active: true,
      };

      useAuthStore.getState().setUser(user, 'company_user');
      const state = useAuthStore.getState();

      expect(state.isCompanyUser).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isOwner).toBe(false);
      expect(state.userType).toBe('company_user');
      expect(state.user).toEqual(user);
      expect(state.isInitializing).toBe(false);
    });

    it('sets isOwner when userType is owner', () => {
      const user = {
        id: '1',
        email: 'owner@example.com',
        first_name: 'Owner',
        is_active: true,
      };

      useAuthStore.getState().setUser(user, 'owner');
      const state = useAuthStore.getState();

      expect(state.isOwner).toBe(true);
      expect(state.isCompanyUser).toBe(false);
      expect(state.userType).toBe('owner');
    });

    it('clears everything when user is null', () => {
      // First set a user
      useAuthStore.getState().setUser(
        { id: '1', email: 'test@example.com', first_name: 'Test', is_active: true },
        'company_user'
      );
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then clear
      useAuthStore.getState().setUser(null, null);
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.userType).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isOwner).toBe(false);
      expect(state.isCompanyUser).toBe(false);
      expect(state.permissions).toEqual([]);
    });

    it('extracts permissions from JWT credentials', () => {
      // Create a JWT with permissions in the payload
      const payload = {
        permissions: ['contacts.read', 'leads.write'],
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };
      const fakeJwt = `header.${btoa(JSON.stringify(payload))}.signature`;

      const user = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        is_active: true,
        credentials: { access: fakeJwt },
      };

      useAuthStore.getState().setUser(user, 'company_user');
      const state = useAuthStore.getState();

      expect(state.permissions).toEqual(['contacts.read', 'leads.write']);
    });

    it('uses permissions array directly when provided', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        is_active: true,
        permissions: ['contacts.read', 'deals.read'],
      };

      useAuthStore.getState().setUser(user, 'company_user');
      const state = useAuthStore.getState();

      expect(state.permissions).toEqual(['contacts.read', 'deals.read']);
    });
  });

  describe('logout', () => {
    it('clears user, tokens, and cached_user from localStorage', () => {
      // Set up some state and localStorage items
      localStorage.setItem('access_token', 'some-token');
      localStorage.setItem('refresh_token', 'some-refresh');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));
      localStorage.setItem('user_type', 'company_user');
      localStorage.setItem('temporary_token', 'temp');

      useAuthStore.getState().setUser(
        { id: '1', email: 'test@example.com', first_name: 'Test', is_active: true },
        'company_user'
      );

      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isOwner).toBe(false);
      expect(state.isCompanyUser).toBe(false);
      expect(state.permissions).toEqual([]);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('user_type')).toBeNull();
      expect(localStorage.getItem('temporary_token')).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('returns true only for COMPANY_ADMIN role', () => {
      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_ADMIN },
        'company_user'
      );
      expect(useAuthStore.getState().isAdmin()).toBe(true);

      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_MANAGER },
        'company_user'
      );
      expect(useAuthStore.getState().isAdmin()).toBe(false);

      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_OPERATOR },
        'company_user'
      );
      expect(useAuthStore.getState().isAdmin()).toBe(false);
    });
  });

  describe('isManager', () => {
    it('returns true only for COMPANY_MANAGER role', () => {
      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_MANAGER },
        'company_user'
      );
      expect(useAuthStore.getState().isManager()).toBe(true);

      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_ADMIN },
        'company_user'
      );
      expect(useAuthStore.getState().isManager()).toBe(false);
    });
  });

  describe('isOperator', () => {
    it('returns true only for COMPANY_OPERATOR role', () => {
      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_OPERATOR },
        'company_user'
      );
      expect(useAuthStore.getState().isOperator()).toBe(true);

      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_ADMIN },
        'company_user'
      );
      expect(useAuthStore.getState().isOperator()).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('returns true when user role >= required role (hierarchy check)', () => {
      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_ADMIN },
        'company_user'
      );

      expect(useAuthStore.getState().hasPermission(UserRole.COMPANY_OPERATOR)).toBe(true);
      expect(useAuthStore.getState().hasPermission(UserRole.COMPANY_MANAGER)).toBe(true);
      expect(useAuthStore.getState().hasPermission(UserRole.COMPANY_ADMIN)).toBe(true);

      // Operator can't access manager level
      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_OPERATOR },
        'company_user'
      );
      expect(useAuthStore.getState().hasPermission(UserRole.COMPANY_MANAGER)).toBe(false);
      expect(useAuthStore.getState().hasPermission(UserRole.COMPANY_OPERATOR)).toBe(true);
    });

    it('returns true for any role when userType is owner', () => {
      useAuthStore.getState().setUser(
        { id: '1', email: 'owner@b.com', first_name: 'Owner', is_active: true },
        'owner'
      );

      expect(useAuthStore.getState().hasPermission(UserRole.COMPANY_ADMIN)).toBe(true);
      expect(useAuthStore.getState().hasPermission(UserRole.OWNER)).toBe(true);
      expect(useAuthStore.getState().hasPermission(UserRole.COMPANY_OPERATOR)).toBe(true);
    });
  });

  describe('hasPermissionString', () => {
    it('returns true for admins regardless of permissions array', () => {
      useAuthStore.getState().setUser(
        { id: '1', email: 'a@b.com', first_name: 'A', is_active: true, role: UserRole.COMPANY_ADMIN },
        'company_user'
      );

      // Admin has no explicit permissions in array, but should still return true
      expect(useAuthStore.getState().hasPermissionString('contacts.read')).toBe(true);
      expect(useAuthStore.getState().hasPermissionString('anything.whatever')).toBe(true);
    });

    it('checks permissions array for non-admin roles', () => {
      const payload = {
        permissions: ['contacts.read', 'leads.read'],
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const fakeJwt = `header.${btoa(JSON.stringify(payload))}.signature`;

      useAuthStore.getState().setUser(
        {
          id: '1',
          email: 'a@b.com',
          first_name: 'A',
          is_active: true,
          role: UserRole.COMPANY_OPERATOR,
          credentials: { access: fakeJwt },
        },
        'company_user'
      );

      expect(useAuthStore.getState().hasPermissionString('contacts.read')).toBe(true);
      expect(useAuthStore.getState().hasPermissionString('leads.read')).toBe(true);
      expect(useAuthStore.getState().hasPermissionString('deals.read')).toBe(false);
    });
  });

  describe('setMustChangePassword', () => {
    it('sets the mustChangePassword flag', () => {
      expect(useAuthStore.getState().mustChangePassword).toBe(false);

      useAuthStore.getState().setMustChangePassword(true);
      expect(useAuthStore.getState().mustChangePassword).toBe(true);

      useAuthStore.getState().setMustChangePassword(false);
      expect(useAuthStore.getState().mustChangePassword).toBe(false);
    });
  });
});
