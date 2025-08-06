import React from 'react';
import AntdButton from 'antd/es/button';
import Spin from 'antd/es/spin';
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
  ExportOutlined,
} from '@ant-design/icons';

type ButtonCreateProps = {
  title: string;
  form?: boolean;
  type?: 'outline' | 'basic';
  iconPlus?: boolean;
  iconRight?: boolean;
  handleClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  classname?: string;
  iconDown?: boolean;
  iconDownload?: boolean;
  iconUp?: boolean;
  iconUpload?: boolean;
  iconArrowDiognal?: boolean;
};

const Button: React.FC<ButtonCreateProps> = ({
  title = 'Default',
  type = 'basic',
  iconPlus = false,
  iconRight = false,
  form = false,
  handleClick,
  isLoading = false,
  disabled = false,
  classname = '',
  iconDown = false,
  iconDownload = false,
  iconUp = false,
  iconUpload = false,
  iconArrowDiognal = false,
}) => {
  const typeButton = {
    basic:
      'bg-primary02 hover:bg-primary02_Hover text-text04 flex items-center',
    outline:
      'bg-background02 text-primary02 hover:text-primary02_Hover border border-primary02 hover:border-primary02_Hover flex items-center',
  };

  const className = `${typeButton[type]} font-normal rounded-md text-base px-[25px] py-[21px] flex justify-center items-center ${disabled ? '!bg-primary02 text-white cursor-not-allowed' : ''} ${classname}`;

  const typeForm = form ? 'submit' : 'button';

  return (
    <AntdButton
      type={type === 'outline' ? 'default' : 'primary'}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      htmlType={typeForm}
    >
      {iconPlus && <PlusOutlined />}
      {iconDownload && <DownloadOutlined />}
      {iconUpload && <UploadOutlined />}
      {iconUp && <ArrowUpOutlined />}
      {iconDown && <ArrowDownOutlined />}
      {iconRight && <ArrowRightOutlined />}
      {iconArrowDiognal && <ExportOutlined />}
      {isLoading ? (
        <Spin size="small" className="ml-2" />
      ) : (
        <span className="ml-2">{title}</span>
      )}
    </AntdButton>
  );
};

export default Button;
