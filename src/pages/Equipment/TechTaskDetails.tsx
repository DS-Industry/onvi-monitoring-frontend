import React from 'react';
import { Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPoses, TechTaskShapeResponse } from '@/services/api/equipment';
import useSWR from 'swr';
import { getContactById } from '@/services/api/organization';
import { useTranslation } from 'react-i18next';

interface TechTaskDetailsProps {
  techTaskData?: TechTaskShapeResponse;
}

const TechTaskDetails: React.FC<TechTaskDetailsProps> = ({ techTaskData }) => {
  const { t } = useTranslation();
  const { data: poses } = useSWR(
    [`get-pos`],
    () => getPoses({ placementId: undefined }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: contactData } = useSWR(
    techTaskData?.executorId ? [`contact-data`] : null,
    () =>
      getContactById(techTaskData?.executorId ? techTaskData.executorId : 0),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const posName = poses?.find(pos => pos.id === techTaskData?.posId)?.name;

  const FieldBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white px-3 py-2 border border-[#C0D0E0] rounded-md w-full md:w-[600px]">
      {children}
    </div>
  );

  return (
    <div className="mb-6">
      <div className="space-y-6">
        <div>
          <div className="text-sm font-medium mb-1">
            {t('routine.taskName')}
          </div>
          <FieldBox>{techTaskData?.name || '-'}</FieldBox>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">{t('finance.carWash')}</div>
          <FieldBox>{posName || '-'}</FieldBox>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">{t('routine.type')}</div>
          <FieldBox>{t(`tables.${techTaskData?.type}`) || '-'}</FieldBox>
        </div>

        {techTaskData?.endSpecifiedDate && (
          <div>
            <div className="text-sm font-medium mb-1">
              {t('routine.dueDate')}
            </div>
            <FieldBox>
              <div className="flex justify-between items-center">
                <span>
                  {dayjs(techTaskData.endSpecifiedDate).format(
                    'DD.MM.YYYY HH:mm'
                  )}
                </span>
                <CalendarOutlined />
              </div>
            </FieldBox>
          </div>
        )}

        <div>
          <div className="text-sm font-medium mb-1">
            {t('routine.responsiblePerson')}
          </div>
          <FieldBox>{contactData?.name || '-'}</FieldBox>
        </div>

        {techTaskData && techTaskData?.tags?.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-1">
              {t('marketing.tags')}
            </div>
            <div className="flex flex-wrap gap-2 bg-white px-3 py-2 border border-[#C0D0E0] rounded-md w-full md:w-[600px]">
              {techTaskData.tags.map(tag => (
                <Tag color="blue" key={tag.id}>
                  {tag.name}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechTaskDetails;
