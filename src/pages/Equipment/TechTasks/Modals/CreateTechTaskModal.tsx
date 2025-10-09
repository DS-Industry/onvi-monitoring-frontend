import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, DatePicker, Button, Checkbox, Avatar } from 'antd';
import { ArrowRightOutlined, CalendarOutlined, CarOutlined, ClockCircleOutlined, NumberOutlined, ToolOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
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
import TipTapEditor from '@/components/ui/Input/TipTapEditor';

const { Option } = Select;

interface CreateTechTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TemplateItem {
  id: number;
  title: string;
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
  const [periodType, setPeriodType] = useState<PeriodType | undefined>(undefined);


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
      setSelectedForTransfer([]);
      setPeriodType(undefined);
      setAvailableTemplates(templates);
    }
  }, [open, form, templates]);

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
      showToast(t('techTasks.createError') || 'Ошибка при создании задачи', 'error');
    }
  };

  const toggleTemplateSelection = (templateId: number) => {
    setSelectedForTransfer(prev => 
      prev.includes(templateId) ? prev.filter(id => id !== templateId) : [...prev, templateId]
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

            <div className="flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-lg font-medium mb-3">
                {t('techTasks.templates')} ({selectedTemplateItems.length}/{templates.length})
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
                    <span className="text-sm font-medium">{t('techTasks.selectedTemplatesList')} ({selectedTemplateItems.length})</span>
                  </div>
                  <div className="lg:h-48 max-h-48 overflow-y-auto">
                    {selectedTemplateItems.map(template => (
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
                name="posId" 
                label={
                  <span>
                    <CarOutlined className="mr-2" /> {t('techTasks.carWashBranch')} 
                  </span>
                }
                rules={[{ required: true, message: t('techTasks.selectCarWash') }]}
              >
                <Select placeholder={t('techTasks.selectCarWash')} size="large">
                  {poses?.map(pos => (
                    <Option key={pos.id} value={pos.id}>{pos.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="type" 
                label={
                  <span>
                    <ToolOutlined className="mr-2" /> {t('techTasks.workType')} 
                  </span>
                }
                rules={[{ required: true, message: t('techTasks.selectWorkType') }]}
              >
                <Select 
                  size="large"
                  onChange={() => {
                    form.setFieldsValue({ periodType: undefined, customPeriodDays: undefined });
                    setPeriodType(undefined);
                  }}
                  placeholder={t('techTasks.selectWorkType')}
                >
                  <Option value={TypeTechTask.ONETIME}>{t('techTasks.onetime')}</Option>
                  <Option value={TypeTechTask.REGULAR}>{t('techTasks.regular')}</Option>
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
                  className="w-full"
                  placeholder={t('techTasks.endDate')}
                  size="large"
                  format="DD.MM.YYYY"
                />
              </Form.Item>

              <Form.Item 
                name="tags" 
                label={
                  <span>
                    <UnorderedListOutlined className="mr-2" /> {t('techTasks.tags')} 
                  </span>
                }
                rules={[{ required: true, message: t('techTasks.selectAtLeastOneTag') }]}
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
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
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
            {t('common.create')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateTechTaskModal;
