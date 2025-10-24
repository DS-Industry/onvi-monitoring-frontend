import React from 'react';
import { Button } from 'antd';
import {
  CloseOutlined,
  FireOutlined,
  GiftFilled,
  RightOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface LevelCardProps {
  levelNumber: number;
  fromAmount: string;
  lossCondition: string;
  description: string;
  bonuses: { label: string; value: string }[];
  isEditable: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({
  levelNumber,
  fromAmount,
  lossCondition,
  description,
  bonuses,
  isEditable,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full relative flex flex-col text-center">
      {isEditable ? <div className="absolute top-3 right-3 text-gray-400 cursor-pointer" onClick={onDelete}>
        <CloseOutlined />
      </div> : null}

      <div className="flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-[#D9FF57] flex items-center justify-center mb-3">
          <FireOutlined style={{ fontSize: 26, color: '#000' }} />
        </div>
      </div>

      <div className="font-semibold text-lg text-text01">
        {t('marketingLoyalty.level')} {levelNumber}
      </div>

      <div className="text-blue-600 font-medium">
        {t('marketingLoyalty.from')} {fromAmount}
      </div>
      <div className="text-gray-400 text-sm mb-3">{description}</div>

      <div className="font-semibold mb-1">
        {t('marketingLoyalty.lossOfLevel')}
      </div>
      <div className="text-gray-400 text-sm mb-3">{lossCondition}</div>

      <div className="font-semibold mb-2">{t('marketingLoyalty.bonuses')}</div>
      <div className="flex flex-col space-y-2 mb-4 w-full">
        {bonuses.map((bonus, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            <div className="h-5 w-5 bg-text01 text-text04 rounded-full flex items-center justify-center">
              <GiftFilled style={{ fontSize: 10 }} />
            </div>
            <div className='flex flex-col items-start'>
              <div className="font-medium">{bonus.label}</div>
              <div className="text-text02">{bonus.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        {isEditable ? <Button
          type="link"
          className="text-primary02 font-medium"
          icon={<RightOutlined />}
          iconPosition="end"
          onClick={onEdit}
        >
          {t('marketingLoyalty.edit')}
        </Button> : null}
      </div>
    </div>
  );
};

export default LevelCard;
