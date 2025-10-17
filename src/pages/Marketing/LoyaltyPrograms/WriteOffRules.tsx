import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WalletIcon from '@icons/WalletIcon.svg?react';
import { Button, Input, Radio, RadioChangeEvent, Select, Switch } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';
import {
  BonusBurnoutType,
  BonusRedemptionUpdate,
  patchBonusRedemption,
} from '@/services/api/marketing';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';

const WriteOffRules: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [radioValue, setRadioValue] = useState('never');
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  const { showToast } = useToast();

  const defaultValues: BonusRedemptionUpdate = {
    loyaltyProgramId: loyaltyProgramId,
    burnoutType: 'month',
    lifetimeBonusDays: undefined,
    maxRedeemPercentage: 0,
    hasBonusWithSale: false,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, setValue } = useFormHook(formData);

  const { trigger: updateBonusRedemption, isMutating } = useSWRMutation(
    [`create-loyalty-program`],
    async () => patchBonusRedemption(formData)
  );

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value?: number | boolean | BonusBurnoutType
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async () => {
    try {
      const result = await updateBonusRedemption();
      if (result) {
        updateSearchParams(searchParams, setSearchParams, {
          step: 3,
          loyaltyProgramId: result.props.id,
        });
        showToast(t('success.recordCreated'), 'success');
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-center bg-background02 p-4">
        <div className="flex flex-col rounded-lg p-8 w-full md:p-0 space-y-10">
          <div className="flex items-center space-x-4">
            <WalletIcon />
            <div>
              <div className="font-semibold text-text01">
                {t('marketingLoyalty.writeOff')}
              </div>
              <div className="text-text03 text-xs">
                {t('marketingLoyalty.settingUp')}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-1">
            <div className="w-7/12">
              <div className="text-text01 font-semibold">
                {t('marketingLoyalty.maximumWriteOff')}
              </div>
              <div className="text-text03">
                {t('marketingLoyalty.maximumPossible')}
              </div>
            </div>
            <div>
              <Input
                {...register('maxRedeemPercentage')}
                suffix={<div>%</div>}
                className="w-20"
                value={formData.maxRedeemPercentage}
                onChange={e =>
                  handleInputChange(
                    'maxRedeemPercentage',
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-7/12">
              <div className="text-text01 font-semibold">
                {t('marketingLoyalty.useBonuses')}
              </div>
              <div className="text-text03">
                {t('marketingLoyalty.allowBonuses')}
              </div>
            </div>
            <div>
              <Switch
                checked={formData.hasBonusWithSale}
                onChange={checked =>
                  handleInputChange('hasBonusWithSale', checked)
                }
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-7/12">
              <div className="text-text01 font-semibold">
                {t('marketing.burni')}
              </div>
              <div className="text-text03">{t('marketing.bonusesCan')}</div>
            </div>
            <div className="space-y-4">
              <Radio.Group
                value={radioValue}
                onChange={(e: RadioChangeEvent) => {
                  setRadioValue(e.target.value);
                }}
              >
                <Radio
                  value="never"
                  style={{
                    backgroundColor:
                      radioValue === 'never' ? '#E4F0FF' : '#E4E5E7',
                    borderColor: '#E4F0FF',
                    color: '#000',
                    padding: '8px',
                  }}
                >
                  {t('marketing.never')}
                </Radio>
                <Radio
                  value="period"
                  style={{
                    backgroundColor:
                      radioValue === 'period' ? '#E4F0FF' : '#E4E5E7',
                    borderColor: '#E4F0FF',
                    color: '#000',
                    padding: '8px',
                  }}
                >
                  {t('marketingLoyalty.afterPeriod')}
                </Radio>
              </Radio.Group>
              {radioValue === 'period' && (
                <div>
                  <Select
                    placeholder={t('techTasks.selectPeriodicity')}
                    className="min-w-80"
                    value={formData.burnoutType}
                    onChange={value => handleInputChange('burnoutType', value)}
                    popupRender={menu => (
                      <>
                        {menu}
                        <div className="flex items-center p-3 border-t border-gray-200 bg-gray-50">
                          <span>{t('marketingLoyalty.every')}</span>
                          <Input
                            className="mx-2 w-24"
                            type="number"
                            {...register('lifetimeBonusDays')}
                            value={formData.lifetimeBonusDays}
                            onChange={e =>
                              handleInputChange(
                                'lifetimeBonusDays',
                                Number(e.target.value)
                              )
                            }
                            placeholder={t('marketingLoyalty.days')}
                          />
                          <span>{t('marketingLoyalty.days')}</span>
                          <Button
                            type="primary"
                            size="small"
                            className="ml-3"
                            onClick={e => {
                              e.stopPropagation();
                              handleInputChange('burnoutType', 'custom');
                              showToast(
                                t('routes.savedSuccessfully'),
                                'success'
                              );
                            }}
                          >
                            {t('marketing.apply')}
                          </Button>
                        </div>
                      </>
                    )}
                    options={[
                      {
                        label: t('marketingLoyalty.everyMonth'),
                        value: 'month',
                      },
                      {
                        label: t('marketingLoyalty.everyYear'),
                        value: 'year',
                      },
                      {
                        label: '',
                        value: 'custom',
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-auto justify-end gap-2">
        <Button
          htmlType="submit"
          loading={isMutating}
          type="primary"
          icon={<RightOutlined />}
          iconPosition="end"
        >
          {t('common.next')}
        </Button>
      </div>
    </form>
  );
};

export default WriteOffRules;
