import React, { useState } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { getOrganization } from '@/services/api/organization';
import { getPoses, getWorkers, PosResponse } from '@/services/api/equipment';
import { getPlacement } from '@/services/api/device';
import { Button, Table, Tooltip } from 'antd';
import PosEditDrawer from './PosEditDrawer';
import { Link, useSearchParams } from 'react-router-dom';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { useUser } from '@/hooks/useUserStore';

const Pos: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const city = Number(searchParams.get('city')) || undefined;
  const userPermissions = usePermissions();
  const [posId, setPosId] = useState<number | null>(null);
  const user = useUser();

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Organization' },
    { action: 'create', subject: 'Organization' },
  ]);

  const { data, isLoading: posLoading } = useSWR(
    user.organizationId ? [`get-pos`, city, user.organizationId] : null,
    () =>
      getPoses({
        placementId: city,
        organizationId: user.organizationId,
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

  const handleUpdate = async (id: number) => {
      setDrawerOpen(true);
      setPosId(id);
    };

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

  if (allowed) {
    columnsPos.push({
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: unknown, record: PosResponse) => (
        <Tooltip title="Редактировать">
          <Button
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: '24px' }}
          />
        </Tooltip>
      ),
    });
  }

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
      <div className="mt-8">
        <Table
          dataSource={poses}
          columns={columnsPos}
          pagination={false}
          scroll={{ x: 'max-content' }}
          loading={posLoading}
        />
      </div>
      <PosEditDrawer
        organizations={organizationData || []}
        isOpen={drawerOpen}
        id={posId}
        onClose={onClose}
      />
    </>
  );
};

export default Pos;
