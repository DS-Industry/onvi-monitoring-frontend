import React from 'react';
import { useTranslation } from 'react-i18next';
import CarIcon from '@icons/CarIcon.svg?react';

const LevelsBonuses: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-center bg-background02 p-4">
        <div className="flex flex-col rounded-lg p-8 w-full md:p-0 space-y-10">
          <div className="flex items-center space-x-4">
            <CarIcon />
            <div>
              <div className="font-semibold text-text01">
                {t('marketingLoyalty.writeOff')}
              </div>
              <div className="text-text03 text-xs">
                {t('marketingLoyalty.settingUp')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelsBonuses;
