import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, DatePicker, Avatar, Spin } from 'antd';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';
import { getAvatarColorClasses } from '@/utils/avatarColors';
import { 
  getTags, 
  getTechTaskItem, 
  getTechTaskShapeItem,
  TypeTechTask,
  PeriodType,
  StatusTechTask
} from '@/services/api/equipment';
import useSWR from 'swr';
import TipTapEditor from '@/components/ui/Input/TipTapEditor';

const { Option } = Select;

interface TemplateItem {
  id: number;
  title: string;
}

interface CompleteTechTaskModalProps {
  open: boolean;
  onClose: () => void;
  techTaskId?: number;
}

const CompleteTechTaskModal: React.FC<CompleteTechTaskModalProps> = ({
  open,
  onClose,
  techTaskId,
}) => {
  const { t } = useTranslation();
  const user = useUser();
  const [form] = Form.useForm();
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateItem[]>([]);
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

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedTemplates([]);
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
      
      setSelectedTemplates(selectedTemplatesList);
      
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
      className="readonly-tech-task-modal"
    >
      <Spin spinning={isLoading || isValidating} tip={t('common.loading')} className="h-full">
        <Form
          form={form}
          layout="vertical"
          className="h-full flex flex-col"
        >
          <div className="p-6 max-h-[700px] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="flex-1 flex flex-col gap-4">
                <Form.Item
                  name="name"
                >
                  <Input
                    placeholder={t('techTasks.enterTaskName')}
                    size="large"
                    className="text-lg"
                    disabled
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
                    <TipTapEditor autoResize readonly />
                  </Form.Item>
                </div>

                <div className="flex-1 flex flex-col min-h-[300px]">
                  <h3 className="text-lg font-medium mb-3">
                    {t('techTasks.templates')} ({selectedTemplates.length}/{templates.length})
                  </h3>
                  
                  <div className="flex gap-4 h-64">
                    <div className="flex-1 border rounded-lg">
                      <div className="p-3 bg-gray-50 border-b">
                        <span className="text-sm font-medium">{t('techTasks.selectedTemplatesList')} ({selectedTemplates.length})</span>
                      </div>
                      <div className="h-48 overflow-y-auto">
                        {selectedTemplates.map(template => (
                          <div
                            key={template.id}
                            className="flex items-center gap-2 p-3 border-b bg-gray-50"
                          >
                            <span className="text-sm text-gray-600">{template.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[450px] flex flex-col gap-4">
                <div className="border rounded-lg p-4 bg-[#F8F8FA] border-[#ACAEB3]">
                  <h3 className="text-lg font-medium mb-4">{t('techTasks.information')}</h3>
                  
                  <Form.Item 
                    name="type" 
                    label={`${t('techTasks.workType')} *`}
                  >
                    <Select placeholder={t('techTasks.selectWorkType')} size="large" disabled>
                      <Option value={TypeTechTask.ONETIME}>{t('techTasks.onetime')}</Option>
                      <Option value={TypeTechTask.REGULAR}>{t('techTasks.regular')}</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item 
                    name="status" 
                    label={`${t('techTasks.status')} *`}
                  >
                    <Select size="large" disabled>
                      <Option value={StatusTechTask.ACTIVE}>{t('techTasks.active')}</Option>
                      <Option value={StatusTechTask.PAUSE}>{t('techTasks.paused')}</Option>
                      <Option value={StatusTechTask.RETURNED}>{t('techTasks.returned')}</Option>
                      <Option value={StatusTechTask.FINISHED}>{t('techTasks.finished')}</Option>
                      <Option value={StatusTechTask.OVERDUE}>{t('techTasks.overdue')}</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item 
                    name="periodType" 
                    label={`${t('techTasks.periodicity')} *`}
                  >
                    <Select 
                      placeholder={t('techTasks.selectPeriodicity')} 
                      size="large"
                      disabled
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
                      label={`${t('techTasks.daysCount')} *`}
                    >
                      <Input
                        type="number"
                        placeholder={t('techTasks.enterDaysCount')}
                        size="large"
                        min={1}
                        max={365}
                        disabled
                      />
                    </Form.Item>
                  )}

                  <Form.Item 
                    name="endDate" 
                    label={`${t('techTasks.endDate')} *`}
                  >
                    <DatePicker
                      placeholder={t('techTasks.endDate')}
                      size="large"
                      format="DD.MM.YYYY"
                      disabled
                    />
                  </Form.Item>

                  <Form.Item name="tags" label={t('techTasks.tags')}>
                    <Select mode="multiple" placeholder={t('techTasks.selectTags')} size="large" disabled>
                      {tagsData?.map(tag => (
                        <Option key={tag.props.id} value={tag.props.id}>{tag.props.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Avatar size={32} className={avatarColors}>{userInitials}</Avatar>
                    <span className="text-sm">{userFullName} ({t('techTasks.you')})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 pt-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
            >
              {t('common.close')}
            </button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CompleteTechTaskModal;
