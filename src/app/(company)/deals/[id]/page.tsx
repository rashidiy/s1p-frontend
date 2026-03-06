'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, DollarOutlined, UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, PlusOutlined, TrophyOutlined, CloseCircleOutlined, RiseOutlined } from '@ant-design/icons';
import { Button, Input, Spin, Tag } from 'antd';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { DEAL_STAGE_COLORS } from '@/lib/constants';
import type { DealResponse, NoteResponse } from '@/types/api';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermissionString } = useAuthStore();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
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
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.updateDeal(dealId, {
        title: editForm.title || null,
        description: editForm.description || null,
        amount: editForm.amount ? parseFloat(editForm.amount) : null,
        probability: editForm.probability ? parseFloat(editForm.probability) : null,
        expected_close_date: editForm.expected_close_date || null,
      });
      setEditing(false);
      loadDeal();
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  };

  const handleWin = async () => {
    const reason = prompt('Win reason (optional):');
    try {
      await apiClient.markDealWon(dealId, reason || undefined);
      loadDeal();
    } catch (error) {
      console.error('Failed to mark deal as won:', error);
    }
  };

  const handleLose = async () => {
    const reason = prompt('Loss reason (optional):');
    try {
      await apiClient.markDealLost(dealId, reason || undefined);
      loadDeal();
    } catch (error) {
      console.error('Failed to mark deal as lost:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await apiClient.createNote({
        content: newNote,
        entity_type: 'deal',
        entity_id: dealId,
      });
      setNewNote('');
      loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await apiClient.deleteDeal(dealId);
      router.push('/deals');
    } catch (error) {
      console.error('Failed to delete deal:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  if (!deal) return <div className="p-6">Deal not found</div>;

  const stageColor = DEAL_STAGE_COLORS[deal.stage?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800';
  const isClosedDeal = deal.stage === 'won' || deal.stage === 'lost';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button size="small" type="text"   onClick={() => router.back()}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
          <h1 className="text-3xl font-bold gradient-text">{deal.title}</h1>
          {deal.stage && <Tag className={stageColor}>{deal.stage}</Tag>}
        </div>
        <div className="flex gap-2">
          {!isClosedDeal && hasPermissionString('deals.write') && (
            <>
              <Button type="primary"  onClick={handleWin} className="bg-green-600 hover:bg-green-700">
                <TrophyOutlined style={{ marginRight: 8 }} />
                Won
              </Button>
              <Button type="primary" danger  onClick={handleLose}>
                <CloseCircleOutlined style={{ marginRight: 8 }} />
                Lost
              </Button>
            </>
          )}
          {hasPermissionString('deals.write') && !editing && (
            <Button type="default"  onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              Edit
            </Button>
          )}
          {hasPermissionString('deals.delete') && (
            <Button type="primary" danger  onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Deal Information</h3>
            </div>
            <div className="p-6 pt-0">
              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input.TextArea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Probability (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.probability}
                        onChange={(e) => setEditForm({ ...editForm, probability: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expected Close Date</label>
                      <Input
                        type="date"
                        value={editForm.expected_close_date}
                        onChange={(e) => setEditForm({ ...editForm, expected_close_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <SaveOutlined style={{ marginRight: 8 }} />
                      Save
                    </Button>
                    <Button type="default"  onClick={() => setEditing(false)}>
                      <CloseOutlined style={{ marginRight: 8 }} />
                      Cancel
                    </Button>
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
                      <span className="font-medium">{deal.probability}% probability</span>
                      {deal.weighted_value != null && (
                        <span className="text-sm text-gray-500">
                          (Weighted: ${deal.weighted_value.toLocaleString()})
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
                      <span className="text-gray-500">Owner: </span>
                      <span className="font-medium">{deal.assigned_to_name}</span>
                    </div>
                  )}
                  {deal.expected_close_date && (
                    <div className="text-sm">
                      <span className="text-gray-500">Expected Close: </span>
                      <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {deal.closed_date && (
                    <div className="text-sm">
                      <span className="text-gray-500">Closed: </span>
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
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Notes</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex gap-2">
                <Input.TextArea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
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
                <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Details</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stage</span>
                <Tag className={stageColor}>{deal.stage || 'N/A'}</Tag>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">${deal.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span>{new Date(deal.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Updated</span>
                <span>{new Date(deal.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
