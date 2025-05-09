import React, { useState } from 'react';
import { ServicesTab } from './ServicesTab';
import InfoTab from './InfoTab';
import { useTranslation } from 'react-i18next';

const ProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', name: t("profile.basic"), content: <InfoTab /> },
    { id: 'services', name: t("profile.changePass"), content: <ServicesTab /> },
  ];

  return (
    <div className="max-w-5xl sm:ml-20 bg-white">
      <div className="flex space-x-4 border-b mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`pb-2 ${activeTab === tab.id ? 'text-text01 border-b-4 border-primary02' : 'text-text02'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="flex space-x-10">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default ProfileForm;
