'use client';

import { Result } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

export default function IntegrationsPage() {
  const t = useTranslations('common');

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
