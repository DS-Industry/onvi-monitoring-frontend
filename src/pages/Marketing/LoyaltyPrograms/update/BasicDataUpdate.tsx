import React, { useEffect, useState } from 'react';
import BonusImage from '@icons/BasicBonus.svg?react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Button, Form, Input, Select } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  getLoyaltyProgramById,
  updateNewLoyaltyProgram,
  LoyaltyProgramUpdateBody,
} from '@/services/api/marketing';
import { useToast } from '@/components/context/useContext';

const BasicDataUpdate: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));

  const defaultValues = {
    name: '',
    description: '',
    maxLevels: 1,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, setValue, errors, reset } = useFormHook(formData);

  const { data: program, isValidating } = useSWR(
    loyaltyProgramId ? [`get-loyalty-program-by-id`, loyaltyProgramId] : null,
    () => getLoyaltyProgramById(loyaltyProgramId)
  );

  useEffect(() => {
    if (program) {
      const next = {
        name: program.name ?? '',
        description: (program as any).description ?? '',
        maxLevels: (program as any).maxLevels ?? 1,
      };
      setFormData(next);
      reset(next);
    }
  }, [program, reset]);

  const { trigger: updateProgram, isMutating } = useSWRMutation(
    [`update-loyalty-program`, loyaltyProgramId],
    async (_key, { arg }: { arg: LoyaltyProgramUpdateBody }) => updateNewLoyaltyProgram(arg)
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
      const result = await updateProgram({
        loyaltyProgramId: loyaltyProgramId,
        name: formData.name,
        description: formData.description,
        maxLevels: formData.maxLevels,
      });
      if (result?.props?.id) {
        updateSearchParams(searchParams, setSearchParams, {
          step: 2,
          loyaltyProgramId: result.props.id,
        });
        showToast(t('success.recordUpdated'), 'success');
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center justify-center bg-background02 p-4">
      <div className="flex flex-col rounded-lg p-8 lg:flex-row md:p-0">
        <div className="lg:w-5/12 p-8">
          <div className="flex items-center justify-center bg-background02 p-4">
            <div className="flex flex-col rounded-lg p-8 w-full md:p-0 space-y-10">
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
                <Form.Item help={errors.name?.message} validateStatus={errors.name ? 'error' : undefined}>
                  <Input
                    placeholder={t('profile.namePlaceholder')}
                    className="w-80 sm:w-96"
                    {...register('name', { required: t('validation.nameRequired') })}
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    status={errors.name ? 'error' : ''}
                    disabled={isValidating}
                  />
                </Form.Item>
              </div>
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('warehouse.desc')}
                </div>
                <Form.Item help={errors.description?.message} validateStatus={errors.description ? 'error' : undefined}>
                  <Input.TextArea
                    placeholder={t('marketingLoyalty.enterDesc')}
                    className="w-80 sm:w-96"
                    {...register('description', { required: t('validation.descriptionRequired') })}
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    rows={4}
                    status={errors.description ? 'error' : ''}
                    disabled={isValidating}
                  />
                </Form.Item>
              </div>
              <div className="space-y-5">
                <div className="text-text01 text-sm font-semibold">
                  {t('marketingLoyalty.maxLevels')}
                </div>
                <div className="text-text03 text-sm">{t('marketingLoyalty.maxLoyalty')}</div>
                <Form.Item>
                  <Select
                    placeholder={t('marketingLoyalty.selectQuantity')}
                    className="max-w-80 sm:max-w-96"
                    {...register('maxLevels')}
                    value={formData.maxLevels}
                    options={[{ label: 1, value: 1 }, { label: 2, value: 2 }]}
                    onChange={value => handleInputChange('maxLevels', value)}
                    disabled={isValidating}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-8/12 rounded-r-lg lg:ml-20">
        </div>
      </div>
      <div className="flex mt-auto justify-end gap-2">
        <Button htmlType="submit" type="primary" icon={<RightOutlined />} iconPosition="end" loading={isMutating || isValidating}>
          {t('common.next')}
        </Button>
      </div>
    </form>
  );
};

export default BasicDataUpdate;


