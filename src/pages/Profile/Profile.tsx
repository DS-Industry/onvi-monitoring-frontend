import React, { useState } from 'react';
import { ServicesTab } from './ServicesTab';
import InfoTab from './InfoTab';
// Import other tab components as needed

const ProfileForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState('info');
  

  // Array of tabs with names and corresponding components
  const tabs = [
    { id: 'info', name: 'Основные данные', content: <InfoTab /> },
    { id: 'services', name: 'Сменить пароль', content: <ServicesTab /> },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b mb-6 w-72">
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

      {/* Main Information Section */}

      {/* Profile Form Container */}
      <div className="flex space-x-10">
        {/* Render the content of the active tab */}
        {tabs.find((tab) => tab.id === activeTab)?.content}

        {/* Avatar Section (Visible only in InfoTab) */}
      </div>

      {/* Save Button */}
    </div>
  );
};

export default ProfileForm;
