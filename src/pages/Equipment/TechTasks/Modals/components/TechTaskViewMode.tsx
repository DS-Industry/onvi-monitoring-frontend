import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TechTaskShapeResponse, createTechTaskShape } from '@/services/api/equipment';
import TechTaskCard from '../../../TechTaskCard';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { useToast } from '@/hooks/useToast';
import { uploadFileWithPresignedUrl, generateTechTaskImageKey } from '@/services/api/s3';

interface TechTaskViewModeProps {
  techTaskData?: TechTaskShapeResponse;
  onSave?: () => void;
}

export interface TechTaskViewModeRef {
  handleSubmit: () => Promise<void>;
}

const TechTaskViewMode = forwardRef<TechTaskViewModeRef, TechTaskViewModeProps>(({
  techTaskData,
  onSave,
}, ref) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [taskValues, setTaskValues] = useState<Record<number, string | number | boolean | null>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File | string | null>>({});

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

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
        let file = null;
        if (item.image) {
          if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
            file = item.image;
          } else {
            file = `${import.meta.env.VITE_S3_CLOUD}/${item.image}`;
          }
        }
        
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

  const handleSubmit = async () => {
    if (!techTaskData) {
      showToast(t('techTasks.noDataError') || 'No tech task data available', 'error');
      return;
    }

    try {
      const valueData = Object.entries(taskValues).map(([itemValueId, value]) => {
        const uploadedFile = uploadedFiles[Number(itemValueId)];
        const imageUrl = uploadedFile && typeof uploadedFile === 'string' ? uploadedFile : undefined;
        
        let stringValue = '';
        if (value === null || value === undefined) {
          stringValue = '';
        } else if (typeof value === 'number') {
          stringValue = isNaN(value) ? '' : String(value);
        } else if (typeof value === 'boolean') {
          stringValue = String(value);
        } else {
          stringValue = String(value);
        }
        
        return {
          itemValueId: Number(itemValueId),
          value: stringValue,
          imageUrl,
        };
      });

      await createTechTaskShape(techTaskData.id, {
        valueData,
      });

      showToast(t('techTasks.saveSuccess') || 'Tech task saved successfully', 'success');
      onSave?.();
    } catch (error) {
      console.error('Save error:', error);
      showToast(t('techTasks.saveError') || 'Failed to save tech task', 'error');
    }
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
});

TechTaskViewMode.displayName = 'TechTaskViewMode';

export default TechTaskViewMode;
