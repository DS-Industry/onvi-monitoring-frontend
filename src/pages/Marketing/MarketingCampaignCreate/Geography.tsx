import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getMarketingCampaignById, getPosesParticipants, PosResponse, updateMarketingCampaign, getLoyaltyPrograms, UpdateMarketingCampaignRequest, MarketingCampaignResponse } from '@/services/api/marketing';
import { useSearchParams } from 'react-router-dom';
import { Button, message } from 'antd';
import { GlobalOutlined, PlayCircleFilled } from '@ant-design/icons';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import ParticipantsMap from '@/components/ui/ParticipantsMap';
import GeographyList from './GeographyList';
import { useUser } from '@/hooks/useUserStore';
import { MarketingCampaignStatus } from '@/utils/constants';

const Geography: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const marketingCampaignId = Number(searchParams.get('marketingCampaignId'));
  const currentStep = Number(searchParams.get('step')) || 1;
  const user = useUser();

  const { data: marketCampaignByIdData, isLoading: loadingMarketingCampaign, isValidating } = useSWR(
    marketingCampaignId
      ? [`get-market-campaign-by-id`, marketingCampaignId]
      : null,
    () => getMarketingCampaignById(Number(marketingCampaignId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const loyaltyProgramId = marketCampaignByIdData?.ltyProgramId || 0;

  const { data: participantsData = [], isLoading: participantsLoading } = useSWR(
    loyaltyProgramId ? [`get-devices`, loyaltyProgramId] : null,
    () => getPosesParticipants(loyaltyProgramId),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const { data: loyaltyProgramsData } = useSWR(
    user.organizationId ? ['get-loyalty-programs', user.organizationId] : null,
    () => getLoyaltyPrograms(user.organizationId),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const { trigger: triggerUpdate, isMutating: isUpdating } = useSWRMutation<
    MarketingCampaignResponse,
    Error,
    [string, number],
    UpdateMarketingCampaignRequest
  >(
    ['user/loyalty/marketing-campaigns', marketingCampaignId],
    async ([, id], { arg }) => updateMarketingCampaign(id, arg)
  );

  const [visibleParticipants, setVisibleParticipants] = useState<PosResponse[]>([]);

  const [sheetPosition, setSheetPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartPosition = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleSelectionChange = useCallback((selected: PosResponse[]) => {
    setVisibleParticipants(selected);
  }, []);

  const handleSaveAndExit = async () => {
    if (!marketingCampaignId || !loyaltyProgramId) {
      message.error(t('marketing.errorCampaign'));
      return;
    }

    const selectedPosIds = visibleParticipants.map(pos => pos.id);
    const selectedProgram = loyaltyProgramsData?.find(
      item => item.props.id === loyaltyProgramId
    );

    if (!selectedProgram) {
      message.error(t('marketing.errorCampaign'));
      return;
    }

    try {
      const updateRequest: UpdateMarketingCampaignRequest = {
        posIds: selectedPosIds,
        ltyProgramParticipantId: selectedProgram.props.participantId,
      };

      await triggerUpdate(updateRequest);
      updateSearchParams(searchParams, setSearchParams, {
        step: currentStep - 1,
      });
    } catch (error) {
      message.error(t('marketing.errorCampaign'));
    }
  };

  const handleLaunch = async () => {
    if (!marketingCampaignId || !loyaltyProgramId) {
      message.error(t('marketing.errorCampaign'));
      return;
    }

    const selectedPosIds = visibleParticipants.map(pos => pos.id);
    const selectedProgram = loyaltyProgramsData?.find(
      item => item.props.id === loyaltyProgramId
    );

    if (!selectedProgram) {
      message.error(t('marketing.errorCampaign'));
      return;
    }

    try {
      const updateRequest: UpdateMarketingCampaignRequest = {
        posIds: selectedPosIds,
        ltyProgramParticipantId: selectedProgram.props.participantId,
        status: MarketingCampaignStatus.ACTIVE,
      };

      await triggerUpdate(updateRequest);
    } catch (error) {
      message.error(t('marketing.errorCampaign'));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const sheetElement = sheetRef.current?.querySelector('.geography-sheet-content');
    if (!sheetElement) return;

    const rect = sheetElement.getBoundingClientRect();
    const touchY = e.touches[0].clientY;
    const relativeY = touchY - rect.top;

    if (relativeY > 80) return;

    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
    dragStartPosition.current = sheetPosition;
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY.current;
    const newPosition = Math.max(0, dragStartPosition.current + deltaY);

    const maxDrag = window.innerHeight * 0.6;
    setSheetPosition(Math.min(newPosition, maxDrag));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const threshold = window.innerHeight * 0.2;
    if (sheetPosition > threshold) {
      setSheetPosition(window.innerHeight * 0.4);
    } else {
      setSheetPosition(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col bg-background02" style={{ height: '100vh', minHeight: '100vh' }}>
      <div className="hidden sm:flex items-center space-x-4 mb-6 flex-shrink-0 px-4 pt-4">
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

      <div className="relative flex-1 min-h-0 overflow-hidden" style={{ flex: '1 1 0%' }}>
        <div className="absolute inset-0 w-full h-full bg-gray-100">
          <style dangerouslySetInnerHTML={{
            __html: `
            .geography-full-map {
              height: 100% !important;
              width: 100% !important;
            }
            .geography-full-map > div {
              height: 100% !important;
              width: 100% !important;
              max-width: none !important;
              display: flex !important;
              justify-content: flex-start !important;
              align-items: flex-start !important;
            }
            .geography-full-map > div > div {
              height: 100% !important;
              width: 100% !important;
              max-width: none !important;
              border-radius: 0 !important;
              flex: 1 !important;
            }
          `}} />
          <div className="geography-full-map w-full h-full">
            <ParticipantsMap
              participants={visibleParticipants}
              loading={participantsLoading || loadingMarketingCampaign || isValidating}
            />
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 sm:hidden z-10 pointer-events-none"
          style={{
            transform: `translateY(${sheetPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
          ref={sheetRef}
        >
          <div
            className="pointer-events-auto geography-sheet-content"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <GeographyList
              participants={participantsData}
              onSelectionChange={handleSelectionChange}
              showButtons={true}
              onBack={currentStep > 1 ? handleSaveAndExit : undefined}
              onLaunch={handleLaunch}
              initialSelectedIds={marketCampaignByIdData?.posIds}
            />
          </div>
        </div>

        <div className="hidden sm:flex sm:flex-row sm:gap-4 sm:h-full sm:relative sm:z-0 sm:p-4">
          <div className="sm:w-96 sm:flex-shrink-0 sm:z-10">
            <GeographyList
              participants={participantsData}
              onSelectionChange={handleSelectionChange}
              initialSelectedIds={marketCampaignByIdData?.posIds}
            />
          </div>
        </div>
      </div>

      <div className="hidden sm:flex justify-end gap-2 mt-3 px-4 pb-4 flex-shrink-0">
        {currentStep > 1 && (
          <Button onClick={handleSaveAndExit} loading={isUpdating} className="w-full sm:w-auto">
            {t('marketingLoyalty.saveAndExit')}
          </Button>
        )}
        <Button
          htmlType="submit"
          type="primary"
          icon={<PlayCircleFilled />}
          className="w-full sm:w-auto"
          onClick={handleLaunch}
          loading={isUpdating}
        >
          {t('marketing.launchNow')}
        </Button>
      </div>
    </div>
  );
};

export default Geography;
