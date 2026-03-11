'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, FundProjectionScreenOutlined, UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Tag, message, App } from 'antd';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { ContactResponse, NoteResponse } from '@/types/api';
import Link from 'next/link';

export default function ContactDetailPage() {
  const params = useParams()!;
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
      message.error('Failed to load contact');
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
      message.error('Failed to load notes');
    }
  };

  const loadActivity = async () => {
    try {
      const data = await apiClient.getContactActivity(contactId);
      setActivity(data);
    } catch (error) {
      console.error('Failed to load activity:', error);
      message.error('Failed to load activity');
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
      message.error('Failed to update contact');
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
      message.error('Failed to add note');
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure?',
      content: 'Are you sure you want to delete this contact? This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiClient.deleteContact(contactId);
          router.push('/contacts');
        } catch (error) {
          console.error('Failed to delete contact:', error);
          message.error('Failed to delete contact');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" style={{ width: `${70 - i * 10}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="glass-card p-6 space-y-3">
            <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-16 bg-gray-50 rounded animate-pulse" />
                <div className="h-5 w-8 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return <div className="p-6">Contact not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Button size="small" type="text"   onClick={() => router.push('/contacts')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasPermissionString('contacts.write') && !editing && (
            <Button type="default"  onClick={() => setEditing(true)}>
              <EditOutlined style={{ marginRight: 8 }} />
              Edit
            </Button>
          )}
          {hasPermissionString('contacts.delete') && (
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
              <h3 className="text-base font-semibold leading-none tracking-tight">Contact Information</h3>
            </div>
            <div className="p-6 pt-0">
              {editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <Input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} size="large" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <Input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} size="large" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} size="large" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} size="large" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Company</label>
                    <Input value={editForm.company_name} onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })} size="large" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <Input value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} size="large" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Source</label>
                    <Input value={editForm.source} onChange={(e) => setEditForm({ ...editForm, source: e.target.value })} size="large" />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <Button type="primary" onClick={handleSave} icon={<SaveOutlined />}>Save</Button>
                    <Button type="default" onClick={() => setEditing(false)} icon={<CloseOutlined />}>Cancel</Button>
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
                      <Button size="small"
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
                      <Tag bordered>{contact.source}</Tag>
                    </div>
                  )}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag) => (
                        <Tag key={tag} >{tag}</Tag>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 pt-2">
                    Created: {new Date(contact.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Notes</h3>
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

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Summary</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Leads</span>
                <Tag >{contact.total_leads ?? 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Deals</span>
                <Tag >{contact.total_deals ?? 0}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Calls</span>
                <Tag bordered>{contact.total_calls ?? 0}</Tag>
              </div>
            </div>
          </div>

          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Activity Timeline</h3>
            </div>
            <div className="p-6 pt-0">
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
            </div>
          </div>
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
            <label className="text-sm font-medium">Phone Number</label>
            <Input value={callPhone} onChange={(e) => setCallPhone(e.target.value)} placeholder="+1234567890" />
          </div>
          <Button disabled={calling || !callPhone}
            onClick={async () => {
              setCalling(true);
              try {
                await apiClient.makeCall({ phone_1: callPhone, phone_2: callPhone });
                setCallModalVisible(false);
              } catch (err: any) {
                console.error(err);
                message.error('Failed to make call');
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
