import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CopyOutlined,
  FireOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Select } from 'antd';
import LevelCard from './LevelCard';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';

const LevelsBonuses: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const levels = [
    {
      levelNumber: 1,
      fromAmount: '0 ₽',
      description: t('marketingLoyalty.initialLevel'),
      lossCondition: t('marketingLoyalty.notApplicable'),
      bonuses: [
        { label: 'Нива Gold 2%', value: t('marketingLoyalty.discount') },
        { label: 'Нива Gold 2%', value: t('marketingLoyalty.cashback') },
      ],
    },
    {
      levelNumber: 2,
      fromAmount: '2000 ₽',
      description: t('marketingLoyalty.middleLevel'),
      lossCondition: '<2000 ₽ ' + t('marketingLoyalty.spent'),
      bonuses: [
        { label: 'Нива Gold 5%', value: t('marketingLoyalty.discount') },
        { label: 'Нива Gold 5%', value: t('marketingLoyalty.cashback') },
      ],
    },
    {
      levelNumber: 3,
      fromAmount: '5000 ₽',
      description: t('marketingLoyalty.highestLevel'),
      lossCondition: '<10000 ₽ ' + t('marketingLoyalty.spent'),
      bonuses: [
        { label: 'Нива Gold 10%', value: t('marketingLoyalty.discount') },
        { label: 'Нива Gold 10%', value: t('marketingLoyalty.cashback') },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-center bg-background02 p-4">
        <div className="flex flex-col rounded-lg p-8 w-full md:p-0 space-y-10">
          <div className="flex flex-col space-y-10 sm:space-y-0 sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary02 flex items-center justify-center text-text04">
                <FireOutlined style={{ fontSize: 20 }} />
              </div>
              <div>
                <div className="font-semibold text-text01">
                  {t('marketingLoyalty.levelsAndBonuses')}
                </div>
                <div className="text-text03 text-xs">
                  {t('marketingLoyalty.creatingLevels')}
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button icon={<CopyOutlined />}>
                {t('equipment.templates')}
              </Button>
              <Button icon={<PlusOutlined />} type="primary">
                {t('marketing.addLevel')}
              </Button>
            </div>
          </div>
          <div>
            <div className="text-text01">
              {t('marketingLoyalty.recalculationPeriod')}
            </div>
            <Select className="w-72" value={''} options={[]} />
            <div className="text-sm text-text03">
              {t('marketingLoyalty.recal')}
            </div>
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            {levels.map(level => (
              <LevelCard key={level.levelNumber} {...level} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex mt-auto justify-end gap-2">
        <Button
          htmlType="submit"
          type="primary"
          icon={<RightOutlined />}
          iconPosition="end"
          onClick={() => {
            updateSearchParams(searchParams, setSearchParams, {
              step: 5,
            });
          }}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};

export default LevelsBonuses;
