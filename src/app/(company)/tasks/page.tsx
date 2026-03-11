'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Button, Tag, Checkbox, Select, message } from 'antd';
import { PlusOutlined, CalendarOutlined, UserOutlined, ExclamationCircleOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { TaskResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const priorityColors: Record<string, string> = { high: 'red', medium: 'orange', low: 'green' };

export default function TasksPage() {
  const t = useTranslations('tasks');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tStatuses = useTranslations('statuses');
  const tCommon = useTranslations('common');

  const [data, setData] = useState<PaginatedResponse<TaskResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { loadTasks(); }, [page, search, status]);

  const loadTasks = async () => {
    try {
      const result = await apiClient.getTasks({ page, page_size: 20, search: search || undefined, status_filter: status || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load tasks:', error); message.error(tErrors('failedToLoadTasks')); }
    finally { setLoading(false); }
  };

  const toggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try { if (!isCompleted) await apiClient.completeTask(taskId); loadTasks(); } catch { message.error(tErrors('failedToUpdateTask')); }
  };

  const isOverdue = (dueDate?: string | null) => dueDate ? new Date(dueDate) < new Date() : false;

  if (loading) return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 w-full md:max-w-lg bg-gray-50 rounded-lg animate-pulse" />
        <div className="h-10 w-full sm:w-44 bg-gray-50 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card p-4 flex items-start gap-4">
            <div className="w-4 h-4 rounded bg-gray-100 animate-pulse mt-1" />
            <div className="flex-1">
              <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-72 bg-gray-50 rounded mt-2 animate-pulse" />
              <div className="flex gap-3 mt-2">
                <div className="h-3 w-24 bg-gray-50 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-12 bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Link href="/tasks/new"><Button type="primary" icon={<PlusOutlined />}>{t('addTask')}</Button></Link>
      </div>
      <p className="page-subtitle">{t('subtitle')}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input.Search placeholder={t('searchTasks')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} allowClear size="large" className="w-full md:max-w-lg" />
        <Select value={status || undefined} onChange={(v) => { setStatus(v || ''); setPage(1); }} placeholder={tCommon('allStatuses')} allowClear className="w-full sm:w-[180px]" size="large"
          options={[{ label: tStatuses('pending'), value: 'pending' }, { label: tStatuses('inProgress'), value: 'in_progress' }, { label: tStatuses('completed'), value: 'completed' }]}
        />
      </div>

      <div className="space-y-3">
        {data?.items.map((task) => (
          <div key={task.id} className={`glass-card p-4 flex items-start gap-3 sm:gap-4 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
            <Checkbox
              checked={task.status === 'completed'}
              onChange={() => toggleTaskComplete(task.id, task.status === 'completed')}
              className="mt-1 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                <div className="min-w-0">
                  <h3 className={`font-semibold truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h3>
                  {task.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.priority && <Tag color={priorityColors[task.priority.toLowerCase()] || 'default'}>{task.priority}</Tag>}
                  {task.due_date && isOverdue(task.due_date) && task.status !== 'completed' && <ExclamationCircleOutlined className="text-red-500" />}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
                {task.due_date && (
                  <span className={`flex items-center gap-1 ${isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-600' : ''}`}>
                    <CalendarOutlined /> {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
                {task.assigned_to_name && <span className="flex items-center gap-1"><UserOutlined /> {task.assigned_to_name}</span>}
                {task.entity_type && task.entity_id && <Tag>{task.entity_type}: {task.entity_id}</Tag>}
              </div>
            </div>
            <Link href={`/tasks/${task.id}`}><Button type="text" size="small">{tActions('view')}</Button></Link>
          </div>
        ))}
      </div>

      {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {data?.items.length === 0 && (
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={160} height={160} variant="confused" />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{t('noTasksFound')}</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
            {search || status ? tCommon('tryAdjustingFilters') : t('getStarted')}
          </p>
        </div>
      )}
    </div>
  );
}
