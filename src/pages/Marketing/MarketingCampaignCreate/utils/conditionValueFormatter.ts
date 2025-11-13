import dayjs from 'dayjs';
import {
  MarketingCampaignConditionType,
  Weekday,
} from '@/services/api/marketing';

export const getWeekdayTranslations = (
  t: (key: string) => string
): Record<Weekday, string> => ({
  [Weekday.MONDAY]: t('common.monday'),
  [Weekday.TUESDAY]: t('common.tuesday'),
  [Weekday.WEDNESDAY]: t('common.wednesday'),
  [Weekday.THURSDAY]: t('common.thursday'),
  [Weekday.FRIDAY]: t('common.friday'),
  [Weekday.SATURDAY]: t('common.saturday'),
  [Weekday.SUNDAY]: t('common.sunday'),
});

export const formatConditionValue = (
  condition: any,
  t: (key: string) => string
): string => {
  switch (condition.type) {
    case MarketingCampaignConditionType.TIME_RANGE:
      return `${dayjs(condition.startTime).format('HH:mm')} - ${dayjs(condition.endTime).format('HH:mm')}`;

    case MarketingCampaignConditionType.WEEKDAY: {
      const weekdayTranslations = getWeekdayTranslations(t);
      return (
        condition.weekdays
          ?.map((day: Weekday) => weekdayTranslations[day] || day)
          .join(', ') ?? ''
      );
    }

    case MarketingCampaignConditionType.VISIT_COUNT:
      return `${condition.visitCount}`;

    case MarketingCampaignConditionType.PURCHASE_AMOUNT:
      return `${condition.minAmount}`;

    case MarketingCampaignConditionType.PROMOCODE_ENTRY:
      return condition.promocode?.code ?? '';

    case MarketingCampaignConditionType.BIRTHDAY:
      return t('marketing.birth');

    default:
      return '';
  }
};

