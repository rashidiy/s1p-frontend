'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined, CheckOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Modal, Select, Tag, message } from 'antd';
import { apiClient } from '@/lib/api';
import type { TaskResponse, UserResponse } from '@/types/api';
import Link from 'next/link';

const priorityColors: Record<string, string> = {
  low: 'green', medium: 'blue', high: 'orange', urgent: 'red',
};
const statusColors: Record<string, string> = {
  pending: 'blue', in_progress: 'orange', completed: 'green', cancelled: 'default',
};

export default function TaskDetailPage() {
  const params = useParams()!;
  const router = useRouter();
  const id = params.id as string;

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    due_date: '',
    entity_type: '',
    entity_id: '',
    assigned_to: '',
    priority: '',
  });

  useEffect(() => {
    loadTask();
    loadUsers();
  }, [id]);

  const loadTask = async () => {
    try {
      const data = await apiClient.getTask(id);
      setTask(data);
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        due_date: data.due_date ? data.due_date.slice(0, 16) : '',
        entity_type: data.entity_type || '',
        entity_id: data.entity_id || '',
        assigned_to: data.assigned_to || '',
        priority: data.priority || '',
      });
    } catch {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({});
      setUsers(result.users || []);
    } catch {
      message.error('Failed to load users');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateTask(id, {
        title: editForm.title,
        description: editForm.description || null,
        due_date: editForm.due_date ? new Date(editForm.due_date).toISOString() : null,
        entity_type: editForm.entity_type || null,
        entity_id: editForm.entity_id || null,
        assigned_to: editForm.assigned_to || null,
        priority: editForm.priority || null,
      } as any);
      setEditing(false);
      loadTask();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await apiClient.completeTask(id);
      loadTask();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete task');
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure?',
      content: 'Are you sure you want to delete this task? This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleting(true);
        try {
          await apiClient.deleteTask(id);
          router.push('/tasks');
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to delete task');
          setDeleting(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-56 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 space-y-4">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" style={{ width: `${75 - i * 15}%` }} />
            ))}
          </div>
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-3">
              <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-50 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-50 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="glass-card p-6 space-y-3">
              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-9 bg-gray-50 rounded-lg animate-pulse" />
              <div className="h-9 bg-gray-50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return <div className="p-6">Task not found</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError('')} className="!rounded-xl" />
      )}

      <div className="page-header">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/tasks">
            <Button size="small" type="text">
              <ArrowLeftOutlined style={{ marginRight: 4 }} />
              Back
            </Button>
          </Link>
          {task.status && (
            <Tag color={statusColors[task.status] || 'default'}>{task.status.replace('_', ' ')}</Tag>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!editing && (
            <Button type="default"  onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Task Details</h3>
            </div>
            <div className="p-6 pt-0">
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Input.TextArea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <Select
                      value={editForm.priority}
                      onChange={(val) => setEditForm({ ...editForm, priority: val })}
                      placeholder="Select priority..."
                      style={{ width: "100%" }}
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                        { value: "urgent", label: "Urgent" },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <Input
                      type="datetime-local"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Assigned To</label>
                    <Select
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="Select user..."
                      value={editForm.assigned_to || undefined}
                      onChange={(val) => setEditForm({ ...editForm, assigned_to: val || '' })}
                      options={users.map(u => ({
                        value: u.id,
                        label: `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}`,
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Entity Type</label>
                    <Select
                      value={editForm.entity_type}
                      onChange={(val) => setEditForm({ ...editForm, entity_type: val })}
                      placeholder="Select entity type..."
                      style={{ width: "100%" }}
                      options={[
                        { value: "contact", label: "Contact" },
                        { value: "lead", label: "Lead" },
                        { value: "deal", label: "Deal" },
                      ]}
                    />
                  </div>
                  {editForm.entity_type && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{editForm.entity_type.charAt(0).toUpperCase() + editForm.entity_type.slice(1)} ID</label>
                      <Input
                        value={editForm.entity_id}
                        onChange={(e) => setEditForm({ ...editForm, entity_id: e.target.value })}
                        placeholder={`Enter ${editForm.entity_type} ID...`}
                      />
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button type="primary" onClick={handleSave} loading={saving} icon={<SaveOutlined />}>Save</Button>
                    <Button type="default" onClick={() => { setEditing(false); loadTask(); }} icon={<CloseOutlined />}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {task.description && (
                    <div>
                      <span className="text-sm text-gray-500">Description</span>
                      <p className="mt-1">{task.description}</p>
                    </div>
                  )}
                  {task.due_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Due Date</span>
                      <span>{new Date(task.due_date).toLocaleString()}</span>
                    </div>
                  )}
                  {task.assigned_to_name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Assigned To</span>
                      <span>{task.assigned_to_name}</span>
                    </div>
                  )}
                  {!task.description && !task.due_date && !task.assigned_to_name && (
                    <p className="text-sm text-gray-500 text-center py-4">No additional details</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {task.entity_type && task.entity_id && (
            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">Linked Entity</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center gap-3">
                  <LinkOutlined style={{ color: '#6366f1' }} />
                  <Link
                    href={`/${task.entity_type}s/${task.entity_id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View {task.entity_type}: {task.entity_id}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Summary</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Priority</span>
                {task.priority ? (
                  <Tag color={priorityColors[task.priority] || 'default'}>{task.priority}</Tag>
                ) : (
                  <span className="text-sm text-gray-400">Not set</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                {task.status ? (
                  <Tag color={statusColors[task.status] || 'default'}>{task.status.replace('_', ' ')}</Tag>
                ) : (
                  <span className="text-sm text-gray-400">Unknown</span>
                )}
              </div>
              {task.due_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <span className="text-sm">{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
              {task.assigned_to_name && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Assigned To</span>
                  <span className="text-sm">{task.assigned_to_name}</span>
                </div>
              )}
              {task.completed_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completed At</span>
                  <span className="text-sm">{new Date(task.completed_at).toLocaleString()}</span>
                </div>
              )}
              <div className="text-sm text-gray-500 pt-2">
                Created: {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Actions</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <Button type="default"
                className="w-full"
                onClick={handleComplete}
                disabled={completing || task.status === 'completed'}>
                <CheckOutlined style={{ marginRight: 8 }} />
                {completing ? 'Completing...' : task.status === 'completed' ? 'Already Completed' : 'Mark Complete'}
              </Button>
              <Button type="primary" danger
                className="w-full"
                onClick={handleDelete}
                disabled={deleting}>
                <DeleteOutlined style={{ marginRight: 8 }} />
                {deleting ? 'Deleting...' : 'Delete Task'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
