import React from 'react';
import { useTranslation } from 'react-i18next';

const Communication: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex space-x-6">
        <div className="gap-2 px-4 py-5 bg-disabledFill w-64 rounded-lg">
          <div className="font-bold text-3xl text-text01">0</div>
          <div className="text-text02/70 mt-2">{t('marketing.sms')}</div>
        </div>
        <div className="gap-2 px-4 py-5 bg-disabledFill w-64 rounded-lg">
          <div className="font-bold text-3xl text-text01">0</div>
          <div className="text-text02/70 mt-2">{t('marketing.letters')}</div>
        </div>
      </div>
      <div className="flex space-x-6">
        <div className="gap-2 px-4 py-5 bg-disabledFill w-64 rounded-lg">
          <div className="font-bold text-3xl text-text01">0</div>
          <div className="text-text02/70 mt-2">{t('marketing.chats')}</div>
        </div>
        <div className="gap-2 px-4 py-5 bg-disabledFill w-64 rounded-lg">
          <div className="font-bold text-3xl text-text01">0</div>
          <div className="text-text02/70 mt-2">{t('marketing.inbox')}</div>
        </div>
      </div>
      <div className="gap-2 px-4 py-5 bg-disabledFill w-64 rounded-lg">
        <div className="font-bold text-3xl text-text01">0</div>
        <div className="text-text02/70 mt-2">{t('marketing.outgoing')}</div>
      </div>
    </div>
  );
};

export default Communication;
