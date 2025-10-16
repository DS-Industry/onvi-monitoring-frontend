import React, { useState } from 'react';
import BonusImage from '@icons/BasicBonus.svg?react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Button, Form, Input, Select } from 'antd';
import MarketingBasicData from '@/assets/MarketingBasicData.webp';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined } from "@ant-design/icons";

const BasicData: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultValues = {
    name: '',
    description: '',
    maxLevels: undefined,
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
    <div className="flex min-h-screen items-center justify-center bg-background02 p-4">
      <div className="flex flex-col rounded-lg p-8 lg:flex-row md:p-0">
        <div className="lg:w-5/12 p-8">
          <div className="flex items-center space-x-4">
            <BonusImage />

            <div>
              <div className="text-lg font-semibold text-text01">
                {t('marketingLoyalty.basicData')}
              </div>
              <div className="text-text02">
                {t('marketingLoyalty.configuring')}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
            <div className="flex flex-col w-full">
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('equipment.name')}
                </div>
                <Form.Item>
                  <Input
                    placeholder={t('profile.namePlaceholder')}
                    className="w-80 sm:w-96"
                    {...register('name')}
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                  />
                </Form.Item>
              </div>
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('warehouse.desc')}
                </div>
                <Form.Item>
                  <Input.TextArea
                    placeholder={t('marketingLoyalty.enterDesc')}
                    className="w-80 sm:w-96"
                    {...register('description')}
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    rows={4}
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
                <Form.Item>
                  <Select
                    placeholder={t('marketingLoyalty.selectQuantity')}
                    className="max-w-80 sm:max-w-96"
                    {...register('maxLevels')}
                    value={formData.maxLevels}
                    onChange={value =>
                      handleInputChange('maxLevels', String(value))
                    }
                  />
                </Form.Item>
              </div>
            </div>
          </form>
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
      <div className="flex mt-auto justify-end gap-2">
          <Button
            onClick={() =>
              updateSearchParams(searchParams, setSearchParams, {
                step: 2,
              })
            }
            type="primary"
            icon={<RightOutlined />}
            iconPosition='end'
          >
            {t('common.next')}
          </Button>
        </div>
    </div>
  );
};

export default BasicData;
