import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CopyOutlined,
  FireOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, List, Tag } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { getTiers } from '@/services/api/marketing';
import LevelsBonusesModal from './LevelsBonusesModal';

const LevelsBonuses: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));

  const { data: tiersData, isLoading: tiersLoading } = useSWR(
    [`get-tiers`, loyaltyProgramId],
    () => getTiers({ programId: loyaltyProgramId || '*' }),
    { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
  );

  const tiers = tiersData || [];

  const [levelModalOpen, setLevelModalOpen] = useState(false);

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
          <div className="flex items-center justify-between">
            <div className="text-text01">{t('marketingLoyalty.recalculationPeriod')}</div>
            <div className="flex space-x-2">
              <Button icon={<PlusOutlined />} type="primary" onClick={() => setLevelModalOpen(true)}>
                {t('marketing.addLevel')}
              </Button>
            </div>
          </div>
          <div className="text-sm text-text03">{t('marketingLoyalty.recal')}</div>

          <div className="mt-6">
            <List
              loading={tiersLoading}
              dataSource={tiers}
              rowKey={item => String(item.id)}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={item.description}
                  />
                  <div className="flex items-center space-x-3">
                    <Tag color="red">{item.limitBenefit}</Tag>
                    <span className="text-text02">{t('marketing.limitBenefit')}</span>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
      <LevelsBonusesModal open={levelModalOpen} onClose={() => setLevelModalOpen(false)} loyaltyProgramId={loyaltyProgramId} />
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
