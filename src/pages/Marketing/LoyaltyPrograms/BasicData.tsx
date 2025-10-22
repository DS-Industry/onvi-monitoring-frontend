import React, { useState } from 'react';
import BonusImage from '@icons/BasicBonus.svg?react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Button, Form, Input } from 'antd';
import MarketingBasicData from '@/assets/MarketingBasicData.webp';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined } from '@ant-design/icons';
import useSWRMutation from 'swr/mutation';
import { createNewLoyaltyProgram } from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';
import { useToast } from '@/components/context/useContext';
import { FireOutlined } from '@ant-design/icons';
import { MAX_LEVELS } from '@/utils/constants';

const BasicData: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();
  const { showToast } = useToast();

  const defaultValues = {
    name: '',
    description: '',
    maxLevels: 1,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, setValue, errors } = useFormHook(formData);

  const { trigger: createLtyProgram, isMutating } = useSWRMutation(
    [`create-loyalty-program`],
    async () =>
      createNewLoyaltyProgram({
        name: formData.name,
        ownerOrganizationId: user.organizationId!,
        description: formData.description,
        maxLevels: formData.maxLevels,
      })
  );

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async () => {
    try {
      const result = await createLtyProgram();
      if (result) {
        updateSearchParams(searchParams, setSearchParams, {
          step: 2,
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-background02"
    >
      <div className="flex flex-col rounded-lg lg:flex-row">
        <div>
          <div className="flex items-center justify-center bg-background02">
            <div className="flex flex-col rounded-lg w-full space-y-10">
              <div className="flex items-center space-x-4">
                <BonusImage />
                <div>
                  <div className="font-semibold text-text01">
                    {t('marketingLoyalty.basicData')}
                  </div>
                  <div className="text-text03 text-xs">
                    {t('marketingLoyalty.configuring')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <div className="flex flex-col w-full">
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('equipment.name')}
                </div>
                <Form.Item
                  help={errors.name?.message}
                  validateStatus={errors.name ? 'error' : undefined}
                >
                  <Input
                    placeholder={t('profile.namePlaceholder')}
                    className="w-full sm:w-96"
                    {...register('name', {
                      required: t('validation.nameRequired'),
                    })}
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    status={errors.name ? 'error' : ''}
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
                    className="w-full sm:w-96"
                    {...register('description', {
                      required: t('validation.descriptionRequired'),
                    })}
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    rows={4}
                    status={errors.description ? 'error' : ''}
                  />
                </Form.Item>
              </div>
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('marketingLoyalty.maxLevels')}
                </div>
                <div className="text-text03 text-sm">
                  {t('marketingLoyalty.maxLoyalty')}
                </div>
                <div className="mt-2 flex items-center space-x-3">
                  <div className="flex space-x-2">
                    {[...Array(MAX_LEVELS)].map((_, index) => {
                      const level = index + 1;
                      const isActive = level <= formData.maxLevels;
                      return (
                        <div
                          key={level}
                          onClick={() => handleInputChange('maxLevels', level)}
                          className={`cursor-pointer w-10 h-10 flex items-center justify-center text-text04 transition-all duration-200 rounded-full ${
                            isActive ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <FireOutlined style={{ fontSize: 24 }} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-sm text-text02 font-medium">
                    {formData.maxLevels}{' '}
                    {t('marketing.levels', {
                      count: formData.maxLevels,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-8/12 rounded-r-lg lg:ml-20">
          <div className="p-8">
            <img
              src={MarketingBasicData}
              alt="Rocket illustration"
              loading="lazy"
              decoding="async"
              className="object-cover w-11/12 h-11/12"
              key="login-image"
            />
          </div>
        </div>
      </div>
      <div className="flex mt-4 justify-end gap-2">
        <Button
          htmlType="submit"
          type="primary"
          icon={<RightOutlined />}
          iconPosition="end"
          loading={isMutating}
        >
          {t('common.next')}
        </Button>
      </div>
    </form>
  );
};

export default BasicData;
