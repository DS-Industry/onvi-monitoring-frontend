import React from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { MarketingCampaignConditionType } from '@/services/api/marketing';
import { formatConditionValue } from '../utils/conditionValueFormatter';
import { useTranslation } from 'react-i18next';

interface ConditionCardProps {
  condition: any;
  index: number;
  totalConditions: number;
  conditionTypes: Array<{ label: string; value: MarketingCampaignConditionType }>;
  onDelete: (conditionId: number, index: number) => void;
  isDeleting?: boolean;
}

const ConditionCard: React.FC<ConditionCardProps> = ({
  condition,
  index,
  totalConditions,
  conditionTypes,
  onDelete,
  isDeleting = false,
}) => {
  const { t } = useTranslation();
  const valueDisplay = formatConditionValue(condition, t);
  const conditionLabel = conditionTypes.find(
    (type) => type.value === condition.type
  )?.label;

  return (
    <React.Fragment>
      <div className="relative flex items-center justify-center w-52 h-24 border-[0.5px] border-primary02 rounded-lg bg-white shadow-sm">
        <Button
          size="small"
          type="text"
          icon={<CloseOutlined />}
          className="!absolute top-1 right-1 text-text02 hover:text-primary02"
          onClick={() => onDelete(condition.id, index)}
          loading={isDeleting}
          disabled={isDeleting}
        />

        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="text-sm font-semibold text-text01">
            {conditionLabel}
          </div>
          <div className="text-sm text-text02">{valueDisplay}</div>
        </div>
      </div>

      {index < totalConditions - 1 && (
        <div className="flex items-center justify-center text-primary02 font-semibold">
          {t('common.and')}
        </div>
      )}
    </React.Fragment>
  );
};

export default ConditionCard;


