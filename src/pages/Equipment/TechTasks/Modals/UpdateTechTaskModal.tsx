import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, DatePicker, Button, Avatar, Checkbox, Spin } from 'antd';
import { ArrowRightOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseOutlined, DeleteOutlined, NumberOutlined, ToolOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';
import { getAvatarColorClasses } from '@/utils/avatarColors';
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
import TipTapEditor from '@/components/ui/Input/TipTapEditor';

const { Option } = Select;

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
  const user = useUser();
  const [form] = Form.useForm();
  const [selectedForTransfer, setSelectedForTransfer] = useState<number[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateItem[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<TemplateItem[]>([]);
  const [periodType, setPeriodType] = useState<PeriodType | undefined>(undefined);

  const swrConfig = { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true };

  const { data: tagsData } = useSWR(['get-tags'], getTags, swrConfig);
  const { data: techTaskItems } = useSWR(['get-tech-task-item'], getTechTaskItem, swrConfig);

  const { data: techTaskDetails, isLoading, mutate, isValidating } = useSWR(
    techTaskId ? ['get-tech-task-details', techTaskId] : null,
    () => getTechTaskShapeItem(techTaskId!),
    { revalidateOnFocus: true, revalidateOnReconnect: true }
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

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedForTransfer([]);
      setSelectedTemplates([]);
      setAvailableTemplates([]);
      setPeriodType(undefined);
    } else if (open && techTaskId) {
      mutate();
    }
  }, [open, techTaskId, mutate]);

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
      setSelectedForTransfer([]);
      
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

  const toggleTemplateSelection = (templateId: number) => {
    setSelectedForTransfer(prev => 
      prev.includes(templateId) ? prev.filter(id => id !== templateId) : [...prev, templateId]
    );
  };

  const handleTransferToSelected = () => {
    const templatesToTransfer = availableTemplates.filter(template => 
      selectedForTransfer.includes(template.id)
    );
    
    setSelectedTemplates(prev => [...prev, ...templatesToTransfer]);
    setAvailableTemplates(prev => prev.filter(template => 
      !selectedForTransfer.includes(template.id)
    ));
    setSelectedForTransfer([]);
  };

  const handleTransferToAvailable = () => {
    const templatesToTransfer = selectedTemplates.filter(template => 
      selectedForTransfer.includes(template.id)
    );
    
    setAvailableTemplates(prev => [...prev, ...templatesToTransfer]);
    setSelectedTemplates(prev => prev.filter(template => 
      !selectedForTransfer.includes(template.id)
    ));
    setSelectedForTransfer([]);
  };

  const handleSubmit = async (values: any) => {
    if (!techTaskDetails) return;

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
      showToast(t('techTasks.updateError') || 'Ошибка при обновлении задачи', 'error');
    }
  };

  const handleDelete = () => {
    if (!techTaskDetails) return;

    Modal.confirm({
      title: t('techTasks.confirmDelete'),
      content: t('techTasks.confirmDeleteMessage', { count: 1 }),
      okText: t('techTasks.delete'),
      okType: 'danger',
      cancelText: t('organizations.cancel'),
      async onOk() {
        try {
          await deleteTechTaskMutation(techTaskDetails.id);
          showToast(t('techTasks.deleteSuccess'), 'success');
          onSuccess?.();
          onClose();
        } catch (error) {
          showToast(t('techTasks.deleteError'), 'error');
        }
      },
    });
  };

  const userInitials = `${user.name?.charAt(0) || ''}${user.name?.charAt(1) || ''}`.toUpperCase();
  const userFullName = user.name || 'Пользователь';
  const avatarColors = getAvatarColorClasses(user.id || 0);

  return (
    <Modal
      closable={false}
      title={
        <div className="flex items-center justify-between">
          <span>{t('routes.technicalTasks')} /{techTaskId}</span>
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={isDeleting}
              className="text-red-500 hover:text-red-700"
              title={t('techTasks.delete')}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              title={t('common.close')}
            />
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
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

            <div className="flex-1 flex flex-col min-h-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2">
                {t('techTasks.taskDescription')}
              </label>
              <Form.Item 
                name="markdownDescription" 
                className="flex-1"
              >
                <TipTapEditor autoResize />
              </Form.Item>
            </div>

            <div className="flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-lg font-medium mb-3">
                {t('techTasks.templates')} ({selectedTemplates.length}/{templates.length})
              </h3>
              
              <div className="flex flex-col lg:flex-row gap-4 lg:h-64">
                <div className="flex-1 border rounded-lg min-w-0">
                  <div className="p-3 bg-gray-50 border-b">
                    <span className="text-sm font-medium">{t('techTasks.availableTemplates')} ({availableTemplates.length})</span>
                  </div>
                  <div className="lg:h-48 max-h-48 overflow-y-auto">
                    {availableTemplates.map(template => (
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
                    ))}
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col justify-center gap-2 lg:py-0 py-2 flex-shrink-0">
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={handleTransferToSelected}
                    disabled={selectedForTransfer.length === 0}
                    title={t('techTasks.moveToSelected')}
                    size="small"
                    className="lg:w-auto"
                  />
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined style={{ transform: 'rotate(180deg)' }} />}
                    onClick={handleTransferToAvailable}
                    disabled={selectedForTransfer.length === 0}
                    title={t('techTasks.moveToAvailable')}
                    size="small"
                    className="lg:w-auto"
                  />
                </div>

                <div className="flex-1 border rounded-lg min-w-0">
                  <div className="p-3 bg-gray-50 border-b">
                    <span className="text-sm font-medium">{t('techTasks.selectedTemplatesList')} ({selectedTemplates.length})</span>
                  </div>
                  <div className="lg:h-48 max-h-48 overflow-y-auto">
                    {selectedTemplates.map(template => (
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[450px] flex flex-col gap-4 lg:flex-shrink-0">
            <div className="border rounded-lg p-4 bg-[#F8F8FA] border-[#ACAEB3]">
              <h3 className="text-lg font-medium mb-4">{t('techTasks.information')}</h3>
              

              <Form.Item 
                name="type" 
                label={
                  <span>
                    <ToolOutlined className="mr-2" /> {t('techTasks.workType')} 
                  </span>
                }
                rules={[{ required: true, message: t('techTasks.selectWorkType') }]}
              >
                <Select placeholder={t('techTasks.selectWorkType')} size="large">
                  <Option value={TypeTechTask.ONETIME}>{t('techTasks.onetime')}</Option>
                  <Option value={TypeTechTask.REGULAR}>{t('techTasks.regular')}</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                name="status" 
                label={
                  <span>
                    <CheckCircleOutlined className="mr-2" /> {t('techTasks.status')} 
                  </span>
                }
                rules={[{ required: true, message: t('techTasks.selectStatus') }]}
              >
                <Select size="large">
                  <Option value={StatusTechTask.ACTIVE}>{t('techTasks.active')}</Option>
                  <Option value={StatusTechTask.PAUSE}>{t('techTasks.paused')}</Option>
                  <Option value={StatusTechTask.RETURNED}>{t('techTasks.returned')}</Option>
                  <Option value={StatusTechTask.FINISHED}>{t('techTasks.finished')}</Option>
                  <Option value={StatusTechTask.OVERDUE}>{t('techTasks.overdue')}</Option>
                </Select>
              </Form.Item>

              <Form.Item 
                name="periodType" 
                label={
                  <span>
                    <ClockCircleOutlined className="mr-2" /> {t('techTasks.periodicity')} 
                  </span>
                }
                rules={[{ required: true, message: t('techTasks.selectPeriodicity') }]}
              >
                <Select 
                  placeholder={t('techTasks.selectPeriodicity')} 
                  size="large"
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

              {periodType === PeriodType.CUSTOM && (
                <Form.Item 
                  name="customPeriodDays" 
                  label={
                    <span>
                      <NumberOutlined className="mr-2" /> {t('techTasks.daysCount')} 
                    </span>
                  }
                  rules={[{ required: true, message: t('techTasks.enterDaysCount') }]}
                >
                  <Input
                    type="number"
                    placeholder={t('techTasks.enterDaysCount')}
                    size="large"
                    min={1}
                    max={365}
                  />
                </Form.Item>
              )}

              <Form.Item 
                name="endDate" 
                label={
                  <span>
                    <CalendarOutlined className="mr-2" /> {t('techTasks.endDate')} 
                  </span>
                }
                rules={[{ required: true, message: t('techTasks.selectEndDate') }]}
              >
                <DatePicker
                  placeholder={t('techTasks.endDate')}
                  size="large"
                  format="DD.MM.YYYY"
                  className="w-full"
                />
              </Form.Item>

              <Form.Item 
                name="tags" 
                label={
                  <span>
                    <UnorderedListOutlined className="mr-2" /> {t('techTasks.tags')} 
                  </span>
                }
              >
                <Select mode="multiple" placeholder={t('techTasks.selectTags')} size="large">
                  {tagsData?.map(tag => (
                    <Option key={tag.props.id} value={tag.props.id}>{tag.props.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="flex items-center gap-2">
                <UserOutlined />
                <div>{t('techTasks.author')}</div>
              </div>
              <div className="flex items-center gap-2 pt-2 bg-gray-50 rounded">
                <Avatar size={32} className={avatarColors}>{userInitials}</Avatar>
                <span className="text-sm">{userFullName} ({t('techTasks.you')})</span>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-4">
          <Button onClick={onClose} size="large">{t('common.cancel')}</Button>
          <Button type="primary" htmlType="submit" size="large" loading={isMutating}>
            {t('common.update')}
          </Button>
        </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default UpdateTechTaskModal;
