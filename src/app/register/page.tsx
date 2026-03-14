'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Alert, Spin, Avatar } from 'antd';
import { UserAddOutlined, UserOutlined, CheckCircleFilled, SendOutlined, DeleteOutlined, CameraOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';
import type { RegisterChallengeResponse, RegisterChallengeStatusResponse } from '@/types/api';

const TOKEN_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const POLL_INTERVAL = 2000;

type Step = 'code' | 'telegram' | 'form';

export default function TelegramRegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const t = useTranslations('auth');

  // Step tracking
  const [step, setStep] = useState<Step>('code');

  // Step 1: Invite code
  const [inviteToken, setInviteToken] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  // Step 2: Telegram connect
  const [challenge, setChallenge] = useState<RegisterChallengeResponse | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<RegisterChallengeStatusResponse | null>(null);
  const [telegramError, setTelegramError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 3: Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Avatar management
  const [avatarState, setAvatarState] = useState<'telegram' | 'custom' | 'none'>('none');
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTokenInput = (value: string): string => {
    const clean = value.replace(/[^A-Za-z2-9]/g, '').toUpperCase().slice(0, 8);
    if (clean.length > 4) {
      return clean.slice(0, 4) + '-' + clean.slice(4);
    }
    return clean;
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteToken(formatTokenInput(e.target.value));
    setCodeError('');
  };

  // Step 1: Validate invite code
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!TOKEN_PATTERN.test(inviteToken)) {
      setCodeError(t('telegramRegisterInvalidToken'));
      return;
    }

    setCodeLoading(true);
    setCodeError('');

    try {
      const result = await apiClient.createRegisterChallenge({ invite_token: inviteToken });
      setChallenge(result);

      // Pre-fill form with invite data
      if (result.invite_first_name) setFirstName(result.invite_first_name);
      if (result.invite_last_name) setLastName(result.invite_last_name);
      if (result.invite_phone) setPhone(result.invite_phone);

      setStep('telegram');
    } catch (err: any) {
      setCodeError(getErrorMessage(err, t('telegramRegisterInvalidCode')));
    } finally {
      setCodeLoading(false);
    }
  };

  // Step 2: Poll for Telegram connection
  const pollStatus = useCallback(async () => {
    if (!challenge) return;

    try {
      const status = await apiClient.pollRegisterChallengeStatus(challenge.challenge_id);
      setTelegramStatus(status);

      if (status.status === 'telegram_connected') {
        // Stop polling
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }

        // Update form with Telegram data
        if (status.telegram_first_name && !firstName) setFirstName(status.telegram_first_name);
        if (status.telegram_last_name && !lastName) setLastName(status.telegram_last_name);

        // Set avatar state based on Telegram avatar availability
        if (status.has_avatar) {
          setAvatarState('telegram');
        }

        setStep('form');
      } else if (status.status === 'expired') {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setTelegramError(t('telegramConnectExpired'));
      }
    } catch {
      // Silently ignore poll errors
    }
  }, [challenge, firstName, lastName, t]);

  useEffect(() => {
    if (step === 'telegram' && challenge) {
      pollRef.current = setInterval(pollStatus, POLL_INTERVAL);
      // Initial poll
      pollStatus();

      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }
  }, [step, challenge, pollStatus]);

  // Step 3: Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    setSubmitError('');
    setSubmitLoading(true);

    try {
      const response = await apiClient.telegramRegister({
        session_id: challenge.challenge_id,
        invite_token: inviteToken,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone: phone || undefined,
        skip_avatar: avatarState !== 'telegram',
      });
      setUser(response, 'company_user');

      // Upload custom avatar after registration
      if (avatarState === 'custom' && customAvatarFile) {
        try {
          await apiClient.uploadAvatar(customAvatarFile);
        } catch {
          // Avatar upload failure is non-critical — proceed to dashboard
          console.error('Failed to upload custom avatar');
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setSubmitError(getErrorMessage(err, t('telegramRegisterFailed')));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Avatar URL (available after Telegram connect)
  const avatarUrl = challenge && telegramStatus?.has_avatar
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/telegram/avatar/${challenge.challenge_id}`
    : null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image must be under 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setSubmitError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    setCustomAvatarFile(file);
    setCustomAvatarPreview(URL.createObjectURL(file));
    setAvatarState('custom');
  };

  const handleRemoveAvatar = () => {
    if (customAvatarPreview) {
      URL.revokeObjectURL(customAvatarPreview);
    }
    setCustomAvatarFile(null);
    setCustomAvatarPreview(null);
    setAvatarState('none');
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (customAvatarPreview) {
        URL.revokeObjectURL(customAvatarPreview);
      }
    };
  }, [customAvatarPreview]);

  const stepNumber = step === 'code' ? 1 : step === 'telegram' ? 2 : 3;

  return (
    <AuthLayout
      title={t('telegramRegisterTitle')}
      subtitle={t('telegramRegisterSubtitle')}
      icon={<UserAddOutlined style={{ fontSize: 28 }} />}
    >
      <div className="space-y-5">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                n === stepNumber
                  ? 'bg-indigo-600 text-white'
                  : n < stepNumber
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {n < stepNumber ? '\u2713' : n}
            </div>
          ))}
        </div>

        {/* Step 1: Enter invite code */}
        {step === 'code' && (
          <form onSubmit={handleValidateCode} className="space-y-5">
            {codeError && (
              <Alert type="error" message={codeError} showIcon className="!rounded-xl" closable onClose={() => setCodeError('')} />
            )}

            <div className="space-y-1.5">
              <label htmlFor="invite-token" className="text-sm font-medium text-gray-700">
                {t('telegramInviteTokenLabel')}
              </label>
              <Input
                id="invite-token"
                value={inviteToken}
                onChange={handleTokenChange}
                placeholder="XXXX-XXXX"
                size="large"
                className="glass-input text-center text-xl tracking-[0.3em] font-mono uppercase"
                maxLength={9}
                disabled={codeLoading}
                autoFocus
                autoComplete="off"
              />
              <p className="text-xs text-gray-400 text-center">{t('telegramInviteTokenHint')}</p>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              size="large"
              disabled={!TOKEN_PATTERN.test(inviteToken) || codeLoading}
              loading={codeLoading}
            >
              {codeLoading ? t('telegramRegisterValidating') : t('telegramRegisterContinue')}
            </Button>
          </form>
        )}

        {/* Step 2: Connect Telegram */}
        {step === 'telegram' && challenge && (
          <div className="space-y-5">
            {telegramError && (
              <Alert type="error" message={telegramError} showIcon className="!rounded-xl" />
            )}

            <div className="text-center space-y-2">
              <p className="text-base font-medium text-gray-800">
                {t('telegramRegisterWelcome', { company: challenge.company_name })}
              </p>
              <p className="text-sm text-gray-500">{t('telegramConnectDescription')}</p>
            </div>

            <div className="text-center py-4">
              <a
                href={challenge.deep_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  className="!h-12 !text-base"
                >
                  {t('telegramConnectButton')}
                </Button>
              </a>
            </div>

            {!telegramError && (
              <div className="text-center py-2">
                <Spin size="small" />
                <p className="text-sm text-gray-400 mt-2">{t('telegramConnecting')}</p>
              </div>
            )}

            {telegramError && (
              <Button
                type="default"
                className="w-full"
                onClick={() => {
                  setStep('code');
                  setChallenge(null);
                  setTelegramStatus(null);
                  setTelegramError('');
                }}
              >
                {t('telegramTryAgain')}
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Registration form */}
        {step === 'form' && challenge && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <Alert type="error" message={submitError} showIcon className="!rounded-xl" closable onClose={() => setSubmitError('')} />
            )}

            {/* Avatar area */}
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="relative">
                <div
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarState === 'telegram' && avatarUrl ? (
                    <Avatar size={80} src={avatarUrl} icon={<UserOutlined />} />
                  ) : avatarState === 'custom' && customAvatarPreview ? (
                    <Avatar size={80} src={customAvatarPreview} icon={<UserOutlined />} />
                  ) : (
                    <Avatar size={80} icon={<CameraOutlined />} className="bg-gray-100 text-gray-400" />
                  )}
                </div>
                {(avatarState === 'telegram' || avatarState === 'custom') && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <DeleteOutlined style={{ fontSize: 12 }} />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              {telegramStatus?.telegram_username && (
                <p className="text-sm text-gray-500">@{telegramStatus.telegram_username}</p>
              )}
              <div className="flex items-center gap-1.5">
                <CheckCircleFilled className="text-green-500 text-sm" />
                <p className="text-xs text-green-600">{t('telegramConnected')}</p>
              </div>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                  {t('firstName')}
                </label>
                <Input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  size="large"
                  className="glass-input"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                  {t('lastName')}
                </label>
                <Input
                  id="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  size="large"
                  className="glass-input"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                {t('phone')}
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                size="large"
                className="glass-input"
              />
            </div>

            <div className="pt-1">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
                disabled={submitLoading}
                loading={submitLoading}
              >
                {submitLoading ? t('telegramRegistering') : t('telegramRegisterSubmit')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
