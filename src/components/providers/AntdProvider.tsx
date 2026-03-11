'use client';

import React, { useEffect } from 'react';
import { ConfigProvider, App } from 'antd';
import { antdLightTheme, antdDarkTheme } from '@/theme/antd-theme';
import { useThemeStore } from '@/store/theme';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolved, mode } = useThemeStore();

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => useThemeStore.getState().setMode('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  // Apply dark class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);

  return (
    <ConfigProvider theme={resolved === 'dark' ? antdDarkTheme : antdLightTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
