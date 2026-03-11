'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { UserResponse } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, DatePicker, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [priority, setPriority] = useState('medium');
  const [entityType, setEntityType] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({});
      setUsers(result.users || []);
    } catch {
      message.error('Failed to load users');
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
      router.push(`/tasks/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create task');
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
              Back
            </Button>
          </Link>
          <p className="page-subtitle">Create a new task</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Task Information</h3>
          <p className="text-sm text-gray-400">Enter the details for the new task</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" closable onClose={() => setError('')} />
            )}

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</label>
              <Input id="title" name="title" type="text" placeholder="Follow up call" required disabled={isLoading} size="large" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <Input.TextArea id="description" name="description" placeholder="Call customer about..." disabled={isLoading} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select value={priority} onChange={setPriority} style={{ width: "100%" }} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }]} size="large" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="due_date" className="text-sm font-medium text-gray-700">Due Date</label>
                <DatePicker id="due_date" showTime className="w-full" format="YYYY-MM-DD HH:mm" value={dueDate ? dayjs(dueDate) : null} onChange={(date) => setDueDate(date ? date.toISOString() : '')} disabled={isLoading} size="large" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Assigned To</label>
                <Select allowClear style={{ width: '100%' }} placeholder="Select user..." value={assignedTo || undefined} onChange={(val) => setAssignedTo(val || null)} options={users.map(u => ({ value: u.id, label: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` }))} disabled={isLoading} size="large" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Linked Entity Type</label>
                <Select value={entityType} onChange={setEntityType} placeholder="Select entity type..." style={{ width: "100%" }} options={[{ value: "contact", label: "Contact" }, { value: "lead", label: "Lead" }, { value: "deal", label: "Deal" }]} size="large" />
              </div>
              {entityType && (
                <div className="space-y-1.5">
                  <label htmlFor="entity_id" className="text-sm font-medium text-gray-700">
                    {entityType.charAt(0).toUpperCase() + entityType.slice(1)} ID
                  </label>
                  <Input id="entity_id" name="entity_id" type="text" placeholder={`Enter ${entityType} ID...`} disabled={isLoading} size="large" />
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <Button type="primary" htmlType="submit" loading={isLoading} size="large">
                Create Task
              </Button>
              <Link href="/tasks">
                <Button type="default" htmlType="button" disabled={isLoading} size="large">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
