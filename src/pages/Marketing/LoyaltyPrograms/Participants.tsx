import React from 'react';
import { useTranslation } from 'react-i18next';
import CarIcon from '@icons/CarIcon.svg?react';
import useSWR from 'swr';
import { getPosesParticipants } from '@/services/api/marketing';
import { useSearchParams } from 'react-router-dom';
import { Button, Skeleton } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import ParticipantsMap from '@/components/ui/ParticipantsMap';

interface ParticipantsProps {
  isEditable?: boolean;
}

const Participants: React.FC<ParticipantsProps> = ({ isEditable = true }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  const currentStep = Number(searchParams.get('step')) || 1;

  const isUpdate = Boolean(searchParams.get('mode') === 'edit');

  const { data: participantsData, isLoading: participantsLoading } = useSWR(
    loyaltyProgramId ? [`get-devices`, loyaltyProgramId] : null,
    () => getPosesParticipants(loyaltyProgramId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const goBack = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep - 1,
    });
  };

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02">
      <div className="flex flex-col rounded-lg w-full space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex items-center space-x-4">
          <CarIcon className="w-12 h-12 flex justify-center items-center" />
          <div>
            <div className="font-bold text-text01 text-2xl">
              {t('marketingLoyalty.participants')}
            </div>
            <div className="text-text02 text-md">
              {t('marketingLoyalty.displaying')}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex space-x-2">
          <div className="font-semibold text-text01">
            {t('marketingLoyalty.participatingBranches')} —
          </div>
          <div className="font-semibold text-primary02">
            {participantsLoading ? (
              <Skeleton.Input
                active
                size="small"
                style={{ width: 20, height: 20 }}
              />
            ) : (
              participantsData?.length || 0
            )}
          </div>
        </div>
        <div className="text-text02 text-sm">
          {t('marketingLoyalty.theLoyalty')}
        </div>
      </div>
      <div>
        <ParticipantsMap
          participants={participantsData || []}
          loading={participantsLoading}
        />
      </div>
      <div>
        <div className="font-semibold text-text01">
          {t('marketingLoyalty.expansion')}
        </div>
        <div className="text-text02 text-sm">
          {t('marketingLoyalty.toExpand')}
        </div>
      </div>


      {isEditable && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3">
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
                step: 4,
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

export default Participants;
