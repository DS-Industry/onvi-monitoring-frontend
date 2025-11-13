import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Button, Form, Input, Row, Col, Card, Typography, Upload, } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import { CameraOutlined } from '@ant-design/icons';

import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import TipTapEditor from '@/components/ui/Input/TipTapEditor';
import PhonePreview from '@/components/ui/PhonePreview';

const { Text } = Typography;

interface BasicDataProps {
  isEditable?: boolean;
}

const Promotion: React.FC<BasicDataProps> = ({ isEditable = true }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [editorContent, setEditorContent] = useState('<h1>Бесплатный пылесос!</h1><p>В далеком цифровом мире, среди тысяч приложений и программ, жил-был маленький робот по имени Онвик. Он был необычным: его корпус блестел, как только что начищенная машина, а глаза светились яркими голубыми диодами — точь-в-точь как фары суперкара. С самого рождения Онвик обожал автомобили...</p>');
  const [bannerImage, setBannerImage] = useState<string | null>(null);


  const handleImageChange: UploadProps['onChange'] = (info) => {
    const { file } = info;

    const fileObj = file.originFileObj || file;

    if (fileObj instanceof File) {
      const imageUrl = URL.createObjectURL(fileObj);
      setBannerImage(imageUrl);
    } else if (file.status === 'done' && file.response?.url) {
      setBannerImage(file.response.url);
    }
  };

  const handleRemoveImage = () => {
    if (bannerImage) {
      URL.revokeObjectURL(bannerImage);
      setBannerImage(null);
    }
  };

  const uploadProps: UploadProps = {
    onChange: handleImageChange,
    showUploadList: false,
    accept: 'image/*',
    maxCount: 1,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        console.error('File must be an image');
        return Upload.LIST_IGNORE;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        console.error('Image size must be less than 5MB');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
  };

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


              <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                  <Card
                    title="Контент акции"
                    styles={{
                      body: {
                        padding: 24,
                      },
                    }}
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">Настройка отображения кампании в приложении</Text>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Описание в приложении
                      </Text>
                      <TipTapEditor
                        value={editorContent}
                        onChange={setEditorContent}
                      />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Баннер/иконка в приложении
                      </Text>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>
                        (оптимально: 166 x 166 px - иконка, 343 x 180 px - для баннера)
                      </Text>
                      {bannerImage ? (
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                          <img
                            src={bannerImage}
                            alt="Banner preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              objectFit: 'contain',
                            }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleRemoveImage}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: 'rgba(255, 255, 255, 0.9)',
                            }}
                          >
                            Удалить
                          </Button>
                        </div>
                      ) : null}
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>
                          {bannerImage ? 'Заменить изображение' : 'Выберите файл или перетащите сюда'}
                        </Button>
                      </Upload>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <div className="flex gap-4 items-center">
                    <div>
                      <PhonePreview
                        content={editorContent}
                        bannerImage={bannerImage}
                        type="news"
                      />
                    </div>

                    <div className="flex items-center">
                      <div className="transform scale-[0.9] origin-center">
                        <PhonePreview
                          content={editorContent}
                          bannerImage={bannerImage}
                          type="main"
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
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
