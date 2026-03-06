'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined, CheckOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Spin, Tag, Alert, Select as AntSelect } from 'antd';
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
  const params = useParams();
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
    } catch {}
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setDeleting(true);
    try {
      await apiClient.deleteTask(id);
      router.push('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete task');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  if (!task) {
    return <div className="p-6">Task not found</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError('')} className="!rounded-xl" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeftOutlined style={{ marginRight: 4 }} />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">{task.title}</h1>
          {task.status && (
            <Tag color={statusColors[task.status] || 'default'}>{task.status.replace('_', ' ')}</Tag>
          )}
        </div>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={editForm.priority} onValueChange={(val) => setEditForm({ ...editForm, priority: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="datetime-local"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <AntSelect
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
                    <Label>Entity Type</Label>
                    <Select value={editForm.entity_type} onValueChange={(val) => setEditForm({ ...editForm, entity_type: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="deal">Deal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editForm.entity_type && (
                    <div className="space-y-2">
                      <Label>{editForm.entity_type.charAt(0).toUpperCase() + editForm.entity_type.slice(1)} ID</Label>
                      <Input
                        value={editForm.entity_id}
                        onChange={(e) => setEditForm({ ...editForm, entity_id: e.target.value })}
                        placeholder={`Enter ${editForm.entity_type} ID...`}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      <SaveOutlined style={{ marginRight: 8 }} />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditing(false); loadTask(); }}>
                      <CloseOutlined style={{ marginRight: 8 }} />
                      Cancel
                    </Button>
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
            </CardContent>
          </Card>

          {task.entity_type && task.entity_id && (
            <Card>
              <CardHeader>
                <CardTitle>Linked Entity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <LinkOutlined style={{ color: '#6366f1' }} />
                  <Link
                    href={`/${task.entity_type}s/${task.entity_id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View {task.entity_type}: {task.entity_id}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={handleComplete}
                disabled={completing || task.status === 'completed'}
                variant={task.status === 'completed' ? 'outline' : 'default'}
              >
                <CheckOutlined style={{ marginRight: 8 }} />
                {completing ? 'Completing...' : task.status === 'completed' ? 'Already Completed' : 'Mark Complete'}
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <DeleteOutlined style={{ marginRight: 8 }} />
                {deleting ? 'Deleting...' : 'Delete Task'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
