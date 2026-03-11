'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { Alert, Button, Input, message as antdMessage } from 'antd';
import type { OwnerResponse } from '@/types/api';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function OwnerProfilePage() {
  const { setUser } = useAuthStore();
  const [profile, setProfile] = useState<OwnerResponse | null>(null);
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
      const data = await apiClient.getOwnerProfile();
      setProfile(data);
      setProfileForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      antdMessage.error('Failed to load profile');
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
      const updated = await apiClient.updateOwnerProfile(profileForm);
      setProfile(updated);
      setMessage('Profile updated successfully');
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
          setUser(userData, 'owner');
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to update profile'));
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
      await apiClient.ownerResetPassword({
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

  if (loading) return (
    <div className="max-w-2xl sm:mx-auto space-y-6">
      <div>
        <div className="h-4 w-48 bg-gray-50 rounded animate-pulse" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="glass-card p-5 sm:p-8 space-y-5">
          <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
                <div className="h-10 bg-gray-50 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl sm:mx-auto space-y-6">
      <div className="page-header">
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <p className="text-sm text-gray-400 mt-0.5">Update your personal details</p>
        </div>
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {message && (
              <Alert type="success" message={message} showIcon className="!rounded-xl" closable onClose={() => setMessage('')} />
            )}
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">First Name <span className="text-red-400">*</span></label>
                <Input
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  required
                  size="large"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  size="large"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={profile?.email || ''} disabled size="large" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                size="large"
                placeholder="+998 90 123 4567"
              />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <Button type="primary" htmlType="submit" size="large" loading={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <p className="text-sm text-gray-400 mt-0.5">Update your account password</p>
        </div>
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4">
          <form onSubmit={handleChangePassword} className="space-y-5">
            {passwordMessage && (
              <Alert type="success" message={passwordMessage} showIcon className="!rounded-xl" closable onClose={() => setPasswordMessage('')} />
            )}
            {passwordError && (
              <Alert type="error" message={passwordError} showIcon className="!rounded-xl" closable onClose={() => setPasswordError('')} />
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <Input.Password
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                required
                size="large"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <Input.Password
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                  size="large"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <Input.Password
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  required
                  size="large"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              At least 8 characters, one uppercase letter, and one number
            </p>
            <div className="pt-2 border-t border-gray-100">
              <Button type="primary" htmlType="submit" size="large" loading={changingPassword}>
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
