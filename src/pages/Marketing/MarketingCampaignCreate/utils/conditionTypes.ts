import { MarketingCampaignConditionType } from '@/services/api/marketing';

export const getAllConditionTypes = (t: (key: string) => string) => [
  {
    label: t('marketingCampaigns.timePeriod'),
    value: MarketingCampaignConditionType.TIME_RANGE,
  },
  {
    label: t('marketingCampaigns.dayOfWeek'),
    value: MarketingCampaignConditionType.WEEKDAY,
  },
  {
    label: t('marketingCampaigns.purchaseAmount'),
    value: MarketingCampaignConditionType.PURCHASE_AMOUNT,
  },
  {
    label: t('marketingCampaigns.numberOfVisits'),
    value: MarketingCampaignConditionType.VISIT_COUNT,
  },
  {
    label: t('marketingCampaigns.promoCodeEntry'),
    value: MarketingCampaignConditionType.PROMOCODE_ENTRY,
  },
  {
    label: t('marketing.birth'),
    value: MarketingCampaignConditionType.BIRTHDAY,
  },
];

export const getFilteredConditionTypes = (
  actionType: string | undefined,
  t: (key: string) => string
) => {
  const allTypes = getAllConditionTypes(t);

  return actionType === 'PROMOCODE_ISSUE'
    ? allTypes.filter(
        type => type.value === MarketingCampaignConditionType.PROMOCODE_ENTRY
      )
    : allTypes.filter(
        type => type.value !== MarketingCampaignConditionType.PROMOCODE_ENTRY
      );
};


