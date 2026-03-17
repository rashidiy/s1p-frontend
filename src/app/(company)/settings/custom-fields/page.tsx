'use client';

import { useEffect, useState } from 'react';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SaveOutlined,
  CloseOutlined,
  FormOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Input, Select, Switch, Tag, Modal, Tooltip, message, Segmented } from 'antd';
import { apiClient } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { EmptyStateCharacter, ErrorCharacter } from '@/components/illustrations';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import type {
  CustomFieldDefinitionResponse,
  CustomFieldDefinitionCreate,
  CustomFieldDefinitionUpdate,
} from '@/types/api';
import { UserRole } from '@/types/api';

const ENTITY_TYPES = ['contact', 'lead', 'deal', 'task'] as const;

const FIELD_TYPE_OPTIONS = [
  { value: 'text', labelKey: 'fieldTypeText' },
  { value: 'number', labelKey: 'fieldTypeNumber' },
  { value: 'dropdown', labelKey: 'fieldTypeDropdown' },
  { value: 'date', labelKey: 'fieldTypeDate' },
  { value: 'boolean', labelKey: 'fieldTypeBoolean' },
] as const;

const FIELD_TYPE_COLORS: Record<string, string> = {
  text: 'blue',
  number: 'green',
  dropdown: 'purple',
  date: 'orange',
  boolean: 'cyan',
};

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomFieldDefinitionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeEntityType, setActiveEntityType] = useState<string>(ENTITY_TYPES[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    field_name: string;
    field_type: string;
    is_required: boolean;
    options: string[];
  }>({
    field_name: '',
    field_type: 'text',
    is_required: false,
    options: [],
  });
  const [newOption, setNewOption] = useState('');
  const [saving, setSaving] = useState(false);

  const t = useTranslations('settings');
  const tActions = useTranslations('actions');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tFields = useTranslations('fields');
  const tEntities = useTranslations('entities');

  useEffect(() => {
    loadFields();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when entity type changes
  }, [activeEntityType]);

  const loadFields = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiClient.getCustomFields(activeEntityType);
      setFields(data);
    } catch (error) {
      console.error('Failed to load custom fields:', error);
      setError(true);
      message.error(tErrors('failedToLoadCustomFields'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      field_name: '',
      field_type: 'text',
      is_required: false,
      options: [],
    });
    setNewOption('');
    setShowForm(true);
  };

  const handleEdit = (field: CustomFieldDefinitionResponse) => {
    setEditingId(field.id);
    setFormData({
      field_name: field.field_name,
      field_type: field.field_type,
      is_required: field.is_required,
      options: field.options || [],
    });
    setNewOption('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        const updateData: CustomFieldDefinitionUpdate = {
          field_name: formData.field_name,
          is_required: formData.is_required,
          options: formData.field_type === 'dropdown' ? formData.options : null,
        };
        await apiClient.updateCustomField(editingId, updateData);
        message.success(t('fieldUpdated'));
      } else {
        const createData: CustomFieldDefinitionCreate = {
          entity_type: activeEntityType,
          field_name: formData.field_name,
          field_type: formData.field_type,
          is_required: formData.is_required,
          options: formData.field_type === 'dropdown' ? formData.options : undefined,
        };
        await apiClient.createCustomField(createData);
        message.success(t('fieldCreated'));
      }
      setShowForm(false);
      loadFields();
    } catch (error) {
      console.error('Failed to save custom field:', error);
      message.error(tErrors('failedToSaveCustomField'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (fieldId: string) => {
    Modal.confirm({
      title: tCommon('areYouSure'),
      content: t('confirmDeleteField'),
      okText: tActions('delete'),
      cancelText: tActions('cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiClient.deleteCustomField(fieldId);
          message.success(t('fieldDeleted'));
          loadFields();
        } catch (error) {
          console.error('Failed to delete custom field:', error);
          message.error(tErrors('failedToDeleteCustomField'));
        }
      },
    });
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...fields];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    const fieldIds = reordered.map((f) => f.id);
    try {
      await apiClient.reorderCustomFields({ field_ids: fieldIds });
      setFields(reordered);
      message.success(t('fieldsReordered'));
    } catch (error) {
      console.error('Failed to reorder fields:', error);
      message.error(tErrors('failedToReorderFields'));
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === fields.length - 1) return;
    const reordered = [...fields];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    const fieldIds = reordered.map((f) => f.id);
    try {
      await apiClient.reorderCustomFields({ field_ids: fieldIds });
      setFields(reordered);
      message.success(t('fieldsReordered'));
    } catch (error) {
      console.error('Failed to reorder fields:', error);
      message.error(tErrors('failedToReorderFields'));
    }
  };

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && !formData.options.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, trimmed],
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o !== optionToRemove),
    }));
  };

  const segmentedOptions = ENTITY_TYPES.map((et) => ({
    label: tEntities(et),
    value: et,
  }));

  if (error) {
    return (
      <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
        <div className="glass-card py-16 flex flex-col items-center justify-center">
          <ErrorCharacter height={115} />
          <h3 className="mt-5 text-lg font-semibold text-gray-800">{tErrors('somethingWentWrong')}</h3>
          <p className="text-sm text-gray-400 mt-1">{tErrors('tryAgainLater')}</p>
          <Button type="primary" className="mt-4" onClick={() => { setError(false); setLoading(true); loadFields(); }}>
            {tActions('tryAgain')}
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) return (
    <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-gray-50 rounded animate-pulse mt-2" />
          </div>
          <div className="h-9 w-36 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-full max-w-md bg-gray-100 rounded-lg animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-7 w-7 bg-gray-50 rounded animate-pulse" />
                  <div className="h-7 w-7 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-64 bg-gray-50 rounded animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-5 w-20 bg-gray-50 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute requireRole={UserRole.COMPANY_ADMIN}>
    <div className="space-y-6">
      <Link href="/settings">
        <Button type="text" icon={<ArrowLeftOutlined />} className="mb-2">
          {tCommon('backToSettings')}
        </Button>
      </Link>
      <div className="page-header">
        <div>
          <p className="page-subtitle">
            {t('customFieldsSubtitle')}
            <Tooltip title={t('customFieldsHelp')}>
              <QuestionCircleOutlined className="text-gray-400 cursor-help ml-2" />
            </Tooltip>
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusOutlined style={{ marginRight: 8 }} />
          {t('addField')}
        </Button>
      </div>

      <Segmented
        value={activeEntityType}
        onChange={(value) => {
          setActiveEntityType(value as string);
          setShowForm(false);
        }}
        options={segmentedOptions}
      />

      {showForm && (
        <div className="glass-card p-0">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-base font-semibold leading-none tracking-tight">
              {editingId ? t('editField') : t('addField')}
            </h3>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fieldName')}</label>
                <Input
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  placeholder={t('fieldName')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fieldType')}</label>
                <Select
                  value={formData.field_type}
                  onChange={(value) => setFormData({ ...formData, field_type: value })}
                  options={FIELD_TYPE_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: t(opt.labelKey),
                  }))}
                  className="w-full"
                  disabled={!!editingId}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_required}
                onChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
              <label className="text-sm font-medium">{t('fieldRequired')}</label>
            </div>

            {formData.field_type === 'dropdown' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">{t('fieldOptions')}</label>
                <p className="text-xs text-gray-500">{t('fieldOptionsHint')}</p>
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onPressEnter={handleAddOption}
                    placeholder={t('addOption')}
                  />
                  <Button onClick={handleAddOption} disabled={!newOption.trim()}>
                    <PlusOutlined style={{ marginRight: 4 }} />
                    {t('addOption')}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.options.map((option) => (
                    <Tag
                      key={option}
                      closable
                      onClose={() => handleRemoveOption(option)}
                    >
                      {option}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !formData.field_name}>
                <SaveOutlined style={{ marginRight: 8 }} />
                {saving ? tActions('saving') : tActions('save')}
              </Button>
              <Button type="default" onClick={() => setShowForm(false)}>
                <CloseOutlined style={{ marginRight: 8 }} />
                {tActions('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((field, index) => (
          <div key={field.id} className="glass-card p-0">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FormOutlined style={{ fontSize: 20, color: '#2563eb' }} />
                  <div>
                    <h3 className="text-base font-semibold leading-none tracking-tight text-lg">
                      {field.field_name}
                    </h3>
                    {field.is_required && (
                      <span className="text-xs text-red-500">* {t('fieldRequired')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="small"
                    type="text"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    title={t('moveUp')}
                    aria-label={t('moveUp')}
                  >
                    <ArrowUpOutlined />
                  </Button>
                  <Button
                    size="small"
                    type="text"
                    disabled={index === fields.length - 1}
                    onClick={() => handleMoveDown(index)}
                    title={t('moveDown')}
                    aria-label={t('moveDown')}
                  >
                    <ArrowDownOutlined />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <div>
                <Tag color={FIELD_TYPE_COLORS[field.field_type] || 'default'}>
                  {FIELD_TYPE_OPTIONS.find((opt) => opt.value === field.field_type)
                    ? t(FIELD_TYPE_OPTIONS.find((opt) => opt.value === field.field_type)!.labelKey)
                    : field.field_type}
                </Tag>
              </div>
              {field.field_type === 'dropdown' && field.options && field.options.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {field.options.slice(0, 5).map((opt) => (
                    <Tag key={opt} className="text-xs">{opt}</Tag>
                  ))}
                  {field.options.length > 5 && (
                    <Tag bordered className="text-xs">
                      +{field.options.length - 5} more
                    </Tag>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="small" type="default" onClick={() => handleEdit(field)}>
                  <EditOutlined style={{ marginRight: 4 }} />
                  {tActions('edit')}
                </Button>
                <Button size="small" type="primary" danger onClick={() => handleDelete(field.id)}>
                  <DeleteOutlined style={{ marginRight: 4 }} />
                  {tActions('delete')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 && !showForm && (
        <div className="glass-card py-12 flex flex-col items-center justify-center">
          <EmptyStateCharacter height={115} variant="setup" />
          <p className="mt-4 text-lg font-medium text-gray-700">{t('noFieldsYet')}</p>
          <p className="text-sm text-gray-500">{t('noFieldsDescription')}</p>
          <Button onClick={handleCreate} className="mt-4">
            <PlusOutlined style={{ marginRight: 8 }} />
            {t('addField')}
          </Button>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
