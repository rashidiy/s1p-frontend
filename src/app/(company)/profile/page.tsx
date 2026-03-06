'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Alert, Button, Input, Spin } from 'antd';
import type { UserResponse } from '@/types/api';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiClient.getMyProfile();
      setProfile(data);
      setProfileForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await apiClient.updateMyProfile(profileForm);
      setProfile(updated);
      setMessage('Profile updated successfully');
      // Update stored user data
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          Object.assign(userData, {
            first_name: updated.first_name,
            last_name: updated.last_name,
            phone: updated.phone,
          });
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData, 'company_user');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!PASSWORD_REGEX.test(passwordForm.new_password)) {
      setPasswordError('Password must be at least 8 characters, contain at least one uppercase letter and one number');
      return;
    }

    setChangingPassword(true);
    try {
      await apiClient.resetPassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMessage('Password changed successfully');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold gradient-text">My Profile</h1>

      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Personal Information</h3>
          <p className="text-sm text-muted-foreground">Update your personal details</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {message && (
              <Alert type="success" message={message} showIcon className="!rounded-xl" />
            )}
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={profile?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input value={profile?.role || ''} disabled />
            </div>
            <Button htmlType="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>

      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Change Password</h3>
          <p className="text-sm text-muted-foreground">Update your password</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordMessage && (
              <Alert type="success" message={passwordMessage} showIcon className="!rounded-xl" />
            )}
            {passwordError && (
              <Alert type="error" message={passwordError} showIcon className="!rounded-xl" />
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters, one uppercase letter, and one number
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                required
              />
            </div>
            <Button htmlType="submit" disabled={changingPassword}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
