import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Tag, Space, Modal, Input } from 'antd';
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
  getLoyaltyHubRequests,
  approveLoyaltyHubRequest,
  rejectLoyaltyHubRequest,
  LoyaltyRequest,
  LoyaltyRequestStatus,
  LTYProgramRequestStatus,
} from '@/services/api/marketing';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

const useLoyaltyHubRequests = (
  currentPage: number,
  pageSize: number,
  status?: LoyaltyRequestStatus,
  search?: string,
  organizationId?: number,
  dateFrom?: string,
  dateTo?: string
) => {

  const { data, isLoading, mutate } = useSWR(
    [
      'get-loyalty-hub-requests',
      currentPage,
      pageSize,
      status,
      search,
      organizationId,
      dateFrom,
      dateTo,
    ],
    () =>
      getLoyaltyHubRequests({
        page: currentPage,
        size: pageSize,
        status: status,
        search,
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
          total: data.totalCount,
          currentPage: data.page,
          pageSize: data.size,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
        }
      : null,
  };
};

const LoyaltyHubRequests: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const status = (searchParams.get('status') as LoyaltyRequestStatus) || undefined;
  const search = searchParams.get('search') || undefined;
  const dateFrom = searchParams.get('dateStart') || undefined;
  const dateTo = searchParams.get('dateEnd') || undefined;

  const { requests, isLoading, mutate, pagination } = useLoyaltyHubRequests(
    currentPage,
    pageSize,
    status,
    search,
    user.organizationId,
    dateFrom,
    dateTo
  );

  const { trigger: approveRequest, isMutating: isApproving } = useSWRMutation(
    'approve-loyalty-hub-request',
    async (_, { arg }: { arg: { id: number; comment?: string } }) => {
      return approveLoyaltyHubRequest(arg.id, arg.comment);
    }
  );

  const { trigger: rejectRequest, isMutating: isRejecting } = useSWRMutation(
    'reject-loyalty-hub-request',
    async (_, { arg }: { arg: { id: number; comment?: string } }) => {
      return rejectLoyaltyHubRequest(arg.id, arg.comment);
    }
  );

  const handleApproveClick = useCallback((request: LoyaltyRequest) => {
    let comment = '';
    
    Modal.confirm({
      title: t('loyaltyHubRequests.approveRequest'),
      content: (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>{t('general.organizationName')}:</strong> {request.organizationName}</p>
            <p><strong>{t('loyaltyHubRequests.loyaltyProgram')}:</strong> {request.ltyProgramName}</p>
            <p><strong>{t('constants.requestId')}:</strong> #{request.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('constants.comment')} ({t('loyaltyHubRequests.commentOptional')})
            </label>
            <Input.TextArea
              rows={3}
              placeholder={t('loyaltyHubRequests.approvalComment')}
              onChange={(e) => { comment = e.target.value; }}
            />
          </div>
        </div>
      ),
      okText: t('constants.approve'),
      cancelText: t('constants.cancel'),
      okButtonProps: { 
        style: { backgroundColor: '#52c41a', borderColor: '#52c41a' },
        loading: isApproving 
      },
      onOk: async () => {
        try {
          await approveRequest({ id: request.ltyProgramId, comment: comment.trim() || undefined });
          mutate();
          showToast(t('loyaltyHubRequests.requestApproved'), 'success');
        } catch (error) {
          showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        }
      },
    });
  }, [approveRequest, mutate, showToast, t, isApproving]);

  const handleRejectClick = useCallback((request: LoyaltyRequest) => {
    let comment = '';
    
    Modal.confirm({
      title: t('loyaltyHubRequests.rejectRequest'),
      content: (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>{t('general.organizationName')}:</strong> {request.organizationName}</p>
            <p><strong>{t('loyaltyHubRequests.loyaltyProgram')}:</strong> {request.ltyProgramName}</p>
            <p><strong>{t('constants.requestId')}:</strong> #{request.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('constants.comment')} ({t('loyaltyHubRequests.commentOptional')})
            </label>
            <Input.TextArea
              rows={3}
              placeholder={t('loyaltyHubRequests.rejectionComment')}
              onChange={(e) => { comment = e.target.value; }}
            />
          </div>
        </div>
      ),
      okText: t('constants.reject'),
      cancelText: t('constants.cancel'),
      okButtonProps: { 
        danger: true,
        loading: isRejecting 
      },
      onOk: async () => {
        try {
          await rejectRequest({ id: request.ltyProgramId, comment: comment.trim() || undefined });
          mutate();
          showToast(t('loyaltyHubRequests.requestRejected'), 'success');
        } catch (error) {
          showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        }
      },
    });
  }, [rejectRequest, mutate, showToast, t, isRejecting]);

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
      title: t('loyaltyHubRequests.loyaltyProgram'),
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
                onClick={() => handleApproveClick(record)}
                loading={isApproving}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                {t('constants.approve')}
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleRejectClick(record)}
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 ms-10 md:ms-0">
          {t('routes.hubRequests')}
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

export default LoyaltyHubRequests;
