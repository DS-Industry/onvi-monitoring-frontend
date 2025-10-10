import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TechTaskShapeResponse } from '@/services/api/equipment';
import TechTaskCard from '../../../TechTaskCard';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { useToast } from '@/hooks/useToast';
import { uploadFileWithPresignedUrl, generateTechTaskImageKey } from '@/services/api/s3';

interface TechTaskViewModeProps {
  techTaskData?: TechTaskShapeResponse;
}

const TechTaskViewMode: React.FC<TechTaskViewModeProps> = ({
  techTaskData,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [taskValues, setTaskValues] = useState<Record<number, string | number | boolean | null>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File | string | null>>({});


  useEffect(() => {
    if (techTaskData?.items) {
      const initialValues = techTaskData.items.reduce(
        (acc, item) => {
          acc[item.id] = item.value ?? '';
          return acc;
        },
        {} as Record<number, string | null>
      );
      setTaskValues(initialValues);

      const fileEntries = techTaskData.items.map(item => {
        const file = item.image
          ? `${import.meta.env.VITE_S3_CLOUD}/${item.image}`
          : null;
        
        console.log('Initial image URL:', {
          itemId: item.id,
          image: item.image,
          fullUrl: file
        });
        
        return [item.id, file];
      });

      const initialFiles = Object.fromEntries(fileEntries);
      setUploadedFiles(initialFiles);
    }
  }, [techTaskData]);

  const handleChange = (
    id: number,
    value: string | number | boolean | null
  ) => {
    setTaskValues(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleUpload =
    (itemId: number) => async (options: RcCustomRequestOptions) => {
      const { file, onSuccess, onError } = options;

      try {
        if (!(file instanceof File)) {
          throw new Error('Invalid file type');
        }

        if (!techTaskData) {
          throw new Error('Tech task data not available');
        }

        const fileKey = generateTechTaskImageKey(
          techTaskData.posId,
          techTaskData.id,
          itemId,
          file.name
        );

        const uploadedKey = await uploadFileWithPresignedUrl(file, fileKey);
        
        const s3Url = `${import.meta.env.VITE_S3_CLOUD}/${uploadedKey}`;
        
        console.log('Upload completed:', {
          fileKey,
          uploadedKey,
          s3Url,
          itemId
        });
        
        setUploadedFiles(prev => ({
          ...prev,
          [itemId]: s3Url,
        }));

        showToast(t('techTasks.imageUploadSuccess') || 'Image uploaded successfully', 'success');
        onSuccess?.('ok');
      } catch (err) {
        console.error('Upload error:', err);
        showToast(
          t('techTasks.imageUploadError') || 'Failed to upload image', 
          'error'
        );
        onError?.(err as Error);
      }
    };

  const removeImage = (itemValueId: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [itemValueId]: null,
    }));
  };


  return (
    <div className="flex flex-1 flex-col min-h-[300px]">
      <h3 className="text-lg font-medium mb-3">
        {t('techTasks.templateCompletion')}
      </h3>
      
      {techTaskData?.items && techTaskData.items.length > 0 ? (
        <TechTaskCard
          items={techTaskData.items}
          values={taskValues}
          uploadedFiles={uploadedFiles}
          onChange={handleChange}
          onFileUpload={handleUpload}
          onImageRemove={removeImage}
          status={techTaskData?.status}
        />
      ) : (
        <div className="text-center text-gray-500 py-8">
          {t('techTasks.noTemplates')}
        </div>
      )}
    </div>
  );
};

export default TechTaskViewMode;
