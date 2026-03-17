'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined, CheckOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Modal, Select, Tag, message } from 'antd';
import { apiClient } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import type { TaskResponse, UserResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const priorityColors: Record<string, string> = {
  low: 'green', medium: 'blue', high: 'orange', urgent: 'red',
};
const statusColors: Record<string, string> = {
  pending: 'blue', in_progress: 'orange', completed: 'green', cancelled: 'default',
};

export default function TaskDetailPage() {
  const params = useParams()!;
  const router = useRouter();
  const { hasPermissionString } = useAuthStore();
  const id = params.id as string;

  const t = useTranslations('tasks');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tPriorities = useTranslations('priorities');
  const tStatuses = useTranslations('statuses');
  const tEntities = useTranslations('entities');
  const tDashboard = useTranslations('dashboard');

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when ID changes
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
      setError(tErrors('failedToLoadTask'));
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await apiClient.getUsers({});
      setUsers(result.items || []);
    } catch {
      message.error(tErrors('failedToLoadUsers'));
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
      message.success(t('taskUpdated'));
      setEditing(false);
      loadTask();
    } catch (err: unknown) {
      setError(getErrorMessage(err, tErrors('failedToUpdateTask')));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await apiClient.completeTask(id);
      message.success(t('taskUpdated'));
      loadTask();
    } catch (err: unknown) {
      setError(getErrorMessage(err, tErrors('failedToUpdateTask')));
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: tCommon('areYouSure'),
      content: t('confirmDeleteTask'),
      okText: tActions('delete'),
      cancelText: tActions('cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeleting(true);
        try {
          await apiClient.deleteTask(id);
          message.success(t('taskDeleted'));
          router.push('/tasks');
        } catch (err: unknown) {
          setError(getErrorMessage(err, tErrors('failedToDeleteTask')));
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
    return (
      <div className="glass-card py-16 flex flex-col items-center justify-center">
        <EmptyStateCharacter height={115} variant="confused" />
        <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('notFoundTitle')}</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">{tErrors('notFoundSubtitle')}</p>
        <Link href="/tasks"><Button type="primary" className="mt-4">{tErrors('goBack')}</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" title={error} showIcon closable onClose={() => setError('')} className="!rounded-xl" />
      )}

      <div className="page-header">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/tasks">
            <Button size="small" type="text">
              <ArrowLeftOutlined style={{ marginRight: 4 }} />
              {tActions('back')}
            </Button>
          </Link>
          {task.status && (
            <Tag color={statusColors[task.status] || 'default'}>{task.status.replace('_', ' ')}</Tag>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {hasPermissionString('tasks.write') && !editing && (
            <Button type="default"  onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              {tActions('edit')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('taskInformation')}</h3>
            </div>
            <div className="p-6 pt-0">
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{tFields('title')}</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{tFields('description')}</label>
                    <Input.TextArea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{tFields('priority')}</label>
                    <Select
                      value={editForm.priority}
                      onChange={(val) => setEditForm({ ...editForm, priority: val })}
                      placeholder={tFields('priority')}
                      style={{ width: "100%" }}
                      options={[
                        { value: "low", label: tPriorities('low') },
                        { value: "medium", label: tPriorities('medium') },
                        { value: "high", label: tPriorities('high') },
                        { value: "urgent", label: tPriorities('urgent') },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{tFields('dueDate')}</label>
                    <Input
                      type="datetime-local"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{tFields('assignedTo')}</label>
                    <Select
                      allowClear
                      style={{ width: '100%' }}
                      placeholder={tFields('assignedTo')}
                      value={editForm.assigned_to || undefined}
                      onChange={(val) => setEditForm({ ...editForm, assigned_to: val || '' })}
                      options={users.map(u => ({
                        value: u.id,
                        label: `${u.first_name || ''}${u.last_name ? ' ' + u.last_name : ''}`.trim() || '—',
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{tFields('entityType')}</label>
                    <Select
                      value={editForm.entity_type}
                      onChange={(val) => setEditForm({ ...editForm, entity_type: val })}
                      placeholder={tFields('entityType')}
                      style={{ width: "100%" }}
                      options={[
                        { value: "contact", label: tEntities('contact') },
                        { value: "lead", label: tEntities('lead') },
                        { value: "deal", label: tEntities('deal') },
                      ]}
                    />
                  </div>
                  {editForm.entity_type && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{editForm.entity_type.charAt(0).toUpperCase() + editForm.entity_type.slice(1)} {tFields('entityId')}</label>
                      <Input
                        value={editForm.entity_id}
                        onChange={(e) => setEditForm({ ...editForm, entity_id: e.target.value })}
                        placeholder={`${tFields('entityId')}...`}
                      />
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button type="primary" onClick={handleSave} loading={saving} icon={<SaveOutlined />}>{tActions('save')}</Button>
                    <Button type="default" onClick={() => { setEditing(false); loadTask(); }} icon={<CloseOutlined />}>{tActions('cancel')}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {task.description && (
                    <div>
                      <span className="text-sm text-gray-500">{tFields('description')}</span>
                      <p className="mt-1">{task.description}</p>
                    </div>
                  )}
                  {task.due_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{tFields('dueDate')}</span>
                      <span>{new Date(task.due_date).toLocaleString()}</span>
                    </div>
                  )}
                  {task.assigned_to_name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{tFields('assignedTo')}</span>
                      <span>{task.assigned_to_name}</span>
                    </div>
                  )}
                  {!task.description && !task.due_date && !task.assigned_to_name && (
                    <p className="text-sm text-gray-500 text-center py-4">{tCommon('noDataFound')}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {task.entity_type && task.entity_id && (
            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">{tFields('linkedEntity')}</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center gap-3">
                  <LinkOutlined style={{ color: '#6366f1' }} />
                  <Link
                    href={`/${task.entity_type}s/${task.entity_id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {tActions('view')} {task.entity_type}: {task.entity_id}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{tCommon('summary')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{tFields('priority')}</span>
                {task.priority ? (
                  <Tag color={priorityColors[task.priority] || 'default'}>{task.priority}</Tag>
                ) : (
                  <span className="text-sm text-gray-400">{tCommon('noDataFound')}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{tFields('status')}</span>
                {task.status ? (
                  <Tag color={statusColors[task.status] || 'default'}>{task.status.replace('_', ' ')}</Tag>
                ) : (
                  <span className="text-sm text-gray-400">{tCommon('unknown')}</span>
                )}
              </div>
              {task.due_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{tFields('dueDate')}</span>
                  <span className="text-sm">{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
              {task.assigned_to_name && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{tFields('assignedTo')}</span>
                  <span className="text-sm">{task.assigned_to_name}</span>
                </div>
              )}
              {task.completed_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{tStatuses('completed')}</span>
                  <span className="text-sm">{new Date(task.completed_at).toLocaleString()}</span>
                </div>
              )}
              <div className="text-sm text-gray-500 pt-2">
                {tFields('created')}: {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{tDashboard('quickActions')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              {hasPermissionString('tasks.write') && (
                <Button type="default"
                  className="w-full"
                  onClick={handleComplete}
                  disabled={completing || task.status === 'completed'}>
                  <CheckOutlined style={{ marginRight: 8 }} />
                  {completing ? `${tStatuses('completed')}...` : task.status === 'completed' ? tStatuses('completed') : tStatuses('completed')}
                </Button>
              )}
              {hasPermissionString('tasks.delete') && (
                <Button type="primary" danger
                  className="w-full"
                  onClick={handleDelete}
                  disabled={deleting}>
                  <DeleteOutlined style={{ marginRight: 8 }} />
                  {deleting ? `${tActions('delete')}...` : t('deleteTask')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
