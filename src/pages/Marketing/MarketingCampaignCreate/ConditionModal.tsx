import React from 'react';
import { Modal, Select, Input, TimePicker, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { Dayjs } from 'dayjs';

interface Condition {
  type?: string;
  value?: any;
}

interface ConditionModalProps {
  open: boolean;
  onCancel: () => void;
  onApply: (condition: Condition) => void;
  currentCondition: Condition;
  setCurrentCondition: React.Dispatch<React.SetStateAction<Condition>>;
}

const ConditionModal: React.FC<ConditionModalProps> = ({
  open,
  onCancel,
  onApply,
  currentCondition,
  setCurrentCondition,
}) => {
  const { t } = useTranslation();

  const handleTimeChange = (field: 'start' | 'end', value: Dayjs | null) => {
    setCurrentCondition(prev => ({
      ...prev,
      value: {
        ...prev.value,
        [field]: value ? value.format('HH:mm') : undefined,
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
                value: 'timePeriod',
              },
              { label: t('marketingCampaigns.dayOfWeek'), value: 'dayOfWeek' },
              {
                label: t('marketingCampaigns.purchaseAmount'),
                value: 'purchaseAmount',
              },
              {
                label: t('marketingCampaigns.numberOfVisits'),
                value: 'numberOfVisits',
              },
              {
                label: t('marketingCampaigns.promoCodeEntry'),
                value: 'promoCodeEntry',
              },
              { label: t('marketingCampaigns.event'), value: 'event' },
            ]}
          />
        </div>

        <div>
          {currentCondition.type && (
            <div className="text-base font-semibold mb-2">
              {t('marketing.value')}
            </div>
          )}

          {currentCondition.type === 'timePeriod' && (
            <div className="flex space-x-4">
              <TimePicker
                format="HH:mm"
                placeholder={t('filters.dateTime.startTime')}
                onChange={v => handleTimeChange('start', v)}
                className="w-1/2"
              />
              <TimePicker
                format="HH:mm"
                placeholder={t('filters.dateTime.endTime')}
                onChange={v => handleTimeChange('end', v)}
                className="w-1/2"
              />
            </div>
          )}

          {currentCondition.type === 'dayOfWeek' && (
            <Select
              mode="multiple"
              className="w-60"
              placeholder={t('marketingCampaigns.day')}
              value={currentCondition.value}
              onChange={value =>
                setCurrentCondition(prev => ({ ...prev, value }))
              }
              options={[
                { label: t('common.monday'), value: 'monday' },
                { label: t('common.tuesday'), value: 'tuesday' },
                { label: t('common.wednesday'), value: 'wednesday' },
                { label: t('common.thursday'), value: 'thursday' },
                { label: t('common.friday'), value: 'friday' },
                { label: t('common.saturday'), value: 'saturday' },
                { label: t('common.sunday'), value: 'sunday' },
              ]}
            />
          )}

          {currentCondition.type === 'purchaseAmount' && (
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

          {currentCondition.type === 'numberOfVisits' && (
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

          {currentCondition.type === 'promoCodeEntry' && (
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

          {currentCondition.type === 'event' && (
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
