import TableSkeleton from '@ui/Table/TableSkeleton';
import {
  createTechTaskShapeWithUrls,
  getTechTaskShapeItem,
  StatusTechTask,
} from '@/services/api/equipment';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { useToast } from '@/components/context/useContext';
import TechTaskCard from './TechTaskCard';
import Button from '@/components/ui/Button/Button';
import { getStatusTagRender } from '@/utils/tableUnits';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { uploadFileWithPresignedUrl, generateTechTaskImageKey } from '@/services/api/s3';

const TechTaskItem: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const techTaskId = Number(searchParams.get('techTaskId'));
  const status = searchParams.get('status');

  const {
    data: techTaskData,
    isLoading: techTaskLoading,
    isValidating,
  } = useSWR([`get-tech-task`], () => getTechTaskShapeItem(techTaskId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const techTaskItems = useMemo(
    () => techTaskData?.items || [],
    [techTaskData]
  );

  const { trigger: createTechTasks, isMutating } = useSWRMutation(
    ['create-tech-task'],
    async (
      _,
      {
        arg,
      }: {
        arg: {
          valueData: { itemValueId: number; value: string }[];
          imageUrls: { itemValueId: number; imageUrl: string }[];
        };
      }
    ) => {
      return createTechTaskShapeWithUrls(techTaskId, arg);
    }
  );

  const [taskValues, setTaskValues] = useState<
    Record<number, string | number | boolean | null>
  >({});

  useEffect(() => {
    if (techTaskItems.length > 0) {
      const initialValues = techTaskItems.reduce(
        (acc, item) => {
          acc[item.id] = item.value ?? '';
          return acc;
        },
        {} as Record<number, string | null>
      );
      setTaskValues(initialValues);

      const fileEntries = techTaskItems.map(item => {
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
  }, [techTaskItems, techTaskData]);

  const handleChange = (
    id: number,
    value: string | number | boolean | null
  ) => {
    setTaskValues(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const [uploadedFiles, setUploadedFiles] = useState<
    Record<number, File | string | null>
  >({});

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
    const techTaskValue = Object.entries(taskValues).map(
      ([itemValueId, value]) => ({
        itemValueId: Number(itemValueId),
        value: String(value),
      })
    );

    const imageUrls = Object.entries(uploadedFiles)
      .filter(([, file]) => file && typeof file === 'string')
      .map(([itemValueId, url]) => ({
        itemValueId: Number(itemValueId),
        imageUrl: url as string,
      }));

    const result = await createTechTasks({
      valueData: techTaskValue,
      imageUrls,
    });

    if (result) {
      mutate([`get-tech-task`]);
      navigate(-1);
    }
  };

  const getStatusRender = getStatusTagRender(t);

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.list')}
          </span>
          <div className="mt-2">{getStatusRender(status || '')}</div>
        </div>
      </div>
      <div className="mt-5">
        {techTaskLoading || isValidating ? (
          <TableSkeleton columnCount={5} />
        ) : (
          <div>
            <TechTaskCard
              items={techTaskItems}
              values={taskValues}
              uploadedFiles={uploadedFiles}
              onChange={handleChange}
              onFileUpload={handleUpload}
              onImageRemove={removeImage}
              status={status ? status as StatusTechTask : undefined}
            />
            {status !== t('tables.FINISHED') && (
              <div className="flex flex-col sm:flex-row gap-4 mt-2 mb-10">
                <Button
                  title={t('organizations.cancel')}
                  type="outline"
                  handleClick={() => {
                    navigate(-1);
                  }}
                />
                <Button
                  title={t('routine.done')}
                  isLoading={isMutating}
                  handleClick={handleSubmit}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TechTaskItem;
