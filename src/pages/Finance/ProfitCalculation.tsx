import React from 'react';
import { useTranslation } from 'react-i18next';

const ProfitCalculation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.profitCalculation')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculation;
