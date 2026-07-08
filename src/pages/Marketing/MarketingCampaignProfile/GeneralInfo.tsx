import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { MarketingCampaignResponse } from '@/services/api/marketing';
import { ACTION_TYPE } from '@/services/api/marketing';

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

const GeneralInfo: React.FC<GeneralInfoProps> = ({ campaign, conditionsCount }) => {
  const { t } = useTranslation();

  const executionTypeLabel = campaign.executionType
    ? t(`tables.${campaign.executionType}`)
    : '—';

  const actionTypeLabel = campaign.actionType
    ? t(ACTION_TYPE_LABEL_KEYS[campaign.actionType as ACTION_TYPE] ?? campaign.actionType)
    : '—';

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
        <div className="text-2xl font-bold text-text01">{t('warehouse.basic')}</div>
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
          { label: t('marketingCampaigns.actionType'), value: executionTypeLabel },
          { label: t('marketingCampaigns.triggerType'), value: actionTypeLabel },
        ]}
      />

      <InfoRow
        sectionTitle={t('marketingCampaigns.participantsAndPrizes')}
        showDivider={false}
        fields={[
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
        ]}
      />
    </div>
  );
};

export default GeneralInfo;
