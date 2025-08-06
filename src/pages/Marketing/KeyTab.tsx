import React from 'react';
import { useTranslation } from 'react-i18next';

const KeyTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex space-x-6">
        <div className="gap-2 px-4 py-5 bg-disabledFill w-64 rounded-lg">
          <div className="font-bold text-3xl text-text01">14 000 ₽</div>
          <div className="text-text02/70 mt-2">{t('marketing.total')}</div>
        </div>
        <div className="gap-2 px-4 py-5 bg-disabledFill w-64 rounded-lg">
          <div className="font-bold text-3xl text-text01">14 00 ₽</div>
          <div className="text-text02/70 mt-2">{t('marketing.avg')}</div>
        </div>
      </div>
      <div className="gap-2 px-4 py-5 bg-disabledFill w-64 rounded-lg">
        <div className="font-bold text-3xl text-text01">10</div>
        <div className="text-text02/70 mt-2">{t('marketing.number')}</div>
      </div>
    </div>
  );
};

export default KeyTab;
