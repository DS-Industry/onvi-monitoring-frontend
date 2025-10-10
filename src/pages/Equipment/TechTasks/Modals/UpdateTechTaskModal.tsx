import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Spin } from 'antd';
import dayjs from 'dayjs';
import { 
  updateTechTask, 
  deleteTechTask,
  getTags, 
  getTechTaskItem, 
  getTechTaskShapeItem,
  TypeTechTask,
  PeriodType,
  StatusTechTask
} from '@/services/api/equipment';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { Grid } from 'antd';

import {
  TechTaskViewMode,
  UpdateTechTaskEditMode,
  UpdateTechTaskInfoPanel,
  UpdateTechTaskModalHeader,
  UpdateTechTaskModalFooter,
  TechTaskViewModeRef,
} from './components';

const { useBreakpoint } = Grid;

interface TemplateItem {
  id: number;
  title: string;
}

interface UpdateTechTaskModalProps {
  open: boolean;
  onClose: () => void;
  techTaskId?: number;
  onSuccess?: () => void;
}

const UpdateTechTaskModal: React.FC<UpdateTechTaskModalProps> = ({
  open,
  onClose,
  techTaskId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const userPermissions = usePermissions();
  const [form] = Form.useForm();
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateItem[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<TemplateItem[]>([]);
  const [periodType, setPeriodType] = useState<PeriodType | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const techTaskViewModeRef = useRef<TechTaskViewModeRef>(null);

  const screens = useBreakpoint();
  const fullscreen = !screens.md;

  const swrConfig = { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true };

  const { data: tagsData } = useSWR(['get-tags'], getTags, swrConfig);
  const { data: techTaskItems } = useSWR(['get-tech-task-item'], getTechTaskItem, swrConfig);

  const { data: techTaskDetails, isLoading, isValidating } = useSWR(
    techTaskId ? ['get-tech-task-details', techTaskId] : null,
    () => getTechTaskShapeItem(techTaskId!),
    swrConfig
  );

  const templates: TemplateItem[] = useMemo(
    () => techTaskItems?.map(item => ({ id: item.props.id, title: item.props.title })) || [],
    [techTaskItems]
  );

  const { trigger: updateTechTaskMutation, isMutating } = useSWRMutation(
    ['update-tech-task'],
    async (_, { arg }: { arg: any }) => {
      return updateTechTask(arg);
    }
  );

  const { trigger: deleteTechTaskMutation, isMutating: isDeleting } = useSWRMutation(
    ['delete-tech-task'],
    async (_, { arg }: { arg: number }) => {
      return deleteTechTask(arg);
    }
  );


  const hasUpdatePermission = hasPermission(userPermissions, [
    { action: 'update', subject: 'TechTask' },
    { action: 'manage', subject: 'TechTask' }
  ]);

  const hasDeletePermission = hasPermission(userPermissions, [
    { action: 'delete', subject: 'TechTask' },
    { action: 'manage', subject: 'TechTask' }
  ]);

  const hasCompletePermission = hasPermission(userPermissions, [
    { action: 'read', subject: 'TechTask' },
    { action: 'manage', subject: 'TechTask' }
  ]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedTemplates([]);
      setAvailableTemplates([]);
      setPeriodType(undefined);
      setIsEditMode(false);
    }
  }, [open, form]);

  useEffect(() => {
    if (techTaskDetails && open && templates.length > 0) {
      setPeriodType(techTaskDetails.periodType);
      
      const selectedItemIds = techTaskDetails.items?.map(item => item.id) || [];
      
      const selectedTemplatesList = templates.filter(template => {
        const matchingByTitle = techTaskDetails.items?.find(item => item.title === template.title);
        if (matchingByTitle) return true;
        return selectedItemIds.includes(template.id);
      });
      
      const availableTemplatesList = templates.filter(template => {
        const matchingByTitle = techTaskDetails.items?.find(item => item.title === template.title);
        const matchingById = selectedItemIds.includes(template.id);
        return !matchingByTitle && !matchingById;
      });
      
      setSelectedTemplates(selectedTemplatesList);
      setAvailableTemplates(availableTemplatesList);
      
      form.setFieldsValue({
        name: techTaskDetails.name,
        status: techTaskDetails.status,
        type: techTaskDetails.type,
        periodType: techTaskDetails.periodType,
        customPeriodDays: techTaskDetails.periodType === PeriodType.CUSTOM ? techTaskDetails.customPeriodDays : undefined,
        markdownDescription: techTaskDetails.markdownDescription || '', 
        endDate: techTaskDetails.endSpecifiedDate ? dayjs(techTaskDetails.endSpecifiedDate) : undefined,
        tags: techTaskDetails.tags?.map(tag => tag.id) || [],
      });
    }
  }, [techTaskDetails, open, form, templates]);

  const handleTemplatesChange = (selected: TemplateItem[], available: TemplateItem[]) => {
    setSelectedTemplates(selected);
    setAvailableTemplates(available);
  };

  const handleComplete = async () => {
    if (!hasCompletePermission) {
      showToast(t('errors.permission.insufficient'), 'error');
      return;
    }

    if (!techTaskDetails) {
      showToast(t('errors.other.general'), 'error');
      return;
    }

    try {
      if (!isEditMode && techTaskViewModeRef.current) {
        // Complete the tech task with shape data - this will automatically set status to FINISHED
        await techTaskViewModeRef.current.handleSubmit();
        showToast(t('techTasks.completeSuccess') || 'Задача успешно завершена', 'success');
        onSuccess?.();
        onClose();
      } else {
        // If in edit mode, just update status to finished
        const result = await updateTechTaskMutation({
          techTaskId: techTaskDetails.id,
          status: StatusTechTask.FINISHED,
        });
        
        if (result) {
          showToast(t('techTasks.completeSuccess') || 'Задача успешно завершена', 'success');
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to complete tech task:', error);
      showToast(t('techTasks.completeError') || 'Ошибка при завершении задачи', 'error');
    }
  };

  const handleReturn = async () => {
    if (!hasUpdatePermission) {
      showToast(t('errors.permission.insufficient'), 'error');
      return;
    }

    if (!techTaskDetails) {
      showToast(t('errors.other.general'), 'error');
      return;
    }

    try {
      const result = await updateTechTaskMutation({
        techTaskId: techTaskDetails.id,
        status: StatusTechTask.RETURNED,
        endSpecifiedDate: techTaskDetails.endSpecifiedDate || dayjs().toDate(),
      });
      
      if (result) {
        showToast(t('actions.returnSuccess'), 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Failed to return tech task:', error);
      showToast(t('actions.returnError'), 'error');
    }
  };

  const handleSubmit = async (values: any) => {
    if (!techTaskDetails || !hasUpdatePermission) {
      showToast(t('errors.permission.insufficient'), 'error');
      return;
    }

    try {
      const updateData = {
        techTaskId: techTaskDetails.id,
        name: values.name,
        status: values.status,
        type: values.type,
        periodType: values.type === TypeTechTask.REGULAR ? values.periodType : undefined,
        customPeriodDays: values.periodType === PeriodType.CUSTOM ? Number(values.customPeriodDays) : undefined,
        markdownDescription: values.markdownDescription,
        endSpecifiedDate: values.endDate ? dayjs(values.endDate).toDate() : undefined,
        techTaskItem: selectedTemplates.map(item => item.id),
        tagIds: values.tags || [],
      };

      await updateTechTaskMutation(updateData);
      showToast(t('techTasks.updateSuccess') || 'Задача успешно обновлена', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update tech task:', error);
      showToast(t('techTasks.updateError') || 'Ошибка при обновлении задачи', 'error');
    }
  };

  const handleDelete = () => {
    if (!techTaskDetails || !hasDeletePermission) {
      showToast(t('errors.permission.insufficient'), 'error');
      return;
    }

    Modal.confirm({
      title: t('techTasks.confirmDelete'),
      content: t('techTasks.confirmDeleteMessage', { count: 1 }),
      okText: t('techTasks.delete'),
      okType: 'danger',
      cancelText: t('organizations.cancel'),
      zIndex: 100000,
      async onOk() {
        try {
          await deleteTechTaskMutation(techTaskDetails.id);
          showToast(t('techTasks.deleteSuccess'), 'success');
          onSuccess?.();
          onClose();
        } catch (error) {
          console.error('Failed to delete tech task:', error);
          showToast(t('techTasks.deleteError'), 'error');
        }
      },
    });
  };

  const handleEditToggle = () => {
    if (!hasUpdatePermission) {
      showToast(t('errors.permission.insufficient'), 'error');
      return;
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <Modal
      closable={false}
      title={
        <UpdateTechTaskModalHeader
          techTaskId={techTaskId}
          status={techTaskDetails?.status}
          isEditMode={isEditMode}
          isDeleting={isDeleting}
          hasUpdatePermission={hasUpdatePermission}
          onEditToggle={handleEditToggle}
          onDelete={handleDelete}
          onClose={onClose}
        />
      }
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
      className="update-tech-task-modal"
    >
      <Spin spinning={isLoading || isValidating} tip={t('common.loading')} className="h-full">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="h-full flex flex-col"
        >
        <div className="p-6 max-h-[700px] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="flex flex-col flex-1 min-w-0 lg:max-w-[60%]">
                <UpdateTechTaskEditMode
                  isEditMode={isEditMode}
                  selectedTemplates={selectedTemplates}
                  availableTemplates={availableTemplates}
                  totalTemplates={templates.length}
                  onTemplatesChange={handleTemplatesChange}
                />
                {!isEditMode && (
                  <TechTaskViewMode
                    ref={techTaskViewModeRef}
                    techTaskData={techTaskDetails}
                    onSave={() => {
                      onSuccess?.();
                      onClose();
                    }}
                  />
                )}
              </div>

              <div className="flex-shrink-0 lg:max-w-[40%]">
                <UpdateTechTaskInfoPanel
                  form={form}
                  isEditMode={isEditMode}
                  periodType={periodType}
                  onPeriodTypeChange={setPeriodType}
                  tagsData={tagsData}
                />
              </div>
        </div>
        </div>

          <UpdateTechTaskModalFooter
            hasUpdatePermission={hasUpdatePermission}
            isEditMode={isEditMode}
            isMutating={isMutating}
            isCompleting={isMutating}
            isReturning={isMutating}
            taskStatus={techTaskDetails?.status}
            onCancel={onClose}
            onSave={() => form.submit()}
            onComplete={handleComplete}
            onReturn={handleReturn}
          />
        </Form>
      </Spin>
    </Modal>
  );
};

export default UpdateTechTaskModal;