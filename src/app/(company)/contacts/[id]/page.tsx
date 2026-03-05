'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, FundProjectionScreenOutlined, UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Spin, Modal } from 'antd';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { ContactResponse, NoteResponse } from '@/types/api';
import Link from 'next/link';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermissionString } = useAuthStore();
  const contactId = params.id as string;

  const [contact, setContact] = useState<ContactResponse | null>(null);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [callPhone, setCallPhone] = useState('');
  const [calling, setCalling] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    position: '',
    source: '',
  });

  useEffect(() => {
    loadContact();
    loadNotes();
    loadActivity();
  }, [contactId]);

  const loadContact = async () => {
    try {
      const data = await apiClient.getContact(contactId);
      setContact(data);
      setEditForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        company_name: data.company_name || '',
        position: data.position || '',
        source: data.source || '',
      });
    } catch (error) {
      console.error('Failed to load contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const data = await apiClient.getEntityNotes('contact', contactId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const loadActivity = async () => {
    try {
      const data = await apiClient.getContactActivity(contactId);
      setActivity(data);
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.updateContact(contactId, {
        first_name: editForm.first_name || null,
        last_name: editForm.last_name || null,
        email: editForm.email || null,
        phone: editForm.phone || null,
        company_name: editForm.company_name || null,
        position: editForm.position || null,
        source: editForm.source || null,
      });
      setEditing(false);
      loadContact();
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await apiClient.createNote({
        content: newNote,
        entity_type: 'contact',
        entity_id: contactId,
      });
      setNewNote('');
      loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await apiClient.deleteContact(contactId);
      router.push('/contacts');
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  if (!contact) {
    return <div className="p-6">Contact not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
          <h1 className="text-3xl font-bold gradient-text">
            {contact.first_name} {contact.last_name}
          </h1>
        </div>
        <div className="flex gap-2">
          {hasPermissionString('contacts.write') && !editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              Edit
            </Button>
          )}
          {hasPermissionString('contacts.delete') && (
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
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={editForm.company_name}
                      onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Input
                      value={editForm.source}
                      onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 flex gap-2">
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
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <MailOutlined style={{ color: '#9ca3af' }} />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneOutlined style={{ color: '#9ca3af' }} />
                      <span>{contact.phone}</span>
                      <Button
                        size="sm"
                        onClick={() => { setCallPhone(contact.phone || ''); setCallModalVisible(true); }}
                        className="ml-2"
                      >
                        <PhoneOutlined style={{ marginRight: 4 }} />
                        Call
                      </Button>
                    </div>
                  )}
                  {contact.company_name && (
                    <div className="flex items-center gap-3">
                      <FundProjectionScreenOutlined style={{ color: '#9ca3af' }} />
                      <span>{contact.company_name}</span>
                      {contact.position && <span className="text-gray-500">- {contact.position}</span>}
                    </div>
                  )}
                  {contact.source && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">Source:</span>
                      <Badge variant="outline">{contact.source}</Badge>
                    </div>
                  )}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 pt-2">
                    Created: {new Date(contact.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
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

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Leads</span>
                <Badge variant="secondary">{contact.total_leads ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Deals</span>
                <Badge variant="secondary">{contact.total_deals ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Calls</span>
                <Badge variant="outline">{contact.total_calls ?? 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <p>{item.description || item.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at || item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        title="Make Call"
        open={callModalVisible}
        onCancel={() => setCallModalVisible(false)}
        footer={null}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={callPhone} onChange={(e) => setCallPhone(e.target.value)} placeholder="+1234567890" />
          </div>
          <Button
            disabled={calling || !callPhone}
            onClick={async () => {
              setCalling(true);
              try {
                await apiClient.makeCall({ phone_1: callPhone, phone_2: callPhone });
                setCallModalVisible(false);
              } catch (err: any) {
                console.error(err);
              } finally {
                setCalling(false);
              }
            }}
          >
            <PhoneOutlined style={{ marginRight: 8 }} />
            {calling ? 'Calling...' : 'Make Call'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
