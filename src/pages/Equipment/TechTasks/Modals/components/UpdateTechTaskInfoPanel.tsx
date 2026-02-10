import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Select, DatePicker, Avatar } from 'antd';
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  NumberOutlined, 
  ToolOutlined, 
  UnorderedListOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { getAvatarColorClasses } from '@/utils/avatarColors';
import { TypeTechTask, PeriodType, StatusTechTask } from '@/services/api/equipment';

interface TagData {
  props: {
    id: number;
    name: string;
  };
}

const { Option } = Select;

interface UpdateTechTaskInfoPanelProps {
  form: any;
  isEditMode: boolean;
  tagsData?: TagData[];
  createdBy?: {
    firstName: string;
    lastName: string;
    id: number;
  };
  executor?: {
    firstName: string;
    lastName: string;
    id: number;
  };
  sendWorkDate?: Date;
}

const UpdateTechTaskInfoPanel: React.FC<UpdateTechTaskInfoPanelProps> = ({
  form,
  isEditMode,
  tagsData,
  createdBy,
  executor,
  sendWorkDate,
}) => {
  const { t } = useTranslation();

  const createdByColors = getAvatarColorClasses(createdBy?.id || 0);
  const executorColors = getAvatarColorClasses(executor?.id || 0);

  const createdByInitials = `${createdBy?.firstName?.charAt(0) || ''}${createdBy?.lastName?.charAt(0) || ''}`.toUpperCase();
  const createdByFullName = createdBy?.firstName + " " + createdBy?.lastName;

  const executorInitials = `${executor?.firstName?.charAt(0) || ''}${executor?.lastName?.charAt(0) || ''}`.toUpperCase();
  const executorFullName = executor?.firstName + " " + executor?.lastName;


  const workType = Form.useWatch('type', form);
  const periodType = Form.useWatch('periodType', form);

  const isSendWorkDateDisabled = !isEditMode || Boolean(sendWorkDate);

  return (
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
          <Select 
            placeholder={t('techTasks.selectWorkType')} 
            size="large" 
            disabled={!isEditMode}
            onChange={(value: TypeTechTask) => {
              if (value === TypeTechTask.ONETIME) {
                form.setFieldsValue({ periodType: undefined, customPeriodDays: undefined });
              }
            }}
          >
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
          <Select size="large" disabled={!isEditMode}>
            <Option value={StatusTechTask.ACTIVE}>{t('techTasks.active')}</Option>
            <Option value={StatusTechTask.PAUSE}>{t('techTasks.paused')}</Option>
            <Option value={StatusTechTask.RETURNED}>{t('techTasks.returned')}</Option>
            <Option value={StatusTechTask.FINISHED}>{t('techTasks.finished')}</Option>
            <Option value={StatusTechTask.OVERDUE}>{t('techTasks.overdue')}</Option>
          </Select>
        </Form.Item>

        {workType === TypeTechTask.REGULAR && (
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
              disabled={!isEditMode}
              onChange={(value: PeriodType) => {
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
        )}

        {workType === TypeTechTask.REGULAR && periodType === PeriodType.CUSTOM && (
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
              disabled={!isEditMode}
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
            disabled={!isEditMode}
          />
        </Form.Item>

        <Form.Item 
          name="sendWorkDate" 
          label={
            <span>
              <CalendarOutlined className="mr-2" /> {t('techTasks.reportDate')} 
            </span>
          }
        >
          <DatePicker
            placeholder={t('techTasks.selectReportDate')}
            size="large"
            format="DD.MM.YYYY"
            className="w-full"
            disabled={isSendWorkDateDisabled}
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
          <Select 
            mode="multiple" 
            placeholder={t('techTasks.selectTags')} 
            size="large" 
            disabled={!isEditMode}
            showSearch
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {tagsData?.map(tag => (
              <Option key={tag.props.id} value={tag.props.id}>{tag.props.name}</Option>
            ))}
          </Select>
        </Form.Item>

        
        {createdBy && <>
          <div className="flex items-center gap-2">
            <UserOutlined />
            <div>{t('techTasks.author')}</div>
          </div>
          <div className="flex items-center gap-2 pt-2 bg-gray-50 rounded">
            <Avatar size={32} className={createdByColors}>{createdByInitials}</Avatar>
            <span className="text-sm">{createdByFullName}</span>
          </div>
        </>}
        {executor && <>
          <div className="flex items-center gap-2 mt-3">
            <UserOutlined />
            <div>{t('techTasks.executor')}</div>
          </div>
          <div className="flex items-center gap-2 pt-2 bg-gray-50 rounded">
            <Avatar size={32} className={executorColors}>{executorInitials}</Avatar>
            <span className="text-sm">{executorFullName}</span>
          </div>
        </>}
      </div>
    </div>
  );
};

export default UpdateTechTaskInfoPanel;
