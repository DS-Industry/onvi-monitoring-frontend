import React from 'react';
import { useTranslation } from 'react-i18next';

const BalanceTransferRequests: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.balanceTransferRequests')}
        </span>
      </div>
    </div>  
  );
};

export default BalanceTransferRequests;