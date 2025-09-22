import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Tag, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useUser } from '@/hooks/useUserStore';
import { useToast } from '@/components/context/useContext';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import LoyaltyRequestStatusFilter from '@/components/ui/Filter/LoyaltyRequestStatusFilter';
import {
  getLoyaltyRequests,
  approveLoyaltyRequest,
  rejectLoyaltyRequest,
  LoyaltyRequest,
  LoyaltyRequestStatus,
  LoyaltyRequestType,
  LTYProgramRequestStatus,
} from '@/services/api/marketing';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

const useLoyaltyRequests = (
  currentPage: number,
  pageSize: number,
  status?: LoyaltyRequestStatus | 'ALL',
  requestType?: LoyaltyRequestType | 'ALL',
  search?: string,
  organizationId?: number,
  dateFrom?: string,
  dateTo?: string
) => {

  const { data, isLoading, mutate } = useSWR(
    [
      'get-loyalty-requests',
      currentPage,
      pageSize,
      status,
      requestType,
      search,
      organizationId,
      dateFrom,
      dateTo,
    ],
    () =>
      getLoyaltyRequests({
        page: currentPage,
        size: pageSize,
        status: status === 'ALL' ? undefined : status,
        requestType: requestType === 'ALL' ? undefined : requestType,
        search,
        organizationId,
        dateFrom,
        dateTo,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const requests = data?.data || [];

  return {
    requests,
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

const LoyaltyRequests: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const status = (searchParams.get('status') as LoyaltyRequestStatus | 'ALL') || 'ALL';
  const requestType = (searchParams.get('requestType') as LoyaltyRequestType | 'ALL') || 'ALL';
  const search = searchParams.get('search') || undefined;
  const dateFrom = searchParams.get('dateStart') || undefined;
  const dateTo = searchParams.get('dateEnd') || undefined;

  const { requests, isLoading, mutate, pagination } = useLoyaltyRequests(
    currentPage,
    pageSize,
    status,
    requestType,
    search,
    user.organizationId,
    dateFrom,
    dateTo
  );

  const { trigger: approveRequest, isMutating: isApproving } = useSWRMutation(
    'approve-loyalty-request',
    async (_, { arg }: { arg: number }) => {
      return approveLoyaltyRequest(arg);
    }
  );

  const { trigger: rejectRequest, isMutating: isRejecting } = useSWRMutation(
    'reject-loyalty-request',
    async (_, { arg }: { arg: number }) => {
      return rejectLoyaltyRequest(arg);
    }
  );

  const handleApprove = useCallback(async (id: number) => {
    try {
      await approveRequest(id);
      mutate(); 
      showToast(t('loyaltyRequests.requestApproved'), 'success');
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  }, [approveRequest, mutate, showToast, t]);

  const handleReject = useCallback(async (id: number) => {
    try {
      await rejectRequest(id);
      mutate(); 
      showToast(t('loyaltyRequests.requestRejected'), 'success');
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  }, [rejectRequest, mutate, showToast, t]);

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
      status: 'ALL',
      requestType: 'ALL',
      search: '',
      dateStart: '',
      dateEnd: '',
    });
  }, [searchParams, setSearchParams]);

  const getStatusTag = (status: LoyaltyRequestStatus) => {
    const statusConfig = {
      [LoyaltyRequestStatus.PENDING]: { color: 'orange', text: t('constants.pending') },
      [LoyaltyRequestStatus.APPROVED]: { color: 'green', text: t('constants.approved') },
      [LoyaltyRequestStatus.REJECTED]: { color: 'red', text: t('constants.rejected') },
    };

    return (
      <Tag color={statusConfig[status].color}>
        {statusConfig[status].text}
      </Tag>
    );
  };

  const columns = [
    {
      title: t('loyaltyRequests.loyaltyProgram'),
      dataIndex: 'ltyProgramName',
      key: 'ltyProgramName',
      render: (text: string, record: LoyaltyRequest) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.ltyProgramName}</div>
        </div>
      ),
    },
    {
      title: t('general.organizationName'),
      dataIndex: 'organizationName',
      key: 'organizationName',
      render: (record: string) => (
        <span className="font-medium">
          <span>{record}</span>
        </span>
      ),
    },
    {
        title: t('constants.comment'),
        dataIndex: 'requestComment',
        key: 'requestComment',
        render: (record: string) => (
          <span className="font-medium">
            <span>{record}</span>
          </span>
        ),
    },
    {
      title: t('general.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: t('constants.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: LoyaltyRequestStatus) => getStatusTag(status),
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      render: (record: LoyaltyRequest) => (
        <Space>
          {record.status === LTYProgramRequestStatus.PENDING && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={isApproving}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                {t('constants.approve')}
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
                loading={isRejecting}
              >
                {t('constants.reject')}
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('routes.loyaltyRequests')}
        </h1>
      </div>

      <GeneralFilters
        count={pagination?.total ?? 0}
        display={['search', 'dateTime', 'reset', 'count']}
        onReset={handleResetFilters}
      >
        <LoyaltyRequestStatusFilter />
      </GeneralFilters>

      <Table
        columns={columns}
        dataSource={requests}
        rowKey="id"
        loading={isLoading}
        pagination={
          pagination
            ? {
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} / ${total} ${t('constants.requests')}`,
                onChange: handlePaginationChange,
                onShowSizeChange: handlePaginationChange,
              }
            : false
        }
        scroll={{ x: 800 }}
      />
    </>
  );
};

export default LoyaltyRequests;
