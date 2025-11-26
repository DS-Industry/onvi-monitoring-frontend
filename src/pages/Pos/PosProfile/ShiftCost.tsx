import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GoldOutlined } from '@ant-design/icons';
import useFormHook from '@/hooks/useFormHook';
import { Button, Input, Select } from 'antd';
import ProfilePosTabTwo from '@/assets/ProfilePosTabTwo.webp';
import useSWR from 'swr';
import { getPositions } from '@/services/api/hr';
import { useUser } from '@/hooks/useUserStore';

const ShiftCost: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();

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
    salary: 0,
    bonus: 0,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, setValue } = useFormHook(formData);

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value: number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async () => {};

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
              onChange={value => handleInputChange('hrPositionId', value)}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('finance.salary')}
            </div>
            <Input
              type="number"
              placeholder={'00'}
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('salary')}
              value={formData.salary}
              onChange={e =>
                handleInputChange('salary', Number(e.target.value))
              }
              suffix={<div>₽</div>}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.bonusPart')}
            </div>
            <Input
              type="number"
              placeholder={'00'}
              className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
              {...register('bonus')}
              value={formData.bonus}
              onChange={e => handleInputChange('bonus', Number(e.target.value))}
              suffix={<div>₽</div>}
            />
          </div>
          <Button htmlType="submit" className="w-full sm:w-96" type="primary">
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
