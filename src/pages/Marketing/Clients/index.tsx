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
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { Link, useSearchParams } from 'react-router-dom';
import { ALL_PAGE_SIZES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import ClientsDrawer from './ClientsDrawer';

const Clients: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const placementId = searchParams.get('city') || undefined;
  const type = (searchParams.get('userType') as UserType) || undefined;
  const tagIds = searchParams.get('tagIds') || undefined;
  const phone = searchParams.get('phone') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const [editClientId, setEditClientId] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: clientsData, isLoading: loadingClients } = useSWR(
    [`get-clients`, currentPage, pageSize, placementId, type, tagIds, phone],
    () =>
      getClients({
        placementId: placementId || '*',
        type: type,
        tagIds: undefined,
        phone: phone,
        page: currentPage,
        size: pageSize,
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

  const handleUpdate = (id: number) => {
    setEditClientId(id);
    setDrawerOpen(true);
  };

  const columnsClients: ColumnsType<ClientsResponse> = [
    {
      title: 'Тип клиента',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Имя клиента',
      dataIndex: 'name',
      key: 'name',
      render: text => {
        return (
          <Link
            to={{
              pathname: '/marketing/clients/profile',
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Теги',
      dataIndex: 'tags',
      key: 'tags',
    },
    {
      title: 'Комментарий',
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
            onClick={() => handleUpdate(record.id)}
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
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          {t('routes.add')}
        </Button>
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
        <ClientsDrawer 
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setEditClientId(0);
          }}
          clientId={editClientId}
        />
    </>
  );
};

export default Clients;
