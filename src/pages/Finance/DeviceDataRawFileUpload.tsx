import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerDeviceDataRawFile } from '@/services/api/deviceDataRawFile';
import { getPresignedUploadUrl, uploadFileToS3 } from '@/services/api/s3';
import { useToast } from '@/hooks/useToast';

const DEVICE_DATA_RAW_PREFIX = 'device-data-raw';

function buildObjectKey(fileName: string): string {
  const base = fileName.replace(/^.*[/\\]/, '');
  return `${DEVICE_DATA_RAW_PREFIX}/${base}`;
}

const DeviceDataRawFileUpload: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFileChange = async () => {
    const selected = inputRef.current?.files?.[0] ?? null;
    setFileName(selected?.name ?? null);

    if (!selected) {
      return;
    }

    const key = buildObjectKey(selected.name);
    setBusy(true);
    try {
      const { url } = await getPresignedUploadUrl(key);
      await uploadFileToS3(selected, url);
      await registerDeviceDataRawFile(key);
      showToast(t('deviceDataRawFile.uploadSuccess'), 'success');
      setFileName(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('Device data raw file flow failed:', error);
      showToast(t('deviceDataRawFile.uploadError'), 'error');
      setFileName(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } finally {
      setBusy(false);
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
        <input
          ref={inputRef}
          type="file"
          disabled={busy}
          className="block w-full text-sm text-text01 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-text01 hover:file:bg-gray-200 disabled:opacity-60"
          onChange={handleFileChange}
        />

        {(busy || fileName) && (
          <span className="text-sm text-text02">
            {busy
              ? t('deviceDataRawFile.uploading')
              : fileName}
          </span>
        )}
      </div>
    </div>
  );
};

export default DeviceDataRawFileUpload;
