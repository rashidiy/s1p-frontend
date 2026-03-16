'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, DollarOutlined, UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, PlusOutlined, RightCircleOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Tag, message } from 'antd';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LEAD_STATUS_COLORS } from '@/lib/constants';
import type { LeadResponse, NoteResponse } from '@/types/api';
import { EmptyStateCharacter } from '@/components/illustrations';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LeadDetailPage() {
  const t = useTranslations('leads');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');

  const params = useParams()!;
  const router = useRouter();
  const { hasPermissionString } = useAuthStore();
  const leadId = params.id as string;

  const [lead, setLead] = useState<LeadResponse | null>(null);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [converting, setConverting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    estimated_value: '',
    source: '',
  });

  useEffect(() => {
    loadLead();
    loadNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when ID changes
  }, [leadId]);

  const loadLead = async () => {
    try {
      const data = await apiClient.getLead(leadId);
      setLead(data);
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        estimated_value: data.estimated_value?.toString() || '',
        source: data.source || '',
      });
    } catch (error) {
      console.error('Failed to load lead:', error);
      message.error(tErrors('failedToLoadLead'));
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const data = await apiClient.getEntityNotes('lead', leadId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
      message.error(tErrors('failedToLoadNotes'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateLead(leadId, {
        title: editForm.title || null,
        description: editForm.description || null,
        estimated_value: editForm.estimated_value ? parseFloat(editForm.estimated_value) : null,
        source: editForm.source || null,
      });
      message.success(t('leadUpdated'));
      setEditing(false);
      loadLead();
    } catch (error) {
      console.error('Failed to update lead:', error);
      message.error(tErrors('failedToUpdateLead'));
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = () => {
    Modal.confirm({
      title: t('convertLead'),
      content: t('convertLeadConfirm'),
      okText: tActions('convert'),
      cancelText: tActions('cancel'),
      onOk: async () => {
        setConverting(true);
        try {
          await apiClient.convertLead(leadId, true);
          message.success(t('leadConverted'));
          loadLead();
        } catch (error) {
          console.error('Failed to convert lead:', error);
          message.error(tErrors('failedToConvertLead'));
        } finally {
          setConverting(false);
        }
      },
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await apiClient.createNote({
        content: newNote,
        entity_type: 'lead',
        entity_id: leadId,
      });
      message.success(t('noteAdded'));
      setNewNote('');
      loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
      message.error(tErrors('failedToAddNote'));
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: tCommon('areYouSure'),
      content: t('confirmDeleteLead'),
      okText: tActions('delete'),
      cancelText: tActions('cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiClient.deleteLead(leadId);
          message.success(t('leadDeleted'));
          router.push('/leads');
        } catch (error) {
          console.error('Failed to delete lead:', error);
          message.error(tErrors('failedToDeleteLead'));
        }
      },
    });
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-56 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
          ))}
        </div>
        <div className="glass-card p-6 space-y-3">
          <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-16 bg-gray-50 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  if (!lead) return (
    <div className="glass-card py-16 flex flex-col items-center justify-center">
      <EmptyStateCharacter height={115} variant="confused" />
      <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('notFoundTitle')}</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">{tErrors('notFoundSubtitle')}</p>
      <Button type="primary" className="mt-4" onClick={() => router.push('/leads')}>{tErrors('goBack')}</Button>
    </div>
  );

  const statusColor = LEAD_STATUS_COLORS[lead.status?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4 flex-wrap">
          <Button size="small" type="text"   onClick={() => router.push('/leads')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            {tActions('back')}
          </Button>
          {lead.status && <Tag className={statusColor}>{lead.status}</Tag>}
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.status !== 'converted' && hasPermissionString('leads.write') && (
            <Button onClick={handleConvert} disabled={converting}>
              <RightCircleOutlined style={{ marginRight: 8 }} />
              {converting ? tActions('changing') : t('convertLead')}
            </Button>
          )}
          {hasPermissionString('leads.write') && !editing && (
            <Button type="default"  onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              {tActions('edit')}
            </Button>
          )}
          {hasPermissionString('leads.delete') && (
            <Button type="primary" danger  onClick={handleDelete}>
              {tActions('delete')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('leadInformation')}</h3>
            </div>
            <div className="p-6 pt-0">
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">{tFields('title')}</label>
                    <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} size="large" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">{tFields('description')}</label>
                    <Input.TextArea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">{tFields('estimatedValue')}</label>
                      <Input type="number" value={editForm.estimated_value} onChange={(e) => setEditForm({ ...editForm, estimated_value: e.target.value })} size="large" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">{tFields('source')}</label>
                      <Input value={editForm.source} onChange={(e) => setEditForm({ ...editForm, source: e.target.value })} size="large" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button type="primary" onClick={handleSave} loading={saving} icon={<SaveOutlined />}>{tActions('save')}</Button>
                    <Button type="default" onClick={() => setEditing(false)} icon={<CloseOutlined />}>{tActions('cancel')}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {lead.description && <p className="text-sm">{lead.description}</p>}
                  {lead.estimated_value && (
                    <div className="flex items-center gap-2">
                      <DollarOutlined style={{ color: '#16a34a' }} />
                      <span className="text-lg font-semibold">${lead.estimated_value.toLocaleString()}</span>
                      {lead.currency && <span className="text-gray-500">{lead.currency}</span>}
                    </div>
                  )}
                  {lead.contact_name && (
                    <div className="flex items-center gap-2">
                      <UserOutlined style={{ color: '#9ca3af' }} />
                      {lead.contact_id ? (
                        <Link href={`/contacts/${lead.contact_id}`} className="text-indigo-600 hover:underline">
                          {lead.contact_name}
                        </Link>
                      ) : (
                        <span>{lead.contact_name}</span>
                      )}
                    </div>
                  )}
                  {lead.pipeline_stage && (
                    <div className="text-sm">
                      <span className="text-gray-500">{tFields('stage')}: </span>
                      <span className="font-medium">{lead.pipeline_stage}</span>
                    </div>
                  )}
                  {lead.assigned_to_name && (
                    <div className="text-sm">
                      <span className="text-gray-500">{tFields('assignedTo')}: </span>
                      <span className="font-medium">{lead.assigned_to_name}</span>
                    </div>
                  )}
                  {lead.source && <Tag bordered>{lead.source}</Tag>}
                  {lead.tags && lead.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.map((tag) => (
                        <Tag key={tag} >{tag}</Tag>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 pt-2">
                    {tFields('created')}: {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{tFields('notes')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex gap-2">
                <Input.TextArea
                  placeholder={t('writeNote')}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()} aria-label={tActions('add')}>
                  <PlusOutlined />
                </Button>
              </div>
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-3">
                  <p className="text-sm">{note.content}</p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{note.created_by_name}</span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">{tCommon('noNotesYet')}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{tCommon('details')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tFields('status')}</span>
                <Tag className={statusColor}>{lead.status || 'N/A'}</Tag>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tFields('created')}</span>
                <span>{new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tFields('updated')}</span>
                <span>{new Date(lead.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
