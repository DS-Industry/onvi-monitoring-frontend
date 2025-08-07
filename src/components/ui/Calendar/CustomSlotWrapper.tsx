import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'antd/es/button';
import { PlusOutlined } from '@ant-design/icons';

interface Props {
  children?: React.ReactNode;
  value: Date;
  onAddEvent: (date: Date) => void;
}

const CustomSlotWrapper: React.FC<Props> = ({
  children,
  value,
  onAddEvent,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative group w-full h-full">
      {children}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 z-10 transition-opacity">
        <Button
          icon={<PlusOutlined />}
          type="default"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onAddEvent(value);
          }}
          className="!text-xs !px-1 !py-0.5"
        >
          <span className="hidden md:inline">{t('routes.add')}</span>
        </Button>
      </div>
    </div>
  );
};

export default CustomSlotWrapper;
