'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Plus, Mail, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types/api';
import type { UserResponse, PaginatedResponse } from '@/types/api';
import Link from 'next/link';

export default function UsersPage() {
  const [data, setData] = useState<PaginatedResponse<UserResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { isAdmin, hasPermission } = useAuthStore();

  const canManageUsers = hasPermission(UserRole.COMPANY_ADMIN);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({
        page,
        page_size: 20,
        search: search || undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await apiClient.deactivateUser(userId);
      } else {
        await apiClient.activateUser(userId);
      }
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.COMPANY_ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.COMPANY_MANAGER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.COMPANY_OPERATOR:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('company_', '').replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-gray-500">Manage user accounts and permissions</p>
        </div>
        {canManageUsers && (
          <Link href="/users/invite">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {user.first_name} {user.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Mail className="mr-1 h-3 w-3" />
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role</span>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    <Shield className="mr-1 h-3 w-3" />
                    {formatRole(user.role)}
                  </Badge>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Joined</span>
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                {canManageUsers && (
                  <div className="flex space-x-2 pt-2">
                    <Link href={`/users/${user.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant={user.is_active ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.total_pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
            disabled={page === data.total_pages}
          >
            Next
          </Button>
        </div>
      )}

      {data?.items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium">No users found</p>
            <p className="text-sm text-gray-500">
              {search ? 'Try adjusting your search' : 'Get started by inviting team members'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
