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
import { deleteTier, getBenefits, getTiers, LoyaltyProgramsByIdResponse } from '@/services/api/marketing';
import LevelsBonusesModal from './LevelsBonusesModal';
import LevelCard from './LevelCard';

import { useToast } from '@/components/context/useContext';

interface LevelsBonusesProps {
  isEditable?: boolean;
  program?: LoyaltyProgramsByIdResponse;
}

const LevelsBonuses: React.FC<LevelsBonusesProps> = ({ program, isEditable = true }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  const currentStep = Number(searchParams.get('step')) || 1;

  const isUpdate = Boolean(searchParams.get('mode') === 'edit');

  const { showToast } = useToast();

  const { data: tiersData, isLoading: tiersLoading } = useSWR(
    [`get-tiers`, loyaltyProgramId],
    () => getTiers({ programId: loyaltyProgramId || '*' }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const tiers = (tiersData?.filter((tier: any) => tier.id !== 1) || [])
    .sort((a: any, b: any) => a.limitBenefit - b.limitBenefit);

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
      <div className="flex items-center justify-center bg-background02">
        <div className="flex flex-col rounded-lg w-full space-y-6 sm:space-y-8 lg:space-y-10">
          <div className="flex flex-col space-y-10 sm:space-y-0 sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="aspect-square rounded-full bg-primary02 flex items-center justify-center text-text04">
                <FireOutlined className="w-12 h-12 flex justify-center items-center text-2xl" />
              </div>

              <div>
                <div className="font-bold text-text01 text-2xl">
                  {t('marketingLoyalty.levelsAndBonuses')}
                </div>

                <div className="text-text02 text-md">
                  {t('marketingLoyalty.creatingLevels')}
                </div>
              </div>
            </div>
            {isEditable && program?.maxLevels && program.maxLevels > tiers.length && (
              <div className="flex space-x-2">
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => setLevelModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  {t('marketing.addLevel')}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6">
            {tiersLoading ? (
              <div className="w-full flex justify-center py-8">
                <Spin />
              </div>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tiers.map((tier: any, index: number) => {
                  const tierBenefits = (benefitsData || []).filter(b =>
                    tier.benefitIds?.includes(b.props.id)
                  );
                  const bonuses = tierBenefits.map(b => ({
                    label: b.props.name,
                    value: String(b.props.bonus),
                  }));
                  return (
                    <LevelCard
                      key={`${tier.id}-${index}`}
                      tierId={tier.id}
                      tierName={tier.name}
                      levelNumber={index + 1}
                      fromAmount={String(tier.limitBenefit)}
                      description={tier.description || ''}
                      bonuses={bonuses}
                      isEditable={isEditable}
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
      {isEditable && (
        <LevelsBonusesModal
          open={levelModalOpen}
          onClose={() => {
            setLevelModalOpen(false);
            setEditTierId(null);
          }}
          loyaltyProgramId={loyaltyProgramId}
          tierId={editTierId || undefined}
        />
      )}

      {isEditable && (
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
            } catch (error) {
              showToast(t('errors.other.errorDuringFormSubmission'), 'error');
            }
          }}
          title={t('marketing.deleteTierConfirm', {
            defaultValue: 'Удалить уровень?',
          })}
        >
          {t('marketing.deleteTierWarning', {
            defaultValue: 'Действие необратимо. Продолжить?',
          })}
        </Modal>
      )}
      {isEditable && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <div className="order-2 sm:order-1">
            {currentStep > 1 && isUpdate && (
              <Button
                icon={<LeftOutlined />}
                onClick={goBack}
                className="w-full sm:w-auto"
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
            className="w-full sm:w-auto order-1 sm:order-2"
            onClick={() => {
              updateSearchParams(searchParams, setSearchParams, {
                step: 5,
              });
            }}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LevelsBonuses;
