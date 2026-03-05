'use client';

import { useEffect, useState } from 'react';
import { Input, Spin, Button, Tag } from 'antd';
import { BankOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { CompanyResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    try { const data = await apiClient.getOwnerCompanies(); setCompanies(data); }
    catch (error) { console.error('Failed to load companies:', error); }
    finally { setLoading(false); }
  };

  const toggleCompanyStatus = async (companyId: string, isActive: boolean) => {
    try { if (isActive) await apiClient.deactivateCompany(companyId); else await apiClient.activateCompany(companyId); loadCompanies(); } catch {}
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.subdomain?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Companies</h1>
          <p className="text-gray-500">Manage all registered companies</p>
        </div>
        <Link href="/owner/companies/new"><Button type="primary" icon={<PlusOutlined />}>Add Company</Button></Link>
      </div>

      <Input.Search placeholder="Search by name or subdomain..." value={search} onChange={(e) => setSearch(e.target.value)} allowClear size="large" className="max-w-lg" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="glass-card p-5 border-l-4 border-l-crm-indigo-500 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <BankOutlined className="text-xl text-crm-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.subdomain}</p>
                </div>
              </div>
              <Tag color={company.is_active ? 'green' : 'default'}>{company.is_active ? 'Active' : 'Inactive'}</Tag>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Provider</span><span className="font-medium uppercase">{company.provider_type}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Users</span><span className="font-medium">{company.users_count || 0}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Created</span><span className="font-medium">{new Date(company.created_at).toLocaleDateString()}</span></div>
              <div className="flex gap-2 pt-2">
                <Link href={`/owner/companies/${company.id}`} className="flex-1"><Button block>View Details</Button></Link>
                <Button danger={company.is_active} onClick={() => toggleCompanyStatus(company.id, company.is_active)} icon={company.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={150} height={150} />
          <p className="mt-4 text-lg font-medium text-gray-700">No companies found</p>
          <p className="text-sm text-gray-500">{search ? 'Try adjusting your search' : 'Get started by adding a company'}</p>
        </div>
      )}
    </div>
  );
}
