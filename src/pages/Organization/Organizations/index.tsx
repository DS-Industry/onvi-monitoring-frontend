import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  getOrganization,
  getOrganizationDocument,
  OrganizationOtherDetailsResponse,
  Organization as OrganizationType,
} from '@/services/api/organization/index.ts';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/useAuthStore';
import { getWorkers } from '@/services/api/equipment';
import { Button, Table, Tag, Tooltip } from 'antd';
import hasPermission from '@/permissions/hasPermission';
import {
  ApiOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import OrganizationDrawer from './OrganizationDrawer';
import FinTabloOrgModal from './FinTabloOrgModal';
import { useSearchParams } from 'react-router-dom';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { useUser } from '@/hooks/useUserStore';
import { getOrganizationFinTablo } from '@/services/api/finance/fintablo';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import { canAccessTariff } from '@/subscription/tariffAccess';

const Organization: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const city = Number(searchParams.get('city')) || undefined;

  const {
    data,
    isLoading: loadingOrg,
    mutate: mutateOrgs,
  } = useSWR(
    [`get-org`, city],
    () =>
      getOrganization({
        placementId: city,
      }),
    {
      shouldRetryOnError: false,
    }
  );

  const user = useUser();

  const { data: workersData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const legalOptions = [
    { name: t('organizations.legalEntity'), value: 'LegalEntity' },
    { name: t('organizations.ip'), value: 'IndividualEntrepreneur' },
  ];

  const organizations =
    data
      ?.map(item => ({
        ...item,
        ownerName:
          `${workersData?.find(work => work.id === item.ownerId)?.name || '-'} ${workersData?.find(work => work.id === item.ownerId)?.surname || ''}` ||
          '-',
        organizationStatus: t(`tables.${item.organizationStatus}`),
        organizationType:
          legalOptions.find(leg => leg.value === item.organizationType)?.name ||
          '-',
      }))
      .sort((a, b) => a.id - b.id) || [];

  const [orgToEdit, setOrgToEdit] = useState<OrganizationType | null>(null);
  const [orgDocuments, setOrgDocuments] =
    useState<OrganizationOtherDetailsResponse | null>(null);

  const handleUpdate = async (id: number) => {
    setDrawerOpen(true);

    const orgToEdit = organizations.find(org => org.id === id);
    let orgs;
    if (orgToEdit?.id) {
      const fetchedOrgData = await getOrganizationDocument(orgToEdit?.id);
      orgs = fetchedOrgData.props;
    }

    setOrgToEdit(orgToEdit || null);
    setOrgDocuments(orgs || null);
  };

  const userPermissions = usePermissions();
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );
  const subscriptionStatus = useSubscriptionStore(state => state.status);
  const hasManagerPaperTariff = canAccessTariff(
    activeSubscription,
    subscriptionStatus,
    { requiredTariffFeatures: ['ManagerPaper'] }
  ).allowed;

  const allowed = hasPermission(
    [
      { action: 'manage', subject: 'Organization' },
      { action: 'create', subject: 'Organization' }
    ],
    userPermissions
  );

  const canUpdateOrg = hasPermission(
    [{ action: 'update', subject: 'Organization' }],
    userPermissions
  );

  const orgIds = useMemo(
    () => (data ?? []).map(item => item.id).sort((a, b) => a - b),
    [data]
  );

  const { data: finTabloByOrgId, mutate: mutateFinTablo } = useSWR(
    canUpdateOrg && hasManagerPaperTariff && orgIds.length
      ? ['org-fintablo-statuses', orgIds]
      : null,
    async () => {
      const entries = await Promise.all(
        orgIds.map(async id => {
          try {
            const status = await getOrganizationFinTablo(id);
            return [id, status.objectsEnabled] as const;
          } catch {
            return [id, false] as const;
          }
        })
      );
      return Object.fromEntries(entries) as Record<number, boolean>;
    },
    { shouldRetryOnError: false }
  );

  const [finTabloOrgId, setFinTabloOrgId] = useState<number | null>(null);

  const dateRender = getDateRender();
  const statusRender = getStatusTagRender(t);

  const columnsOrg: ColumnsType<OrganizationType> = [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('table.columns.address'),
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: t('table.columns.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('table.columns.status'),
      dataIndex: 'organizationStatus',
      key: 'organizationStatus',
      render: statusRender,
    },
    {
      title: t('table.columns.type'),
      dataIndex: 'organizationType',
      key: 'organizationType',
    },
    {
      title: t('table.columns.createdAt'),
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
      title: t('table.columns.owner'),
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
  ];

  if (canUpdateOrg) {
    columnsOrg.push({
      title: t('fintablo.title'),
      dataIndex: 'fintablo',
      key: 'fintablo',
      render: (_: unknown, record: OrganizationType) => {
        const connected = finTabloByOrgId?.[record.id] === true;
        return (
          <Tag color={connected ? 'success' : 'default'}>
            {connected ? t('fintablo.connected') : t('fintablo.disconnected')}
          </Tag>
        );
      },
    });
  }

  if (allowed || canUpdateOrg) {
    columnsOrg.push({
      title: t('table.columns.actions'),
      dataIndex: 'actions',
      key: 'actions',
      render: (_: unknown, record: OrganizationType) => (
        <div className="flex items-center">
          {allowed && record.organizationStatus === t(`tables.ACTIVE`) && (
            <Tooltip title={t('actions.edit')}>
              <Button
                type="text"
                icon={
                  <EditOutlined className="text-blue-500 hover:text-blue-700" />
                }
                onClick={() => handleUpdate(record.id)}
                style={{ height: '24px' }}
              />
            </Tooltip>
          )}
          {canUpdateOrg && (
            <Tooltip title={t('fintablo.open')}>
              <Button
                type="text"
                aria-label={t('fintablo.open')}
                icon={
                  <ApiOutlined className="text-blue-500 hover:text-blue-700" />
                }
                onClick={() => setFinTabloOrgId(record.id)}
                style={{ height: '24px' }}
              />
            </Tooltip>
          )}
        </div>
      ),
    });
  }

  const onEdit = () => {
    setOrgToEdit(null);
    setOrgDocuments(null);
    mutateOrgs();
  };

  const onClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.legalEntities')}
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
      <>
        <div className="mt-5">
          <GeneralFilters count={organizations.length} display={['city']} />
          <Table
            dataSource={organizations}
            columns={columnsOrg}
            loading={loadingOrg}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </>
      <OrganizationDrawer
        orgToEdit={orgToEdit}
        orgDocuments={orgDocuments}
        onEdit={onEdit}
        isOpen={drawerOpen}
        onClose={onClose}
      />
      <FinTabloOrgModal
        open={finTabloOrgId != null}
        organizationId={finTabloOrgId}
        onClose={() => setFinTabloOrgId(null)}
        onSaved={() => {
          void mutateFinTablo();
        }}
      />
    </>
  );
};

export default Organization;
