'use client';

import { useEffect, useState } from 'react';
import { Input, Pagination, Spin, Button, Tag, Checkbox } from 'antd';
import { PlusOutlined, CalendarOutlined, UserOutlined, ExclamationCircleOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import type { TaskResponse, PaginatedResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';

const priorityColors: Record<string, string> = { high: 'red', medium: 'orange', low: 'green' };

export default function TasksPage() {
  const [data, setData] = useState<PaginatedResponse<TaskResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { loadTasks(); }, [page, search]);

  const loadTasks = async () => {
    try {
      const result = await apiClient.getTasks({ page, page_size: 20, search: search || undefined });
      setData(result);
    } catch (error) { console.error('Failed to load tasks:', error); }
    finally { setLoading(false); }
  };

  const toggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try { if (!isCompleted) await apiClient.completeTask(taskId); loadTasks(); } catch {}
  };

  const isOverdue = (dueDate?: string | null) => dueDate ? new Date(dueDate) < new Date() : false;

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
          <p className="text-gray-500">Manage your to-do list</p>
        </div>
        <Link href="/tasks/new"><Button type="primary" icon={<PlusOutlined />}>Add Task</Button></Link>
      </div>

      <Input.Search placeholder="Search tasks..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} allowClear size="large" className="max-w-lg" />

      <div className="space-y-3">
        {data?.items.map((task) => (
          <div key={task.id} className={`glass-card p-4 flex items-start gap-4 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
            <Checkbox
              checked={task.status === 'completed'}
              onChange={() => toggleTaskComplete(task.id, task.status === 'completed')}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h3>
                  {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                </div>
                <div className="flex items-center gap-2">
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
            <Link href={`/tasks/${task.id}`}><Button type="text" size="small">View</Button></Link>
          </div>
        ))}
      </div>

      {data && data.total_pages > 1 && <div className="flex justify-center"><Pagination current={page} total={data.total} pageSize={20} onChange={(p) => setPage(p)} showSizeChanger={false} /></div>}

      {data?.items.length === 0 && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter width={150} height={150} />
          <p className="mt-4 text-lg font-medium text-gray-700">No tasks found</p>
          <p className="text-sm text-gray-500">{search ? 'Try adjusting your search' : 'Get started by adding a task'}</p>
        </div>
      )}
    </div>
  );
}
