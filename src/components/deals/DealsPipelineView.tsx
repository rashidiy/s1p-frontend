'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button, Spin, message } from 'antd';
import { DollarOutlined, RiseOutlined, UserOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { apiClient } from '@/lib/api';
import type { DealResponse } from '@/types/api';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DEAL_STAGES, DEAL_STAGE_BOARD_COLORS, DEAL_STAGE_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';

interface DealsPipelineViewProps {
  myDeals?: boolean;
}

export default function DealsPipelineView({ myDeals }: DealsPipelineViewProps) {
  const t = useTranslations('deals');
  const tActions = useTranslations('actions');
  const tStatuses = useTranslations('statuses');
  const tErrors = useTranslations('errors');
  const { hasPermissionString } = useAuthStore();

  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeals = useCallback(async () => {
    try {
      const result = await apiClient.getDeals({ page: 1, page_size: 100, my_deals: myDeals || undefined });
      setDeals(result.items);
    } catch (error) {
      console.error('Failed to load pipeline:', error);
      message.error(t('failedToLoadPipeline'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable ref
  }, [myDeals]);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, DealResponse[]> = {};
    for (const stage of DEAL_STAGES) {
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
    } catch {
      // Revert on failure
      setDeals(prev => prev.map(d =>
        d.id === dealId ? { ...d, stage: oldStage } : d
      ));
      message.error(tErrors('failedToUpdateDeal'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable refs
  }, []);

  const handleWin = useCallback(async (e: React.MouseEvent, dealId: string) => {
    e.stopPropagation();
    try {
      await apiClient.markDealWon(dealId);
      message.success(t('dealMarkedWon'));
      loadDeals();
    } catch {
      message.error(tErrors('failedToMarkDealAsWon'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable refs
  }, [loadDeals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  const isClosedStage = (stage: string) => stage === 'closed_won' || stage === 'closed_lost';

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="pipeline-board">
        {DEAL_STAGES.map((stage) => {
          const color = DEAL_STAGE_BOARD_COLORS[stage];
          const stageDeals = dealsByStage[stage] || [];
          const total = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
          const closed = isClosedStage(stage);

          return (
            <div key={stage} className="pipeline-column">
              <div className="pipeline-column-header" style={{ borderTopColor: color }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 text-sm">
                    {tStatuses(DEAL_STAGE_KEYS[stage])}
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

              <Droppable droppableId={stage} isDropDisabled={closed}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`pipeline-column-body ${snapshot.isDraggingOver ? 'pipeline-drop-active' : ''}`}
                    style={{ minHeight: 100 }}
                  >
                    {stageDeals.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index} isDragDisabled={closed}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`pipeline-deal-card glass-card ${snapshot.isDragging ? 'pipeline-deal-dragging' : ''}`}
                            onClick={() => { window.location.href = `/deals/${deal.id}`; }}
                            style={{ ...provided.draggableProps.style, cursor: closed ? 'pointer' : 'grab' }}
                          >
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                              {deal.title}
                            </h4>

                            <div className="flex items-center gap-1 text-green-600 font-bold text-base mb-2">
                              <DollarOutlined className="text-xs" />
                              {formatCurrency(deal.amount ?? 0, deal.currency || 'UZS')}
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

                            {!closed && hasPermissionString('deals.write') && (
                              <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                                <Button size="small" type="primary" className="flex-1 !text-xs bg-green-600 hover:bg-green-700" icon={<TrophyOutlined />} onClick={(e) => handleWin(e, deal.id)}>
                                  {tActions('win')}
                                </Button>
                              </div>
                            )}
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
