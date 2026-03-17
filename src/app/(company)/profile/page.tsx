'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { Alert, Button, Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { UserResponse } from '@/types/api';
import { useTranslations } from 'next-intl';
import { ErrorCharacter } from '@/components/illustrations';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
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
  const [loadError, setLoadError] = useState(false);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadProfile = async () => {
    try {
      setLoadError(false);
      const data = await apiClient.getMyProfile();
      setProfile(data);
      setProfileForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
    } catch {
      setLoadError(true);
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
      setMessage(t('profileUpdated'));
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, tErrors('failedToUpdateProfile')));
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
      await apiClient.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMessage(t('passwordChanged'));
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: unknown) {
      setPasswordError(getErrorMessage(err, tErrors('failedToChangePassword')));
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

  if (loadError) {
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <ErrorCharacter height={115} />
        <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
        <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
        <Button type="primary" className="mt-4" onClick={() => { setLoadError(false); setLoading(true); loadProfile(); }}>
          {tActions('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl sm:mx-auto space-y-6">
      <Link href="/settings">
        <Button type="text" icon={<ArrowLeftOutlined />} className="mb-2">
          {tCommon('backToSettings')}
        </Button>
      </Link>
      <div className="page-header">
        <p className="page-subtitle">{t('subtitle')}</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">{t('personalDetails')}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{t('updatePersonalDetails')}</p>
        </div>
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {message && (
              <Alert type="success" title={message} showIcon className="!rounded-xl" closable onClose={() => setMessage('')} />
            )}
            {error && (
              <Alert type="error" title={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('firstName')} <span className="text-red-400">*</span></label>
                <Input
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  required
                  size="large"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('lastName')}</label>
                <Input
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  size="large"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{tFields('email')}</label>
              <Input value={profile?.email || ''} disabled size="large" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{tFields('phone')}</label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                size="large"
                placeholder="+998 90 123 4567"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{tFields('role')}</label>
              <Input value={profile?.role ? tRoles(profile.role as any) : ''} disabled size="large" />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <Button type="primary" htmlType="submit" size="large" loading={saving}>
                {saving ? tActions('saving') : tActions('saveChanges')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">{t('changePassword')}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{t('updatePassword')}</p>
        </div>
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4">
          <form onSubmit={handleChangePassword} className="space-y-5">
            {passwordMessage && (
              <Alert type="success" title={passwordMessage} showIcon className="!rounded-xl" closable onClose={() => setPasswordMessage('')} />
            )}
            {passwordError && (
              <Alert type="error" title={passwordError} showIcon className="!rounded-xl" closable onClose={() => setPasswordError('')} />
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{tFields('currentPassword')}</label>
              <Input.Password
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                required
                size="large"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('newPassword')}</label>
                <Input.Password
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                  size="large"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('confirmNewPassword')}</label>
                <Input.Password
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  required
                  size="large"
                  autoComplete="off"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {tAuth('passwordRequirements')}
            </p>
            <div className="pt-2 border-t border-gray-100">
              <Button type="primary" htmlType="submit" size="large" loading={changingPassword}>
                {changingPassword ? tActions('changing') : t('changePassword')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
