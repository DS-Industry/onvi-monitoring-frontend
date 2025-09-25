import React, { useMemo, useState, useCallback } from 'react';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useUser } from '@/hooks/useUserStore';
import { updateSearchParams } from '@/utils/searchParamsUtils';

import { Button, Table, Tooltip } from 'antd';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import EditClientsDrawer from './EditClientsDrawer';

import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import {
  ClientsResponse,
  getClients,
  UserType,
} from '@/services/api/marketing';

import {
  ALL_PAGE_SIZES,
  ContractType,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const useClients = (
  currentPage: number,
  pageSize: number,
  placementId?: string,
  type?: UserType,
  phone?: string,
  organizationId?: number,
  registrationFrom?: string,
  registrationTo?: string,
  search?: string
) => {
  const { t } = useTranslation();

  const { data, isLoading, mutate } = useSWR(
    [
      'get-clients',
      currentPage,
      pageSize,
      placementId,
      type,
      phone,
      organizationId,
      registrationFrom,
      registrationTo,
      search,
    ],
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
        phone,
        page: currentPage,
        size: pageSize,
        organizationId: Number(organizationId),
        registrationFrom,
        registrationTo,
        search,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const clients =
    data?.data?.map(client => ({
      ...client,
      status: t(`tables.${client.status}`),
    })) || [];

  return {
    clients,
    isLoading,
    mutate,
    pagination: data
      ? {
          total: data.total,
          currentPage: data.page,
          pageSize: data.size,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
        }
      : null,
  };
};

const Clients: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const placementId = searchParams.get('city') || undefined;
  const type = (searchParams.get('userType') as UserType) || '*';
  const phone = searchParams.get('phone') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const registrationFrom = searchParams.get('registrationFrom') || undefined;
  const registrationTo = searchParams.get('registrationTo') || undefined;
  const search = searchParams.get('search') || undefined;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number>();

  const { clients, isLoading, mutate, pagination } = useClients(
    currentPage,
    pageSize,
    placementId,
    type,
    phone,
    user.organizationId,
    registrationFrom,
    registrationTo,
    search
  );

  const onEditClick = useCallback((id: number) => {
    setSelectedClientId(id);
    setDrawerOpen(true);
  }, []);

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
        title: t('marketing.type'),
        dataIndex: 'contractType',
        key: 'contractType',
        render: (text: ContractType) => (
          <>
            {ContractType[text] === ContractType.CORPORATE
              ? t('marketing.legal')
              : t('marketing.physical')}
          </>
        ),
      },
      {
        title: t('marketing.name'),
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: ClientsResponse) => (
          <Link
            to={{
              pathname: '/marketing/clients/profile',
              search: `?userId=${record.id}`,
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            {text}
          </Link>
        ),
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
        title: t('equipment.comment'),
        dataIndex: 'comment',
        key: 'comment',
      },
      {
        title: '',
        key: 'actions',
        render: (_: unknown, record: ClientsResponse) => (
          <Tooltip title={t('actions.edit')}>
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
    ],
    [t, onEditClick]
  );

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.clients')}
          </span>
        </div>
        <div className="xs:flex xs:space-x-2">
          <Button
            icon={<DownloadOutlined />}
            className="btn-outline-primary mt-2 sm:mt-0"
            onClick={() => navigate('/marketing/clients/import')}
          >
            <span>{t('marketing.importCards')}</span>
          </Button>
          <Button
            icon={<PlusOutlined />}
            className="btn-primary  mt-2 sm:mt-0"
            onClick={() => setDrawerOpen(true)}
          >
            {t('routes.add')}
          </Button>
        </div>
      </div>

      <GeneralFilters
        count={pagination?.total || 0}
        display={['search', 'city', 'count', 'userType', 'reset']}
        onReset={() => {
          updateSearchParams(searchParams, setSearchParams, {
            userType: undefined,
            page: DEFAULT_PAGE,
            registrationFrom: undefined,
            registrationTo: undefined,
            city: undefined,
            search: '',
          });
        }}
      >
        <div className="w-full sm:w-80">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('marketing.reg')}
          </label>
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            placeholder={[t('filters.dateTime.startDate'), t('filters.dateTime.endDate')]}
            value={
              registrationFrom && registrationTo
                ? [dayjs(registrationFrom), dayjs(registrationTo)]
                : undefined
            }
            onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
              if (dates && dates[0] && dates[1]) {
                updateSearchParams(searchParams, setSearchParams, {
                  registrationFrom: dates[0].toISOString(),
                  registrationTo: dates[1].toISOString(),
                  page: DEFAULT_PAGE,
                });
              } else {
                updateSearchParams(searchParams, setSearchParams, {
                  registrationFrom: undefined,
                  registrationTo: undefined,
                  page: DEFAULT_PAGE,
                });
              }
            }}
          />
        </div>
      </GeneralFilters>

      <div className="mt-4 flex flex-col min-h-screen">
        <Table
          columns={columns}
          dataSource={clients}
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

      {drawerOpen && <EditClientsDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedClientId(undefined);
          mutate();
        }}
        clientId={selectedClientId}
      />}
    </>
  );
};

export default Clients;
