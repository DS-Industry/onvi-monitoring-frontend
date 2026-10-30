import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Link } from 'react-router-dom';
import { CarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useSWR from 'swr';
import type { MarketingCampaignResponse } from '@/services/api/marketing';
import { ACTION_TYPE } from '@/services/api/marketing';
import { getPlacement } from '@/services/api/device';
import {
  isRegistrationCampaign,
  isRegistrationGiftPointsCampaign,
  parseRegistrationGiftPointsPayload,
  parseRegistrationPayload,
} from '../MarketingCampaignCreate/utils/registrationCampaign';

const ACTION_TYPE_LABEL_KEYS: Record<ACTION_TYPE, string> = {
  DISCOUNT: 'marketingCampaigns.discount',
  PROMOCODE_ISSUE: 'marketingCampaigns.promocode',
  CASHBACK_BOOST: 'marketingCampaigns.cashback',
  GIFT_POINTS: 'marketingCampaigns.points',
};

interface GeneralInfoProps {
  campaign: MarketingCampaignResponse;
  conditionsCount: number;
}

interface InfoFieldItem {
  label: string;
  value: React.ReactNode;
}

const InfoRow: React.FC<{
  sectionTitle: string;
  fields: InfoFieldItem[];
  showDivider?: boolean;
}> = ({ sectionTitle, fields, showDivider = true }) => (
  <div className={showDivider ? 'border-b border-[#EEF0F4] p-8' : 'p-8'}>
    <div className="grid grid-cols-1 gap-y-4 md:grid-cols-[200px_240px_minmax(0,1fr)] md:gap-x-20 lg:gap-x-28">
      <div className="font-semibold text-text01">{sectionTitle}</div>
      <div className="flex flex-col gap-4">
        {fields.map(field => (
          <div key={field.label} className="text-sm text-text01">
            {field.label}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {fields.map(field => (
          <div key={field.label} className="whitespace-pre-wrap text-[13px] text-text02">
            {field.value}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DISCOUNT_TYPE_LABEL_KEYS: Record<string, string> = {
  PERCENTAGE: 'marketingCampaigns.percentage',
  FIXED_AMOUNT: 'marketingCampaigns.fixedAmount',
  FREE_SERVICE: 'marketingCampaigns.freeService',
};

const getRegistrationFields = (
  campaign: MarketingCampaignResponse,
  regionName: string,
  t: TFunction
): InfoFieldItem[] => {
  const payload = parseRegistrationPayload(campaign.actionPayload);
  const discountValue =
    payload.discountType === 'FREE_SERVICE'
      ? t(DISCOUNT_TYPE_LABEL_KEYS.FREE_SERVICE)
      : `${payload.discountValue} ${payload.discountType === 'PERCENTAGE' ? '%' : '₽'}`;
  const formatRub = (value?: number) => (value !== undefined ? `${value} ₽` : '—');

  return [
    { label: t('pos.city'), value: regionName },
    {
      label: t('marketing.discountType'),
      value: t(DISCOUNT_TYPE_LABEL_KEYS[payload.discountType] ?? payload.discountType),
    },
    { label: t('marketing.discountValue'), value: discountValue },
    { label: t('marketingCampaigns.validDays'), value: payload.validDays },
    {
      label: t('marketingCampaigns.minOrderAmount'),
      value: formatRub(payload.minOrderAmount),
    },
    {
      label: t('marketingCampaigns.maxDiscountAmount'),
      value: formatRub(payload.maxDiscountAmount),
    },
  ];
};

const getRegistrationGiftPointsFields = (
  campaign: MarketingCampaignResponse,
  regionName: string,
  t: TFunction
): InfoFieldItem[] => {
  const payload = parseRegistrationGiftPointsPayload(campaign.actionPayload);

  return [
    { label: t('pos.city'), value: regionName },
    { label: t('marketingCampaigns.registrationPointsAmount'), value: payload.points },
    {
      label: t('marketingCampaigns.registrationPointsDuration'),
      value: payload.durationDays ?? t('marketingCampaigns.registrationPointsTierExpiry'),
    },
  ];
};

const GeneralInfo: React.FC<GeneralInfoProps> = ({ campaign, conditionsCount }) => {
  const { t } = useTranslation();

  const executionTypeLabel = campaign.executionType
    ? t(`tables.${campaign.executionType}`)
    : '—';

  const isRegistration = isRegistrationCampaign(campaign);
  const isRegistrationGiftPoints = isRegistrationGiftPointsCampaign(campaign);

  // A registration campaign is stored as PROMOCODE_ISSUE or GIFT_POINTS, so
  // name it explicitly.
  const actionTypeLabel = isRegistrationGiftPoints
    ? t('marketingCampaigns.registrationPoints')
    : isRegistration
    ? t('marketingCampaigns.registration')
    : campaign.actionType
      ? t(ACTION_TYPE_LABEL_KEYS[campaign.actionType as ACTION_TYPE] ?? campaign.actionType)
      : '—';

  // Same SWR key as CityFilter, so the placements list is shared from cache.
  const { data: placements } = useSWR(isRegistration ? 'get-city' : null, getPlacement, {
    shouldRetryOnError: false,
  });
  const regionName =
    placements?.find(item => item.id === campaign.placementId)?.region ?? '—';

  const dateRange =
    campaign.launchDate && campaign.endDate
      ? `${dayjs(campaign.launchDate).format('DD.MM.YYYY')} - ${dayjs(campaign.endDate).format('DD.MM.YYYY')}`
      : campaign.launchDate
        ? dayjs(campaign.launchDate).format('DD.MM.YYYY')
        : '—';

  const loyaltyProgramValue =
    campaign.ltyProgramId && campaign.ltyProgramName ? (
      <Link
        to={{
          pathname: `/marketing/loyalty/program/${campaign.ltyProgramId}`,
          search: `?loyaltyProgramId=${campaign.ltyProgramId}&mode=edit`,
        }}
        className="text-primary02 hover:text-primary02_Hover"
      >
        {campaign.ltyProgramName}
      </Link>
    ) : (
      campaign.ltyProgramName || '—'
    );

  return (
    <div className="mx-24 bg-white">
      <div className="flex items-center gap-4 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary02 text-white">
          <CarOutlined style={{ fontSize: 24 }} />
        </div>
        <div className="text-2xl font-normal text-text01">{t('warehouse.basic')}</div>
      </div>

      <InfoRow
        sectionTitle={t('marketingLoyalty.basicInformation')}
        fields={[
          { label: t('marketingLoyalty.name'), value: campaign.name || '—' },
          {
            label: t('marketingLoyalty.description'),
            value: campaign.description || '—',
          },
          { label: t('marketing.loyaltyProgram'), value: loyaltyProgramValue },
          { label: t('equipment.dateRange'), value: dateRange },
        ]}
      />

      <InfoRow
        sectionTitle={t('marketingCampaigns.actionType')}
        fields={[
          { label: t('marketingCampaigns.actionType'), value: actionTypeLabel },
          { label: t('marketingCampaigns.triggerType'), value: executionTypeLabel },
        ]}
      />

      <InfoRow
        sectionTitle={t('marketingCampaigns.participantsAndPrizes')}
        showDivider={false}
        fields={
          isRegistrationGiftPoints
            ? getRegistrationGiftPointsFields(campaign, regionName, t)
            : isRegistration
            ? getRegistrationFields(campaign, regionName, t)
            : [
                {
                  label: t('marketingLoyalty.participatingBranches'),
                  value: campaign.posCount ?? '—',
                },
                {
                  label: t('marketingCampaigns.numberOfThresholds'),
                  value: conditionsCount,
                },
                {
                  label: t('marketingCampaigns.accumulationPeriod'),
                  value: '—',
                },
              ]
        }
      />
    </div>
  );
};

export default GeneralInfo;
