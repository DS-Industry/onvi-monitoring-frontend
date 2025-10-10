import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Empty } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

interface TemplateItem {
  id: number;
  title: string;
}

interface TechTaskTemplateManagerProps {
  selectedTemplates: TemplateItem[];
  availableTemplates: TemplateItem[];
  totalTemplates: number;
  onTemplatesChange: (selected: TemplateItem[], available: TemplateItem[]) => void;
}

const TechTaskTemplateManager: React.FC<TechTaskTemplateManagerProps> = ({
  selectedTemplates,
  availableTemplates,
  totalTemplates,
  onTemplatesChange,
}) => {
  const { t } = useTranslation();
  const [selectedForTransfer, setSelectedForTransfer] = useState<number[]>([]);

  const toggleTemplateSelection = (templateId: number) => {
    setSelectedForTransfer(prev => 
      prev.includes(templateId) ? prev.filter(id => id !== templateId) : [...prev, templateId]
    );
  };

  const handleTransferToSelected = () => {
    if (selectedForTransfer.length === 0) return;
    
    const templatesToTransfer = availableTemplates.filter(template => 
      selectedForTransfer.includes(template.id)
    );
    
    const newSelected = [...selectedTemplates, ...templatesToTransfer];
    const newAvailable = availableTemplates.filter(template => 
      !selectedForTransfer.includes(template.id)
    );
    
    onTemplatesChange(newSelected, newAvailable);
    setSelectedForTransfer([]);
  };

  const handleTransferToAvailable = () => {
    if (selectedForTransfer.length === 0) return;
    
    const templatesToTransfer = selectedTemplates.filter(template => 
      selectedForTransfer.includes(template.id)
    );
    
    const newAvailable = [...availableTemplates, ...templatesToTransfer];
    const newSelected = selectedTemplates.filter(template => 
      !selectedForTransfer.includes(template.id)
    );
    
    onTemplatesChange(newSelected, newAvailable);
    setSelectedForTransfer([]);
  };

  return (
    <>
      <h3 className="text-lg font-medium mb-3">
        {t('techTasks.templates')} ({selectedTemplates.length}/{totalTemplates})
      </h3>
      
      <div className="flex flex-col lg:flex-row gap-4 lg:h-64">
        <div className="flex-1 border rounded-lg min-w-0">
          <div className="p-3 bg-gray-50 border-b">
            <span className="text-sm font-medium">
              {t('techTasks.availableTemplates')} ({availableTemplates.length})
            </span>
          </div>
          <div className="lg:h-48 max-h-48 overflow-y-auto">
            {availableTemplates.length > 0 ? (
              availableTemplates.map(template => (
                <div
                  key={template.id}
                  className={`flex items-center gap-2 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedForTransfer.includes(template.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleTemplateSelection(template.id)}
                >
                  <Checkbox checked={selectedForTransfer.includes(template.id)} />
                  <span className="text-sm truncate">{template.title}</span>
                </div>
              ))
            ) : (
              <div className="p-4">
                <Empty 
                  description={t('techTasks.noAvailableTemplates')} 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row lg:flex-col justify-center gap-2 lg:py-0 py-2 flex-shrink-0">
          <button
            onClick={handleTransferToSelected}
            disabled={selectedForTransfer.length === 0}
            title={t('techTasks.moveToSelected')}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ArrowRightOutlined />
          </button>
          <button
            onClick={handleTransferToAvailable}
            disabled={selectedForTransfer.length === 0}
            title={t('techTasks.moveToAvailable')}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ArrowRightOutlined style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>

        <div className="flex-1 border rounded-lg min-w-0">
          <div className="p-3 bg-gray-50 border-b">
            <span className="text-sm font-medium">
              {t('techTasks.selectedTemplatesList')} ({selectedTemplates.length})
            </span>
          </div>
          <div className="lg:h-48 max-h-48 overflow-y-auto">
            {selectedTemplates.length > 0 ? (
              selectedTemplates.map(template => (
                <div
                  key={template.id}
                  className={`flex items-center gap-2 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedForTransfer.includes(template.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleTemplateSelection(template.id)}
                >
                  <Checkbox checked={selectedForTransfer.includes(template.id)} />
                  <span className="text-sm truncate">{template.title}</span>
                </div>
              ))
            ) : (
              <div className="p-4">
                <Empty 
                  description={t('techTasks.noSelectedTemplates')} 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TechTaskTemplateManager;
