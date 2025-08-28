import React, { useState } from 'react';
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
import { Button, Table, Tooltip } from 'antd';
import hasPermission from '@/permissions/hasPermission';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import OrganizationDrawer from './OrganizationDrawer';
import { useSearchParams } from 'react-router-dom';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { useUser } from '@/hooks/useUserStore';

const Organization: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const city = Number(searchParams.get('city')) || undefined;
  const {
    data,
    isLoading: loadingOrg,
    mutate: mutateOrgs,
  } = useSWR([`get-org`, city], () =>
    getOrganization({
      placementId: city,
    })
  );

  const user = useUser();

  const { data: workersData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
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
          workersData?.find(work => work.id === item.ownerId)?.name || '-',
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
    if (orgToEdit?.organizationDocumentId) {
      const fetchedOrgData = await getOrganizationDocument(
        orgToEdit?.organizationDocumentId
      );
      orgs = fetchedOrgData.props;
    }

    setOrgToEdit(orgToEdit || null);
    setOrgDocuments(orgs || null);
  };

  const userPermissions = usePermissions();

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Organization' },
    { action: 'create', subject: 'Organization' },
  ]);

  const dateRender = getDateRender();
  const statusRender = getStatusTagRender(t);

  const columnsOrg: ColumnsType<OrganizationType> = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Адресс',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Статус',
      dataIndex: 'organizationStatus',
      key: 'organizationStatus',
      render: statusRender,
    },
    {
      title: 'Тип',
      dataIndex: 'organizationType',
      key: 'organizationType',
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
      title: 'Хозяин',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
  ];

  if (allowed) {
    columnsOrg.push({
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: unknown, record: { id: number }) => (
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
    </>
  );
};

export default Organization;
