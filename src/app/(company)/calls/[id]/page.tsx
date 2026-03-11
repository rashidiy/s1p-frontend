'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input, Select, Spin, Tag, message } from 'antd';
import { ArrowLeftOutlined, PhoneOutlined, LinkOutlined, SearchOutlined } from '@ant-design/icons';
import { PhoneIncoming, PhoneOutgoing } from '@/components/icons/custom-icons';
import { apiClient } from '@/lib/api';
import { CALL_DIRECTION_LABELS, CALL_STATUS_LABELS } from '@/lib/constants';
import type { CallEventResponse } from '@/types/api';
import Link from 'next/link';

const OUTCOME_OPTIONS = [
  { value: 'interested', label: 'Interested', group: 'positive' },
  { value: 'appointment_scheduled', label: 'Appointment Scheduled', group: 'positive' },
  { value: 'follow_up', label: 'Follow Up', group: 'positive' },
  { value: 'sale_made', label: 'Sale Made', group: 'positive' },
  { value: 'no_answer', label: 'No Answer', group: 'neutral' },
  { value: 'left_voicemail', label: 'Left Voicemail', group: 'neutral' },
  { value: 'busy', label: 'Busy', group: 'neutral' },
  { value: 'callback_requested', label: 'Callback Requested', group: 'neutral' },
  { value: 'information_provided', label: 'Information Provided', group: 'neutral' },
  { value: 'not_interested', label: 'Not Interested', group: 'negative' },
  { value: 'wrong_number', label: 'Wrong Number', group: 'negative' },
  { value: 'do_not_call', label: 'Do Not Call', group: 'negative' },
  { value: 'customer_complaint', label: 'Customer Complaint', group: 'negative' },
  { value: 'other', label: 'Other', group: 'other' },
];

const outcomeColors: Record<string, string> = {
  interested: 'green',
  appointment_scheduled: 'green',
  follow_up: 'cyan',
  sale_made: 'gold',
  no_answer: 'orange',
  left_voicemail: 'orange',
  busy: 'orange',
  callback_requested: 'blue',
  information_provided: 'blue',
  not_interested: 'red',
  wrong_number: 'red',
  do_not_call: 'volcano',
  customer_complaint: 'magenta',
  other: 'default',
};

const stateColors: Record<string, string> = {
  ANSWER: 'green',
  NOANSWER: 'orange',
  BUSY: 'red',
  CANCEL: 'default',
  CONGESTION: 'red',
  CHANUNAVAIL: 'default',
};

