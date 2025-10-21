import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FireOutlined,
  PlusOutlined,
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { Button, Modal, Spin } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { deleteTier, getBenefits, getTiers } from '@/services/api/marketing';
import LevelsBonusesModal from './LevelsBonusesModal';
import LevelCard from './LevelCard';

const LevelsBonuses: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  const currentStep = Number(searchParams.get('step')) || 1;

  const { data: tiersData, isLoading: tiersLoading } = useSWR(
    [`get-tiers`, loyaltyProgramId],
    () => getTiers({ programId: loyaltyProgramId || '*' }),
    { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
  );

  const tiers = tiersData || [];

  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [editTierId, setEditTierId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: benefitsData } = useSWR([`get-benefits`], () => getBenefits(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const goBack = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep - 1,
    });
  };

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
             <div className="flex space-x-2">
              <Button icon={<PlusOutlined />} type="primary" onClick={() => setLevelModalOpen(true)}>
                {t('marketing.addLevel')}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-text01">{t('marketingLoyalty.recalculationPeriod')}</div>
          </div>
          <div className="text-sm text-text03">{t('marketingLoyalty.recal')}</div>

          <div className="mt-6">
            {tiersLoading ? (
              <div className="w-full flex justify-center py-8"><Spin /></div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {tiers.map((tier: any, index: number) => {
                  const tierBenefits = (benefitsData || []).filter(b => tier.benefitIds?.includes(b.props.id));
                  const bonuses = tierBenefits.map(b => ({ label: b.props.name, value: String(b.props.bonus) }));
                  return (
                    <LevelCard
                      key={tier.id}
                      levelNumber={index + 1}
                      fromAmount={String(tier.limitBenefit)}
                      lossCondition={t('marketingLoyalty.lossCondition', { defaultValue: '-' })}
                      description={tier.description || ''}
                      bonuses={bonuses}
                      onEdit={() => {
                        setEditTierId(tier.id);
                        setLevelModalOpen(true);
                      }}
                      onDelete={() => setDeletingId(tier.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <LevelsBonusesModal
        open={levelModalOpen}
        onClose={() => { setLevelModalOpen(false); setEditTierId(null); }}
        loyaltyProgramId={loyaltyProgramId}
        tierId={editTierId || undefined}
      />

      <Modal
        open={!!deletingId}
        onCancel={() => setDeletingId(null)}
        okButtonProps={{ danger: true }}
        okText={t('common.delete')}
        onOk={async () => {
          if (!deletingId) return;
          try {
            await deleteTier(deletingId);
            setDeletingId(null);
            await mutate([`get-tiers`, loyaltyProgramId]);
          } finally {
            // refresh tiers
          }
        }}
        title={t('marketing.deleteTierConfirm', { defaultValue: 'Удалить уровень?' })}
      >
        {t('marketing.deleteTierWarning', { defaultValue: 'Действие необратимо. Продолжить?' })}
      </Modal>
      <div className="flex mt-auto justify-end gap-2">
        <div>
          {currentStep > 1 && (
            <Button
              icon={<LeftOutlined />}
              onClick={goBack}
            >
              {t('common.back')}
            </Button>
          )}
        </div>
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
