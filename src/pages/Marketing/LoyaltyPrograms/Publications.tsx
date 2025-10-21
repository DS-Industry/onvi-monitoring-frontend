import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileTextOutlined, PlayCircleOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import {
  getLoyaltyProgramById,
  getPosesParticipants,
} from '@/services/api/marketing';
import { useSearchParams } from 'react-router-dom';
import { Button, Divider } from 'antd';

const Publications: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));

  const { data: program } = useSWR(
    loyaltyProgramId ? [`get-loyalty-program-by-id`, loyaltyProgramId] : null,
    () => getLoyaltyProgramById(loyaltyProgramId)
  );

  const { data: participantsData } = useSWR(
    loyaltyProgramId ? [`get-devices`, loyaltyProgramId] : null,
    () => getPosesParticipants(loyaltyProgramId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  return (
    <div>
      <div className="flex items-center justify-center bg-background02 p-4">
        <div className="flex flex-col rounded-lg p-8 w-full md:p-0 space-y-10">
          <div className="flex flex-col space-y-10 sm:space-y-0 sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary02 flex items-center justify-center text-text04">
                <FileTextOutlined style={{ fontSize: 20 }} />
              </div>
              <div>
                <div className="font-semibold text-text01">
                  {t('marketingLoyalty.publication')}
                </div>
                <div className="text-base03 text-xs">
                  {t('marketingLoyalty.implementation')}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="text-sm font-semibold text-text01">
              {t('marketingLoyalty.basicInformation')}
            </div>
            <div className="flex flex-col space-y-4 text-text01 text-xs">
              <div>{t('marketingLoyalty.name')}</div>
              <div>{t('marketingLoyalty.description')}</div>
              <div>{t('marketingLoyalty.maxLevels')}</div>
            </div>
            <div className="flex flex-col space-y-4 text-sm text-base03">
              <div>{program?.name || '-'}</div>
              <div>{program?.description || '-'}</div>
              <div>{program?.maxLevels || '-'}</div>
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="text-sm font-semibold text-text01">
              {t('marketing.write')}
            </div>
            <div className="flex flex-col space-y-4 text-text01 text-xs">
              <div>{t('marketingLoyalty.maxWriteOffPercent')}</div>
              <div>{t('marketing.use')}</div>
              <div>{t('marketingLoyalty.bonusExpiration')}</div>
            </div>
            <div className="flex flex-col space-y-4 text-sm text-base03">
              <div>{program?.maxRedeemPercentage || '0%'}</div>
              <div>{program?.hasBonusWithSale || '-'}</div>
              <div>
                {program?.lifetimeBonusDays || '-'} {t('marketingLoyalty.days')}
              </div>
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="text-sm font-semibold text-text01">
              {t('marketingLoyalty.participantsAndLevels')}
            </div>
            <div className="flex flex-col space-y-4 text-text01 text-xs">
              <div>{t('marketingLoyalty.participatingBranches')}</div>
              <div>{t('marketingLoyalty.numberOfLevels')}</div>
            </div>
            <div className="flex flex-col space-y-4 text-sm text-base03">
              <div>{participantsData?.length || '-'}</div>
              <div>{program?.maxLevels || '-'}</div>
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="text-sm font-semibold text-text01">
              {t('marketingLoyalty.hub')}
            </div>
            <div className="flex flex-col space-y-4 text-base03 text-xs">
              <div>{t('marketingLoyalty.hubRequest')}</div>
            </div>
            <Button className="bg-primary01 w-28">
              {t('marketingLoyalty.request')}
            </Button>
          </div>
          <div className="flex space-x-4 justify-end">
            <Button className="text-primary02">
              {t('marketingLoyalty.saveAndExit')}
            </Button>
            <Button type="primary" icon={<PlayCircleOutlined />}>
              {t('marketingLoyalty.startNow')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publications;
