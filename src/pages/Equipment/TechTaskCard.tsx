import React, { useState } from 'react';
import {
  CloseOutlined,
  UpOutlined,
  DownOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { Button, Card, List, Upload, Input, InputNumber, Select, Checkbox, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { TechTasksItem, StatusTechTask } from '@/services/api/equipment';

const selectOptions = [
  { name: 'Ниже нормы', value: 'belowNormal' },
  { name: 'Норма', value: 'normal' },
  { name: 'Выше нормы', value: 'aboveNormal' },
];

type Props = {
  items: TechTasksItem[];
  values: Record<number, string | number | boolean | null>;
  uploadedFiles: Record<number, File | string | null>;
  onChange: (id: number, value: string | number | boolean | null) => void;
  onFileUpload: (itemId: number) => (options: any) => void;
  onImageRemove: (id: number) => void;
  status?: StatusTechTask;
};

type DynamicInputProps = {
  type: string;
  value: string | number | boolean | null;
  onChange: (val: string | number | boolean | null) => void;
  disabled: boolean;
};

const DynamicInput: React.FC<DynamicInputProps> = ({
  type,
  value,
  onChange,
  disabled,
}) => {
  switch (type) {
    case 'Text':
      return (
        <Input
          type="text"
          value={value as string || ''}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full"
        />
      );

    case 'Number':
      return (
        <InputNumber
          value={value as number | null}
          onChange={val => onChange(val ?? null)}
          onBlur={e => {
            const inputValue = e.target.value;
            if (inputValue === '' || inputValue === undefined) {
              onChange(null);
            } else {
              const numValue = Number(inputValue);
              onChange(isNaN(numValue) ? null : numValue);
            }
          }}
          disabled={disabled}
          className="w-full"
        />
      );

    case 'SelectList':
      return (
        <Select
          value={value as string}
          options={selectOptions}
          onChange={val => onChange(val)}
          disabled={disabled}
          className="w-full"
        />
      );

    case 'Checkbox':
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
      );

    default:
      return <span>-</span>;
  }
};

const TechTaskCard: React.FC<Props> = ({
  items,
  values,
  uploadedFiles,
  onChange,
  onFileUpload,
  onImageRemove,
  status,
}) => {
  const { t } = useTranslation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [previewImage, setPreviewImage] = useState<{
    visible: boolean;
    src: string;
  }>({
    visible: false,
    src: '',
  });

  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, TechTasksItem[]>
  );

  const groupOrder = Array.from(
    new Set(items.map(item => item.group))
  );
  
  const sortedGroupEntries = groupOrder.map(group => ({ 
    groupName: group, 
    groupItems: grouped[group] 
  }));

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleImagePreview = (itemId: number) => {
    const imageSrc = uploadedFiles[itemId] instanceof File
      ? URL.createObjectURL(uploadedFiles[itemId] as File)
      : (uploadedFiles[itemId] as string);

    setPreviewImage({
      visible: true,
      src: imageSrc,
    });
  };

  const handleClosePreview = () => {
    setPreviewImage({
      visible: false,
      src: '',
    });
  };

  return (
    <div>
      <List
        dataSource={sortedGroupEntries}
        locale={{ emptyText: ' ' }}
        renderItem={({ groupName, groupItems }) => (
          <List.Item className="w-full">
            <Card className="w-full">
              <div
                className="flex items-center justify-between space-x-2 mb-4 cursor-pointer"
                onClick={() => toggleGroup(groupName)}
              >
                <div className="text-lg font-semibold">
                  {t(`chemical.${groupName}`)}
                </div>
                <div className="cursor-pointer w-6 h-6 text-primary02_Hover flex justify-center items-center">
                  {openGroups[groupName] ? <UpOutlined /> : <DownOutlined />}
                </div>
              </div>
              {openGroups[groupName] && (
                <List
                  dataSource={groupItems}
                  locale={{ emptyText: '' }}
                  renderItem={item => (
                    <List.Item className="w-full border-none">
                      <div className="w-full flex flex-col">
                        <div className="flex flex-col w-full space-y-2">
                          <div className="text-text01 font-semibold">
                            {item.title}
                          </div>
                          <DynamicInput
                            type={item.type}
                            value={values[item.id]}
                            onChange={val => onChange(item.id, val)}
                            disabled={status === StatusTechTask.FINISHED}
                          />
                          <Upload
                            customRequest={onFileUpload(item.id)}
                            showUploadList={false}
                            multiple={false}
                            accept="image/*"
                            disabled={status === StatusTechTask.FINISHED}
                          >
                            <Button
                              type="text"
                              icon={<PictureOutlined className="text-xl" />}
                              className="min-w-full h-14 border-2 border-dashed border-[#C0D0E0] rounded-xl flex items-center justify-start gap-2 text-sm font-medium"
                            >
                              {t('routine.attachImage')}
                            </Button>
                          </Upload>
                        </div>
                        {uploadedFiles[item.id] && (
                          <div className="flex flex-wrap gap-4 pt-4">
                            <div className="relative w-[100px] h-[100px] border rounded-md overflow-hidden group">
                              <img
                                src={
                                  uploadedFiles[item.id] instanceof File
                                    ? URL.createObjectURL(
                                      uploadedFiles[item.id] as File
                                    )
                                    : (uploadedFiles[item.id] as string)
                                }
                                alt="uploaded"
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleImagePreview(item.id)}
                                onError={(e) => {
                                  console.error('Image failed to load:', {
                                    src: e.currentTarget.src,
                                    itemId: item.id,
                                    uploadedFile: uploadedFiles[item.id],
                                    uploadedFileType: typeof uploadedFiles[item.id]
                                  });
                                  e.currentTarget.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', {
                                    src: uploadedFiles[item.id],
                                    itemId: item.id,
                                    uploadedFileType: typeof uploadedFiles[item.id]
                                  });
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onImageRemove(item.id);
                                }}
                                disabled={status === StatusTechTask.FINISHED}
                                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
                              >
                                <CloseOutlined style={{ fontSize: '12px' }} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </List.Item>
        )}
      />

      <Modal
        open={previewImage.visible}
        onCancel={handleClosePreview}
        footer={null}
        centered
        width="auto"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        className="image-preview-modal"
      >
        <img
          src={previewImage.src}
          alt="Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
          }}
        />
      </Modal>
    </div>
  );
};

export default TechTaskCard;