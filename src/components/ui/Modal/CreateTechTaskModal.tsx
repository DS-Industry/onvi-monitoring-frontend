import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, DatePicker, Button, Checkbox, Avatar } from 'antd';
import { CloseOutlined, QuestionCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';
import { getAvatarColorClasses } from '@/utils/avatarColors';
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

const { TextArea } = Input;
const { Option } = Select;

interface CreateTechTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TemplateItem {
  id: number;
  title: string;
  description?: string;
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
  const [selectedForTransfer, setSelectedForTransfer] = useState<number[]>([]);
  const [taskType, setTaskType] = useState<TypeTechTask | undefined>(undefined);
  const [periodType, setPeriodType] = useState<PeriodType | undefined>(undefined);


  const { data: poses } = useSWR(user.organizationId ? ['get-poses'] : null, () => getPoses({ organizationId: user.organizationId }), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false
  });

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

  const templates: TemplateItem[] = useMemo(
    () =>
      techTaskItems?.map(item => ({
        id: item.props.id,
        title: item.props.title,
        description: 'This is the description text.',
      })) || [],
    [techTaskItems]
  );

  const { trigger: createTechTaskMutation, isMutating } = useSWRMutation(
    ['create-tech-task'],
    async (_, { arg }: { arg: TechTaskBody }) => {
      return createTechTask(arg);
    }
  );

  useEffect(() => {
    if (templates.length > 0) {
      setAvailableTemplates(templates);
      setSelectedTemplateItems([]);
      setSelectedForTransfer([]);
    }
  }, [templates]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedTemplateItems([]);
      setSelectedForTransfer([]);
      setTaskType(undefined);
      setPeriodType(undefined);
      if (templates.length > 0) {
        setAvailableTemplates(templates);
      }
    }
  }, [open, form, templates]);

  const handleSubmit = async (values: any) => {
    try {
      if (!values.name) {
        showToast(t('techTasks.taskNameRequired'), 'error');
        return;
      }
      
      if (!values.posId) {
        showToast(t('techTasks.selectCarWash'), 'error');
        return;
      }
      
      if (!values.type) {
        showToast(t('techTasks.selectWorkType'), 'error');
        return;
      }
      
      if (selectedTemplateItems.length === 0) {
        showToast(t('techTasks.selectAtLeastOneTemplate'), 'error');
        return;
      }
      
      if (!values.tags || values.tags.length === 0) {
        showToast(t('techTasks.selectAtLeastOneTag'), 'error');
        return;
      }

      if (values.type === TypeTechTask.REGULAR) {
        if (!values.periodType) {
          showToast(t('techTasks.selectPeriodTypeForRegular'), 'error');
          return;
        }
        
        if (values.periodType === PeriodType.CUSTOM) {
          if (!values.customPeriodDays || values.customPeriodDays <= 0) {
            showToast(t('techTasks.enterDaysForCustomPeriod'), 'error');
            return;
          }
          if (values.customPeriodDays > 365) {
            showToast(t('techTasks.customPeriodMaxDays'), 'error');
            return;
          }
        }
      }

      if (values.type === TypeTechTask.ONETIME && !values.endDate) {
        showToast(t('techTasks.enterEndDateForOnetime'), 'error');
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
      showToast(t('techTasks.createError') || 'Ошибка при создании задачи', 'error');
    }
  };

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

  const userInitials = `${user.name?.charAt(0) || ''}${user.name?.charAt(1) || ''}`.toUpperCase();
  const userFullName = user.name || 'Пользователь';
  const avatarColors = getAvatarColorClasses(user.id || 0);

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span>{t('routes.technicalTasks')} /{user.id}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      className="create-tech-task-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="h-full flex flex-col"
        initialValues={{}}
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
                {t('techTasks.authorComment')}: <span className="text-red-500">*</span>
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
                  name="authorComment" 
                  className="flex-1"
                  rules={[{ required: true, message: t('techTasks.authorCommentRequired') }]}
                >
                  <TextArea
                    placeholder={t('techTasks.authorCommentPlaceholder')}
                    className="flex-1 min-h-[120px]"
                    autoSize={{ minRows: 5 }}
                  />
                </Form.Item>
              </div>
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

          <div className="w-full lg:w-80 flex flex-col gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">{t('techTasks.information')}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('techTasks.carWashBranch')} <span className="text-red-500">*</span>
                </label>
                <Form.Item name="posId" rules={[{ required: true, message: t('techTasks.selectCarWash') }]}>
                  <Select
                    placeholder={t('techTasks.selectCarWash')}
                    size="large"
                    className="w-full"
                  >
                    {poses?.map(pos => (
                      <Option key={pos.id} value={pos.id}>
                        {pos.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('techTasks.workType')} <span className="text-red-500">*</span>
                </label>
                <Form.Item name="type" rules={[{ required: true, message: t('techTasks.selectWorkType') }]}>
                  <Select 
                    size="large" 
                    className="w-full"
                    onChange={(value) => {
                      setTaskType(value);
                      form.setFieldsValue({ periodType: undefined, customPeriodDays: undefined });
                      setPeriodType(undefined);
                    }}
                  >
                    <Option value={TypeTechTask.ONETIME}>{t('techTasks.onetime')}</Option>
                    <Option value={TypeTechTask.REGULAR}>{t('techTasks.regular')}</Option>
                  </Select>
                </Form.Item>
              </div>

              {taskType === TypeTechTask.REGULAR && (
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
                  {t('techTasks.endDate')} {taskType === TypeTechTask.ONETIME && <span className="text-red-500">*</span>}
                </label>
                <Form.Item 
                  name="endDate" 
                  rules={taskType === TypeTechTask.ONETIME ? [{ required: true, message: t('techTasks.selectEndDate') }] : []}
                >
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
                  {t('techTasks.tags')} <span className="text-red-500">*</span>
                </label>
                <Form.Item name="tags" rules={[{ required: true, message: t('techTasks.selectAtLeastOneTag') }]}>
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

        <div className="flex justify-end gap-3 mt-6 pt-4">
          <Button onClick={onClose} size="large">
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isMutating}
          >
            {t('common.create')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateTechTaskModal;
