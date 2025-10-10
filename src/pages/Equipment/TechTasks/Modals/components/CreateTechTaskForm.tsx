import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input } from 'antd';
import TipTapEditor from '@/components/ui/Input/TipTapEditor';
import TechTaskTemplateManager from './TechTaskTemplateManager';

interface TemplateItem {
  id: number;
  title: string;
}

interface CreateTechTaskFormProps {
  selectedTemplates: TemplateItem[];
  availableTemplates: TemplateItem[];
  totalTemplates: number;
  onTemplatesChange: (selected: TemplateItem[], available: TemplateItem[]) => void;
}

const CreateTechTaskForm: React.FC<CreateTechTaskFormProps> = ({
  selectedTemplates,
  availableTemplates,
  totalTemplates,
  onTemplatesChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col gap-4 lg:min-w-0">
      <Form.Item
        name="name"
        rules={[{ required: true, message: t('techTasks.taskNameRequired') }]}
      >
        <Input
          placeholder={t('techTasks.enterTaskName')}
          size="large"
          className="text-lg"
        />
      </Form.Item>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-2">
          {t('techTasks.authorComment')} *
        </label>
        <Form.Item 
          name="authorComment" 
          className="flex-1"
          rules={[{ required: true, message: t('techTasks.authorCommentRequired') }]}
        >
          <TipTapEditor autoResize />
        </Form.Item>
      </div>

      <div className="flex flex-col min-h-[300px]">
        <TechTaskTemplateManager
          selectedTemplates={selectedTemplates}
          availableTemplates={availableTemplates}
          totalTemplates={totalTemplates}
          onTemplatesChange={onTemplatesChange}
        />
      </div>
    </div>
  );
};

export default CreateTechTaskForm;
