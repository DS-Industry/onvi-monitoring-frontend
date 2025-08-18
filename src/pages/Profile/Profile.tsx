import React, { useState } from 'react';
const InfoTab = React.lazy(() => import('./InfoTab'));
const ServicesTab = React.lazy(() => import('./ServicesTab'));
import { useTranslation } from 'react-i18next';

const ProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', name: t('profile.basic'), content: <InfoTab /> },
    { id: 'services', name: t('profile.changePass'), content: <ServicesTab /> },
  ];

  return (
    <div>
      <div className="ml-12 sm:ml-20 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.profile')}
          </span>
        </div>
      </div>
      <div className="max-w-5xl sm:ml-20 bg-white">
        <div className="flex space-x-4 border-b mb-6 w-fit">
          {tabs.map(tab => (
            <button
              className={`pb-2 ${activeTab === tab.id ? 'text-text01 border-b-4 border-primary02' : 'text-text02'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="flex space-x-10">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
