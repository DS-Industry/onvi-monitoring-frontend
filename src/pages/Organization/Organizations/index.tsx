import React, { useState } from 'react';
import useSWR from 'swr';
import {
  getOrganization,
  getOrganizationDocument,
  OrganizationBody,
  Organization as OrganizationType,
} from '@/services/api/organization/index.ts';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/useAuthStore';
import { getWorkers } from '@/services/api/equipment';
import { Button, Table, Tooltip } from 'antd';
import hasPermission from '@/permissions/hasPermission';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import AntDButton from 'antd/es/button';
import { ColumnsType } from 'antd/es/table';
import { getDateRender } from '@/utils/tableUnits';
import OrganizationDrawer from './OrganizationDrawer';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';

const Organization: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || '*';
  const { data, isLoading: loadingOrg } = useSWR([`get-org`, city], () =>
    getOrganization({
      placementId: city,
    })
  );
  const [editOrgId, setEditOrgId] = useState<number>(0);

  const { data: workersData } = useSWR([`get-workers`], () => getWorkers(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const workers: { name: string; value: number }[] = [
    ...(workersData?.map(work => ({
      name: work.name,
      value: work.id,
    })) || []),
  ];

  const legalOptions = [
    { name: t('organizations.legalEntity'), value: 'LegalEntity' },
    { name: t('organizations.ip'), value: 'IndividualEntrepreneur' },
  ];

  const organizations =
    data
      ?.map(item => ({
        ...item,
        ownerName:
          workers.find(work => work.value === item.ownerId)?.name || '-',
        organizationStatus: t(`tables.${item.organizationStatus}`),
        organizationType:
          legalOptions.find(leg => leg.value === item.organizationType)?.name ||
          '-',
      }))
      .sort((a, b) => a.id - b.id) || [];

  const initialValues: OrganizationBody = {
    fullName: '',
    organizationType: '',
    rateVat: '',
    inn: '',
    okpo: '',
    kpp: undefined,
    addressRegistration: '',
    ogrn: '',
    bik: '',
    correspondentAccount: '',
    bank: '',
    settlementAccount: '',
    addressBank: '',
    certificateNumber: '',
    dateCertificate: undefined,
  };

  const [formData, setFormData] = useState(initialValues);

  const handleUpdate = async (id: number) => {
    setEditOrgId(id);
    setDrawerOpen(true);

    const orgToEdit = organizations.find(org => org.id === id);
    let orgs;
    if (orgToEdit?.organizationDocumentId) {
      const fetchedOrgData = await getOrganizationDocument(
        orgToEdit?.organizationDocumentId
      );
      orgs = fetchedOrgData.props;
    }

    if (orgToEdit) {
      setFormData({
        fullName: orgToEdit.name,
        organizationType:
          legalOptions.find(leg => leg.name === orgToEdit.organizationType)
            ?.value || '',
        rateVat: orgs?.rateVat ? orgs.rateVat : '',
        inn: orgs?.inn ? orgs.inn : '',
        okpo: orgs?.okpo ? orgs.okpo : '',
        kpp: orgs?.kpp ? orgs.kpp : undefined,
        addressRegistration: orgToEdit.address,
        ogrn: orgs?.ogrn ? orgs.ogrn : '',
        bik: orgs?.bik ? orgs.bik : '',
        correspondentAccount: orgs?.correspondentAccount
          ? orgs.correspondentAccount
          : '',
        bank: orgs?.bank ? orgs.bank : '',
        settlementAccount: orgs?.settlementAccount
          ? orgs.settlementAccount
          : '',
        addressBank: orgs?.addressBank ? orgs.addressBank : '',
        certificateNumber: orgs?.certificateNumber
          ? orgs.certificateNumber
          : '',
        dateCertificate: orgs?.dateCertificate
          ? dayjs(orgs.dateCertificate).toDate()
          : undefined,
      });
    }
  };

  const userPermissions = usePermissions();

  const allowed = hasPermission(userPermissions, [
    { action: 'manage', subject: 'Organization' },
    { action: 'create', subject: 'Organization' },
  ]);

  const dateRender = getDateRender();

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
          <AntDButton
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
    setEditOrgId(0);
  }

  const onClose = () => {
    setDrawerOpen(false);
  }

  return (
    <>
      <GeneralFilters count={organizations.length} display={['city']} />
      <Button
        icon={<PlusOutlined />}
        className="absolute top-6 right-6 bg-primary02 text-white p-5 hover:bg-primary02_Hover"
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        {t('routes.add')}
      </Button>
      <>
        <div className="mt-8">
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
        initialValues={initialValues}
        formData={formData}
        onChange={setFormData}
        orgId={editOrgId}
        onEdit={onEdit}
        isOpen={drawerOpen}
        onClose={onClose}
      />
    </>
  );
};

export default Organization;
