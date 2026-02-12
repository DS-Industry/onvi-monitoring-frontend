import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Checkbox, Typography, Button, Grid } from 'antd';
import { EnvironmentFilled, PlayCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PosResponse } from '@/services/api/marketing';

const { useBreakpoint } = Grid;

const { Text } = Typography;

const ROW_HEIGHT_ESTIMATE = 72;

interface ParticipantRowProps {
  branch: PosResponse;
  checked: boolean;
  onToggle: (id: number, checked: boolean) => void;
}

const ParticipantRow = React.memo(({ branch, checked, onToggle }: ParticipantRowProps) => (
  <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="w-8 h-8 bg-[#C6FF3A] rounded-full flex items-center justify-center flex-shrink-0">
        <EnvironmentFilled className="text-black text-lg" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <Text className="font-semibold text-text01 text-sm truncate">{branch.name}</Text>
        <Text type="secondary" className="text-xs truncate">
          {branch.address.city}, {branch.address.location}
        </Text>
      </div>
    </div>
    <Checkbox
      checked={checked}
      onChange={e => onToggle(branch.id, e.target.checked)}
      className="ml-2 flex-shrink-0"
    />
  </div>
));
ParticipantRow.displayName = 'ParticipantRow';

interface GeographyListProps {
  participants: PosResponse[];
  onSelectionChange?: (selected: PosResponse[]) => void;
  showButtons?: boolean;
  onBack?: () => void;
  onLaunch?: () => void;
  initialSelectedIds?: number[];
}

const GeographyList: React.FC<GeographyListProps> = React.memo(({
  participants,
  onSelectionChange,
  showButtons = false,
  onBack,
  onLaunch,
  initialSelectedIds,
}) => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const previousParticipantsRef = useRef<string>('');
  const previousInitialSelectedIdsRef = useRef<string>('');
  const onSelectionChangeRef = useRef(onSelectionChange);
  const initializedRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const isMdOrLarger = screens.md || screens.lg || screens.xl || screens.xxl;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    const currentIdsString = participants
      .map(p => p.id)
      .sort()
      .join(',');
    const previousIdsString = previousParticipantsRef.current;
    const currentInitialIdsString = (initialSelectedIds || []).sort().join(',');
    const previousInitialIdsString = previousInitialSelectedIdsRef.current;

    const participantsChanged = currentIdsString !== previousIdsString;
    const initialSelectedIdsChanged =
      currentInitialIdsString !== previousInitialIdsString;

    if (
      participantsChanged ||
      (initialSelectedIdsChanged && participants.length > 0)
    ) {
      if (participants.length > 0) {
        const ids =
          initialSelectedIds && initialSelectedIds.length > 0
            ? initialSelectedIds.filter(id =>
              participants.some(p => p.id === id)
            )
            : participants.map(p => p.id);
        setSelectedIds(ids);
        previousParticipantsRef.current = currentIdsString;
        previousInitialSelectedIdsRef.current = currentInitialIdsString;
        initializedRef.current = true;
        if (onSelectionChangeRef.current) {
          const selected = participants.filter(p => ids.includes(p.id));
          onSelectionChangeRef.current(selected);
        }
      } else {
        setSelectedIds([]);
        previousParticipantsRef.current = '';
        previousInitialSelectedIdsRef.current = '';
        initializedRef.current = false;
        if (onSelectionChangeRef.current) {
          onSelectionChangeRef.current([]);
        }
      }
    }
  }, [participants, initialSelectedIds]);

  useEffect(() => {
    if (!onSelectionChangeRef.current || !initializedRef.current) return;
    const selected = participants.filter(p => selectedIds.includes(p.id));
    onSelectionChangeRef.current(selected);
  }, [selectedIds, participants]);

  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const handleToggle = useCallback((id: number, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(i => i !== id)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(participants.map(p => p.id));
  }, [participants]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: participants.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div
      className={`bg-white shadow-lg w-full ${showButtons ? 'rounded-t-3xl' : 'rounded-2xl'
        } flex flex-col transition-all duration-300`}
      style={
        isMdOrLarger
          ? {
            maxHeight: showButtons ? (expanded ? '80vh' : '10vh') : '70vh',
            height: "80vh",
          }
          : {
            height: "80vh",
          }
      }
    >
      {showButtons && (
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
          onClick={() => setExpanded(prev => !prev)}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
      )}

      <div
        className={`font-semibold text-lg text-text01 ${showButtons ? 'px-4 pt-1 pb-2 touch-none select-none' : 'p-4'} mb-3`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {showButtons ? (
            <div className="font-bold text-text01 text-lg">
              {t('marketingLoyalty.participatingBranches')}
            </div>
          ) : (
            <div className="font-semibold text-lg text-text01">
              {t('marketingLoyalty.participatingBranches')}
            </div>
          )}
          {participants.length > 0 && (
            <div className="flex gap-2">
              <Button type="link" size="small" onClick={handleSelectAll} className="p-0 h-auto text-primary">
                {t('marketingLoyalty.selectAll')}
              </Button>
              <Button type="link" size="small" onClick={handleDeselectAll} className="p-0 h-auto text-base03">
                {t('marketingLoyalty.deselectAll')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={`flex-1 md:min-h-0 overflow-y-auto ${showButtons ? 'px-4' : 'px-4'} ${showButtons ? 'pb-2' : ''}`}
      >
        {participants.length === 0 ? (
          <div className="text-center py-8 text-base03">
            <Text type="secondary">{t('marketingLoyalty.noParticipants')}</Text>
          </div>
        ) : (
          <div
            style={{
              height: totalSize,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map(virtualRow => {
              const branch = participants[virtualRow.index];
              return (
                <div
                  key={branch.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="pr-1"
                >
                  <ParticipantRow
                    branch={branch}
                    checked={selectedIdsSet.has(branch.id)}
                    onToggle={handleToggle}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showButtons && (
        <div className="px-4 pt-3 pb-4 border-t border-gray-100 flex gap-2 bg-white">
          {onBack && (
            <Button
              onClick={onBack}
              className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
            >
              {t('marketingLoyalty.saveAndExit')}
            </Button>
          )}
          {onLaunch && (
            <Button
              type="primary"
              icon={<PlayCircleFilled />}
              onClick={onLaunch}
              className={`${onBack ? 'flex-1' : 'w-full'}`}
            >
              {isMdOrLarger ? t('marketing.launchNow') : ""}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

GeographyList.displayName = 'GeographyList';

export default GeographyList;
