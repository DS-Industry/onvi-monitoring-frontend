import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, Select, InputNumber, Button, Space } from 'antd';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  getSubscriptionRequestsList,
  updateSubscriptionRequestStatus,
  createSubscriptionFromRequest,
  type SubscriptionRequestItem,
  type SubscriptionRequestListStatus,
  type SubscriptionRequestStatus,
} from '@/services/api/subscription';
import {
  approvePosRequest,
  type PosRequestResponseDto,
} from '@/services/api/posRequest';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  ALL_PAGE_SIZES,
} from '@/utils/constants';

const STATUS_OPTIONS: { value: SubscriptionRequestListStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'READY', label: 'Ready' },
  { value: 'PAYMENT_REQUESTED', label: 'Payment Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

function useSubscriptionRequestsList(
  page: number,
  size: number,
  status?: SubscriptionRequestListStatus,
  organizationId?: number
) {
  const { data, isLoading, mutate } = useSWR(
    ['subscription-requests-list', page, size, status, organizationId],
    () => getSubscriptionRequestsList({ page, size, status, organizationId }),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  return {
    data: data?.data ?? [],
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
}

const SubscriptionRequests: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const status = (searchParams.get('status') as SubscriptionRequestListStatus) || undefined;
  const organizationIdParam = searchParams.get('organizationId');
  const organizationId =
    organizationIdParam != null && organizationIdParam !== ''
      ? Number(organizationIdParam)
      : undefined;

  const { data, isLoading, pagination, mutate } = useSubscriptionRequestsList(
    currentPage,
    pageSize,
    status,
    organizationId
  );

  const handlePaginationChange = useCallback(
    (page: number, size: number) => {
      updateSearchParams(searchParams, setSearchParams, {
        page: String(page),
        size: String(size),
      });
    },
    [searchParams, setSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    updateSearchParams(searchParams, setSearchParams, {
      page: String(DEFAULT_PAGE),
      size: String(DEFAULT_PAGE_SIZE),
      status: undefined,
      organizationId: undefined,
    });
  }, [searchParams, setSearchParams]);

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] =
    useState<SubscriptionRequestStatus | null>(null);

  const getStatusTag = (statusValue: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'orange', text: t('constants.pending') },
      READY: { color: 'blue', text: t('subscriptionRequests.ready') },
      PAYMENT_REQUESTED: {
        color: 'purple',
        text: t('subscriptionRequests.status.payment_requested'),
      },
      APPROVED: { color: 'green', text: t('constants.approved') },
      REJECTED: { color: 'red', text: t('constants.rejected') },
    };
    const config = statusConfig[statusValue] ?? {
      color: 'default',
      text: statusValue,
    };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const columns = [
    {
      title: t('constants.requestId'),
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: number) => `#${id}`,
    },
    {
      title: t('subscriptionRequests.organizationId'),
      dataIndex: 'organizationId',
      key: 'organizationId',
      width: 120,
    },
    {
      title: t('subscriptionRequests.planCode'),
      dataIndex: 'planCode',
      key: 'planCode',
      width: 100,
      render: (code: string | undefined) => code ?? '—',
    },
    {
      title: t('subscriptionRequests.connectionType'),
      dataIndex: 'connectionType',
      key: 'connectionType',
      width: 140,
      render: (value: string | null) => value ?? '—',
    },
    {
      title: t('constants.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (statusValue: string) => getStatusTag(statusValue),
    },
    {
      title: t('subscriptionRequests.requestedAt'),
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 160,
      render: (dateStr: string) => formatDate(dateStr),
    },
    {
      title: t('subscriptionRequests.posesCount'),
      dataIndex: 'posesCount',
      key: 'posesCount',
      width: 100,
      render: (v: number | null) => (v != null ? v : '—'),
    },
    {
      title: t('subscriptionRequests.ownerName'),
      dataIndex: 'ownerName',
      key: 'ownerName',
      width: 180,
      render: (v: string | null | undefined) => v ?? '—',
    },
    {
      title: t('subscriptionRequests.ownerEmail'),
      dataIndex: 'ownerEmail',
      key: 'ownerEmail',
      width: 220,
      render: (v: string | null | undefined) => v ?? '—',
    },
    {
      title: t('subscriptionRequests.onviFeature'),
      dataIndex: 'onviFeature',
      key: 'onviFeature',
      width: 90,
      render: (v: boolean) => (v ? t('constants.active') : t('constants.inactive')),
    },
    {
      title: t('subscriptionRequests.corporateClientsFeature'),
      dataIndex: 'corporateClientsFeature',
      key: 'corporateClientsFeature',
      width: 120,
      render: (v: boolean) => (v ? t('constants.active') : t('constants.inactive')),
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      width: 220,
      render: (_: unknown, record: SubscriptionRequestItem) => {
        const handleChange = async (nextStatus: SubscriptionRequestStatus) => {
          try {
            setUpdatingId(record.id);
            setUpdatingStatus(nextStatus);
            await updateSubscriptionRequestStatus(record.id, nextStatus);
            await mutate();
          } finally {
            setUpdatingId(null);
            setUpdatingStatus(null);
          }
        };

        const isLoadingFor = (statusValue: SubscriptionRequestStatus) =>
          updatingId === record.id && updatingStatus === statusValue;

        const recordStatus = record.status?.toUpperCase?.() ?? record.status;
        const posRequests = record.posRequests ?? [];
        const allPosApproved =
          posRequests.length === 0 ||
          posRequests.every(
            p => (p.status?.toUpperCase?.() ?? p.status) === 'APPROVED'
          );

        if (recordStatus === 'APPROVED') {
          return null;
        }

        if (recordStatus === 'PAYMENT_REQUESTED') {
          const handleAccept = async () => {
            try {
              setUpdatingId(record.id);
              setUpdatingStatus('READY');
              await createSubscriptionFromRequest(record.id);
              await mutate();
            } finally {
              setUpdatingId(null);
              setUpdatingStatus(null);
            }
          };

          return (
            <Space size="small">
              <Button
                danger
                size="small"
                loading={isLoadingFor('REJECTED')}
                onClick={() => void handleChange('REJECTED')}
              >
                {t('constants.reject')}
              </Button>
              {allPosApproved && (
                <Button
                  type="primary"
                  size="small"
                  loading={isLoadingFor('READY')}
                  onClick={() => void handleAccept()}
                >
                  {t('subscriptionRequests.accept')}
                </Button>
              )}
            </Space>
          );
        }

        if (recordStatus === 'READY') {
          return (
            <Space size="small">
              <Button
                danger
                size="small"
                loading={isLoadingFor('REJECTED')}
                onClick={() => void handleChange('REJECTED')}
              >
                {t('constants.reject')}
              </Button>
              <Button
                type="primary"
                size="small"
                loading={isLoadingFor('APPROVED')}
                onClick={() => void handleChange('APPROVED')}
              >
                {t('constants.payed')}
              </Button>
            </Space>
          );
        }

        return null
      },
    },
  ];

  const renderPosRequestsTable = (record: SubscriptionRequestItem) => {
    const posRequests = record.posRequests ?? [];
    if (!posRequests.length) {
      return <span className="text-sm text-text02">{t('table.noData')}</span>;
    }

    const handleApprovePos = async (pos: PosRequestResponseDto) => {
      try {
        setUpdatingId(pos.id);
        setUpdatingStatus('APPROVED');
        await approvePosRequest(pos.id);
        await mutate();
      } finally {
        setUpdatingId(null);
        setUpdatingStatus(null);
      }
    };

    const isLoadingForPos = (posId: number) =>
      updatingId === posId && updatingStatus === 'APPROVED';

    const posColumns = [
      {
        title: t('general.name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: t('general.address'),
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: t('createOrganization.posRequestsNumberOfBoxes'),
        dataIndex: 'numberOfBoxes',
        key: 'numberOfBoxes',
        render: (v: number | null) => (v != null ? v : '—'),
      },
      {
        title: t('createOrganization.posRequestsNumberOfVacuums'),
        dataIndex: 'numberOfVacuums',
        key: 'numberOfVacuums',
        render: (v: number | null) => (v != null ? v : '—'),
      },
      {
        title: t('createOrganization.posRequestsPosMigrationId'),
        dataIndex: 'posMigrationId',
        key: 'posMigrationId',
        render: (v: number | null | undefined) => (v != null ? v : '—'),
      },
      {
        title: t('constants.status'),
        dataIndex: 'status',
        key: 'status',
        render: (statusValue: string) => getStatusTag(statusValue),
      },
      {
        title: t('constants.actions'),
        key: 'actions',
        render: (_: unknown, pos: PosRequestResponseDto) =>
          pos.status === 'APPROVED' ? null : (
            <Space size="small">
              <Button
                type="primary"
                size="small"
                loading={isLoadingForPos(pos.id)}
                onClick={() => void handleApprovePos(pos)}
              >
                {t('constants.approve')}
              </Button>
            </Space>
          ),
      },
    ];

    return (
      <Table<PosRequestResponseDto>
        columns={posColumns}
        dataSource={posRequests}
        rowKey="id"
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <>
      <div className="ml-12 md:ml-0 flex items-center space-x-2">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.subscriptionRequests')}
        </span>
      </div>

      <GeneralFilters
        count={pagination?.total ?? 0}
        display={['reset', 'count']}
        onReset={handleResetFilters}
      >
        <div className="flex flex-col text-sm text-text02">
          <div className="mb-1">{t('constants.status')}</div>
          <Select
            allowClear
            placeholder={t('constants.allStatuses')}
            className="w-full sm:w-48"
            value={status ?? undefined}
            options={STATUS_OPTIONS.map(opt => ({
              ...opt,
              label: t(`subscriptionRequests.status.${opt.value.toLowerCase()}`),
            }))}
            onChange={value =>
              updateSearchParams(searchParams, setSearchParams, {
                status: value ?? undefined,
                page: String(DEFAULT_PAGE),
              })
            }
          />
        </div>
        <div className="flex flex-col text-sm text-text02">
          <div className="mb-1">{t('subscriptionRequests.organizationId')}</div>
          <InputNumber
            min={1}
            placeholder={t('subscriptionRequests.organizationIdPlaceholder')}
            className="w-full sm:w-40"
            value={organizationId ?? undefined}
            onChange={value => {
              const next =
                value != null && value >= 1 ? String(value) : undefined;
              updateSearchParams(searchParams, setSearchParams, {
                organizationId: next,
                page: String(DEFAULT_PAGE),
              });
            }}
          />
        </div>
      </GeneralFilters>

      <div className="mt-8">
        <Table<SubscriptionRequestItem>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={isLoading}
          expandable={{
            expandedRowRender: renderPosRequestsTable,
            rowExpandable: record => (record.posRequests?.length ?? 0) > 0,
          }}
          pagination={
            pagination
              ? {
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: ALL_PAGE_SIZES,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} / ${total} ${t('constants.requests')}`,
                onChange: handlePaginationChange,
              }
              : false
          }
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: t('table.noData') }}
        />
      </div>
    </>
  );
};

export default SubscriptionRequests;
