'use client';

import { useEffect } from 'react';
import { Result } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

export default function IntegrationsPage() {
  const t = useTranslations('common');

  useEffect(() => { document.title = `${t('comingSoon')} | S1P`; }, [t]);

  return (
    <div style={{ padding: '24px' }}>
      <Result
        icon={<ApiOutlined style={{ color: '#4338CA' }} />}
        title={t('comingSoon')}
        subTitle={t('comingSoonDescription')}
      />
    </div>
  );
}
