import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import WalletIcon from '@icons/WalletIcon.svg?react';
import {
  Button,
  Input,
  Radio,
  RadioChangeEvent,
  Select,
  Switch,
  Typography,
} from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useSearchParams } from 'react-router-dom';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import {
  BonusBurnoutType,
  BonusRedemptionUpdate,
  patchBonusRedemption,
  getLoyaltyProgramById,
} from '@/services/api/marketing';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';

const WriteOffRules: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [radioValue, setRadioValue] = useState('never');
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  const currentStep = Number(searchParams.get('step')) || 1;
  const { showToast } = useToast();

  const isUpdate = Boolean(searchParams.get('mode') === 'edit');

  const defaultValues: BonusRedemptionUpdate = {
    loyaltyProgramId: loyaltyProgramId,
    burnoutType: 'month',
    lifetimeBonusDays: undefined,
    maxRedeemPercentage: 0,
    hasBonusWithSale: false,
  };

  const [formData, setFormData] = useState(defaultValues);
  const [initialData, setInitialData] = useState<BonusRedemptionUpdate | null>(
    null
  );
  const [selectOpen, setSelectOpen] = useState(false);

  const { register, handleSubmit, setValue, reset } = useFormHook(formData);

  useEffect(() => {
    const load = async () => {
      if (!loyaltyProgramId) return;
      try {
        const program = await getLoyaltyProgramById(loyaltyProgramId);
        if (program) {
          const rawBurnoutType = program.burnoutType as string | undefined;
          const lifetimeBonusDays = program.lifetimeBonusDays as
            | number
            | undefined;
          const maxRedeemPercentage = program.maxRedeemPercentage as
            | number
            | undefined;
          const hasBonusWithSale = program.hasBonusWithSale as
            | boolean
            | undefined;

          const normalizedType = (rawBurnoutType || '')
            .toString()
            .toLowerCase();
          let burnoutType: BonusBurnoutType | undefined;
          if (normalizedType === 'never') {
            burnoutType = undefined;
          } else if (
            normalizedType === 'month' ||
            normalizedType === 'year' ||
            normalizedType === 'custom'
          ) {
            burnoutType = normalizedType as BonusBurnoutType;
          } else if (
            typeof lifetimeBonusDays === 'number' &&
            lifetimeBonusDays > 0
          ) {
            burnoutType = 'custom';
          } else {
            burnoutType = 'month';
          }

          const next = {
            loyaltyProgramId,
            burnoutType,
            lifetimeBonusDays,
            maxRedeemPercentage: maxRedeemPercentage ?? 0,
            hasBonusWithSale: hasBonusWithSale ?? false,
          } as BonusRedemptionUpdate;

          setFormData(prev => ({ ...prev, ...next }));
          setInitialData(next);
          reset(next);
          setRadioValue(
            next.burnoutType === 'custom' ||
              next.burnoutType === 'month' ||
              next.burnoutType === 'year'
              ? 'period'
              : 'never'
          );
        }
      } catch (error) {
        console.error(
          'Failed to load loyalty program for write-off rules',
          error
        );
      }
    };
    load();
  }, [loyaltyProgramId]);

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

  const isFormChanged = () => {
    if (!initialData) return true;
    return JSON.stringify(initialData) !== JSON.stringify(formData);
  };

  const goNextStep = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: 3,
      loyaltyProgramId,
    });
  };

  const goBack = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep - 1,
    });
  };

  const onSubmit = async () => {
    try {
      if (!isFormChanged()) {
        goNextStep();
        return;
      }

      const result = await updateBonusRedemption();
      if (result) {
        goNextStep();
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
                  if (e.target.value === 'never') {
                    handleInputChange('burnoutType', undefined);
                    handleInputChange('lifetimeBonusDays', undefined);
                    setSelectOpen(false);
                  } else if (e.target.value === 'period') {
                    if (!formData.burnoutType) {
                      handleInputChange('burnoutType', 'month');
                    }
                  }
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
                    className="w-full sm:min-w-80"
                    value={
                      formData.burnoutType ||
                      (formData.lifetimeBonusDays ? 'custom' : undefined)
                    }
                    onChange={value => {
                      handleInputChange('burnoutType', value);
                      if (value !== 'custom') {
                        handleInputChange('lifetimeBonusDays', undefined);
                      }
                    }}
                    open={selectOpen}
                    onDropdownVisibleChange={() => {
                      setSelectOpen(true);
                    }}
                    defaultActiveFirstOption={false}
                    popupRender={menu => (
                      <>
                        {menu}
                        <div className="flex items-center p-3 border-t border-gray-200 bg-gray-50">
                          <Typography.Text>
                            {t('marketingLoyalty.every')}
                          </Typography.Text>
                          <Input
                            className="mx-2 w-24"
                            type="number"
                            {...register('lifetimeBonusDays')}
                            value={formData.lifetimeBonusDays}
                            min={0}
                            disabled={formData.burnoutType !== 'custom'}
                            onChange={e => {
                              if (formData.burnoutType === 'custom') {
                                handleInputChange(
                                  'lifetimeBonusDays',
                                  Number(e.target.value)
                                );
                              }
                            }}
                            placeholder={t('marketingLoyalty.days')}
                          />
                          <span>{t('marketingLoyalty.days')}</span>
                          <Button
                            type="primary"
                            size="small"
                            className="ml-3"
                            disabled={
                              formData.burnoutType === 'custom' &&
                              !formData.lifetimeBonusDays
                            }
                            onClick={e => {
                              e.stopPropagation();
                              if (formData.burnoutType !== 'custom') {
                                handleInputChange(
                                  'lifetimeBonusDays',
                                  undefined
                                );
                              }
                              setSelectOpen(false);
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
                        label: t('marketingLoyalty.custom'),
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
        <div>
          {currentStep > 1 && isUpdate && (
            <Button
              icon={<LeftOutlined />}
              onClick={goBack}
            >
              {t('common.back')}
            </Button>
          )}
        </div>
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
