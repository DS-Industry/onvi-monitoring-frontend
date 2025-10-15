import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import { Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
  LoyaltyProgramStatus,
  getLoyaltyPrograms,
} from '@/services/api/marketing';
import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import { LoyaltyProgramsResponse } from '@/services/api/marketing';
import { ColumnsType } from 'antd/es/table';
import { useUser } from '@/hooks/useUserStore';
import { usePermissions } from '@/hooks/useAuthStore';
import ParticipantRequestModal from './ParticipantRequestModal';

const MarketingLoyalty: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const navigate = useNavigate();

  const user = useUser();

  const permissions = usePermissions();

  const hasPermission = user?.organizationId
    ? permissions.some(
        permission =>
          (permission.action === 'create' ||
            permission.action === 'manage' ||
            permission.action === 'read') &&
          permission.subject === 'Pos' &&
          Array.isArray(permission.conditions?.organizationId?.in) &&
          permission.conditions.organizationId.in.includes(user.organizationId!)
      )
    : false;

  const { data: loyaltyProgramsData, isLoading: loyaltyProgramsLoading } =
    useSWR<LoyaltyProgramsResponse[]>(
      'get-loyalty-programs',
      () => getLoyaltyPrograms(user.organizationId),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
      }
    );
  const loyaltyPrograms =
    loyaltyProgramsData?.map(item => ({
      ...item.props,
      status: t(`tables.${item.props.status}`) as LoyaltyProgramStatus,
    })) || [];

  const statusRender = getStatusTagRender(t);
  const dateRender = getDateRender();

  const columnsLoyaltyPrograms: ColumnsType<LoyaltyProgramsResponse['props']> =
    [
      {
        title: t('loyaltyProgramsTable.programName'),
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record) => {
          return (
            <>
              {record.ownerOrganizationId === user.organizationId ? (
                <Link
                  to={{
                    pathname: '/marketing/loyalty/bonus',
                    search: `?loyaltyId=${record.id}`,
                  }}
                  className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                  {text}
                </Link>
              ) : (
                <span className="text-gray-500 font-semibold cursor-not-allowed">
                  {text}
                </span>
              )}
            </>
          );
        },
      },
      {
        title: t('loyaltyProgramsTable.participationStatus'),
        dataIndex: 'type',
        key: 'type',
        render: (_, record) => (
          <span>
            {record.ownerOrganizationId === user.organizationId ? (
              <>{t('loyaltyProgramsTable.owner')}</>
            ) : (
              <>{t('loyaltyProgramsTable.participant')}</>
            )}
          </span>
        ),
      },
      {
        title: t('marketing.ty'),
        dataIndex: 'isHub',
        key: 'isHub',
        render: (_, record) => (
          <span>
            {record.isHub ? (
              <>{t('marketing.hub')}</>
            ) : (
              <>{t('loyaltyProgramsTable.regularProgram')}</>
            )}
          </span>
        ),
      },
      {
        title: t('loyaltyProgramsTable.status'),
        dataIndex: 'status',
        key: 'status',
        render: statusRender,
      },
      {
        title: t('loyaltyProgramsTable.launchDate'),
        dataIndex: 'startDate',
        key: 'startDate',
        render: dateRender,
      },
    ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.loyalty')}
          </span>
        </div>
        {!loyaltyProgramsLoading && user && permissions && (
          <div className="flex items-center space-x-2">
            {hasPermission && (
              <Button
                icon={<PlusOutlined />}
                className="btn-outline-primary"
                onClick={() => {
                  navigate('/marketing/loyalty/programs');
                }}
              >
                {t('routes.add')}
              </Button>
            )}
            <Button
              icon={<PlusOutlined />}
              className="btn-primary"
              onClick={() => setIsParticipantModalOpen(true)}
            >
              {t('loyaltyProgramsTable.join')}
            </Button>
          </div>
        )}
      </div>
      <div className="mt-2">
        {notificationVisible && (
          <Notification
            title={t('routes.loyalty')}
            message={t('marketing.promotion')}
            showBonus={true}
            onClose={() => setNotificationVisible(false)}
          />
        )}
        <div className="mt-8">
          <Table
            rowKey={record => record.id.toString()}
            dataSource={loyaltyPrograms}
            columns={columnsLoyaltyPrograms}
            loading={loyaltyProgramsLoading}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: t('table.noData') }}
          />
        </div>
      </div>

      <ParticipantRequestModal
        open={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
      />
    </>
  );
};

export default MarketingLoyalty;
