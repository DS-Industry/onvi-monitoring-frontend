import React, { useEffect, useState } from 'react';
import BonusImage from '@icons/BasicBonus.svg?react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Button, Form, Input, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { FireOutlined, RightOutlined } from '@ant-design/icons';
import useSWRMutation from 'swr/mutation';
import {
  updateNewLoyaltyProgram,
  LoyaltyProgramUpdateBody,
  LoyaltyProgramsByIdResponse,
} from '@/services/api/marketing';
import { useToast } from '@/components/context/useContext';
import { MAX_LEVELS } from '@/utils/constants';

interface BasicDataUpdateProps {
  program?: LoyaltyProgramsByIdResponse;
  isValidating: boolean;
  mutate: () => void;
  isEditable?: boolean;
}

const BasicDataUpdate: React.FC<BasicDataUpdateProps> = ({ program, isValidating, mutate, isEditable = true }) => {
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

  const { register, handleSubmit, setValue, errors, reset } =
    useFormHook(formData);

  useEffect(() => {
    if (program) {
      const next = {
        name: program.name ?? '',
        description: program.description ?? '',
        maxLevels: program.maxLevels ?? 1,
      };
      setFormData(next);
      reset(next);
    }
  }, [program, reset]);

  const { trigger: updateProgram, isMutating } = useSWRMutation(
    [`update-loyalty-program`, loyaltyProgramId],
    async (_key, { arg }: { arg: LoyaltyProgramUpdateBody }) =>
      updateNewLoyaltyProgram(arg)
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
      if (
        program &&
        formData.name === (program.name ?? '') &&
        formData.description === (program.description ?? '') &&
        formData.maxLevels === (program.maxLevels ?? 1)
      ) {
        updateSearchParams(searchParams, setSearchParams, {
          step: 2,
          loyaltyProgramId,
        });
        return; 
      }

      const result = await updateProgram({
        loyaltyProgramId,
        name: formData.name,
        description: formData.description,
        maxLevels: formData.maxLevels,
      });

      if (result?.props?.id) {
        // Refetch program data after successful update
        mutate();
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

  if (isValidating) {
    return (
      <div className="bg-background02 p-4">
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-background02">
      <div className="flex flex-col rounded-lglg:flex-row mb-3">
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
                    disabled={isValidating || !isEditable}
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
                    disabled={isValidating || !isEditable}
                  />
                </Form.Item>
              </div>
              <div className="space-y-5">
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
                          onClick={() => isEditable && handleInputChange('maxLevels', level)}
                          className={`${isEditable ? 'cursor-pointer' : 'cursor-not-allowed'} w-10 h-10 flex items-center justify-center text-text04 transition-all duration-200 rounded-full ${
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

        <div className="hidden lg:flex lg:w-8/12 rounded-r-lg lg:ml-20"></div>
      </div>
      {isEditable && (
        <div className="flex mt-auto justify-end gap-2 mt-3">
          <Button
            htmlType="submit"
            type="primary"
            icon={<RightOutlined />}
            iconPosition="end"
            loading={isMutating || isValidating}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </form>
  );
};

export default BasicDataUpdate;
