'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Button, Tag, message } from 'antd';
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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
      message.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-full md:max-w-lg bg-gray-50 rounded-lg animate-pulse" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-5 border-l-4 border-l-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                <div>
                  <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-50 rounded mt-1.5 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-40 bg-gray-50 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-50 rounded animate-pulse" />
                <div className="h-8 w-full bg-gray-100 rounded-lg mt-3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Link href="/contacts/new">
          <Button type="primary" icon={<PlusOutlined />}>Add Contact</Button>
        </Link>
      </div>
      <p className="page-subtitle">Manage your contact database</p>

      <Input.Search
        placeholder="Search contacts..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        allowClear
        size="large"
        className="w-full md:max-w-lg"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={160} height={160} variant="no-contacts" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">No contacts found</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {search ? 'Try adjusting your search criteria' : 'Add your first contact to start building your database'}
          </p>
        </div>
      )}
    </div>
  );
}
