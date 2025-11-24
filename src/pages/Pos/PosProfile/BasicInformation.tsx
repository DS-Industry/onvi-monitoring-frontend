import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CarOutlined } from '@ant-design/icons';
import ProfilePosTabOne from '@/assets/ProfilePosTabOne.webp';
import useFormHook from '@/hooks/useFormHook';
import { Button, Input, Select, Spin, TimePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { getPosById, updateCarWash } from '@/services/api/pos';
import { getOrganization } from '@/services/api/organization';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';

const BasicInformation: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const posId = Number(searchParams.get('posId')) || undefined;
  const { showToast } = useToast();

  const defaultValues = {
    name: '',
    description: '',
    address: '',
    startTime: '',
    endTime: '',
    organizationId: 0,
    carWashPosType: '',
    minSumOrder: 0,
    maxSumOrder: 0,
    stepSumOrder: 0,
  };

  const [formData, setFormData] = useState(defaultValues);

  const {
    data: posData,
    isLoading,
    isValidating,
  } = useSWR(
    posId ? [`get-pos-by-id`, posId] : null,
    () => getPosById(posId!),
    {
      shouldRetryOnError: false,
    }
  );

  const { data: organizationData } = useSWR(
    [`get-org`],
    () => getOrganization({}),
    {
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (posData) {
      setFormData({
        name: posData.props.name,
        description: '',
        startTime: posData.props.startTime || '',
        endTime: posData.props.endTime || '',
        organizationId: posData.props.organizationId,
        carWashPosType: posData.props.carWashPosType,
        minSumOrder: posData.props.minSumOrder,
        maxSumOrder: posData.props.maxSumOrder,
        stepSumOrder: posData.props.stepSumOrder,
        address: posData.props.address.props.city,
      });
    }
  }, [posData]);

  const { trigger: updatePos, isMutating: isUpdatingPos } = useSWRMutation(
    [`update-pos`, posId],
    async () =>
      updateCarWash(
        Number(posId),
        {
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          organizationId: formData.organizationId,
          carWashPosType: formData.carWashPosType || '',
          minSumOrder: formData.minSumOrder,
          maxSumOrder: formData.maxSumOrder,
          stepSumOrder: formData.stepSumOrder,
          address: {
            city: formData.address,
            location: posData?.props.address.props.location || '',
          },
        },
        null
      )
  );

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

  const onSubmit = async () => {
    try {
      const result = await updatePos();
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

  if (isLoading || isValidating) {
    return (
      <div className="h-[600px] w-full flex justify-center items-center">
        <Spin />
      </div>
    );
  }

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
              {t('pos.company')}
            </div>
            <Select
              placeholder={t('pos.companyName')}
              options={
                organizationData?.map(org => ({
                  value: org.id,
                  label: org.name,
                })) || []
              }
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
              {...register('stepSumOrder')}
              value={
                formData.stepSumOrder !== null ? formData.stepSumOrder : ''
              }
              onChange={e => handleInputChange('stepSumOrder', e.target.value)}
              suffix={<div>₽</div>}
            />
          </div>
          <Button
            htmlType="submit"
            className="w-full sm:w-96"
            type="primary"
            loading={isUpdatingPos}
          >
            {t('marketing.apply')}
          </Button>
        </div>
      </div>

      <div className="flex-1 hidden lg:flex items-center justify-center bg-white">
        <img
          src={ProfilePosTabOne}
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
