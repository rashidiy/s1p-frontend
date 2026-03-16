'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { UserResponse } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, DatePicker, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/utils';

export default function NewTaskPage() {
  const router = useRouter();

  const t = useTranslations('tasks');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tPriorities = useTranslations('priorities');
  const tEntities = useTranslations('entities');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [priority, setPriority] = useState('medium');
  const [entityType, setEntityType] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load on mount only
  }, []);

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({});
      setUsers(result.items || []);
    } catch {
      message.error(tErrors('failedToLoadUsers'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const entity_id = formData.get('entity_id') as string;

    try {
      const result = await apiClient.createTask({
        title,
        description: description || null,
        due_date: dueDate ? dayjs(dueDate).toISOString() : null,
        entity_type: entityType || null,
        entity_id: entity_id || null,
        assigned_to: assignedTo || null,
      });
      message.success(t('taskCreated'));
      router.push(`/tasks/${result.id}`);
    } catch (err) {
      setError(getErrorMessage(err, tErrors('failedToCreateTask')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button size="small" type="text">
              <ArrowLeftOutlined style={{ marginRight: 4 }} />
              {tActions('back')}
            </Button>
          </Link>
          <p className="page-subtitle">{t('newTaskSubtitle')}</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">{t('taskInformation')}</h3>
          <p className="text-sm text-gray-400">{t('enterTaskDetails')}</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">{tFields('title')} *</label>
              <Input id="title" name="title" type="text" placeholder={tFields('title')} required disabled={isLoading} size="large" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">{tFields('description')}</label>
              <Input.TextArea id="description" name="description" placeholder={tFields('description')} disabled={isLoading} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('priority')}</label>
                <Select value={priority} onChange={setPriority} style={{ width: "100%" }} options={[{ value: "low", label: tPriorities('low') }, { value: "medium", label: tPriorities('medium') }, { value: "high", label: tPriorities('high') }, { value: "urgent", label: tPriorities('urgent') }]} size="large" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="due_date" className="text-sm font-medium text-gray-700">{tFields('dueDate')}</label>
                <DatePicker id="due_date" showTime className="w-full" format="YYYY-MM-DD HH:mm" value={dueDate ? dayjs(dueDate) : null} onChange={(date) => setDueDate(date ? date.toISOString() : '')} disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{tFields('assignedTo')}</label>
                <Select allowClear style={{ width: '100%' }} placeholder={tFields('assignedTo')} value={assignedTo || undefined} onChange={(val) => setAssignedTo(val || null)} options={users.map(u => ({ value: u.id, label: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` }))} disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{t('linkedEntityType')}</label>
                <Select value={entityType} onChange={setEntityType} placeholder={tFields('entityType')} style={{ width: "100%" }} options={[{ value: "contact", label: tEntities('contact') }, { value: "lead", label: tEntities('lead') }, { value: "deal", label: tEntities('deal') }]} size="large" />
              </div>
              {entityType && (
                <div className="space-y-1.5">
                  <label htmlFor="entity_id" className="text-sm font-medium text-gray-700">
                    {entityType.charAt(0).toUpperCase() + entityType.slice(1)} {tFields('entityId')}
                  </label>
                  <Input id="entity_id" name="entity_id" type="text" placeholder={`${tFields('entityId')}...`} disabled={isLoading} size="large" />
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <Button type="primary" htmlType="submit" loading={isLoading} size="large">
                {t('createTask')}
              </Button>
              <Link href="/tasks">
                <Button type="default" htmlType="button" disabled={isLoading} size="large">{tActions('cancel')}</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
