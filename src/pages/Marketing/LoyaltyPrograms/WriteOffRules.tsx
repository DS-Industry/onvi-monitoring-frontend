import React from 'react';
import { useTranslation } from 'react-i18next';
import WalletIcon from '@icons/WalletIcon.svg?react';
import MarketingBasicData from '@/assets/MarketingBasicData.webp';

const WriteOffRules: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background02 p-4">
      <div className="flex flex-col rounded-lg p-8 lg:flex-row md:p-0">
        <div className="lg:w-5/12">
        <div className="flex items-center space-x-4">
            <WalletIcon className='w-14' />

            <div>
              <div className="text-lg font-semibold text-text01">
                {t('marketingLoyalty.writeOff')}
              </div>
              <div className="text-text02">
                {t('marketingLoyalty.settingUp')}
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-8/12 rounded-r-lg lg:ml-20">
        <div className="p-8">
            <img
              src={MarketingBasicData}
              alt="Rocket illustration"
              loading="lazy"
              decoding="async"
              className="object-cover w-11/12 h-11/12"
              key="login-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteOffRules;
