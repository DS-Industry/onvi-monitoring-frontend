import React from 'react';
import { useTranslation } from 'react-i18next';
import CarIcon from '@icons/CarIcon.svg?react';
import useSWR from 'swr';
import { getPosesParticipants } from '@/services/api/marketing';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import ParticipantsMap from '@/components/ui/ParticipantsMap';

const Participants: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  const currentStep = Number(searchParams.get('step')) || 1;

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

  console.log('Participants data: ', participantsData);

  const goBack = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep - 1,
    });
  };

  return (
    <div className="flex flex-col space-y-10 bg-background02 p-4">
      <div className="flex flex-col rounded-lg p-8 w-full md:p-0 space-y-10">
        <div className="flex items-center space-x-4">
          <CarIcon />
          <div>
            <div className="font-semibold text-text01">
              {t('marketingLoyalty.participants')}
            </div>
            <div className="text-text03 text-xs">
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
            {participantsData?.length || 0}
          </div>
        </div>
        <div className="text-text03 text-sm">
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
        <div className="text-text03 text-sm">
          {t('marketingLoyalty.toExpand')}
        </div>
      </div>
    
      
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
              step: 4,
            });
          }}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};

export default Participants;
