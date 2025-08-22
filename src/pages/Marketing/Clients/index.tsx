import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  ClientsResponse,
  getClients,
  UserType,
} from '@/services/api/marketing';
import { Button, Table, Tooltip } from 'antd';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import EditClientsDrawer from './EditClientsDrawer';
import { useUser } from '@/hooks/useUserStore';

const Clients: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const placementId = searchParams.get('city') || undefined;
  const type = (searchParams.get('userType') as UserType) || '*';
  const tagIds = searchParams.get('tagIds') || undefined;
  const phone = searchParams.get('phone') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(
    undefined
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = useUser();

  const { data: clientsData, isLoading: loadingClients } = useSWR(
    [`get-clients`, currentPage, pageSize, placementId, type, tagIds, phone],
    () =>
      getClients({
        placementId: placementId || '*',
        contractType:
          type === 'PHYSICAL'
            ? 'INDIVIDUAL'
            : type === 'LEGAL'
              ? 'CORPORATE'
              : '*',
        tagIds: undefined,
        phone: phone,
        page: currentPage,
        size: pageSize,
        workerCorporateId: Number(user.organizationId),
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const clients =
    clientsData?.map(client => ({
      ...client,
      status: t(`tables.${client.status}`),
    })) || [];

  const onEditClick = (id: number) => {
    setSelectedClientId(id);
    setDrawerOpen(true);
  };

  const columnsClients: ColumnsType<ClientsResponse> = [
    {
      title: t('marketing.type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('marketing.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return (
          <Link
            to={{
              pathname: '/marketing/clients/profile',
              search: `?userId=${record.id}`,
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: t('profile.telephone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('constants.status'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('marketing.tags'),
      dataIndex: 'tags',
      key: 'tags',
    },
    {
      title: t('equipment.comment'),
      dataIndex: 'comment',
      key: 'comment',
    },
    {
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
            onClick={() => onEditClick(record.id)}
            style={{ height: '24px' }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.clients')}
          </span>
          <QuestionMarkIcon />
        </div>
        <div className="xs:flex xs:space-x-2">
          <Button
            icon={<DownloadOutlined />}
            className="btn-outline-primary"
            onClick={() => {
              navigate('/marketing/clients/import');
            }}
          >
            <span className="hidden sm:flex">{t('routes.importClients')}</span>
          </Button>
          <Button
            icon={<PlusOutlined />}
            className="btn-primary"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            {t('routes.add')}
          </Button>
        </div>
      </div>
      <GeneralFilters
        count={clients.length}
        display={['city', 'count', 'phone', 'tagIds', 'userType']}
      />
      <div className="mt-8 flex flex-col min-h-screen">
        <Table
          columns={columnsClients}
          dataSource={clients}
          loading={loadingClients}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: clients.length,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} из ${total} операций`,
            onChange: (page, size) =>
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              }),
          }}
        />
      </div>
      <EditClientsDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedClientId(undefined);
        }}
        clientId={selectedClientId}
      />
    </>
  );
};

export default Clients;
