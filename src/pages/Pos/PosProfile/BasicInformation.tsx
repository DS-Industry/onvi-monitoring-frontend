import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CarOutlined } from '@ant-design/icons';
import FactoryLetterS from '@/assets/Factory Letter S.png';
import useFormHook from '@/hooks/useFormHook';
import { Input, Select, TimePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const BasicInformation: React.FC = () => {
  const { t } = useTranslation();

  const defaultValues = {
    name: '',
    description: '',
    address: '',
    startTime: '',
    endTime: '',
    monthlyPlan: 0,
    organizationId: 0,
    carWashPosType: '',
    minSumOrder: 0,
    maxSumOrder: 0,
    stepSumAmount: 0
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, setValue } = useFormHook(formData);

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const handleTimeChange = (
    field: 'startTime' | 'endTime',
    time: Dayjs | null
  ) => {
    const timeString = time ? time.format('HH:mm') : '';
    setFormData(prev => ({ ...prev, [field]: timeString }));
    setValue(field, timeString);
  };

  const onSubmit = async () => {};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col lg:flex-row bg-background02 rounded-lg overflow-hidden"
    >
      {/* Left Section – Form */}
      <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <CarOutlined className="text-2xl text-white" />
          </div>
          <div>
            <div className="font-bold text-text01 text-2xl">
              {t('pos.basicInformation')}
            </div>
            <div className="text-text02 text-md">{t('pos.displaying')}</div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 sm:space-y-8">
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('equipment.name')}
            </div>
            <Input
              placeholder={t('organizations.fullNamePlaceholder')}
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('name')}
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('marketing.address')}
            </div>
            <Input
              placeholder={t('marketing.enterAddress')}
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('address')}
              value={formData.address}
              onChange={e => handleInputChange('address', e.target.value)}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.opening')}
            </div>
            <div className="flex items-center space-x-2">
              <div>С</div>
              <TimePicker
                placeholder={t('shift.selectStartTime')}
                format="HH:mm"
                className="w-32"
                {...register('startTime')}
                value={
                  formData.startTime ? dayjs(formData.startTime, 'HH:mm') : null
                }
                onChange={time => handleTimeChange('startTime', time)}
              />
              <div className="flex items-center space-x-2">
                <div>{t('analysis.endDate')}</div>
                <TimePicker
                  placeholder={t('shift.selectEndTime')}
                  format="HH:mm"
                  className="w-32"
                  {...register('endTime')}
                  value={
                    formData.endTime ? dayjs(formData.endTime, 'HH:mm') : null
                  }
                  onChange={time => handleTimeChange('endTime', time)}
                />
              </div>
            </div>
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.monthly')}
            </div>
            <Input
              type="number"
              placeholder={'00'}
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('monthlyPlan')}
              value={formData.monthlyPlan}
              onChange={e => handleInputChange('monthlyPlan', e.target.value)}
              suffix={<div>₽</div>}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.company')}
            </div>
            <Select
              placeholder={t('pos.companyName')}
              options={[]}
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('organizationId')}
              value={formData.organizationId}
              onChange={value => handleInputChange('organizationId', value)}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.type')}
            </div>
            <Select
              placeholder={t('pos.self')}
              options={[
                { label: 'МСО', value: 'SelfService' },
                { label: t('pos.robot'), value: 'Portal' },
                {
                  label: `МСО + ${t('pos.robot')}`,
                  value: 'SelfServiceAndPortal',
                },
              ]}
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('carWashPosType')}
              value={formData.carWashPosType}
              onChange={value => handleInputChange('carWashPosType', value)}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.minAmount')}
            </div>
            <Input
              placeholder="00"
              type="number"
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('minSumOrder')}
              value={formData.minSumOrder !== null ? formData.minSumOrder : ''}
              onChange={e => handleInputChange('minSumOrder', e.target.value)}
              suffix={<div>₽</div>}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.maxAmount')}
            </div>
            <Input
              placeholder="00"
              type="number"
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('maxSumOrder')}
              value={formData.maxSumOrder !== null ? formData.maxSumOrder : ''}
              onChange={e => handleInputChange('maxSumOrder', e.target.value)}
              suffix={<div>₽</div>}
            />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('pos.stepAmount')}
            </div>
            <Input
              placeholder="00"
              type="number"
              className="w-full sm:w-auto sm:min-w-72 lg:min-w-96"
              {...register('stepSumAmount')}
              value={formData.stepSumAmount !== null ? formData.stepSumAmount : ''}
              onChange={e => handleInputChange('stepSumAmount', e.target.value)}
              suffix={<div>₽</div>}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 hidden lg:flex items-center justify-center bg-white">
        <img
          src={FactoryLetterS}
          alt="Factory illustration"
          loading="lazy"
          decoding="async"
          className="object-contain w-[500px] h-auto"
        />
      </div>
    </form>
  );
};

export default BasicInformation;
