import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input } from 'antd';
import TipTapEditor from '@/components/ui/Input/TipTapEditor';
import TechTaskTemplateManager from './TechTaskTemplateManager';

interface TemplateItem {
  id: number;
  title: string;
}

interface UpdateTechTaskEditModeProps {
  isEditMode: boolean;
  selectedTemplates: TemplateItem[];
  availableTemplates: TemplateItem[];
  totalTemplates: number;
  onTemplatesChange: (selected: TemplateItem[], available: TemplateItem[]) => void;
}

const UpdateTechTaskEditMode: React.FC<UpdateTechTaskEditModeProps> = ({
  isEditMode,
  selectedTemplates,
  availableTemplates,
  totalTemplates,
  onTemplatesChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 min-w-0 w-full">
      <Form.Item
        name="name"
        rules={[{ required: true, message: t('techTasks.taskNameRequired') }]}
      >
        <Input
          placeholder={t('techTasks.enterTaskName')}
          size="large"
          className="text-lg"
          disabled={!isEditMode}
        />
      </Form.Item>

      <div className="flex flex-col">
        <label className="text-lg font-medium text-gray-700 mb-2">
          {t('techTasks.taskDescription')}
        </label>
        <Form.Item 
          name="markdownDescription" 
          className="flex-1"
        >
          <TipTapEditor 
            key={`editor-${isEditMode}`}
            autoResize 
            readonly={!isEditMode} 
          />
        </Form.Item>
      </div>

      {isEditMode ? <div className="flex flex-col min-h-[300px] w-full">
        <TechTaskTemplateManager
          selectedTemplates={selectedTemplates}
          availableTemplates={availableTemplates}
          totalTemplates={totalTemplates}
          onTemplatesChange={onTemplatesChange}
        /> 
      </div> : null}
    </div>
  );
};

export default UpdateTechTaskEditMode;
