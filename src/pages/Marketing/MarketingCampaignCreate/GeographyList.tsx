import React, { useState, useEffect } from 'react';
import { Checkbox, Typography } from 'antd';
import { EnvironmentFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PosResponse } from '@/services/api/marketing';

const { Text } = Typography;

interface GeographyListProps {
  participants: PosResponse[];
  onSelectionChange?: (selected: PosResponse[]) => void;
}

const GeographyList: React.FC<GeographyListProps> = ({
  participants,
  onSelectionChange,
}) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<number[]>(participants.map(p => p.id));

  // Notify parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selected = participants.filter(p => selectedIds.includes(p.id));
      onSelectionChange(selected);
    }
  }, [selectedIds]);

  const handleToggle = (id: number, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full max-w-md">
      {/* Title */}
      <div className="font-semibold text-lg text-text01 mb-3">
        {t('marketingLoyalty.participatingBranches')}
      </div>
      {/* Scrollable list */}
      <div className="max-h-80 overflow-y-auto pr-1 space-y-3">
        {participants.map(branch => (
          <div
            key={branch.id}
            className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#C6FF3A] rounded-full flex items-center justify-center">
                <EnvironmentFilled className="text-black text-lg" />
              </div>
              <div className="flex flex-col">
                <Text className="font-semibold text-text01 text-sm">
                  {branch.name}
                </Text>
                <Text type="secondary" className="text-xs">
                  {branch.address.city}, {branch.address.location}
                </Text>
              </div>
            </div>

            <Checkbox
              checked={selectedIds.includes(branch.id)}
              onChange={e => handleToggle(branch.id, e.target.checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeographyList;