export default function CallDetailPage() {
  const params = useParams()!;
  const router = useRouter();
  const callId = params.id as string;

  const [call, setCall] = useState<CallEventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState('');
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [savingOutcome, setSavingOutcome] = useState(false);
  const [linkType, setLinkType] = useState<'contact' | 'lead' | 'deal'>('contact');
  const [linkEntityId, setLinkEntityId] = useState('');
  const [linkSearchResults, setLinkSearchResults] = useState<any[]>([]);
  const [linking, setLinking] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadCall();
  }, [callId]);

  const loadCall = async () => {
    try {
      const data = await apiClient.getCall(callId);
      setCall(data);
      if (data.outcome) setOutcome(data.outcome);
      if (data.disposition_notes) setDispositionNotes(data.disposition_notes);
      const phone = data.phone_2 || data.phone_1;
      if (phone) {
        try {
          const sugg = await apiClient.getAutoLinkSuggestions(phone);
          setSuggestions(sugg);
        } catch {
          console.error('Failed to load auto-link suggestions');
        }
      }
    } catch (e) {
      console.error(e);
      message.error('Failed to load call');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutcome = async () => {
    setSavingOutcome(true);
    try {
      await apiClient.setCallOutcome(callId, { outcome, disposition_notes: dispositionNotes || null });
      message.success('Outcome saved successfully');
      loadCall();
    } catch (err) {
      message.error('Failed to save outcome');
    } finally {
      setSavingOutcome(false);
    }
  };

  const handleLink = async () => {
    if (!linkEntityId) return;
    setLinking(true);
    try {
      const linkData: any = {};
      linkData[linkType + '_id'] = linkEntityId;
      await apiClient.linkCall(callId, linkData);
      message.success('Call linked successfully');
      setLinkEntityId('');
      setLinkSearchResults([]);
      loadCall();
    } catch (err) {
      message.error('Failed to link call');
    } finally {
      setLinking(false);
    }
  };

  const handleLinkSuggestion = async (type: string, id: string) => {
    try {
      const linkData: any = {};
      linkData[type + '_id'] = id;
      await apiClient.linkCall(callId, linkData);
      message.success('Call linked successfully');
      loadCall();
    } catch (err) {
      message.error('Failed to link call');
    }
  };

  const searchEntities = async (query: string) => {
    if (!query || query.length < 2) {
      setLinkSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      let results: any[] = [];
      if (linkType === 'contact') {
        const res = await apiClient.getContacts({ search: query, page: 1, page_size: 10 });
        results = res.items.map((c: any) => ({ id: c.id, label: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || c.phone || 'Unknown' }));
      } else if (linkType === 'lead') {
        const res = await apiClient.getLeads({ search: query, page: 1, page_size: 10 });
        results = res.items.map((l: any) => ({ id: l.id, label: l.title || 'Untitled Lead' }));
      } else if (linkType === 'deal') {
        const res = await apiClient.getDeals({ search: query, page: 1, page_size: 10 });
        results = res.items.map((d: any) => ({ id: d.id, label: d.title || 'Untitled Deal' }));
      }
      setLinkSearchResults(results);
    } catch {
      setLinkSearchResults([]);
      message.error('Failed to search entities');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '\u2014';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimestamp = (ts?: number | null) => {
    if (!ts) return '\u2014';
    return new Date(ts * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-14 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-6 w-32 bg-gray-50 rounded animate-pulse" />
                <div className="h-5 w-5 bg-gray-50 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-12 bg-gray-50 rounded animate-pulse mb-2" />
                    <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 space-y-3">
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-9 bg-gray-50 rounded-lg animate-pulse" />
              <div className="h-20 bg-gray-50 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="glass-card p-6 space-y-3">
            <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-16 bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!call) {
    return <div className="p-6">Call not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 flex-wrap">
          <Button size="small" type="text"   onClick={() => router.push('/calls')}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            Back to Calls
          </Button>
          {call.direction && (
            <Tag color={call.direction === 'inbound' ? 'blue' : call.direction === 'outbound' ? 'green' : 'default'}>
              {CALL_DIRECTION_LABELS[call.direction] || call.direction}
            </Tag>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Call Information */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Call Information</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-lg">{call.phone_1 || 'Unknown'}</span>
                {call.direction === 'inbound' ? (
                  <PhoneIncoming style={{ color: '#10b981', fontSize: 20 }} />
                ) : (
                  <PhoneOutgoing style={{ color: '#3b82f6', fontSize: 20 }} />
                )}
                <span className="font-medium text-lg">{call.phone_2 || 'Unknown'}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500 block">State</span>
                  {call.state ? (
                    <Tag color={stateColors[call.state] || 'default'}>{CALL_STATUS_LABELS[call.state] || call.state}</Tag>
                  ) : (
                    <span className="text-gray-400">{'\u2014'}</span>
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Duration</span>
                  <span className="font-medium">{formatDuration(call.billing_sec)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Timestamp</span>
                  <span className="font-medium">{formatTimestamp(call.call_start_timestamp)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Provider</span>
                  <Tag>{call.provider_type}</Tag>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Attempts</span>
                  <span className="font-medium">{call.attempts}</span>
                </div>
              </div>

              {call.has_recording && (
                <div className="mt-4">
                  <Button size="small" type="default"
                    onClick={async () => {
                      try {
                        const recUrl = await apiClient.getCallRecording(callId);
                        window.open(recUrl, '_blank');
                      } catch {
                        message.error('Failed to load recording');
                      }
                    }}
                  >
                    Play Recording
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Set Call Outcome */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Set Call Outcome</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              {call.outcome && (
                <div>
                  <span className="text-sm text-gray-500 mr-2">Current outcome:</span>
                  <Tag color={outcomeColors[call.outcome] || 'default'}>
                    {OUTCOME_OPTIONS.find(o => o.value === call.outcome)?.label || call.outcome}
                  </Tag>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Outcome</label>
                <Select
                  value={outcome || undefined}
                  onChange={(v) => setOutcome(v)}
                  placeholder="Select outcome..."
                  style={{ width: '100%' }}
                  options={[
                    { label: 'Positive', options: OUTCOME_OPTIONS.filter(o => o.group === 'positive').map(o => ({ value: o.value, label: o.label })) },
                    { label: 'Neutral', options: OUTCOME_OPTIONS.filter(o => o.group === 'neutral').map(o => ({ value: o.value, label: o.label })) },
                    { label: 'Negative', options: OUTCOME_OPTIONS.filter(o => o.group === 'negative').map(o => ({ value: o.value, label: o.label })) },
                    { label: 'Other', options: OUTCOME_OPTIONS.filter(o => o.group === 'other').map(o => ({ value: o.value, label: o.label })) },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Disposition Notes</label>
                <Input.TextArea
                  value={dispositionNotes}
                  onChange={(e) => setDispositionNotes(e.target.value)}
                  placeholder="Notes about the call..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveOutcome} disabled={!outcome || savingOutcome}>
                {savingOutcome ? 'Saving...' : 'Save Outcome'}
              </Button>
            </div>
          </div>

          {/* Link to CRM Entity */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Link to CRM Entity</h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex flex-wrap gap-2">
                {call.contact_id && (
                  <Link href={`/contacts/${call.contact_id}`}>
                    <Tag color="blue" className="cursor-pointer">Contact: {call.contact_id}</Tag>
                  </Link>
                )}
                {call.lead_id && (
                  <Link href={`/leads/${call.lead_id}`}>
                    <Tag color="green" className="cursor-pointer">Lead: {call.lead_id}</Tag>
                  </Link>
                )}
                {call.deal_id && (
                  <Link href={`/deals/${call.deal_id}`}>
                    <Tag color="purple" className="cursor-pointer">Deal: {call.deal_id}</Tag>
                  </Link>
                )}
                {!call.contact_id && !call.lead_id && !call.deal_id && (
                  <span className="text-sm text-gray-500">No linked entities</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Entity Type</label>
                  <Select
                    value={linkType}
                    onChange={(v) => { setLinkType(v); setLinkEntityId(''); setLinkSearchResults([]); }}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'contact', label: 'Contact' },
                      { value: 'lead', label: 'Lead' },
                      { value: 'deal', label: 'Deal' },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Entity</label>
                  <Select
                    showSearch
                    value={linkEntityId || undefined}
                    placeholder={`Search ${linkType}s...`}
                    filterOption={false}
                    onSearch={searchEntities}
                    onChange={(v) => setLinkEntityId(v)}
                    loading={searchLoading}
                    style={{ width: '100%' }}
                    options={linkSearchResults.map(r => ({ value: r.id, label: r.label }))}
                    notFoundContent={searchLoading ? <Spin size="small" /> : null}
                  />
                </div>
                <Button onClick={handleLink} disabled={!linkEntityId || linking}>
                  <LinkOutlined style={{ marginRight: 8 }} />
                  {linking ? 'Linking...' : 'Link'}
                </Button>
              </div>
            </div>
          </div>

          {/* Auto-Link Suggestions */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Auto-Link Suggestions</h3>
            </div>
            <div className="p-6 pt-0">
              {suggestions ? (
                <div className="space-y-3">
                  {suggestions.contacts?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">Contacts</span>
                      {suggestions.contacts.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <span>{c.first_name || ''} {c.last_name || ''} {c.phone ? `(${c.phone})` : ''}</span>
                          <Button size="small" type="default"   onClick={() => handleLinkSuggestion('contact', c.id)}>
                            <LinkOutlined style={{ marginRight: 4 }} /> Link
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {suggestions.leads?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">Leads</span>
                      {suggestions.leads.map((l: any) => (
                        <div key={l.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <span>{l.title || 'Untitled Lead'}</span>
                          <Button size="small" type="default"   onClick={() => handleLinkSuggestion('lead', l.id)}>
                            <LinkOutlined style={{ marginRight: 4 }} /> Link
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {suggestions.deals?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">Deals</span>
                      {suggestions.deals.map((d: any) => (
                        <div key={d.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <span>{d.title || 'Untitled Deal'}</span>
                          <Button size="small" type="default"   onClick={() => handleLinkSuggestion('deal', d.id)}>
                            <LinkOutlined style={{ marginRight: 4 }} /> Link
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!suggestions.contacts?.length && !suggestions.leads?.length && !suggestions.deals?.length) && (
                    <p className="text-sm text-gray-500 text-center py-4">No suggestions found</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No suggestions found</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Call Summary */}
          <div className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-base font-semibold leading-none tracking-tight">Call Summary</h3>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Outcome</span>
                {call.outcome ? (
                  <Tag color={outcomeColors[call.outcome] || 'default'}>
                    {OUTCOME_OPTIONS.find(o => o.value === call.outcome)?.label || call.outcome}
                  </Tag>
                ) : (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Duration</span>
                <span className="font-medium">{formatDuration(call.billing_sec)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Direction</span>
                <span className="font-medium">{call.direction ? CALL_DIRECTION_LABELS[call.direction] || call.direction : '\u2014'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">State</span>
                {call.state ? (
                  <Tag color={stateColors[call.state] || 'default'}>{CALL_STATUS_LABELS[call.state] || call.state}</Tag>
                ) : (
                  <span className="text-gray-400">{'\u2014'}</span>
                )}
              </div>
              <div className="border-t pt-3 mt-3 space-y-2">
                <span className="text-sm text-gray-500 block">Linked to:</span>
                {call.contact_id ? (
                  <Link href={`/contacts/${call.contact_id}`} className="text-sm text-blue-600 hover:underline block">
                    Contact
                  </Link>
                ) : null}
                {call.lead_id ? (
                  <Link href={`/leads/${call.lead_id}`} className="text-sm text-blue-600 hover:underline block">
                    Lead
                  </Link>
                ) : null}
                {call.deal_id ? (
                  <Link href={`/deals/${call.deal_id}`} className="text-sm text-blue-600 hover:underline block">
                    Deal
                  </Link>
                ) : null}
                {!call.contact_id && !call.lead_id && !call.deal_id && (
                  <span className="text-sm text-gray-400">None</span>
                )}
              </div>
            </div>
          </div>

          {/* UTM Tracking */}
          {(call.utm_source || call.utm_medium || call.utm_campaign) && (
            <div className="glass-card p-0">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-base font-semibold leading-none tracking-tight">UTM Tracking</h3>
              </div>
              <div className="p-6 pt-0 space-y-3">
                {call.utm_source && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Source</span>
                    <Tag bordered>{call.utm_source}</Tag>
                  </div>
                )}
                {call.utm_medium && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Medium</span>
                    <Tag bordered>{call.utm_medium}</Tag>
                  </div>
                )}
                {call.utm_campaign && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Campaign</span>
                    <Tag bordered>{call.utm_campaign}</Tag>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
