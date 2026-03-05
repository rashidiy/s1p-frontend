'use client';

import React from 'react';
import { ConfigProvider, App } from 'antd';
import { antdTheme } from '@/theme/antd-theme';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
