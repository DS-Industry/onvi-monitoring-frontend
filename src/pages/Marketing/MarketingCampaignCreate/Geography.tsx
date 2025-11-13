import React, { useState, useCallback, useRef, useEffect } from 'react';
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
    loyaltyProgramId ? [`get-devices`, loyaltyProgramId] : null,
    () => getPosesParticipants(loyaltyProgramId),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
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

  const goBack = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep - 1,
    });
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
              loading={participantsLoading}
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
              onBack={currentStep > 1 ? goBack : undefined}
              onLaunch={() =>
                updateSearchParams(searchParams, setSearchParams, { step: 4 })
              }
            />
          </div>
        </div>

        <div className="hidden sm:flex sm:flex-row sm:gap-4 sm:h-full sm:relative sm:z-0 sm:p-4">
          <div className="sm:w-96 sm:flex-shrink-0 sm:z-10">
            <GeographyList
              participants={participantsData}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </div>
      </div>

      <div className="hidden sm:flex justify-end gap-2 mt-3 px-4 pb-4 flex-shrink-0">
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
