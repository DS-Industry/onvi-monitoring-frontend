import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form } from 'antd';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';
import { 
  createTechTask, 
  getPoses, 
  getTags, 
  getTechTaskItem, 
  TechTaskBody,
  TypeTechTask,
  PeriodType
} from '@/services/api/equipment';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/hooks/useToast';
import { Grid } from 'antd';

import {
  CreateTechTaskModalHeader,
  CreateTechTaskModalFooter,
  CreateTechTaskInfoPanel,
  CreateTechTaskForm,
} from './components';

const { useBreakpoint } = Grid;

interface TemplateItem {
  id: number;
  title: string;
}

interface CreateTechTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateTechTaskModal: React.FC<CreateTechTaskModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useUser();
  const [form] = Form.useForm();
  const [availableTemplates, setAvailableTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplateItems, setSelectedTemplateItems] = useState<TemplateItem[]>([]);
  const [periodType, setPeriodType] = useState<PeriodType | undefined>(undefined);

  const screens = useBreakpoint();
  const fullscreen = !screens.md;

  const swrConfig = { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true };

  const { data: poses } = useSWR(
    user.organizationId ? ['get-poses'] : null, 
    () => getPoses({ organizationId: user.organizationId }),
    swrConfig
  );

  const { data: tagsData } = useSWR(['get-tags'], getTags, swrConfig);
  const { data: techTaskItems } = useSWR(['get-tech-task-item'], getTechTaskItem, swrConfig);

  const templates: TemplateItem[] = useMemo(
    () => techTaskItems?.map(item => ({ id: item.props.id, title: item.props.title })) || [],
    [techTaskItems]
  );

  const { trigger: createTechTaskMutation, isMutating } = useSWRMutation(
    ['create-tech-task'],
    async (_, { arg }: { arg: TechTaskBody }) => createTechTask(arg)
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedTemplateItems([]);
      setPeriodType(undefined);
      setAvailableTemplates(templates);
    }
  }, [open, form, templates]);

  const handleTemplatesChange = (selected: TemplateItem[], available: TemplateItem[]) => {
    setSelectedTemplateItems(selected);
    setAvailableTemplates(available);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedTemplateItems.length === 0) {
        showToast(t('techTasks.selectAtLeastOneTemplate'), 'error');
        return;
      }

      const techTaskData: TechTaskBody = {
        name: values.name,
        posId: Number(values.posId),
        type: values.type,
        periodType: values.type === TypeTechTask.REGULAR ? values.periodType : undefined,
        customPeriodDays: values.periodType === PeriodType.CUSTOM ? Number(values.customPeriodDays) : undefined,
        markdownDescription: values.authorComment,
        startDate: new Date(), 
        endSpecifiedDate: values.endDate ? dayjs(values.endDate).toDate() : undefined,
        techTaskItem: selectedTemplateItems.map(item => item.id),
        tagIds: values.tags.map((tagId: any) => Number(tagId)),
      };

      await createTechTaskMutation(techTaskData);
      showToast(t('techTasks.createSuccess') || 'Задача успешно создана', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create tech task:', error);
      showToast(t('techTasks.createError') || 'Ошибка при создании задачи', 'error');
    }
  };

  return (
    <Modal
      title={<CreateTechTaskModalHeader onClose={onClose} />}
      open={open}
      onCancel={onClose}
      footer={null}
      width={fullscreen ? '100vw' : 1200}
      style={{
        height: fullscreen ? '100vh' : 'auto', 
        maxWidth: fullscreen ? '100vw' : 'auto', 
        padding: fullscreen ? 0 : "auto", 
        top: fullscreen ? 0 : 50,
        margin: fullscreen ? 0 : "auto",
      }}
      zIndex={99999}
      className="create-tech-task-modal"
      closable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="h-full flex flex-col"
        initialValues={{}}
      >
        <div className="p-6 max-h-[700px] overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <CreateTechTaskForm
              selectedTemplates={selectedTemplateItems}
              availableTemplates={availableTemplates}
              totalTemplates={templates.length}
              onTemplatesChange={handleTemplatesChange}
            />

            <CreateTechTaskInfoPanel
              form={form}
              periodType={periodType}
              onPeriodTypeChange={setPeriodType}
              tagsData={tagsData}
              posesData={poses}
            />
          </div>
        </div>

        <CreateTechTaskModalFooter
          isMutating={isMutating}
          onCancel={onClose}
        />
      </Form>
    </Modal>
  );
};

export default CreateTechTaskModal;