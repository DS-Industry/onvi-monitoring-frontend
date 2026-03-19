import React from 'react';
import { useTranslation } from 'react-i18next';

const ExpenseReport: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="ml-12 md:ml-0 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.expenseReport')}
          </span>
        </div>
      </div>
    </>
  );
};

export default ExpenseReport;