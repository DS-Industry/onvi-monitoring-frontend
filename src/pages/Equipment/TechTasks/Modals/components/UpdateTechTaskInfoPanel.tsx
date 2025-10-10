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
import { useUser } from '@/hooks/useUserStore';
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
  periodType?: PeriodType;
  onPeriodTypeChange: (value: PeriodType) => void;
  tagsData?: TagData[];
}

const UpdateTechTaskInfoPanel: React.FC<UpdateTechTaskInfoPanelProps> = ({
  form,
  isEditMode,
  periodType,
  onPeriodTypeChange,
  tagsData,
}) => {
  const { t } = useTranslation();
  const user = useUser();

  const userInitials = `${user.name?.charAt(0) || ''}${user.name?.charAt(1) || ''}`.toUpperCase();
  const userFullName = user.name || 'Пользователь';
  const avatarColors = getAvatarColorClasses(user.id || 0);

  const handlePeriodTypeChange = (value: PeriodType) => {
    onPeriodTypeChange(value);
    if (value !== PeriodType.CUSTOM) {
      form.setFieldsValue({ customPeriodDays: undefined });
    }
  };

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
          <Select placeholder={t('techTasks.selectWorkType')} size="large" disabled={!isEditMode}>
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
            onChange={handlePeriodTypeChange}
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
          name="tags" 
          label={
            <span>
              <UnorderedListOutlined className="mr-2" /> {t('techTasks.tags')} 
            </span>
          }
        >
          <Select mode="multiple" placeholder={t('techTasks.selectTags')} size="large" disabled={!isEditMode}>
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
  );
};

export default UpdateTechTaskInfoPanel;
