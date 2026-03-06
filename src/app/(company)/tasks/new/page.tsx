'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { UserResponse } from '@/types/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select, Select } from 'antd';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [priority, setPriority] = useState('medium');
  const [entityType, setEntityType] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({});
      setUsers(result.users || []);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const due_date = formData.get('due_date') as string;
    const entity_id = formData.get('entity_id') as string;

    try {
      const result = await apiClient.createTask({
        title,
        description: description || null,
        due_date: due_date ? new Date(due_date).toISOString() : null,
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
      <div className="flex items-center space-x-4">
        <Link href="/tasks">
          <Button size="middle" style={{ width: 40, height: 40, padding: 0 }} type="text">
            <ArrowLeftOutlined />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">New Task</h1>
          <p className="text-gray-500">Create a new task</p>
        </div>
      </div>

      <div className="glass-card p-0 max-w-2xl">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Task Information</h3>
          <p className="text-sm text-muted-foreground">Enter the details for the new task</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error" message={error} showIcon className="!rounded-xl" />
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title *</label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Follow up call"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input.TextArea
                id="description"
                name="description"
                placeholder="Call customer about..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                  value={priority}
                  onChange={setPriority}
                  style={{ width: "100%" }}
                  options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }]}
                />
            </div>

            <div className="space-y-2">
              <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
              <Input
                id="due_date"
                name="due_date"
                type="datetime-local"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned To</label>
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder="Select user..."
                value={assignedTo || undefined}
                onChange={(val) => setAssignedTo(val || null)}
                options={users.map(u => ({
                  value: u.id,
                  label: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}`,
                }))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Linked Entity Type</label>
              <Select
                  value={entityType}
                  onChange={setEntityType}
                  placeholder="Select entity type..."
                  style={{ width: "100%" }}
                  options={[{ value: "contact", label: "Contact" }, { value: "lead", label: "Lead" }, { value: "deal", label: "Deal" }]}
                />
            </div>

            {entityType && (
              <div className="space-y-2">
                <label htmlFor="entity_id" className="text-sm font-medium">
                  {entityType.charAt(0).toUpperCase() + entityType.slice(1)} ID
                </label>
                <Input
                  id="entity_id"
                  name="entity_id"
                  type="text"
                  placeholder={`Enter ${entityType} ID...`}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="flex space-x-3">
              <Button htmlType="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Task'}
              </Button>
              <Link href="/tasks">
                <Button type="default" htmlType="button"  disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
