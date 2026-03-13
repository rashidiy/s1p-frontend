'use client';

import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { useTranslations } from 'next-intl';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export function AuthLayout({ children, title, subtitle, icon }: AuthLayoutProps) {
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  return (
    <div className="min-h-screen flex bg-gradient-auth relative overflow-hidden">
      {/* Animated decorative orbs */}
      <div className="absolute top-[-15%] left-[-8%] w-[450px] h-[450px] rounded-full bg-white/[0.06] pointer-events-none auth-orb auth-orb-1" />
      <div className="absolute bottom-[-10%] right-[15%] w-[350px] h-[350px] rounded-full bg-white/[0.05] pointer-events-none auth-orb auth-orb-2" />
      <div className="absolute top-[40%] left-[5%] w-[200px] h-[200px] rounded-full bg-white/[0.04] pointer-events-none auth-orb auth-orb-3" />

      {/* Left side - branding + illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative z-10">
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-5 border border-white/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-6xl font-extrabold text-white tracking-tight mb-3">S1P</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-white/0 via-white/40 to-white/0 rounded-full mx-auto" />
          </div>
          <p className="text-xl text-white/90 leading-relaxed font-medium">
            {tAuth('manageRelationships')}
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 pb-8 sm:p-8 relative z-10">
        {/* Mobile-only brand header */}
        <div className="lg:hidden text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm mb-3 border border-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">S1P</h1>
          <p className="text-sm text-white/60 mt-1">{tCommon('customerRelationshipManagement')}</p>
        </div>

        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#4338ca',
              colorInfo: '#4338ca',
              colorLink: '#4338ca',
              colorLinkHover: '#6366f1',
              colorLinkActive: '#3730a3',
            },
          }}
        >
          <div className="auth-card w-full max-w-md p-8 sm:p-10">
            <div className="text-center mb-8">
              {icon && (
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-crm-indigo-50 text-crm-indigo-600 mb-4">
                  {icon}
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
            </div>
            {children}
          </div>
        </ConfigProvider>
      </div>
    </div>
  );
}
