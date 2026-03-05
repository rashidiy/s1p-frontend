'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Spin, Button, Tag } from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { ContactResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

export default function ContactsPage() {
  const [data, setData] = useState<PaginatedResponse<ContactResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadContacts();
  }, [page, search]);

  const loadContacts = async () => {
    try {
      const result = await apiClient.getContacts({
        page,
        page_size: 20,
        search: search || undefined,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Contacts</h1>
          <p className="text-gray-500">Manage your contact database</p>
        </div>
        <Link href="/contacts/new">
          <Button type="primary" icon={<PlusOutlined />}>Add Contact</Button>
        </Link>
      </div>

      <Input.Search
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        allowClear
        size="large"
        className="max-w-lg"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((contact) => (
          <div key={contact.id} className="glass-card p-5 border-l-4 border-l-crm-indigo-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crm-indigo-100">
                <UserOutlined className="text-crm-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {contact.first_name} {contact.last_name}
                </h3>
                {contact.company_name && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                    <BankOutlined className="text-xs" /> {contact.company_name}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {contact.email && (
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <MailOutlined /> <span className="truncate">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <PhoneOutlined /> <span>{contact.phone}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1 pt-1">
                {(contact.total_leads ?? 0) > 0 && <Tag color="blue">{contact.total_leads} Leads</Tag>}
                {(contact.total_deals ?? 0) > 0 && <Tag color="green">{contact.total_deals} Deals</Tag>}
                {(contact.total_calls ?? 0) > 0 && <Tag>{contact.total_calls} Calls</Tag>}
              </div>
              <Link href={`/contacts/${contact.id}`}>
                <Button block className="!mt-3">View Details</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex justify-center">
          <Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} />
        </div>
      )}

      {data?.items.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={150} height={150} />
          <p className="mt-4 text-lg font-medium text-gray-700">No contacts found</p>
          <p className="text-sm text-gray-500">
            {search ? 'Try adjusting your search' : 'Get started by adding a contact'}
          </p>
        </div>
      )}
    </div>
  );
}
