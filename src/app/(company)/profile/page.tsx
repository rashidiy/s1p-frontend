'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Alert, Button, Input, message as antMessage } from 'antd';
import type { UserResponse } from '@/types/api';
import { useTranslations } from 'next-intl';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tAuth = useTranslations('auth');
  const tRoles = useTranslations('roles');

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
      antMessage.error(tErrors('failedToLoadProfile'));
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
      setMessage(tErrors('profileUpdated'));
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
      setError(err.response?.data?.detail || tErrors('failedToUpdateProfile'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError(t('passwordMismatch'));
      return;
    }

    if (!PASSWORD_REGEX.test(passwordForm.new_password)) {
      setPasswordError(tAuth('passwordRequirementsError'));
      return;
    }

    setChangingPassword(true);
    try {
      await apiClient.resetPassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMessage(tErrors('passwordChanged'));
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || tErrors('failedToChangePassword'));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
      {[1, 2].map((i) => (
        <div key={i} className="glass-card p-6 space-y-4">
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight">{t('personalDetails')}</h3>
          <p className="text-sm text-gray-400">{t('updatePersonalDetails')}</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {message && (
              <Alert type="success" message={message} showIcon className="!rounded-xl" />
            )}
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{tFields('firstName')}</label>
                <Input
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{tFields('lastName')}</label>
                <Input
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{tFields('email')}</label>
              <Input value={profile?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{tFields('phone')}</label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{tFields('role')}</label>
              <Input value={profile?.role ? tRoles(profile.role as any) : ''} disabled />
            </div>
            <Button type="primary" htmlType="submit" disabled={saving}>
              {saving ? tActions('saving') : tActions('saveChanges')}
            </Button>
          </form>
        </div>
      </div>

      <div className="glass-card p-0">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight">{t('changePassword')}</h3>
          <p className="text-sm text-gray-400">{t('updatePassword')}</p>
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
              <label className="text-sm font-medium">{tFields('currentPassword')}</label>
              <Input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{tFields('newPassword')}</label>
              <Input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
              />
              <p className="text-xs text-gray-400">
                {tAuth('passwordRequirements')}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{tFields('confirmNewPassword')}</label>
              <Input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                required
              />
            </div>
            <Button type="primary" htmlType="submit" disabled={changingPassword}>
              {changingPassword ? tActions('changing') : t('changePassword')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
