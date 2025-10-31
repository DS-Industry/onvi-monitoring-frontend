import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Button, Form, Input } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DownloadOutlined, RightOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import { CameraOutlined } from '@ant-design/icons';

interface BasicDataProps {
  isEditable?: boolean;
}

const Promotion: React.FC<BasicDataProps> = ({ isEditable = true }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const defaultValues = {
    name: '',
    promotionType: 'icon',
    description: '',
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
        step: 3,
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
                <div className="w-12 h-12 bg-primary02 flex items-center justify-center rounded-full text-white">
                  <CameraOutlined style={{ fontSize: 24 }} />
                </div>
                <div>
                  <div className="font-bold text-text01 text-2xl">
                    {t('marketingCampaigns.promotion')}
                  </div>
                  <div className="text-base03 text-md">
                    {t('marketingCampaigns.settingUpCampaign')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 lg:mt-10">
            <div className="flex flex-col w-full space-y-6">
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('marketingCampaigns.name')}
                </div>
                <Form.Item
                  help={errors.name?.message}
                  validateStatus={errors.name ? 'error' : undefined}
                >
                  <Input
                    placeholder={t('marketingCampaigns.enterName')}
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
                  {t('marketingCampaigns.type')}
                </div>
                <div className="flex space-x-2">
                  <Button>{t('marketingCampaigns.icon')}</Button>
                  <Button>{t('marketingCampaigns.banner')}</Button>
                </div>
              </div>
              <div>
                <div className="text-text01 text-sm font-semibold">
                  {t('marketingCampaigns.description')}
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
                  {t('marketingCampaigns.bannerIcon')}
                </div>
                <div className="text-text02 text-xs">
                  {t('marketingCampaigns.optimally')}
                </div>
                <div className="flex flex-wrap justify-center items-center gap-2 border h-14 w-96 rounded-lg">
                  <label
                    htmlFor="file-upload"
                    className="flex items-center text-primary02 cursor-pointer space-x-2"
                  >
                    <DownloadOutlined />
                    <div>{t('warehouse.select')}</div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                  />
                  <div className="text-text01">{t('warehouse.or')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-8/12 rounded-r-lg lg:ml-20"></div>
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

export default Promotion;
