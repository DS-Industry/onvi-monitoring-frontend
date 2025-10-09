import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, DatePicker, Button, Avatar } from 'antd';
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';
import { getAvatarColorClasses } from '@/utils/avatarColors';
import { 
  updateTechTask, 
  getTags, 
  getTechTaskItem, 
  TechTaskReadAll,
  TypeTechTask,
  PeriodType,
  StatusTechTask
} from '@/services/api/equipment';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/hooks/useToast';

const { TextArea } = Input;
const { Option } = Select;

interface UpdateTechTaskModalProps {
  open: boolean;
  onClose: () => void;
  techTask?: TechTaskReadAll;
  onSuccess?: () => void;
}

const UpdateTechTaskModal: React.FC<UpdateTechTaskModalProps> = ({
  open,
  onClose,
  techTask,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useUser();
  const [form] = Form.useForm();
  const [periodType, setPeriodType] = useState<PeriodType | undefined>(undefined);

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

  const { trigger: updateTechTaskMutation, isMutating } = useSWRMutation(
    ['update-tech-task'],
    async (_, { arg }: { arg: any }) => {
      return updateTechTask(arg);
    }
  );

  useEffect(() => {
    if (techTask && open) {
      setPeriodType(techTask.periodType);
      
      form.setFieldsValue({
        name: techTask.name,
        status: techTask.status,
        periodType: techTask.periodType,
        customPeriodDays: techTask.customPeriodDays,
        markdownDescription: '', 
        endDate: techTask.endSpecifiedDate ? dayjs(techTask.endSpecifiedDate) : undefined,
        techTaskItem: [],
        tags: techTask.tags?.map(tag => tag.id) || [],
      });
    }
  }, [techTask, open, form]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setPeriodType(undefined);
    }
  }, [open, form]);

  const handleSubmit = async (values: any) => {
    if (!techTask) return;

    try {
      if (techTask.type === TypeTechTask.REGULAR && values.periodType === PeriodType.CUSTOM) {
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
        techTaskId: techTask.id,
        name: values.name,
        status: values.status,
        periodType: techTask.type === TypeTechTask.REGULAR ? values.periodType : undefined,
        customPeriodDays: values.periodType === PeriodType.CUSTOM ? Number(values.customPeriodDays) : undefined,
        markdownDescription: values.markdownDescription,
        endSpecifiedDate: values.endDate ? dayjs(values.endDate).toDate() : undefined,
        techTaskItem: values.techTaskItem || [],
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
          <span>{t('routes.technicalTasks')} /{techTask?.id}</span>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          />
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      className="update-tech-task-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="h-full flex flex-col"
      >
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[600px]">
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
              <div className="flex-1">
                <div className="border rounded-lg p-2 mb-2 bg-gray-50">
                  <div className="flex gap-2 flex-wrap">
                    <Button type="text" size="small" className="font-bold">B</Button>
                    <Button type="text" size="small" className="italic">I</Button>
                    <Button type="text" size="small" className="underline">U</Button>
                    <Button type="text" size="small" className="line-through">S</Button>
                    <Button type="text" size="small">☑</Button>
                    <Button type="text" size="small">⋯</Button>
                  </div>
                </div>
                <Form.Item 
                  name="markdownDescription" 
                  className="flex-1"
                >
                  <TextArea
                    placeholder={t('techTasks.taskDescriptionPlaceholder')}
                    className="flex-1 min-h-[120px]"
                    autoSize={{ minRows: 5 }}
                  />
                </Form.Item>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">{t('techTasks.templates')}</h3>
                <span className="text-sm text-gray-500">
                  {t('techTasks.selectedTemplates', { 
                    selected: form.getFieldValue('techTaskItem')?.length || 0, 
                    total: techTaskItems?.length || 0 
                  })}
                </span>
              </div>
              
              <Form.Item name="techTaskItem">
                <Select
                  mode="multiple"
                  placeholder={t('techTasks.selectTemplates')}
                  size="large"
                  className="w-full"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {techTaskItems?.map(item => (
                    <Option key={item.props.id} value={item.props.id}>
                      {item.props.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="w-full lg:w-80 flex flex-col gap-4">
            <div className="border rounded-lg p-4">
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

              {techTask?.type === TypeTechTask.REGULAR && (
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
                      { type: 'number', min: 1, message: t('techTasks.minDays') },
                      { type: 'number', max: 365, message: t('techTasks.maxDays') }
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

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
    </Modal>
  );
};

export default UpdateTechTaskModal;
