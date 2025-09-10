import { MarketingCampaignRequest } from '@/services/api/marketing';
import { Button, DatePicker, Form, Modal } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type LaunchModalProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  onLaunchNow: () => void;
  onLaunch: () => void;
  control: Control<MarketingCampaignRequest>;
};

const LaunchModal: React.FC<LaunchModalProps> = ({
    open,
    onClose,
    loading,
    onLaunchNow,
    onLaunch,
    control
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        closeIcon={true}
        width={700}
        styles={{ mask: { background: 'rgba(0,0,0,0.05)' } }}
        maskClosable={true}
        className="custom-top-right-modal"
      >
        <div className="relative">
          <div className="px-8 py-7">
            <h2 className="font-bold text-2xl mb-2">
              {t('marketing.launchControl')}
            </h2>
            <div className="mb-6 text-base text-text01">
              {t('marketing.launchControlDesc')}
            </div>
            <div className="flex mb-6 gap-2">
              <Button
                type="primary"
                className="flex items-center font-semibold text-base"
                loading={loading}
                onClick={onLaunchNow}
              >
                <span className="mr-2">▶</span>
                {t('marketing.launchNow')}
              </Button>
              <span className="ml-2 text-text01 text-sm">
                {t('marketing.launchNowDesc')}
              </span>
            </div>
            <hr className="border-[#EEE]" />
            <div className="mt-6">
              <div className="text-xl font-semibold mb-4">
                {t('marketing.delayedStart')}
              </div>
              <div className="flex gap-3 items-center">
                <div>
                  <div className="text-sm text-text02">{t('marketing.date')}</div>
                  <Controller
                    name="launchDate"
                    control={control}
                    rules={{ required: t('validation.launchDateRequired') }}
                    render={({ field, fieldState }) => (
                      <Form.Item
                        validateStatus={fieldState.error ? 'error' : ''}
                        help={fieldState.error?.message}
                        className="!mb-0 min-h-[72px]"
                      >
                        <DatePicker
                          {...field}
                          format="DD.MM.YYYY"
                          className="h-10 w-40"
                          placeholder={t('marketing.date')}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={date =>
                            field.onChange(date ? date.toDate() : undefined)
                          }
                          disabledDate={current =>
                            current && current < dayjs().startOf('day')
                          }
                        />
                      </Form.Item>
                    )}
                  />
                </div>
                <div>
                  <div className="text-sm text-text02">{t('filters.dateTime.endDate')}</div>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Form.Item
                        validateStatus={fieldState.error ? 'error' : ''}
                        help={fieldState.error?.message}
                        className="!mb-0 min-h-[72px]"
                      >
                        <DatePicker
                          {...field}
                          format="DD.MM.YYYY"
                          className="h-10 w-40"
                          placeholder={t('filters.dateTime.endDate')}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={date =>
                            field.onChange(date ? date.toDate() : undefined)
                          }
                          disabledDate={current =>
                            current && current < dayjs().startOf('day')
                          }
                        />
                      </Form.Item>
                    )}
                  />
                </div>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={onLaunch}
                  className="h-10 font-semibold text-base mb-[13px]"
                >
                  {t('marketing.schedule')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <style>
        {`
.custom-top-right-modal .ant-modal-content {
  margin: 0 !important; 
  position: fixed !important;
  top: 1.25rem !important; /* adjust vertical offset */
  right: 1.5rem !important; /* adjust horizontal offset */
  max-width: 700px;
  border-radius: 1.5rem;
}

`}
      </style>
    </>
  );
};

export default LaunchModal;
