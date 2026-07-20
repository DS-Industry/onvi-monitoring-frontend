import React from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { registerDeviceDataRawFile } from '@/services/api/deviceDataRawFile';
import { getPresignedUploadUrl, uploadFileToS3 } from '@/services/api/s3';
import { useToast } from '@/hooks/useToast';

const DEVICE_DATA_RAW_PREFIX = 'device-data-raw';

function buildObjectKey(fileName: string): string {
  const base = fileName.replace(/^.*[/\\]/, '');
  return `${DEVICE_DATA_RAW_PREFIX}/${Date.now()}-${base}`;
}

async function uploadDeviceDataRawFile(file: File): Promise<string> {
  const key = buildObjectKey(file.name);
  const { url } = await getPresignedUploadUrl(key);
  await uploadFileToS3(file, url);
  await registerDeviceDataRawFile(key);
  return key;
}

const DeviceDataRawFileUpload: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleUpload = async (options: RcCustomRequestOptions) => {
    const { file, onSuccess, onError } = options;

    try {
      if (!(file instanceof File)) {
        throw new Error('Invalid file type');
      }

      await uploadDeviceDataRawFile(file);
      showToast(t('deviceDataRawFile.uploadSuccess'), 'success');
      onSuccess?.('ok');
    } catch (error) {
      console.error('Device data raw file flow failed:', error);
      showToast(t('deviceDataRawFile.uploadError'), 'error');
      onError?.(error as Error);
    }
  };

  return (
    <div>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.deviceDataRawFileUpload')}
        </span>
      </div>

      <div className="flex flex-col gap-4 max-w-xl">
        <Upload.Dragger multiple customRequest={handleUpload} showUploadList>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">{t('deviceDataRawFile.selectFiles')}</p>
          <p className="ant-upload-hint">{t('deviceDataRawFile.selectFilesHint')}</p>
        </Upload.Dragger>
      </div>
    </div>
  );
};

export default DeviceDataRawFileUpload;
