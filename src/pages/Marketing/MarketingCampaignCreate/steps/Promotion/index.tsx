import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import { Button, Row, Col, Card, Typography, Upload, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { RightOutlined } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';
import { CameraOutlined } from '@ant-design/icons';
import useSWR from 'swr';

import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import TipTapEditor from '@/components/ui/Input/TipTapEditor';
import PhonePreview from '@/components/ui/PhonePreview';
import {
  upsertMarketingCampaignMobileDisplay,
  getMarketingCampaignMobileDisplay,
  MarketingCampaignMobileDisplayType,
  MarketingCampaignResponse,
  ACTION_TYPE
} from '@/services/api/marketing';
import { uploadFileWithPresignedUrl } from '@/services/api/s3';

const { Text } = Typography;

interface BasicDataProps {
  campaign?: MarketingCampaignResponse;
  isEditable?: boolean;
}

const Promotion: React.FC<BasicDataProps> = ({ campaign, isEditable = true }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const marketingCampaignId = Number(searchParams.get('marketingCampaignId'));
  const editMode = Boolean(searchParams.get('mode') === 'edit');

  const isPromocode = campaign?.actionType as ACTION_TYPE === 'PROMOCODE_ISSUE';

  const [editorContent, setEditorContent] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [initialEditorContent, setInitialEditorContent] = useState<
    string | null
  >(null);
  const [initialBannerImageUrl, setInitialBannerImageUrl] = useState<
    string | null
  >(null);
  const [initialPromotionType, setInitialPromotionType] =
    useState<MarketingCampaignMobileDisplayType | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [promotionType, setPromotionType] =
    useState<MarketingCampaignMobileDisplayType>(
      MarketingCampaignMobileDisplayType.PersonalPromocode
    );

  const [isSubmiting, setIsSubmitting] = useState(false);

  const {
    data: mobileDisplayData,
    isLoading: isLoadingMobileDisplay,
    isValidating: isValidatingMobileDisplay,
  } = useSWR(
    marketingCampaignId
      ? [`get-marketing-campaign-mobile-display`, marketingCampaignId]
      : null,
    () => getMarketingCampaignMobileDisplay(marketingCampaignId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const isLoading = isLoadingMobileDisplay || isValidatingMobileDisplay;

  useEffect(() => {
    if (mobileDisplayData) {
      let newEditorContent = '';
      let newBannerImageUrl: string | null = null;
      let newPromotionType =
        MarketingCampaignMobileDisplayType.PersonalPromocode;

      if (
        mobileDisplayData.type === MarketingCampaignMobileDisplayType.Promo &&
        mobileDisplayData.description
      ) {
        newEditorContent = mobileDisplayData.description;
      } else if (
        mobileDisplayData.type ===
        MarketingCampaignMobileDisplayType.PersonalPromocode
      ) {
        newEditorContent = '';
      }

      if (mobileDisplayData.imageLink) {
        newBannerImageUrl = mobileDisplayData.imageLink;
        setBannerImage(mobileDisplayData.imageLink);
      }

      if (mobileDisplayData.type) {
        newPromotionType = mobileDisplayData.type;
      }

      setEditorContent(newEditorContent);
      setBannerImageUrl(newBannerImageUrl);
      setPromotionType(newPromotionType);

      if (initialEditorContent === null) {
        setInitialEditorContent(newEditorContent);
        setInitialBannerImageUrl(newBannerImageUrl);
        setInitialPromotionType(newPromotionType);
      }
    } else {
      if (isPromocode) {
        setPromotionType(MarketingCampaignMobileDisplayType.PersonalPromocode);
        setEditorContent('');
      } else {
        setPromotionType(MarketingCampaignMobileDisplayType.Promo);
      }
    }
  }, [mobileDisplayData]);

  const handleImageChange: UploadProps['onChange'] = async info => {
    const { file } = info;

    const fileObj = file.originFileObj || file;

    if (fileObj instanceof File) {
      const imageUrl = URL.createObjectURL(fileObj);
      setBannerImage(imageUrl);

      setUploadingImage(true);
      try {
        const timestamp = Date.now();
        const key = `marketing-campaigns/${marketingCampaignId || 'temp'}/mobile-display/${timestamp}-${fileObj.name}`;
        const uploadedKey = await uploadFileWithPresignedUrl(fileObj, key);
        const s3Url = `${import.meta.env.VITE_S3_CLOUD}/${uploadedKey}`;
        setBannerImageUrl(s3Url);
      } catch (error) {
        console.error('Failed to upload image:', error);
        showToast(
          t('errors.other.errorDuringFormSubmission') ||
          'Failed to upload image',
          'error'
        );
      } finally {
        setUploadingImage(false);
      }
    } else if (file.status === 'done' && file.response?.url) {
      setBannerImage(file.response.url);
      setBannerImageUrl(file.response.url);
    }
  };

  const handleRemoveImage = () => {
    if (bannerImage) {
      if (bannerImage.startsWith('blob:')) {
        URL.revokeObjectURL(bannerImage);
      }
      setBannerImage(null);
      setBannerImageUrl(null);
    }
  };

  const uploadProps: UploadProps = {
    onChange: handleImageChange,
    showUploadList: false,
    accept: 'image/*',
    maxCount: 1,
    beforeUpload: file => {
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
    description: '',
  };

  const [formData] = useState(defaultValues);

  const { handleSubmit } = useFormHook(formData);

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!marketingCampaignId) {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        return;
      }

      if (editMode) {
        const hasChanged =
          editorContent !== initialEditorContent ||
          bannerImageUrl !== initialBannerImageUrl ||
          promotionType !== initialPromotionType;

        if (!hasChanged) {
          updateSearchParams(searchParams, setSearchParams, {
            step: 6,
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (!bannerImageUrl) {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        return;
      }

      const request: {
        type: MarketingCampaignMobileDisplayType;
        imageLink: string;
        description?: string;
      } = {
        type: promotionType,
        imageLink: bannerImageUrl,
      };

      if (promotionType === MarketingCampaignMobileDisplayType.Promo) {
        if (!editorContent || editorContent.trim() === '') {
          showToast(t('errors.other.errorDuringFormSubmission'), 'error');
          return;
        }
        request.description = editorContent;
      }

      await upsertMarketingCampaignMobileDisplay(marketingCampaignId, request);

      setInitialEditorContent(editorContent);
      setInitialBannerImageUrl(bannerImageUrl);
      setInitialPromotionType(promotionType);

      updateSearchParams(searchParams, setSearchParams, {
        step: 6,
      });
      showToast(t('tables.SAVED'), 'success');
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-background02 p-6 rounded-lg">
        <Spin size="large" tip={t('common.loading')} />
      </div>
    );
  }

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
              <div className="text-text01 text-sm font-semibold">
                {t('marketingCampaigns.type')}
              </div>
              <div className="flex space-x-2">
                <Button
                  type={
                    promotionType ===
                      MarketingCampaignMobileDisplayType.PersonalPromocode
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => {
                    setPromotionType(
                      MarketingCampaignMobileDisplayType.PersonalPromocode
                    );
                    setEditorContent('');
                  }}
                  disabled={!isPromocode || !isEditable || mobileDisplayData?.type === MarketingCampaignMobileDisplayType.Promo}
                >
                  {t('marketingCampaigns.icon')}
                </Button>
                <Button
                  type={
                    promotionType === MarketingCampaignMobileDisplayType.Promo
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() =>
                    setPromotionType(MarketingCampaignMobileDisplayType.Promo)
                  }
                  disabled={!isEditable || isPromocode}
                >
                  {t('marketingCampaigns.banner')}
                </Button>
              </div>

              <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={18}>
                  <Card
                    title="Контент акции"
                    styles={{
                      body: {
                        padding: 24,
                      },
                    }}
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">
                        {t('marketingCampaigns.settingUpCampaign')}
                      </Text>
                    </div>
                    {promotionType ===
                      MarketingCampaignMobileDisplayType.Promo && (
                        <div style={{ marginBottom: 16 }}>
                          <Text
                            strong
                            style={{ display: 'block', marginBottom: 8 }}
                          >
                            {t('marketingCampaigns.description')}
                          </Text>
                          <TipTapEditor
                            value={editorContent}
                            onChange={setEditorContent}
                          />
                        </div>
                      )}
                    <div>
                      <Text
                        strong
                        style={{ display: 'block', marginBottom: 8 }}
                      >
                        {t('marketingCampaigns.bannerIcon')}
                      </Text>
                      <Text
                        type="secondary"
                        style={{
                          display: 'block',
                          marginBottom: 8,
                          fontSize: '12px',
                        }}
                      >
                        {t('marketingCampaigns.optimally')}
                      </Text>
                      <div>
                        {bannerImage ? (
                          <div
                            style={{
                              position: 'relative',
                              display: 'inline-block',
                              marginBottom: 8,
                            }}
                          >
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
                              {t('marketing.delete')}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                      <Upload {...uploadProps}>
                        <Button
                          icon={<UploadOutlined />}
                          loading={uploadingImage}
                          disabled={!isEditable || uploadingImage}
                        >
                          {bannerImage
                            ? 'Заменить изображение'
                            : 'Выберите файл или перетащите сюда'}
                        </Button>
                      </Upload>
                    </div>
                    {isEditable && (
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          htmlType="submit"
                          type="primary"
                          icon={<RightOutlined />}
                          iconPosition="end"
                          loading={uploadingImage || isLoading || isSubmiting}
                          disabled={!bannerImageUrl}
                        >
                          {t('common.next')}
                        </Button>
                      </div>
                    )}
                  </Card>
                </Col>

                <Col xs={0} lg={6}>
                  <div className="flex gap-4 items-center transform scale-[0.8] origin-top">
                    <div>
                      <PhonePreview
                        content={editorContent}
                        bannerImage={bannerImage}
                        type={
                          promotionType ===
                            MarketingCampaignMobileDisplayType.Promo
                            ? 'main'
                            : 'promocode'
                        }
                      />
                    </div>
                    <div
                      className="flex items-center"
                      style={{ width: '337.5px', flexShrink: 0 }}
                    >
                      {promotionType ===
                        MarketingCampaignMobileDisplayType.Promo ? (
                        <div className="transform scale-[0.9] origin-center">
                          <PhonePreview
                            bannerImage={bannerImage}
                            type="news"
                            content={editorContent}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex xl:w-8/12 rounded-r-lg xl:ml-20"></div>
      </div>
    </form>
  );
};

export default Promotion;
