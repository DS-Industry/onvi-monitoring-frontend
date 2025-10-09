import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, DatePicker, Button, Avatar, Checkbox, Spin } from 'antd';
import { CloseOutlined, QuestionCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';
import { getAvatarColorClasses } from '@/utils/avatarColors';
import { 
  updateTechTask, 
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
import TipTapEditor from '@/components/ui/Input/TipTapEditor';

const { Option } = Select;

interface TemplateItem {
  id: number;
  title: string;
  description?: string;
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
  const user = useUser();
  const [form] = Form.useForm();
  const [periodType, setPeriodType] = useState<PeriodType | undefined>(undefined);
  const [availableTemplates, setAvailableTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplateItems, setSelectedTemplateItems] = useState<TemplateItem[]>([]);
  const [selectedForTransfer, setSelectedForTransfer] = useState<number[]>([]);

  const { data: tagsData } = useSWR(['get-tags'], () => getTags(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false
  });

  const { data: techTaskItems } = useSWR(
    ['get-tech-task-item'],
    () => getTechTaskItem(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const { data: techTaskDetails, isLoading: isLoadingTechTaskDetails, isValidating: isValidatingTechTaskDetails, mutate: mutateTechTaskDetails } = useSWR(
    techTaskId ? ['get-tech-task-details', techTaskId] : null,
    () => getTechTaskShapeItem(techTaskId!),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: false,
      shouldRetryOnError: false,
      dedupingInterval: 0, 
      refreshInterval: 0, 
    }
  );

  const templates: TemplateItem[] = useMemo(
    () =>
      techTaskItems?.map(item => ({
        id: item.props.id,
        title: item.props.title,
        description: 'This is the description text.',
      })) || [],
    [techTaskItems]
  );

  const { trigger: updateTechTaskMutation, isMutating } = useSWRMutation(
    ['update-tech-task'],
    async (_, { arg }: { arg: any }) => {
      return updateTechTask(arg);
    }
  );

  useEffect(() => {
    if (techTaskDetails && open && templates.length > 0) {
      setPeriodType(techTaskDetails.periodType);
      
      const selectedItemIds = techTaskDetails.items?.map(item => item.id) || [];
      
      const selectedTemplates = templates.filter(template => {
        const matchingByTitle = techTaskDetails.items?.find(item => item.title === template.title);
        if (matchingByTitle) return true;
        
        return selectedItemIds.includes(template.id);
      });
      
      const availableTemplatesList = templates.filter(template => {
        const matchingByTitle = techTaskDetails.items?.find(item => item.title === template.title);
        const matchingById = selectedItemIds.includes(template.id);
        return !matchingByTitle && !matchingById;
      });
      
      setSelectedTemplateItems(selectedTemplates);
      setAvailableTemplates(availableTemplatesList);
      setSelectedForTransfer([]);
      
      form.setFieldsValue({
        name: techTaskDetails.name,
        status: techTaskDetails.status,
        periodType: techTaskDetails.periodType,
        customPeriodDays: techTaskDetails.periodType === PeriodType.CUSTOM ? techTaskDetails.customPeriodDays : undefined,
        markdownDescription: techTaskDetails.markdownDescription || '', 
        endDate: techTaskDetails.endSpecifiedDate ? dayjs(techTaskDetails.endSpecifiedDate) : undefined,
        tags: techTaskDetails.tags?.map(tag => tag.id) || [],
      });
    }
  }, [techTaskDetails, open, form, templates]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setPeriodType(undefined);
      setAvailableTemplates([]);
      setSelectedTemplateItems([]);
      setSelectedForTransfer([]);
    } else if (open && techTaskId) {
      mutateTechTaskDetails();
    }
  }, [open, form, techTaskId, mutateTechTaskDetails]);

  const handleTemplateSelect = (templateId: number) => {
    setSelectedForTransfer(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleTransferToSelected = () => {
    const templatesToTransfer = availableTemplates.filter(template => 
      selectedForTransfer.includes(template.id)
    );
    
    setSelectedTemplateItems(prev => [...prev, ...templatesToTransfer]);
    setAvailableTemplates(prev => prev.filter(template => 
      !selectedForTransfer.includes(template.id)
    ));
    setSelectedForTransfer([]);
  };

  const handleTransferToAvailable = () => {
    const templatesToTransfer = selectedTemplateItems.filter(template => 
      selectedForTransfer.includes(template.id)
    );
    
    setAvailableTemplates(prev => [...prev, ...templatesToTransfer]);
    setSelectedTemplateItems(prev => prev.filter(template => 
      !selectedForTransfer.includes(template.id)
    ));
    setSelectedForTransfer([]);
  };

  const handleSubmit = async (values: any) => {
    if (!techTaskDetails) return;

    try {
      if (techTaskDetails.type === TypeTechTask.REGULAR && values.periodType === PeriodType.CUSTOM) {
        if (!values.customPeriodDays || values.customPeriodDays <= 0) {
          showToast(t('techTasks.enterDaysForCustomPeriod'), 'error');
          return;
        }
        if (values.customPeriodDays > 365) {
          showToast(t('techTasks.customPeriodMaxDays'), 'error');
          return;
        }
      }

      const updateData = {
        techTaskId: techTaskDetails.id,
        name: values.name,
        status: values.status,
        periodType: techTaskDetails.type === TypeTechTask.REGULAR ? values.periodType : undefined,
        customPeriodDays: values.periodType === PeriodType.CUSTOM ? Number(values.customPeriodDays) : undefined,
        markdownDescription: values.markdownDescription,
        endSpecifiedDate: values.endDate ? dayjs(values.endDate).toDate() : undefined,
        techTaskItem: selectedTemplateItems.map(item => item.id),
        tagIds: values.tags || [],
      };

      await updateTechTaskMutation(updateData);
      showToast(t('techTasks.updateSuccess') || 'Задача успешно обновлена', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast(t('techTasks.updateError') || 'Ошибка при обновлении задачи', 'error');
    }
  };

  const userInitials = `${user.name?.charAt(0) || ''}${user.name?.charAt(1) || ''}`.toUpperCase();
  const userFullName = user.name || 'Пользователь';
  const avatarColors = getAvatarColorClasses(user.id || 0);

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span>{t('routes.technicalTasks')} /{techTaskId}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      className="update-tech-task-modal"
    >
      <Spin 
        spinning={isLoadingTechTaskDetails || isValidatingTechTaskDetails} 
        tip={t('common.loading')}
        className="h-full"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="h-full flex flex-col"
        >
          <div className="flex-1 overflow-y-scroll p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="flex-1 flex flex-col gap-4">
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

            <div className="flex-1 flex flex-col min-h-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2">
                {t('techTasks.taskDescription')}
              </label>
              <Form.Item 
                name="markdownDescription" 
                className="flex-1"
              >
                <TipTapEditor />
              </Form.Item>
            </div>

            <div className="flex-1 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{t('techTasks.templates')} ({selectedTemplateItems.length})</h3>
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    size="small"
                    className="text-gray-400 hover:text-gray-600"
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {t('techTasks.selectedTemplates', { selected: selectedTemplateItems.length, total: templates.length })}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <div className="border rounded-lg">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                      <span className="text-sm font-medium text-gray-700">{t('techTasks.availableTemplates')}</span>
                      <span className="text-xs text-gray-500">{availableTemplates.length}</span>
                    </div>
                    <div className="h-48 lg:h-64 overflow-y-auto">
                      {availableTemplates.map(template => (
                        <div
                          key={template.id}
                          className={`flex items-center gap-2 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                            selectedForTransfer.includes(template.id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <Checkbox
                            checked={selectedForTransfer.includes(template.id)}
                            onChange={() => handleTemplateSelect(template.id)}
                          />
                          <span className="text-sm">{template.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col justify-center gap-2 lg:gap-0">
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={handleTransferToSelected}
                    disabled={selectedForTransfer.length === 0}
                    className="lg:mb-2"
                    title={t('techTasks.moveToSelected')}
                  />
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined style={{ transform: 'rotate(180deg)' }} />}
                    onClick={handleTransferToAvailable}
                    disabled={selectedForTransfer.length === 0}
                    title={t('techTasks.moveToAvailable')}
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="border rounded-lg">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                      <span className="text-sm font-medium text-gray-700">{t('techTasks.selectedTemplatesList')}</span>
                      <span className="text-xs text-gray-500">{selectedTemplateItems.length}</span>
                    </div>
                    <div className="h-48 lg:h-64 overflow-y-auto">
                      {selectedTemplateItems.map(template => (
                        <div
                          key={template.id}
                          className={`flex items-center gap-2 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                            selectedForTransfer.includes(template.id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <Checkbox
                            checked={selectedForTransfer.includes(template.id)}
                            onChange={() => handleTemplateSelect(template.id)}
                          />
                          <span className="text-sm">{template.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[450px] flex flex-col gap-4">
            <div className="border rounded-lg p-4 bg-[#F8F8FA] border-[#ACAEB3]">
              <h3 className="text-lg font-medium mb-4">{t('techTasks.information')}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('techTasks.status')} <span className="text-red-500">*</span>
                </label>
                <Form.Item name="status" rules={[{ required: true, message: t('techTasks.selectStatus') }]}>
                  <Select size="large" className="w-full">
                    <Option value={StatusTechTask.ACTIVE}>{t('techTasks.active')}</Option>
                    <Option value={StatusTechTask.PAUSE}>{t('techTasks.paused')}</Option>
                    <Option value={StatusTechTask.RETURNED}>{t('techTasks.returned')}</Option>
                    <Option value={StatusTechTask.FINISHED}>{t('techTasks.finished')}</Option>
                    <Option value={StatusTechTask.OVERDUE}>{t('techTasks.overdue')}</Option>
                  </Select>
                </Form.Item>
              </div>

              {techTaskDetails?.type === TypeTechTask.REGULAR && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('techTasks.periodicity')} <span className="text-red-500">*</span>
                    <QuestionCircleOutlined className="ml-1 text-gray-400" />
                  </label>
                  <Form.Item name="periodType" rules={[{ required: true, message: t('techTasks.selectPeriodicity') }]}>
                    <Select 
                      placeholder={t('techTasks.selectPeriodicity')} 
                      size="large" 
                      className="w-full"
                      onChange={(value) => {
                        setPeriodType(value);
                        if (value !== PeriodType.CUSTOM) {
                          form.setFieldsValue({ customPeriodDays: undefined });
                        }
                      }}
                    >
                      <Option value={PeriodType.DAILY}>{t('techTasks.daily')}</Option>
                      <Option value={PeriodType.WEEKLY}>{t('techTasks.weekly')}</Option>
                      <Option value={PeriodType.MONTHLY}>{t('techTasks.monthly')}</Option>
                      <Option value={PeriodType.YEARLY}>{t('techTasks.yearly')}</Option>
                      <Option value={PeriodType.CUSTOM}>{t('techTasks.customPeriod')}</Option>
                    </Select>
                  </Form.Item>
                </div>
              )}

              {periodType === PeriodType.CUSTOM && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('techTasks.daysCount')} <span className="text-red-500">*</span>
                  </label>
                  <Form.Item 
                    name="customPeriodDays" 
                    rules={[
                      { required: true, message: t('techTasks.enterDaysCount') },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder={t('techTasks.enterDaysCount')}
                      size="large"
                      className="w-full"
                      min={1}
                      max={365}
                    />
                  </Form.Item>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('techTasks.endDate')}
                </label>
                <Form.Item name="endDate">
                  <DatePicker
                    placeholder={t('techTasks.endDate')}
                    size="large"
                    className="w-full"
                    format="DD.MM.YYYY"
                  />
                </Form.Item>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('techTasks.tags')}
                </label>
                <Form.Item name="tags">
                  <Select
                    mode="multiple"
                    placeholder={t('techTasks.selectTags')}
                    size="large"
                    className="w-full"
                  >
                    {tagsData?.map(tag => (
                      <Option key={tag.props.id} value={tag.props.id}>
                        {tag.props.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('techTasks.author')}
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Avatar
                    size={32}
                    className={avatarColors}
                  >
                    {userInitials}
                  </Avatar>
                  <span className="text-sm">
                    {userFullName} ({t('techTasks.you')})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-4">
        <Button onClick={onClose} size="large">
          {t('common.cancel')}
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={isMutating}
        >
          {t('common.update')}
        </Button>
      </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default UpdateTechTaskModal;
