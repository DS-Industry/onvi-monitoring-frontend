import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoldOutlined } from '@ant-design/icons';

const ShiftCost: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <GoldOutlined className="w-12 h-12 flex justify-center items-center text-2xl text-white" />
        </div>
        <div>
          <div className="font-bold text-text01 text-2xl">
            {t('pos.shiftCost')}
          </div>
          <div className="text-text02 text-md">{t('pos.displayingCost')}</div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCost;
