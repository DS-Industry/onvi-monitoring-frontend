import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getPosesParticipants, PosResponse } from '@/services/api/marketing';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'antd';
import { GlobalOutlined, PlayCircleFilled } from '@ant-design/icons';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import ParticipantsMap from '@/components/ui/ParticipantsMap';
import GeographyList from './GeographyList';

const Geography: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  const currentStep = Number(searchParams.get('step')) || 1;

  const { data: participantsData = [], isLoading: participantsLoading } = useSWR(
    [`get-devices`, loyaltyProgramId],
    () => getPosesParticipants(44),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const [visibleParticipants, setVisibleParticipants] = useState<PosResponse[]>(participantsData);

  const handleSelectionChange = (selected: PosResponse[]) => {
    setVisibleParticipants(selected);
  };

  const goBack = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep - 1,
    });
  };

  return (
    <div className="flex flex-col space-y-6 bg-background02">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary02 flex items-center justify-center rounded-full text-white">
          <GlobalOutlined style={{ fontSize: 24 }} />
        </div>
        <div>
          <div className="font-bold text-text01 text-2xl">
            {t('marketingCampaigns.geography')}:{t('marketingCampaigns.map')}
          </div>
          <div className="text-base03 text-md">
            {t('marketingCampaigns.settingUpAffiliates')}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <GeographyList
          participants={participantsData}
          onSelectionChange={handleSelectionChange}
        />
        <div className="flex-1">
          <ParticipantsMap
            participants={visibleParticipants}
            loading={participantsLoading}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-3">
        {currentStep > 1 && (
          <Button onClick={goBack} className="w-full sm:w-auto">
            {t('marketingLoyalty.saveAndExit')}
          </Button>
        )}
        <Button
          htmlType="submit"
          type="primary"
          icon={<PlayCircleFilled />}
          className="w-full sm:w-auto"
          onClick={() =>
            updateSearchParams(searchParams, setSearchParams, { step: 4 })
          }
        >
          {t('marketing.launchNow')}
        </Button>
      </div>
    </div>
  );
};

export default Geography;
