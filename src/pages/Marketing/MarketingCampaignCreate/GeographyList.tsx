import React, { useState, useEffect, useRef } from 'react';
import { Checkbox, Typography, Button } from 'antd';
import { EnvironmentFilled, PlayCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PosResponse } from '@/services/api/marketing';

const { Text } = Typography;

interface GeographyListProps {
  participants: PosResponse[];
  onSelectionChange?: (selected: PosResponse[]) => void;
  showButtons?: boolean;
  onBack?: () => void;
  onLaunch?: () => void;
}

const GeographyList: React.FC<GeographyListProps> = ({
  participants,
  onSelectionChange,
  showButtons = false,
  onBack,
  onLaunch,
}) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const previousParticipantsRef = useRef<string>('');
  const onSelectionChangeRef = useRef(onSelectionChange);
  const initializedRef = useRef(false);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    const currentIdsString = participants.map(p => p.id).sort().join(',');
    const previousIdsString = previousParticipantsRef.current;

    if (currentIdsString !== previousIdsString) {
      if (participants.length > 0) {
        const ids = participants.map(p => p.id);
        setSelectedIds(ids);
        previousParticipantsRef.current = currentIdsString;
        initializedRef.current = true;
        if (onSelectionChangeRef.current) {
          onSelectionChangeRef.current(participants);
        }
      } else {
        setSelectedIds([]);
        previousParticipantsRef.current = '';
        initializedRef.current = false;
        if (onSelectionChangeRef.current) {
          onSelectionChangeRef.current([]);
        }
      }
    } else if (participants.length > 0 && !initializedRef.current) {
      const ids = participants.map(p => p.id);
      setSelectedIds(ids);
      initializedRef.current = true;
      if (onSelectionChangeRef.current) {
        onSelectionChangeRef.current(participants);
      }
    }
  }, [participants]);

  const handleToggle = (id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const updated = checked ? [...prev, id] : prev.filter(i => i !== id);
      if (onSelectionChangeRef.current) {
        const selected = participants.filter(p => updated.includes(p.id));
        onSelectionChangeRef.current(selected);
      }
      return updated;
    });
  };

  return (
    <div
      className={`bg-white shadow-lg w-full ${showButtons
        ? 'rounded-t-3xl'
        : 'rounded-2xl'
        } ${showButtons ? 'max-h-[65vh]' : ''} flex flex-col`}
    >
      {showButtons && (
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
      )}

      <div className={`font-semibold text-lg text-text01 ${showButtons ? 'px-4 pt-1 pb-2 touch-none select-none' : 'p-4'} mb-3`}>
        {showButtons ? (
          <div className="font-bold text-text01 text-lg">
            {t('marketingLoyalty.participatingBranches')}
          </div>
        ) : (
          <div className="font-semibold text-lg text-text01">
            {t('marketingLoyalty.participatingBranches')}
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto ${showButtons ? 'px-4' : 'px-4'} space-y-3 ${showButtons ? 'pb-2' : ''}`}>
        {participants.length === 0 ? (
          <div className="text-center py-8 text-base03">
            <Text type="secondary">{t('marketingLoyalty.noParticipants')}</Text>
          </div>
        ) : (
          participants.map(branch => (
            <div
              key={branch.id}
              className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-[#C6FF3A] rounded-full flex items-center justify-center flex-shrink-0">
                  <EnvironmentFilled className="text-black text-lg" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <Text className="font-semibold text-text01 text-sm truncate">
                    {branch.name}
                  </Text>
                  <Text type="secondary" className="text-xs truncate">
                    {branch.address.city}, {branch.address.location}
                  </Text>
                </div>
              </div>

              <Checkbox
                checked={selectedIds.includes(branch.id)}
                onChange={e => handleToggle(branch.id, e.target.checked)}
                className="ml-2 flex-shrink-0"
              />
            </div>
          ))
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
              {t('marketing.launchNow')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GeographyList;
