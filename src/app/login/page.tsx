'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Alert } from 'antd';
import { LoginOutlined, SendOutlined } from '@ant-design/icons';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useTranslations } from 'next-intl';

const OTP_LENGTH = 6;
const POLL_INTERVAL = 2000;
const POLL_MAX_DURATION = 5 * 60 * 1000; // 5 minutes

type TelegramStep = 'idle' | 'waiting_bot' | 'enter_otp' | 'verifying' | 'expired';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const t = useTranslations('auth');

  // Telegram OTP state
  const [step, setStep] = useState<TelegramStep>('idle');
  const [challengeId, setChallengeId] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartRef = useRef<number>(0);
  const otpInputRef = useRef<any>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Handle owner impersonation token
  useEffect(() => {
    const impersonateToken = searchParams?.get('impersonate');
    if (impersonateToken) {
      apiClient.consumeImpersonationToken(impersonateToken);
      apiClient.getMyProfile().then((profile) => {
        setUser({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          role: profile.role as any,
          company_id: profile.company_id ?? undefined,
          is_active: profile.is_active,
          credentials: { access: impersonateToken },
          permissions: profile.permissions,
        }, 'company_user');
        router.replace('/dashboard');
      }).catch(() => {
        setError(t('impersonationFailed'));
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_type');
      });
    }
  }, [searchParams]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Step 1: Create challenge and open Telegram
  const handleTelegramLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const challenge = await apiClient.createLoginChallenge();
      setChallengeId(challenge.challenge_id);
      setDeepLink(challenge.deep_link);
      setStep('waiting_bot');

      // Open Telegram deep link
      window.open(challenge.deep_link, '_blank');

      // Start polling for OTP sent status
      pollStartRef.current = Date.now();
      pollRef.current = setInterval(async () => {
        // Timeout after 5 minutes
        if (Date.now() - pollStartRef.current > POLL_MAX_DURATION) {
          stopPolling();
          setStep('expired');
          return;
        }

        try {
          const status = await apiClient.pollChallengeStatus(challenge.challenge_id);
          if (status.status === 'otp_sent') {
            stopPolling();
            setStep('enter_otp');
            setTimeout(() => otpInputRef.current?.focus(), 100);
          } else if (status.status === 'expired') {
            stopPolling();
            setStep('expired');
          } else if (status.status === 'used') {
            stopPolling();
          }
        } catch {
          // Ignore poll errors, keep trying
        }
      }, POLL_INTERVAL);
    } catch (err: any) {
      setError(getErrorMessage(err, t('telegramLoginFailed')));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!challengeId || otp.length !== OTP_LENGTH) return;
    setError('');
    setStep('verifying');
    try {
      const response = await apiClient.verifyOtp({ challenge_id: challengeId, otp });
      setUser(response, 'company_user');
      router.push('/dashboard');
    } catch (err: any) {
      setStep('enter_otp');
      setOtp('');
      setError(getErrorMessage(err, t('telegramOtpFailed')));
    }
  };

  // OTP input handler — digits only, auto-submit on 6 digits
  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === OTP_LENGTH && step === 'enter_otp') {
      handleVerifyOtp();
    }
  }, [otp]);

  // Reset to start
  const handleReset = () => {
    stopPolling();
    setStep('idle');
    setChallengeId('');
    setDeepLink('');
    setOtp('');
    setError('');
  };

  return (
    <AuthLayout title={t('welcomeBack')} subtitle={t('enterCredentials')} icon={<LoginOutlined style={{ fontSize: 28 }} />}>
      <div className="space-y-5">
        {error && <Alert type="error" message={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />}

        {/* Telegram OTP Flow */}
        {step === 'idle' && (
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            className="w-full"
            onClick={handleTelegramLogin}
            loading={loading}
          >
            {t('telegramLogin')}
          </Button>
        )}

        {step === 'waiting_bot' && (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <SendOutlined style={{ fontSize: 32, color: '#0088cc' }} />
            </div>
            <div>
              <p className="font-medium text-gray-800">{t('telegramWaitingBot')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('telegramWaitingBotHint')}</p>
            </div>
            <Button size="small" type="link" href={deepLink} target="_blank">
              {t('telegramLogin')}
            </Button>
            <div>
              <Button size="small" type="text" onClick={handleReset}>
                {t('telegramCancel')}
              </Button>
            </div>
          </div>
        )}

        {step === 'enter_otp' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium text-gray-800">{t('telegramEnterOtp')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('telegramOtpHint')}</p>
            </div>
            <Input
              ref={otpInputRef}
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              placeholder="000000"
              maxLength={OTP_LENGTH}
              size="large"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
            />
            <Button
              type="primary"
              size="large"
              className="w-full"
              onClick={handleVerifyOtp}
              disabled={otp.length !== OTP_LENGTH}
              loading={step === 'verifying' as any}
            >
              {t('signIn')}
            </Button>
            <div className="text-center">
              <Button size="small" type="text" onClick={handleReset}>
                {t('telegramCancel')}
              </Button>
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="text-center space-y-4">
            <div className="animate-spin inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-gray-600">{t('signingIn')}...</p>
          </div>
        )}

        {step === 'expired' && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">{t('telegramLinkExpired')}</p>
            <Button type="primary" onClick={handleReset}>
              {t('telegramTryAgain')}
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
