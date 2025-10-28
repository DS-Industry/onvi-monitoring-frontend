import React, { useState } from 'react';
import { Upload, message, Typography } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Text } = Typography;

interface FileUploadProps {
  accept?: string; // e.g. ".jpg,.png,.pdf"
  maxSizeMB?: number; // max file size in MB
  multiple?: boolean;
  onChange?: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.jpg,.png,.pdf',
  maxSizeMB = 5,
  multiple = true,
  onChange,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);

  const handleBeforeUpload = (file: File) => {
    const isAccepted = accept.split(',').some(type => file.name.endsWith(type));
    if (!isAccepted) {
      message.error(`File type not allowed: ${file.name}`);
      return Upload.LIST_IGNORE;
    }

    const isSizeValid = file.size / 1024 / 1024 < maxSizeMB;
    if (!isSizeValid) {
      message.error(`File ${file.name} exceeds ${maxSizeMB} MB limit`);
      return Upload.LIST_IGNORE;
    }

    const updatedList = [...fileList, file];
    setFileList(updatedList);
    onChange?.(updatedList);
    return false; // Prevent automatic upload
  };

  const handleRemove = (file: any) => {
    const updatedList = fileList.filter(f => f.uid !== file.uid);
    setFileList(updatedList);
    onChange?.(updatedList);
  };

  const props: UploadProps = {
    multiple,
    accept,
    beforeUpload: handleBeforeUpload,
    onRemove: handleRemove,
    fileList,
  };

  return (
    <div className="w-full max-w-xl">
      <Dragger {...props}>
        <p className="text-blue-500">
          <InboxOutlined style={{ fontSize: 40 }} />
        </p>
        <p className="text-gray-800 font-medium">
          Click or drag files to this area to upload
        </p>
        <Text type="secondary" className="text-sm">
          Allowed: {accept.replace(/,/g, ', ')} | Max size: {maxSizeMB} MB
        </Text>
      </Dragger>
    </div>
  );
};

export default FileUpload;
