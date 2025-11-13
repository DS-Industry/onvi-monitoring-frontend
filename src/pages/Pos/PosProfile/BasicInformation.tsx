import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CarOutlined } from '@ant-design/icons';
import FactoryLetterS from '@/assets/Factory Letter S.png';
import useFormHook from '@/hooks/useFormHook';
import { Input } from 'antd';

const BasicInformation: React.FC = () => {
  const { t } = useTranslation();

  const defaultValues = {
    name: '',
    description: '',
    address: ''
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
                className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
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
                className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
                {...register('address')}
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                status={errors.address ? 'error' : ''}
              />
          </div>
          <div>
            <div className="text-text01 text-sm font-semibold">
              {t('warehouse.desc')}
            </div>
              <Input.TextArea
                placeholder={t('marketingLoyalty.enterDesc')}
                className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[384px]"
                {...register('description')}
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={4}
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
