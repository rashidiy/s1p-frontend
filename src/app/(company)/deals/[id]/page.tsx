'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, DollarOutlined, UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, PlusOutlined, TrophyOutlined, CloseCircleOutlined, RiseOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Tag, message } from 'antd';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { DEAL_STAGE_COLORS } from '@/lib/constants';
import type { DealResponse, NoteResponse } from '@/types/api';
import { useTranslations } from 'next-intl';

export default function DealDetailPage() {
  const params = useParams()!;
  const router = useRouter();
  const { hasPermissionString } = useAuthStore();
  const dealId = params.id as string;

  const t = useTranslations('deals');
  const tFields = useTranslations('fields');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tEntities = useTranslations('entities');

  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    amount: '',
    probability: '',
    expected_close_date: '',
  });

  useEffect(() => {
    loadDeal();
    loadNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when ID changes
  }, [dealId]);

  const loadDeal = async () => {
    try {
      const data = await apiClient.getDeal(dealId);
      setDeal(data);
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        amount: data.amount?.toString() || '',
        probability: data.probability?.toString() || '',
        expected_close_date: data.expected_close_date || '',
      });
    } catch (error) {
      console.error('Failed to load deal:', error);
      message.error(tErrors('failedToLoadDeal'));
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const data = await apiClient.getEntityNotes('deal', dealId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
      message.error(tErrors('failedToLoadNotes'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateDeal(dealId, {
        title: editForm.title || null,
        description: editForm.description || null,
        amount: editForm.amount ? parseFloat(editForm.amount) : null,
        probability: editForm.probability ? parseFloat(editForm.probability) : null,
        expected_close_date: editForm.expected_close_date || null,
      });
      message.success(t('dealUpdated'));
      setEditing(false);
      loadDeal();
    } catch (error) {
      console.error('Failed to update deal:', error);
      message.error(tErrors('failedToUpdateDeal'));
    } finally {
      setSaving(false);
    }
  };

  const handleWin = () => {
    setReasonInput('');
    Modal.confirm({
      title: t('markAsWon'),
      content: (
        <div className="mt-2">
          <label className="text-sm text-gray-600">{t('winReason')}:</label>
          <Input
            placeholder={t('winReason')}
            className="mt-1"
            onChange={(e) => {
              // Store in a closure-accessible ref via DOM
              const modal = document.querySelector('.ant-modal-confirm-content input') as HTMLInputElement;
              if (modal) modal.dataset.value = e.target.value;
            }}
          />
        </div>
      ),
      okText: t('markAsWon'),
      cancelText: tActions('cancel'),
      onOk: async () => {
        const input = document.querySelector('.ant-modal-confirm-content input') as HTMLInputElement;
        const reason = input?.value || undefined;
        try {
          await apiClient.markDealWon(dealId, reason);
          message.success(t('dealMarkedWon'));
          loadDeal();
        } catch (error) {
          console.error('Failed to mark deal as won:', error);
          message.error(tErrors('failedToMarkDealAsWon'));
        }
      },
    });
  };

  const handleLose = () => {
    setReasonInput('');
    Modal.confirm({
      title: t('markAsLost'),
      content: (
        <div className="mt-2">
          <label className="text-sm text-gray-600">{t('lossReason')}:</label>
          <Input
            placeholder={t('lossReason')}
            className="mt-1"
            onChange={(e) => {
              const modal = document.querySelector('.ant-modal-confirm-content input') as HTMLInputElement;
              if (modal) modal.dataset.value = e.target.value;
            }}
          />
        </div>
      ),
      okText: t('markAsLost'),
      okButtonProps: { danger: true },
      cancelText: tActions('cancel'),
      onOk: async () => {
        const input = document.querySelector('.ant-modal-confirm-content input') as HTMLInputElement;
        const reason = input?.value || undefined;
        try {
          await apiClient.markDealLost(dealId, reason);
          message.success(t('dealMarkedLost'));
          loadDeal();
        } catch (error) {
          console.error('Failed to mark deal as lost:', error);
          message.error(tErrors('failedToMarkDealAsLost'));
        }
      },
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await apiClient.createNote({
        content: newNote,
        entity_type: 'deal',
        entity_id: dealId,
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
      content: t('confirmDeleteDeal'),
      okText: tActions('delete'),
      cancelText: tActions('cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiClient.deleteDeal(dealId);
          message.success(t('dealDeleted'));
          router.push('/deals');
        } catch (error) {
          console.error('Failed to delete deal:', error);
          message.error(tErrors('failedToDeleteDeal'));
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
  if (!deal) return <div className="p-6">{tErrors('notFoundDetail')}</div>;

  const stageColor = DEAL_STAGE_COLORS[deal.stage?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800';
  const isClosedDeal = deal.stage === 'won' || deal.stage === 'lost';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4 flex-wrap">
          <Button size="small" type="text"   onClick={() => router.push('/deals')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            {tActions('back')}
          </Button>
          {deal.stage && <Tag className={stageColor}>{deal.stage}</Tag>}
        </div>
        <div className="flex flex-wrap gap-2">
          {!isClosedDeal && hasPermissionString('deals.write') && (
            <>
              <Button type="primary"  onClick={handleWin} className="bg-green-600 hover:bg-green-700">
                <TrophyOutlined style={{ marginRight: 8 }} />
                {t('won')}
              </Button>
              <Button type="primary" danger  onClick={handleLose}>
                <CloseCircleOutlined style={{ marginRight: 8 }} />
                {t('lost')}
              </Button>
            </>
          )}
          {hasPermissionString('deals.write') && !editing && (
            <Button type="default"  onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              {tActions('edit')}
            </Button>
          )}
          {hasPermissionString('deals.delete') && (
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
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('dealInformation')}</h3>
            </div>
            <div className="p-6 pt-0">
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">{tFields('title')}</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      size="large"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">{tFields('description')}</label>
                    <Input.TextArea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">{tFields('amount')}</label>
                      <Input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        size="large"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">{tFields('probability')}</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.probability}
                        onChange={(e) => setEditForm({ ...editForm, probability: e.target.value })}
                        size="large"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">{tFields('expectedCloseDate')}</label>
                      <Input
                        type="date"
                        value={editForm.expected_close_date}
                        onChange={(e) => setEditForm({ ...editForm, expected_close_date: e.target.value })}
                        size="large"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button type="primary" onClick={handleSave} loading={saving} icon={<SaveOutlined />}>{tActions('save')}</Button>
                    <Button type="default" onClick={() => setEditing(false)} icon={<CloseOutlined />}>{tActions('cancel')}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {deal.description && <p className="text-sm">{deal.description}</p>}
                  <div className="flex items-center gap-2">
                    <DollarOutlined style={{ fontSize: 20, color: '#16a34a' }} />
                    <span className="text-2xl font-bold text-green-600">
                      ${deal.amount.toLocaleString()}
                    </span>
                    {deal.currency && <span className="text-gray-500">{deal.currency}</span>}
                  </div>
                  {deal.probability != null && (
                    <div className="flex items-center gap-2">
                      <RiseOutlined style={{ color: '#9ca3af' }} />
                      <span className="font-medium">{deal.probability}%</span>
                      {deal.weighted_value != null && (
                        <span className="text-sm text-gray-500">
                          (${deal.weighted_value.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  {deal.contact_name && (
                    <div className="flex items-center gap-2">
                      <UserOutlined style={{ color: '#9ca3af' }} />
                      <span>{deal.contact_name}</span>
                    </div>
                  )}
                  {deal.assigned_to_name && (
                    <div className="text-sm">
                      <span className="text-gray-500">{t('owner')}: </span>
                      <span className="font-medium">{deal.assigned_to_name}</span>
                    </div>
                  )}
                  {deal.expected_close_date && (
                    <div className="text-sm">
                      <span className="text-gray-500">{tFields('expectedCloseDate')}: </span>
                      <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {deal.closed_date && (
                    <div className="text-sm">
                      <span className="text-gray-500">{tFields('close')}: </span>
                      <span>{new Date(deal.closed_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {deal.tags && deal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {deal.tags.map((tag) => (
                        <Tag key={tag} >{tag}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">{tEntities('notes')}</h3>
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
              <h3 className="text-base font-semibold leading-none tracking-tight">{t('details')}</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tFields('stage')}</span>
                <Tag className={stageColor}>{deal.stage || 'N/A'}</Tag>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tFields('amount')}</span>
                <span className="font-medium">${deal.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tFields('created')}</span>
                <span>{new Date(deal.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tFields('updated')}</span>
                <span>{new Date(deal.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
