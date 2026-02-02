'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, PhoneIncoming, PhoneOutgoing, GitBranch } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { SipuniResponse, CallNumberRequest, ExternalCallRequest, CallTreeRequest } from '@/types/api';

type CallType = 'internal' | 'external' | 'tree';

export default function CallsPage() {
  const [integrations, setIntegrations] = useState<SipuniResponse[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [callType, setCallType] = useState<CallType>('internal');
  const [loading, setLoading] = useState(false);

  // Internal call form
  const [internalForm, setInternalForm] = useState({
    phone: '',
    sip_number: '',
    reverse: false,
    antiaon: false,
  });

  // External call form
  const [externalForm, setExternalForm] = useState({
    phone1: '',
    phone2: '',
    bridge_start: '201',
    bridge_end: '201',
  });

  // Call tree form
  const [treeForm, setTreeForm] = useState({
    phone: '',
    sip_number: '',
    tree: '',
    reverse: false,
    attempt_duration: 30,
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await apiClient.getSipuniList();
      setIntegrations(data);
      if (data.length > 0) {
        setSelectedIntegration(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const getSelectedToken = () => {
    const integration = integrations.find((i) => i.id === selectedIntegration);
    return integration?.token || '';
  };

  const handleInternalCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: CallNumberRequest = {
        token: getSelectedToken(),
        ...internalForm,
      };
      await apiClient.makeInternalCall(data);
      alert('Internal call initiated successfully!');
      setInternalForm({ phone: '', sip_number: '', reverse: false, antiaon: false });
    } catch (error: any) {
      alert(`Failed to initiate call: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExternalCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: ExternalCallRequest = {
        token: getSelectedToken(),
        ...externalForm,
      };
      await apiClient.makeExternalCall(data);
      alert('External call initiated successfully!');
      setExternalForm({ phone1: '', phone2: '', bridge_start: '201', bridge_end: '201' });
    } catch (error: any) {
      alert(`Failed to initiate call: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTreeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: CallTreeRequest = {
        token: getSelectedToken(),
        ...treeForm,
      };
      await apiClient.makeCallTree(data);
      alert('Call tree initiated successfully!');
      setTreeForm({ phone: '', sip_number: '', tree: '', reverse: false, attempt_duration: 30 });
    } catch (error: any) {
      alert(`Failed to initiate call: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (integrations.length === 0) {
    return (
      <AppLayout>
        <div className="p-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Phone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No integrations available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please add a SIPUNI integration first to make calls
              </p>
              <Button onClick={() => window.location.href = '/integrations'}>
                Go to Integrations
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Calls</h1>
          <p className="text-muted-foreground mt-2">
            Initiate calls through your SIPUNI integrations
          </p>
        </div>

        <div className="mb-6">
          <Label>Select Integration</Label>
          <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
            <SelectTrigger className="w-full max-w-md mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {integrations.map((integration) => (
                <SelectItem key={integration.id} value={integration.id}>
                  {integration.company_name} ({integration.cabinet_id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Button
            variant={callType === 'internal' ? 'default' : 'outline'}
            className="h-auto py-4"
            onClick={() => setCallType('internal')}
          >
            <div className="flex flex-col items-center gap-2">
              <PhoneIncoming className="h-5 w-5" />
              <span>Internal Call</span>
            </div>
          </Button>
          <Button
            variant={callType === 'external' ? 'default' : 'outline'}
            className="h-auto py-4"
            onClick={() => setCallType('external')}
          >
            <div className="flex flex-col items-center gap-2">
              <PhoneOutgoing className="h-5 w-5" />
              <span>External Call</span>
            </div>
          </Button>
          <Button
            variant={callType === 'tree' ? 'default' : 'outline'}
            className="h-auto py-4"
            onClick={() => setCallType('tree')}
          >
            <div className="flex flex-col items-center gap-2">
              <GitBranch className="h-5 w-5" />
              <span>Call Tree</span>
            </div>
          </Button>
        </div>

        {callType === 'internal' && (
          <Card>
            <CardHeader>
              <CardTitle>Internal Call</CardTitle>
              <CardDescription>
                Make an internal call to a phone number via SIP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInternalCall} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={internalForm.phone}
                      onChange={(e) => setInternalForm({ ...internalForm, phone: e.target.value })}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sip_number">SIP Number *</Label>
                    <Input
                      id="sip_number"
                      value={internalForm.sip_number}
                      onChange={(e) => setInternalForm({ ...internalForm, sip_number: e.target.value })}
                      placeholder="201"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={internalForm.reverse}
                      onChange={(e) => setInternalForm({ ...internalForm, reverse: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Reverse</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={internalForm.antiaon}
                      onChange={(e) => setInternalForm({ ...internalForm, antiaon: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Anti-AON</span>
                  </label>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Initiating...' : 'Make Call'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {callType === 'external' && (
          <Card>
            <CardHeader>
              <CardTitle>External Call</CardTitle>
              <CardDescription>
                Connect two external phone numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExternalCall} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone1">Phone 1 *</Label>
                    <Input
                      id="phone1"
                      value={externalForm.phone1}
                      onChange={(e) => setExternalForm({ ...externalForm, phone1: e.target.value })}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone2">Phone 2 *</Label>
                    <Input
                      id="phone2"
                      value={externalForm.phone2}
                      onChange={(e) => setExternalForm({ ...externalForm, phone2: e.target.value })}
                      placeholder="+0987654321"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bridge_start">Bridge Start</Label>
                    <Input
                      id="bridge_start"
                      value={externalForm.bridge_start}
                      onChange={(e) => setExternalForm({ ...externalForm, bridge_start: e.target.value })}
                      placeholder="201"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bridge_end">Bridge End</Label>
                    <Input
                      id="bridge_end"
                      value={externalForm.bridge_end}
                      onChange={(e) => setExternalForm({ ...externalForm, bridge_end: e.target.value })}
                      placeholder="201"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Initiating...' : 'Make Call'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {callType === 'tree' && (
          <Card>
            <CardHeader>
              <CardTitle>Call Tree</CardTitle>
              <CardDescription>
                Execute a call tree with multiple attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTreeCall} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tree_phone">Phone Number *</Label>
                    <Input
                      id="tree_phone"
                      value={treeForm.phone}
                      onChange={(e) => setTreeForm({ ...treeForm, phone: e.target.value })}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tree_sip">SIP Number *</Label>
                    <Input
                      id="tree_sip"
                      value={treeForm.sip_number}
                      onChange={(e) => setTreeForm({ ...treeForm, sip_number: e.target.value })}
                      placeholder="201"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tree">Tree Configuration *</Label>
                    <Input
                      id="tree"
                      value={treeForm.tree}
                      onChange={(e) => setTreeForm({ ...treeForm, tree: e.target.value })}
                      placeholder="201,202,203"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attempt_duration">Attempt Duration (seconds)</Label>
                    <Input
                      id="attempt_duration"
                      type="number"
                      min="30"
                      value={treeForm.attempt_duration}
                      onChange={(e) => setTreeForm({ ...treeForm, attempt_duration: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={treeForm.reverse}
                      onChange={(e) => setTreeForm({ ...treeForm, reverse: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Reverse</span>
                  </label>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Initiating...' : 'Execute Call Tree'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
