import React, { useState } from 'react';
import { ServicesTab } from './ServicesTab';
import { AdditionalInfoTab } from './AdditionalInfoTab';
import InfoTab from './InfoTab';
// Import other tab components as needed

const ProfileForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState('info');
  

  // Array of tabs with names and corresponding components
  const tabs = [
    { id: 'info', name: 'Информация', content: <InfoTab /> },
    { id: 'additional', name: 'Услуги', content: <AdditionalInfoTab /> },
    { id: 'services', name: 'Доп. информация', content: <ServicesTab /> },
    { id: 'additional1', name: 'Настройки', content: <AdditionalInfoTab /> },
    { id: 'additional2', name: 'Расписание', content: <AdditionalInfoTab /> },
    { id: 'additional3', name: 'Расчет ЗП', content: <AdditionalInfoTab /> },
    // Add other tabs here
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white">
      {/* Navigation Tabs */}
      <div className="flex space-x-6 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`pb-2 ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
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
