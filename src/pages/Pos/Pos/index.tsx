import React, { useMemo, useState } from 'react';
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
      shouldRetryOnError: false
    }
  );

  const { data: organizationData } = useSWR([`get-org`], () =>
    getOrganization({}), {
      shouldRetryOnError: false
    }
  );

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const { data: placementData } = useSWR(
    [`get-placement`],
    () => getPlacement(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const poses = useMemo(() => {
    const orgMap = organizationData
      ? new Map(organizationData.map(org => [org.id, org.name]))
      : new Map();

    const workerMap = workerData
      ? new Map(workerData.map(work => [work.id, work.name]))
      : new Map();

    const placeMap = placementData
      ? new Map(placementData.map(place => [place.id, place]))
      : new Map();

    return (data ?? [])
      .map(item => ({
        ...item,
        organizationName: orgMap.get(item.organizationId) ?? '-',
        status: t(`tables.${item.posStatus}`),
        createdByName: workerMap.get(item.createdById) ?? '-',
        updatedByName: workerMap.get(item.updatedById) ?? '-',
        city: placeMap.get(item.placementId)?.region ?? '-',
        country: placeMap.get(item.placementId)?.country ?? '-',
      }))
      .sort((a, b) => a.id - b.id);
  }, [data, organizationData, workerData, placementData, t]);

  const handleUpdate = async (id: number) => {
    setDrawerOpen(true);
    setPosId(id);
  };

  const dateRender = getDateRender();
  const statusRender = getStatusTagRender(t);

  const columnsPos: ColumnsType<PosResponse> = [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('hr.name'),
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
      title: t('pos.country'),
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: t('pos.city'),
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: t('pos.address'),
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: t('warehouse.organization'),
      dataIndex: 'organizationName',
      key: 'organizationName',
    },
    {
      title: t('table.headers.status'),
      dataIndex: 'status',
      key: 'status',
      render: statusRender,
    },
    {
      title: t('table.headers.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: dateRender,
    },
    {
      title: t('table.columns.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: dateRender,
    },
    {
      title: t('table.headers.created'),
      dataIndex: 'createdByName',
      key: 'createdByName',
    },
    {
      title: t('table.headers.updated'),
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
    setPosId(null)
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
