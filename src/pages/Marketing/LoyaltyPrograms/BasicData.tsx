import React, { useState } from 'react';
import BonusImage from '@icons/BasicBonus.svg?react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Form, Input } from 'antd';
import MultilineInput from '@/components/ui/Input/MultilineInput';

const BasicData: React.FC = () => {
  const { t } = useTranslation();

  const defaultValues = {
    name: '',
    description: '',
    maxLevels: 0,
    recalculationPeriod: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, setValue } = useFormHook(formData);

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async () => {};

  return (
    <div className="p-4">
      <div className="flex items-center space-x-4">
        <BonusImage />

        <div>
          <div className="text-lg font-semibold text-text01">
            {t('marketingLoyalty.basicData')}
          </div>
          <div className="text-text02">{t('marketingLoyalty.configuring')}</div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
        <div className="flex flex-col w-full">
          <div>
            <div className="text-text02 text-sm">{t('equipment.name')}</div>
            <Form.Item>
              <Input
                placeholder={t('profile.namePlaceholder')}
                className="w-80 sm:w-96"
                {...register('name', {
                  required: t('validation.nameRequired'),
                })}
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
              />
            </Form.Item>
          </div>
          <MultilineInput
            title={t('warehouse.desc')}
            label={t('warehouse.about')}
            classname="w-80 sm:w-96"
            inputType="secondary"
            value={formData.description}
            changeValue={e => handleInputChange('description', e.target.value)}
            {...register('description')}
          />
        </div>
      </form>
    </div>
  );
};

export default BasicData;
