'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Input, Button, Tag, Table, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { BankOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { CompanyResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

const PAGE_SIZE = 50;

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations('companies');
  const tErrors = useTranslations('errors');
  const tActions = useTranslations('actions');
  const tStatuses = useTranslations('statuses');
  const tFields = useTranslations('fields');
  const tCommon = useTranslations('common');
  const tEntities = useTranslations('entities');

  const loadCompanies = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const data = await apiClient.getOwnerCompanies({
        search: s || undefined,
        page: p,
        page_size: PAGE_SIZE,
      });
      setCompanies(data);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (error) {
      message.error(tErrors('failedToLoadCompanies'));
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  useEffect(() => { loadCompanies(1, ''); }, [loadCompanies]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value) {
      setPage(1);
      loadCompanies(1, '');
      return;
    }
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadCompanies(1, value);
    }, 400);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const newPage = pagination.current || 1;
    setPage(newPage);
    loadCompanies(newPage, search);
  };

  const toggleCompanyStatus = async (companyId: string, isActive: boolean) => {
    try {
      if (isActive) await apiClient.deactivateCompany(companyId);
      else await apiClient.activateCompany(companyId);
      loadCompanies(page, search);
    } catch (error) {
      message.error(tErrors('failedToToggleCompanyStatus'));
    }
  };

  const handleImpersonate = async (companyId: string) => {
    try {
      const { url } = await apiClient.impersonateCompany(companyId);
      window.open(url, '_blank');
    } catch (error: unknown) {
      message.error(getErrorMessage(error, tErrors('failedToAccessCompany')));
    }
  };

  const columns: ColumnsType<CompanyResponse> = [
    {
      title: tFields('name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-2">
          <BankOutlined className="text-crm-indigo-600" />
          <Link href={`/owner/companies/${record.id}`} className="font-medium text-gray-900 hover:text-crm-indigo-600 transition-colors">
            {name}
          </Link>
        </div>
      ),
    },
    {
      title: tFields('subdomain'),
      dataIndex: 'subdomain',
      key: 'subdomain',
      render: (subdomain: string, record) =>
        subdomain ? (
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleImpersonate(record.id); }}
            className="flex items-center gap-1 text-sm text-crm-indigo-600 hover:text-crm-indigo-700 transition-colors"
          >
            <span>{subdomain}.s1p.uz</span>
            <ExportOutlined style={{ fontSize: 11 }} />
          </a>
        ) : (
          <span className="text-gray-400">&mdash;</span>
        ),
    },
    {
      title: tStatuses('status'),
      dataIndex: 'is_active',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? tStatuses('active') : tStatuses('inactive')}
        </Tag>
      ),
    },
    {
      title: tFields('provider'),
      dataIndex: 'provider_type',
      key: 'provider',
      width: 110,
      responsive: ['md'],
      render: (provider: string) => <span className="uppercase text-sm">{provider}</span>,
    },
    {
      title: tEntities('users'),
      dataIndex: 'users_count',
      key: 'users',
      width: 80,
      render: (count: number) => count || 0,
    },
    {
      title: tFields('created'),
      dataIndex: 'created_at',
      key: 'created',
      width: 120,
      responsive: ['lg'],
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: tActions('actions'),
      key: 'actions',
      width: 160,
      render: (_: unknown, record) => (
        <div className="flex gap-2">
          <Link href={`/owner/companies/${record.id}`}>
            <Button size="small" icon={<EyeOutlined />}>{tActions('viewDetails')}</Button>
          </Link>
          <Button
            size="small"
            danger={record.is_active}
            onClick={() => toggleCompanyStatus(record.id, record.is_active)}
            icon={record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
          />
        </div>
      ),
    },
  ];

  if (loading && companies.length === 0) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-gray-50 rounded animate-pulse mt-2" />
        </div>
        <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-10 w-80 bg-gray-50 rounded-lg animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="page-subtitle">{t('subtitle')}</p>
        <Link href="/owner/companies/new">
          <Button type="primary" icon={<PlusOutlined />}>{t('addCompany')}</Button>
        </Link>
      </div>

      <Input.Search
        placeholder={t('searchCompanies')}
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        allowClear
        size="large"
        className="max-w-full sm:max-w-lg"
      />

      {!loading && companies.length === 0 ? (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="no-deals" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">
            {search ? t('noMatchesFound') : t('noCompaniesFound')}
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {search ? tCommon('tryAdjustingSearch') : t('getStartedDescription')}
          </p>
        </div>
      ) : (
        <Table<CompanyResponse>
          columns={columns}
          dataSource={companies}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: hasMore ? page * PAGE_SIZE + 1 : (page - 1) * PAGE_SIZE + companies.length,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
          scroll={{ x: 700 }}
        />
      )}
    </div>
  );
}
