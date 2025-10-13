import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Select, DatePicker, Avatar } from 'antd';
import { 
  CalendarOutlined, 
  CarOutlined,
  ClockCircleOutlined, 
  NumberOutlined, 
  ToolOutlined, 
  UnorderedListOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { useUser } from '@/hooks/useUserStore';
import { getAvatarColorClasses } from '@/utils/avatarColors';
import { TypeTechTask, PeriodType } from '@/services/api/equipment';

const { Option } = Select;

interface TagData {
  props: {
    id: number;
    name: string;
  };
}

interface PosData {
  id: number;
  name: string;
}

interface CreateTechTaskInfoPanelProps {
  form: any;
  tagsData?: TagData[];
  posesData?: PosData[];
}

const CreateTechTaskInfoPanel: React.FC<CreateTechTaskInfoPanelProps> = ({
  form,
  tagsData,
  posesData,
}) => {
  const { t } = useTranslation();
  const user = useUser();

  const userInitials = `${user.name?.charAt(0) || ''}${user.name?.charAt(1) || ''}`.toUpperCase();
  const userFullName = user.name || 'Пользователь';
  const avatarColors = getAvatarColorClasses(user.id || 0);

  const workType = Form.useWatch('type', form);
  const periodType = Form.useWatch('periodType', form);


  return (
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
            {posesData?.map(pos => (
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
            onChange={(value: TypeTechTask) => {
              if (value === TypeTechTask.ONETIME) {
                form.setFieldsValue({ periodType: undefined, customPeriodDays: undefined });
              }
            }}
            placeholder={t('techTasks.selectWorkType')}
          >
            <Option value={TypeTechTask.ONETIME}>{t('techTasks.onetime')}</Option>
            <Option value={TypeTechTask.REGULAR}>{t('techTasks.regular')}</Option>
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
  );
};

export default CreateTechTaskInfoPanel;
