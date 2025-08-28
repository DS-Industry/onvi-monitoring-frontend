import React, { useState } from 'react';
import Notification from '@ui/Notification.tsx';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { getOrganization } from '@/services/api/organization';
import { getPoses, getWorkers, PosResponse } from '@/services/api/equipment';
import { getPlacement } from '@/services/api/device';
import { Button, Table } from 'antd';
import PosCreationDrawer from './PosCreationDrawer';
import { Link, useSearchParams } from 'react-router-dom';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { useUser } from '@/hooks/useUserStore';

const Pos: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const city = Number(searchParams.get('city')) || undefined;
  const userPermissions = usePermissions();

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Organization' },
    { action: 'create', subject: 'Organization' },
  ]);

  const { data, isLoading: posLoading } = useSWR(
    [`get-pos`, city],
    () =>
      getPoses({
        placementId: city,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: organizationData } = useSWR([`get-org`], () =>
    getOrganization({})
  );

  const user = useUser();

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: placementData } = useSWR(
    [`get-placement`],
    () => getPlacement(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const poses = React.useMemo(
    () =>
      (data ?? [])
        .map(item => ({
          ...item,
          organizationName:
            organizationData?.find(org => org.id === item.organizationId)
              ?.name ?? '-',
          status: t(`tables.${item.posStatus}`),
          createdByName:
            workerData?.find(work => work.id === item.createdById)?.name ?? '-',
          updatedByName:
            workerData?.find(work => work.id === item.updatedById)?.name ?? '-',
          city:
            placementData?.find(place => place.id === item.placementId)
              ?.region ?? '',
          country:
            placementData?.find(place => place.id === item.placementId)
              ?.country ?? '',
        }))
        .sort((a, b) => a.id - b.id),
    [data, placementData, t]
  );

  const dateRender = getDateRender();
  const statusRender = getStatusTagRender(t);

  const columnsPos: ColumnsType<PosResponse> = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: '/station/enrollments/devices',
              search: `?posId=${record.id || '*'}`,
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: 'Страна',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Город',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Организация',
      dataIndex: 'organizationName',
      key: 'organizationName',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: statusRender,
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: dateRender,
    },
    {
      title: 'Дата обновления',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: dateRender,
    },
    {
      title: 'Создал',
      dataIndex: 'createdByName',
      key: 'createdByName',
    },
    {
      title: 'Обновил',
      dataIndex: 'updatedByName',
      key: 'updatedByName',
    },
  ];

  const onClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.objectManagement')}
          </span>
        </div>
        {allowed && (
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <div className="hidden sm:flex">{t('routes.add')}</div>
          </Button>
        )}
      </div>
      <GeneralFilters count={poses.length} display={['city', 'count']} />
      {poses.length > 0 ? (
        <>
          <div className="mt-8">
            <Table
              dataSource={poses}
              columns={columnsPos}
              pagination={false}
              scroll={{ x: 'max-content' }}
              loading={posLoading}
            />
          </div>
        </>
      ) : (
        <>
          {notificationVisible && organizationData?.length === 0 && (
            <div className="mt-2">
              <Notification
                title={t('pos.companyName')}
                message={t('pos.createObject')}
                link={t('pos.goto')}
                linkUrl="/administration/legalRights"
                onClose={() => setNotificationVisible(false)}
              />
            </div>
          )}
        </>
      )}
      <PosCreationDrawer
        organizations={organizationData || []}
        isOpen={drawerOpen}
        onClose={onClose}
      />
    </>
  );
};

export default Pos;
