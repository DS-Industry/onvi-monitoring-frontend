import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoldOutlined } from '@ant-design/icons';
import useFormHook from '@/hooks/useFormHook';
import { Button, Input, Select } from 'antd';
import ProfilePosTabTwo from '@/assets/ProfilePosTabTwo.webp';
import useSWR, { mutate } from 'swr';
import { getPositions } from '@/services/api/hr';
import { useUser } from '@/hooks/useUserStore';
import { getPosById, updatePositionSalaryRate } from '@/services/api/pos';
import { useSearchParams } from 'react-router-dom';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';

const ShiftCost: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const { showToast } = useToast();

  const [searchParams] = useSearchParams();
  const posId = Number(searchParams.get('posId')) || undefined;

  const { data: posData } = useSWR(
    posId ? [`get-pos-by-id`, posId] : null,
    () => getPosById(posId!),
    {
      shouldRetryOnError: false,
    }
  );

  const { data: positionData } = useSWR(
    user.organizationId ? [`get-positions`, user.organizationId] : null,
    () =>
      getPositions({
        organizationId: user.organizationId,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const positions: { value: number; label: string }[] =
    positionData?.map(item => ({
      value: item.props.id,
      label: item.props.name,
    })) || [];

  const defaultValues = {
    hrPositionId: 0,
    baseRateDay: 0,
    bonusRateDay: 0,
    baseRateNight: 0,
    bonusRateNight: 0,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, setValue } = useFormHook(formData);

  useEffect(() => {
    if (
      formData.hrPositionId > 0 &&
      posData?.positionSalaryRates &&
      Array.isArray(posData.positionSalaryRates) &&
      posData.positionSalaryRates.length > 0
    ) {
      const positionRate = posData.positionSalaryRates.find(
        rate => rate.hrPositionId === formData.hrPositionId
      );

      if (positionRate) {
        const newValues = {
          baseRateDay: positionRate.baseRateDay ?? 0,
          bonusRateDay: positionRate.bonusRateDay ?? 0,
          baseRateNight: positionRate.baseRateNight ?? 0,
          bonusRateNight: positionRate.bonusRateNight ?? 0,
        };

        setFormData(prev => ({
          ...prev,
          ...newValues,
        }));
        setValue('baseRateDay', newValues.baseRateDay);
        setValue('bonusRateDay', newValues.bonusRateDay);
        setValue('baseRateNight', newValues.baseRateNight);
        setValue('bonusRateNight', newValues.bonusRateNight);
      } else {
        const resetValues = {
          baseRateDay: 0,
          bonusRateDay: 0,
          baseRateNight: 0,
          bonusRateNight: 0,
        };
        setFormData(prev => ({
          ...prev,
          ...resetValues,
        }));
        setValue('baseRateDay', 0);
        setValue('bonusRateDay', 0);
        setValue('baseRateNight', 0);
        setValue('bonusRateNight', 0);
      }
    } else if (formData.hrPositionId === 0) {
      const resetValues = {
        baseRateDay: 0,
        bonusRateDay: 0,
        baseRateNight: 0,
        bonusRateNight: 0,
      };
      setFormData(prev => ({
        ...prev,
        ...resetValues,
      }));
      setValue('baseRateDay', 0);
      setValue('bonusRateDay', 0);
      setValue('baseRateNight', 0);
      setValue('bonusRateNight', 0);
    }
  }, [formData.hrPositionId, posData, setValue]);

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value: number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const { trigger: updatePositionRate, isMutating: isUpdating } = useSWRMutation(
    [`update-position-salary-rate`, posId],
    async () => {
      if (!posId || !formData.hrPositionId) {
        throw new Error('Missing required fields');
      }
      return updatePositionSalaryRate(posId, {
        posId,
        hrPositionId: formData.hrPositionId,
        baseRateDay: formData.baseRateDay,
        bonusRateDay: formData.bonusRateDay,
        baseRateNight: formData.baseRateNight,
        bonusRateNight: formData.bonusRateNight,
      });
    }
  );

  const onSubmit = async () => {
    if (!formData.hrPositionId) {
      showToast(t('hr.selectPos'), 'error');
      return;
    }

    try {
      const result = await updatePositionRate();
      if (result) {
        mutate([`get-pos-by-id`, posId]);
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-10 bg-background02"
    >
      <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <GoldOutlined className="text-2xl text-white" />
          </div>
          <div>
            <div className="font-bold text-text01 text-2xl">
              {t('pos.shiftCost')}
            </div>
            <div className="text-text02 text-md">{t('pos.displayingCost')}</div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 sm:space-y-8">
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('roles.job')}
            </div>
            <Select
              options={positions}
              placeholder={t('hr.selectPos')}
              className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
              value={
                formData.hrPositionId === 0 ? undefined : formData.hrPositionId
              }
              onChange={value => handleInputChange('hrPositionId', value || 0)}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.baseRateDay')}
            </div>
            <Input
              type="number"
              placeholder={'00'}
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('baseRateDay')}
              value={formData.baseRateDay || ''}
              onChange={e =>
                handleInputChange('baseRateDay', Number(e.target.value) || 0)
              }
              suffix={<div>₽</div>}
              disabled={formData.hrPositionId === 0}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.bonusRateDay')}
            </div>
            <Input
              type="number"
              placeholder={'00'}
              className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
              {...register('bonusRateDay')}
              value={formData.bonusRateDay || ''}
              onChange={e => handleInputChange('bonusRateDay', Number(e.target.value) || 0)}
              suffix={<div>₽</div>}
              disabled={formData.hrPositionId === 0}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.baseRateNight')}
            </div>
            <Input
              type="number"
              placeholder={'00'}
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('baseRateNight')}
              value={formData.baseRateNight || ''}
              onChange={e =>
                handleInputChange('baseRateNight', Number(e.target.value) || 0)
              }
              suffix={<div>₽</div>}
              disabled={formData.hrPositionId === 0}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.bonusRateNight')}
            </div>
            <Input
              type="number"
              placeholder={'00'}
              className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
              {...register('bonusRateNight')}
              value={formData.bonusRateNight || ''}
              onChange={e => handleInputChange('bonusRateNight', Number(e.target.value) || 0)}
              suffix={<div>₽</div>}
              disabled={formData.hrPositionId === 0}
            />
          </div>
          <Button
            htmlType="submit"
            className="w-full sm:w-96"
            type="primary"
            loading={isUpdating}
          >
            {t('marketing.apply')}
          </Button>
        </div>
      </div>

      <div className="flex-1 hidden lg:flex items-center justify-center bg-white">
        <img
          src={ProfilePosTabTwo}
          alt="Factory illustration"
          loading="lazy"
          decoding="async"
          className="object-contain w-[500px] h-auto"
        />
      </div>
    </form>
  );
};

export default ShiftCost;
