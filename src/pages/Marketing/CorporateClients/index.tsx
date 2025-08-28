import React, { useMemo, useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/hooks/useUserStore';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import useSWR from 'swr';

import { Button, Table, message } from 'antd';
import CorporateClientFilters from '@/components/ui/Filter/CorporateClientFilters';
import { PlusOutlined } from '@ant-design/icons';

import {
  CorporateClientResponse,
  CorporateClientsParams,
  CorporateClientsPaginatedResponse,
  getCorporateClients,
} from '@/services/api/marketing';

import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import CorporateClientDrawer from './CorporateClientDrawer';

const CorporateClients: React.FC = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const registrationFrom = searchParams.get('registrationFrom') || undefined;
  const registrationTo = searchParams.get('registrationTo') || undefined;
  const inn = searchParams.get('inn') || undefined;
  const ownerPhone = searchParams.get('ownerPhone') || undefined;
  const name = searchParams.get('name') || undefined;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] =
    useState<CorporateClientResponse | null>(null);

  const params: CorporateClientsParams = {
    inn,
    ownerPhone,
    name,
    page: currentPage,
    size: pageSize,
    registrationFrom,
    registrationTo,
    organizationId: user?.organizationId,
  };

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR<CorporateClientsPaginatedResponse>(
    ['corporate-clients', params],
    () => getCorporateClients(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  if (error) {
    console.error('Error fetching corporate clients:', error);
    message.error('Failed to fetch corporate clients');
  }

  const corporateClients = response?.data || [];
  const pagination = response
    ? {
        total: response.total,
        currentPage: response.page,
        pageSize: response.size,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrevious: response.hasPrevious,
      }
    : {
        total: 0,
        currentPage: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };

  const handlePaginationChange = useCallback(
    (page: number, size: number) => {
      updateSearchParams(searchParams, setSearchParams, {
        page: String(page),
        size: String(size),
      });
    },
    [searchParams, setSearchParams]
  );

  const columns = useMemo(
    () => [
      {
        title: t('corporateClients.name'),
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: CorporateClientResponse) => (
          <Link
            to={{
              pathname: '/marketing/corporate-clients/profile',
              search: `?clientId=${record.id}`,
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        ),
      },
      {
        title: t('corporateClients.inn'),
        dataIndex: 'inn',
        key: 'inn',
      },
      {
        title: t('corporateClients.address'),
        dataIndex: 'address',
        key: 'address',
        ellipsis: true,
      },
      {
        title: t('corporateClients.ownerPhone'),
        dataIndex: 'ownerPhone',
        key: 'ownerPhone',
      },
      {
        title: t('corporateClients.dateRegistered'),
        dataIndex: 'dateRegistered',
        key: 'dateRegistered',
        render: (date: string) => {
          if (!date) return '-';
          return new Date(date).toLocaleDateString();
        },
      },
      {
        title: t('constants.status'),
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : status === 'BLOCKED'
                  ? 'bg-red-100 text-red-800'
                  : status === 'VERIFICATE'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status}
          </span>
        ),
      },
      {
        title: t('actions.actions'),
        dataIndex: 'actions',
        key: 'actions',
        render: (_, record: CorporateClientResponse) => (
          <Button
            type="link"
            onClick={() => {
              setSelectedClient(record);
              setDrawerOpen(true);
            }}
          >
            {t('actions.edit')}
          </Button>
        ),
      },
    ],
    [t]
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.corporateClients')}
          </span>
        </div>
        <Button
          type="primary"
          onClick={() => {
            setSelectedClient(null);
            setDrawerOpen(true);
          }}
          className="bg-primary02 hover:bg-primary02_Hover text-white"
          icon={<PlusOutlined />}
        >
          {t('routes.create')}
        </Button>
      </div>

      <div className="mt-4">
        <CorporateClientFilters />
      </div>

      <div className="mt-4 flex flex-col min-h-screen">
        <Table
          columns={columns}
          dataSource={corporateClients}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            current: pagination?.currentPage || currentPage,
            pageSize: pagination?.pageSize || pageSize,
            total: pagination?.total || 0,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}`,
            onChange: handlePaginationChange,
          }}
        />
      </div>
      <CorporateClientDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSuccess={() => {
          mutate();
        }}
      />
    </>
  );
};

export default CorporateClients;
