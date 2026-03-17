'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Spin, message } from 'antd';
import { DollarOutlined, RiseOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { apiClient } from '@/lib/api';
import type { DealResponse } from '@/types/api';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDate } from '@/lib/utils';

const PIPELINE_STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation'] as const;

const STAGE_COLORS: Record<string, string> = {
  prospecting: '#3B82F6',
  qualification: '#F59E0B',
  proposal: '#F97316',
  negotiation: '#8B5CF6',
};

export default function DealsPipelineView() {
  const t = useTranslations('deals');
  const tStatuses = useTranslations('statuses');
  const tErrors = useTranslations('errors');

  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeals = useCallback(async () => {
    try {
      const result = await apiClient.getDeals({ page: 1, page_size: 100 });
      setDeals(result.items);
    } catch (error) {
      console.error('Failed to load pipeline:', error);
      message.error(t('failedToLoadPipeline'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable ref
  }, []);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, DealResponse[]> = {};
    for (const stage of PIPELINE_STAGES) {
      grouped[stage] = [];
    }
    for (const deal of deals) {
      const stage = deal.stage?.toLowerCase();
      if (stage && stage in grouped) {
        grouped[stage].push(deal);
      }
    }
    return grouped;
  }, [deals]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const dealId = draggableId;
    const newStage = destination.droppableId;
    const oldStage = source.droppableId;

    // Optimistic update
    setDeals(prev => prev.map(d =>
      d.id === dealId ? { ...d, stage: newStage } : d
    ));

    try {
      await apiClient.updateDeal(dealId, { stage: newStage } as never);
      message.success(t('dealMoved'));
    } catch (error) {
      // Revert on failure
      setDeals(prev => prev.map(d =>
        d.id === dealId ? { ...d, stage: oldStage } : d
      ));
      console.error('Failed to move deal:', error);
      message.error(tErrors('failedToUpdateDeal'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable refs
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="pipeline-board">
        {PIPELINE_STAGES.map((stage) => {
          const color = STAGE_COLORS[stage];
          const stageDeals = dealsByStage[stage] || [];
          const total = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

          return (
            <div key={stage} className="pipeline-column">
              <div className="pipeline-column-header" style={{ borderTopColor: color }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 text-sm">
                    {tStatuses(stage)}
                  </span>
                  <span
                    className="pipeline-count-badge"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {formatCurrency(total)}
                </span>
              </div>

              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`pipeline-column-body ${snapshot.isDraggingOver ? 'pipeline-drop-active' : ''}`}
                    style={{ minHeight: 100 }}
                  >
                    {stageDeals.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`pipeline-deal-card glass-card ${snapshot.isDragging ? 'pipeline-deal-dragging' : ''}`}
                            onClick={() => { window.location.href = `/deals/${deal.id}`; }}
                            style={{ ...provided.draggableProps.style, cursor: 'grab' }}
                          >
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                              {deal.title}
                            </h4>

                            <div className="flex items-center gap-1 text-green-600 font-bold text-base mb-2">
                              <DollarOutlined className="text-xs" />
                              {formatCurrency(deal.amount ?? 0)}
                            </div>

                            {deal.contact_name && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <UserOutlined className="text-[10px]" />
                                {deal.contact_name}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              {deal.probability != null && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <RiseOutlined className="text-[10px]" />
                                  {deal.probability}%
                                </span>
                              )}
                              {deal.expected_close_date && (
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <CalendarOutlined className="text-[10px]" />
                                  {formatDate(deal.expected_close_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-6 text-xs text-gray-400">
                        {t('noDealsInStage')}
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
