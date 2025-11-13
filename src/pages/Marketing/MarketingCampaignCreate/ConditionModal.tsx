import React from 'react';
import { Modal, Select, Input, TimePicker, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import {
  MarketingCampaignConditionType,
  Weekday,
} from '@/services/api/marketing';

interface Condition {
  type?: MarketingCampaignConditionType;
  value?: any;
}

interface ConditionModalProps {
  open: boolean;
  onCancel: () => void;
  onApply: (condition: Condition) => void;
  currentCondition: Condition;
  setCurrentCondition: React.Dispatch<React.SetStateAction<Condition>>;
  loading?: boolean;
}

const ConditionModal: React.FC<ConditionModalProps> = ({
  open,
  onCancel,
  onApply,
  currentCondition,
  setCurrentCondition,
  loading,
}) => {
  const { t } = useTranslation();

  const handleTimeChange = (field: 'start' | 'end', value: Dayjs | null) => {
    setCurrentCondition(prev => ({
      ...prev,
      value: {
        ...prev.value,
        [field]: value
          ? dayjs()
              .hour(value.hour())
              .minute(value.minute())
              .second(0)
              .millisecond(0)
              .toISOString()
          : undefined,
      },
    }));
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={() => onApply(currentCondition)}
          disabled={!currentCondition.type}
          loading={loading}
        >
          {t('marketing.apply')}
        </Button>,
      ]}
      centered
      className="rounded-2xl"
    >
      <div className="flex flex-col space-y-6 mb-40">
        <div>
          <div className="text-base font-semibold mb-2">
            {t('marketingCampaigns.conditionType')}
          </div>
          <Select
            className="w-60"
            placeholder={t('marketingCampaigns.conditionType')}
            value={currentCondition.type}
            onChange={type => setCurrentCondition({ type, value: undefined })}
            options={[
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
                label: t('marketingCampaigns.event'),
                value: MarketingCampaignConditionType.EVENT,
              },
            ]}
          />
        </div>

        <div>
          {currentCondition.type && (
            <div className="text-base font-semibold mb-2">
              {t('marketing.value')}
            </div>
          )}

          {currentCondition.type ===
            MarketingCampaignConditionType.TIME_RANGE && (
            <div className="flex space-x-4">
              <TimePicker
                format="HH:mm"
                value={
                  currentCondition.value?.start
                    ? dayjs(currentCondition.value.start)
                    : null
                }
                onChange={v => handleTimeChange('start', v)}
                placeholder={t('filters.dateTime.startTime')}
                className="w-1/2"
              />

              <TimePicker
                format="HH:mm"
                value={
                  currentCondition.value?.end
                    ? dayjs(currentCondition.value.end)
                    : null
                }
                onChange={v => handleTimeChange('end', v)}
                placeholder={t('filters.dateTime.endTime')}
                className="w-1/2"
              />
            </div>
          )}

          {currentCondition.type === MarketingCampaignConditionType.WEEKDAY && (
            <Select
              mode="multiple"
              className="w-60"
              placeholder={t('marketingCampaigns.day')}
              value={currentCondition.value}
              onChange={value =>
                setCurrentCondition(prev => ({ ...prev, value }))
              }
              options={[
                { label: t('common.monday'), value: Weekday.MONDAY },
                { label: t('common.tuesday'), value: Weekday.TUESDAY },
                { label: t('common.wednesday'), value: Weekday.WEDNESDAY },
                { label: t('common.thursday'), value: Weekday.THURSDAY },
                { label: t('common.friday'), value: Weekday.FRIDAY },
                { label: t('common.saturday'), value: Weekday.SATURDAY },
                { label: t('common.sunday'), value: Weekday.SUNDAY },
              ]}
            />
          )}

          {currentCondition.type ===
            MarketingCampaignConditionType.PURCHASE_AMOUNT && (
            <Input
              type="number"
              className="w-60"
              placeholder={t('marketing.enter')}
              value={currentCondition.value}
              onChange={e =>
                setCurrentCondition(prev => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
              suffix={<div>₽</div>}
            />
          )}

          {currentCondition.type ===
            MarketingCampaignConditionType.VISIT_COUNT && (
            <Input
              type="number"
              className="w-60"
              placeholder={t('techTasks.enterDaysCount')}
              value={currentCondition.value}
              onChange={e =>
                setCurrentCondition(prev => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
            />
          )}

          {currentCondition.type ===
            MarketingCampaignConditionType.PROMOCODE_ENTRY && (
            <Input
              className="w-60"
              placeholder={t('subscriptions.enter')}
              value={currentCondition.value}
              onChange={e =>
                setCurrentCondition(prev => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
            />
          )}

          {currentCondition.type === MarketingCampaignConditionType.EVENT && (
            <Select
              className="w-60"
              placeholder={t('marketingCampaigns.selectEvent')}
              value={currentCondition.value}
              onChange={value =>
                setCurrentCondition(prev => ({ ...prev, value }))
              }
              options={[
                { label: 'Birthday', value: 'birthday' },
                { label: 'Anniversary', value: 'anniversary' },
              ]}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConditionModal;
