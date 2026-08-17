import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import { Spin, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import { AxiosError } from 'axios';
import { useToast } from '@/components/context/useContext';
import { updatePosBannerUrls } from '@/services/api/pos';
import { uploadFileWithPresignedUrl } from '@/services/api/s3';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type BannerField = 'homeBannerUrl' | 'headerBannerUrl';

type BannerUploadCardProps = {
  posId: number;
  field: BannerField;
  label: string;
  imageUrl?: string | null;
  onUploaded: () => void;
};

const BannerUploadCard: React.FC<BannerUploadCardProps> = ({
  posId,
  field,
  label,
  imageUrl,
  onUploaded,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const uploadingRef = useRef(false);

  useEffect(() => {
    if (imageUrl) {
      setFileList([
        {
          uid: `-${field}`,
          name: field,
          status: 'done',
          url: imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [field, imageUrl]);

  const uploadBanner = async (file: File) => {
    if (uploadingRef.current) return;

    uploadingRef.current = true;
    setUploading(true);
    setFileList([
      {
        uid: `upload-${Date.now()}`,
        name: file.name,
        status: 'uploading',
      },
    ]);

    try {
      const bannerKind = field === 'homeBannerUrl' ? 'home' : 'header';
      const safeName = file.name.replace(/[^\w.-]+/g, '_');
      const key = `pos/${posId}/banners/${bannerKind}/${Date.now()}-${safeName}`;
      const uploadedKey = await uploadFileWithPresignedUrl(file, key);
      const s3Url = `${import.meta.env.VITE_S3_CLOUD}/${uploadedKey}`;

      await updatePosBannerUrls(
        posId,
        field === 'homeBannerUrl'
          ? { homeBannerUrl: s3Url }
          : { headerBannerUrl: s3Url }
      );

      setFileList([
        {
          uid: `-${field}`,
          name: file.name,
          status: 'done',
          url: s3Url,
        },
      ]);
      onUploaded();
      showToast(t('tables.SAVED'), 'success');
    } catch (error) {
      console.error('Failed to upload banner:', error);
      setFileList(
        imageUrl
          ? [
              {
                uid: `-${field}`,
                name: field,
                status: 'done',
                url: imageUrl,
              },
            ]
          : []
      );
      // Axios interceptor already toasts API errors; only toast for non-API failures (e.g. S3)
      if (!(error instanceof AxiosError)) {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    listType: 'picture-card',
    accept: 'image/*',
    maxCount: 1,
    fileList,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    beforeUpload: file => {
      if (!file.type.startsWith('image/')) {
        showToast(t('errors.other.invalidFileType'), 'error');
        return Upload.LIST_IGNORE;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        showToast(t('posOverview.bannerImageTooLarge'), 'error');
        return Upload.LIST_IGNORE;
      }

      void uploadBanner(file);
      return Upload.LIST_IGNORE;
    },
    onRemove: () => {
      if (uploadingRef.current) return false;
      setFileList([]);
      return true;
    },
  };

  return (
    <div>
      <div className="mb-2 text-sm text-text02">{label}</div>
      <Spin spinning={uploading}>
        <Upload {...uploadProps}>
          {fileList.length >= 1 ? null : (
            <div className="text-text02">
              <PlusOutlined />
              <div className="mt-2">{t('hr.upload')}</div>
            </div>
          )}
        </Upload>
      </Spin>
    </div>
  );
};

export default BannerUploadCard;
