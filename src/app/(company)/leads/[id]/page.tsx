'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftOutlined, DollarOutlined, UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, PlusOutlined, RightCircleOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LEAD_STATUS_COLORS } from '@/lib/constants';
import type { LeadResponse, NoteResponse } from '@/types/api';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermissionString } = useAuthStore();
  const leadId = params.id as string;

  const [lead, setLead] = useState<LeadResponse | null>(null);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [converting, setConverting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    estimated_value: '',
    source: '',
  });

  useEffect(() => {
    loadLead();
    loadNotes();
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
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.updateLead(leadId, {
        title: editForm.title || null,
        description: editForm.description || null,
        estimated_value: editForm.estimated_value ? parseFloat(editForm.estimated_value) : null,
        source: editForm.source || null,
      });
      setEditing(false);
      loadLead();
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const handleConvert = async () => {
    if (!confirm('Convert this lead to a deal?')) return;
    setConverting(true);
    try {
      await apiClient.convertLead(leadId, true);
      loadLead();
    } catch (error) {
      console.error('Failed to convert lead:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await apiClient.createNote({
        content: newNote,
        entity_type: 'lead',
        entity_id: leadId,
      });
      setNewNote('');
      loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await apiClient.deleteLead(leadId);
      router.push('/leads');
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  if (!lead) return <div className="p-6">Lead not found</div>;

  const statusColor = LEAD_STATUS_COLORS[lead.status?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
          <h1 className="text-3xl font-bold gradient-text">{lead.title}</h1>
          {lead.status && <Badge className={statusColor}>{lead.status}</Badge>}
        </div>
        <div className="flex gap-2">
          {lead.status !== 'converted' && hasPermissionString('leads.write') && (
            <Button onClick={handleConvert} disabled={converting}>
              <RightCircleOutlined style={{ marginRight: 8 }} />
              {converting ? 'Converting...' : 'Convert to Deal'}
            </Button>
          )}
          {hasPermissionString('leads.write') && !editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              Edit
            </Button>
          )}
          {hasPermissionString('leads.delete') && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estimated Value</Label>
                      <Input
                        type="number"
                        value={editForm.estimated_value}
                        onChange={(e) => setEditForm({ ...editForm, estimated_value: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Input
                        value={editForm.source}
                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <SaveOutlined style={{ marginRight: 8 }} />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      <CloseOutlined style={{ marginRight: 8 }} />
                      Cancel
                    </Button>
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
                      <span>{lead.contact_name}</span>
                    </div>
                  )}
                  {lead.pipeline_stage && (
                    <div className="text-sm">
                      <span className="text-gray-500">Pipeline Stage: </span>
                      <span className="font-medium">{lead.pipeline_stage}</span>
                    </div>
                  )}
                  {lead.assigned_to_name && (
                    <div className="text-sm">
                      <span className="text-gray-500">Assigned to: </span>
                      <span className="font-medium">{lead.assigned_to_name}</span>
                    </div>
                  )}
                  {lead.source && <Badge variant="outline">{lead.source}</Badge>}
                  {lead.tags && lead.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 pt-2">
                    Created: {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
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
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <Badge className={statusColor}>{lead.status || 'N/A'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span>{new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Updated</span>
                <span>{new Date(lead.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
