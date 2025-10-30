import React, { useState } from 'react';
import BonusImage from '@icons/BasicBonus.svg?react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import BasicCampaign from '@/assets/BasicCampaign.webp';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import useSWR from 'swr';
import {
  getPublicLoyaltyPrograms,
  LoyaltyProgramStatus,
} from '@/services/api/marketing';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';

interface BasicDataProps {
  isEditable?: boolean;
}

const BasicInformation: React.FC<BasicDataProps> = ({ isEditable = true }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const user = useUser();

  const initials =
    user.name.length >= 2
      ? `${user.name[0].charAt(0)}${user.name[1].charAt(0)}`.toUpperCase()
      : user.name.charAt(0).toUpperCase();

  const { data: programsResponse, isLoading: programsLoading } = useSWR(
    'public-loyalty-programs',
    () =>
      getPublicLoyaltyPrograms({
        status: LoyaltyProgramStatus.ACTIVE,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  );

  const publicPrograms = programsResponse?.programs ?? [];

  const programOptions = publicPrograms.map(program => ({
    label: program.name,
    value: program.id,
  }));

  const defaultValues = {
    loyaltyProgramId: '',
    name: '',
    description: '',
    dateStart: '',
    dateEnd: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, setValue, errors } = useFormHook(formData);

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async () => {
    try {
      updateSearchParams(searchParams, setSearchParams, {
        step: 2,
      });
      showToast(t('marketing.loyaltyCreated'), 'success');
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-background02 pb-3">
      <div className="flex flex-col rounded-lg lg:flex-row">
        <div className="mb-3">
          <div className="flex items-center justify-center bg-background02">
            <div className="flex flex-col rounded-lg w-full space-y-6 sm:space-y-8 lg:space-y-10">
              <div className="flex items-center space-x-4">
                <BonusImage className="w-12 h-12" />
                <div>
                  <div className="font-bold text-text01 text-2xl">
                    {t('warehouse.basic')}
                  </div>
                  <div className="text-base03 text-md">
                    {t('marketingCampaigns.setting')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 lg:mt-10">
            <div className="flex flex-col w-full space-y-6">
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('routes.loyalty')}
                </div>
                <Form.Item
                  help={errors.loyaltyProgramId?.message}
                  validateStatus={errors.loyaltyProgramId ? 'error' : undefined}
                >
                  <Select
                    placeholder={t('loyaltyProgramsTable.selectProgram')}
                    className="w-full sm:w-auto sm:max-w-[280px] lg:max-w-[384px]"
                    options={programOptions}
                    {...register('loyaltyProgramId', {
                      required: t('validation.loyaltyProgramRequired'),
                    })}
                    value={
                      formData.loyaltyProgramId === ''
                        ? undefined
                        : formData.loyaltyProgramId
                    }
                    onChange={value =>
                      handleInputChange('loyaltyProgramId', value)
                    }
                    status={errors.loyaltyProgramId ? 'error' : ''}
                    disabled={!isEditable}
                    loading={programsLoading}
                  />
                </Form.Item>
              </div>
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('equipment.name')}
                </div>
                <Form.Item
                  help={errors.name?.message}
                  validateStatus={errors.name ? 'error' : undefined}
                >
                  <Input
                    placeholder={t('organizations.fullNamePlaceholder')}
                    className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
                    {...register('name', {
                      required: t('validation.nameRequired'),
                    })}
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    status={errors.name ? 'error' : ''}
                    disabled={!isEditable}
                  />
                </Form.Item>
              </div>
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('warehouse.desc')}
                </div>
                <Form.Item
                  help={errors.description?.message}
                  validateStatus={errors.description ? 'error' : undefined}
                >
                  <Input.TextArea
                    placeholder={t('marketingLoyalty.enterDesc')}
                    className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
                    {...register('description', {
                      required: t('validation.descriptionRequired'),
                    })}
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    rows={4}
                    status={errors.description ? 'error' : ''}
                    disabled={!isEditable}
                  />
                </Form.Item>
              </div>
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('equipment.dateRange')}
                </div>
                <div className="flex items-start gap-3">
                  <Form.Item
                    className="mb-0 min-h-[72px]"
                    help={errors.dateStart?.message}
                    validateStatus={errors.dateStart ? 'error' : undefined}
                  >
                    <DatePicker
                      className="w-40 sm:w-auto sm:min-w-[160px]"
                      value={
                        formData.dateStart ? dayjs(formData.dateStart) : null
                      }
                      {...register('dateStart', {
                        required: t('validation.startDateRequired'),
                      })}
                      onChange={date =>
                        handleInputChange(
                          'dateStart',
                          date ? date.toISOString() : ''
                        )
                      }
                      disabled={!isEditable}
                    />
                  </Form.Item>
                  <div className="flex items-center h-6  mt-1 text-text02">
                    {t('analysis.endDate')}
                  </div>
                  <Form.Item
                    className="mb-0 min-h-[72px]"
                    help={errors.dateEnd?.message}
                    validateStatus={errors.dateEnd ? 'error' : undefined}
                  >
                    <DatePicker
                      className="w-40 sm:w-auto sm:min-w-[160px]"
                      value={formData.dateEnd ? dayjs(formData.dateEnd) : null}
                      {...register('dateEnd', {
                        required: t('validation.finishDateRequired'),
                      })}
                      onChange={date =>
                        handleInputChange(
                          'dateEnd',
                          date ? date.toISOString() : ''
                        )
                      }
                      disabled={!isEditable}
                    />
                  </Form.Item>
                </div>
              </div>
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('equipment.resp')}
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-medium bg-[#BFFA00]`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-text02">{user.name} {user.surname} ({t('techTasks.you')})</div>
                  </div>
                </div> 
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-8/12 rounded-r-lg lg:ml-20">
          <div className="p-8">
            <img
              src={BasicCampaign}
              alt="Rocket illustration"
              loading="lazy"
              decoding="async"
              className="object-cover w-11/12 h-11/12"
              key="login-image"
            />
          </div>
        </div>
      </div>
      {isEditable && (
        <div className="flex justify-end gap-2 mt-3">
          <Button
            htmlType="submit"
            type="primary"
            icon={<RightOutlined />}
            iconPosition="end"
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </form>
  );
};

export default BasicInformation;
