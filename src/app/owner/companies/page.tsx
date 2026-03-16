'use client';

import { useEffect, useState } from 'react';
import { Input, Button, Tag, message } from 'antd';
import { BankOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { CompanyResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

function getCompanyUrl(subdomain: string): string {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const port = process.env.NODE_ENV === 'production' ? '' : ':3000';
  return `${protocol}://${subdomain}.${baseDomain}${port}`;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const t = useTranslations('companies');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tStatuses = useTranslations('statuses');
  const tFields = useTranslations('fields');
  const tCommon = useTranslations('common');
  const tEntities = useTranslations('entities');

  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    try { const data = await apiClient.getOwnerCompanies(); setCompanies(data); }
    catch (error) { console.error('Failed to load companies:', error); message.error(tErrors('failedToLoadCompanies')); }
    finally { setLoading(false); }
  };

  const toggleCompanyStatus = async (companyId: string, isActive: boolean) => {
    try { if (isActive) await apiClient.deactivateCompany(companyId); else await apiClient.activateCompany(companyId); loadCompanies(); } catch (error) { console.error('Failed to toggle company status:', error); message.error(tErrors('failedToToggleCompanyStatus')); }
  };

  const handleImpersonate = async (companyId: string) => {
    try {
      const { url } = await apiClient.impersonateCompany(companyId);
      window.open(url, '_blank');
    } catch (error: unknown) {
      message.error(getErrorMessage(error, tErrors('failedToAccessCompany')));
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.subdomain?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-gray-50 rounded animate-pulse mt-2" />
        </div>
        <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-10 w-80 bg-gray-50 rounded-lg animate-pulse" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 border-l-4 border-l-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-50 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-16 bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="page-subtitle">{t('subtitle')}</p>
        <Link href="/owner/companies/new"><Button type="primary" icon={<PlusOutlined />}>{t('addCompany')}</Button></Link>
      </div>

      <Input.Search placeholder={t('searchCompanies')} value={search} onChange={(e) => setSearch(e.target.value)} allowClear size="large" className="max-w-full sm:max-w-lg" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="glass-card p-5 border-l-4 border-l-crm-indigo-500 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <BankOutlined className="text-xl text-crm-indigo-600" />
                <div>
                  <Link href={`/owner/companies/${company.id}`} className="font-semibold text-gray-900 hover:text-crm-indigo-600 transition-colors">{company.name}</Link>
                  {company.subdomain ? (
                    <button onClick={(e) => { e.stopPropagation(); handleImpersonate(company.id); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-crm-indigo-600 transition-colors cursor-pointer bg-transparent border-none p-0">
                      <span>{getCompanyUrl(company.subdomain).replace(/^https?:\/\//, '')}</span>
                      <ExportOutlined style={{ fontSize: 11 }} />
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">—</p>
                  )}
                </div>
              </div>
              <Tag color={company.is_active ? 'green' : 'default'}>{company.is_active ? tStatuses('active') : tStatuses('inactive')}</Tag>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">{tFields('provider')}</span><span className="font-medium uppercase">{company.provider_type}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">{tEntities('users')}</span><span className="font-medium">{company.users_count || 0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">{tFields('created')}</span><span className="font-medium">{new Date(company.created_at).toLocaleDateString()}</span></div>
              <div className="flex gap-2 pt-2">
                <Link href={`/owner/companies/${company.id}`} className="flex-1"><Button block>{tActions('viewDetails')}</Button></Link>
                <Button danger={company.is_active} onClick={() => toggleCompanyStatus(company.id, company.is_active)} icon={company.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="no-deals" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">
            {search ? t('noMatchesFound') : t('noCompaniesFound')}
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {search ? tCommon('tryAdjustingSearch') : t('getStartedDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
