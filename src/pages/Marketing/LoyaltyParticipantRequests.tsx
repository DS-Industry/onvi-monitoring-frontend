import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Tag, Space, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import LoyaltyParticipantRequestStatusFilter from '@/components/ui/Filter/LoyaltyParticipantRequestStatusFilter';
import {
  getLoyaltyParticipantRequests,
  approveLoyaltyParticipantRequest,
  rejectLoyaltyParticipantRequest,
  LoyaltyParticipantRequest,
  LTYProgramRequestStatus,
} from '@/services/api/marketing';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';

const useLoyaltyParticipantRequests = (
  currentPage: number,
  pageSize: number,
  status?: LTYProgramRequestStatus,
  search?: string,
  ltyProgramId?: number,
  dateFrom?: string,
  dateTo?: string
) => {
  const { data, isLoading, mutate } = useSWR(
    [
      'get-loyalty-participant-requests',
      currentPage,
      pageSize,
      status,
      search,
      ltyProgramId,
      dateFrom,
      dateTo,
    ],
    () =>
      getLoyaltyParticipantRequests({
        page: currentPage,
        size: pageSize,
        status: status,
        search,
        ltyProgramId,
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
      }
      : null,
  };
};

const LoyaltyParticipantRequests: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modal, contextHolder] = Modal.useModal();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const status =
    (searchParams.get('status') as LTYProgramRequestStatus) || undefined;
  const search = searchParams.get('search') || undefined;
  const ltyProgramId = searchParams.get('ltyProgramId')
    ? Number(searchParams.get('ltyProgramId'))
    : undefined;
  const dateFrom = searchParams.get('dateStart') || undefined;
  const dateTo = searchParams.get('dateEnd') || undefined;

  const { requests, isLoading, mutate, pagination } =
    useLoyaltyParticipantRequests(
      currentPage,
      pageSize,
      status,
      search,
      ltyProgramId,
      dateFrom,
      dateTo
    );

  const { trigger: approveRequest, isMutating: isApproving } = useSWRMutation(
    'approve-loyalty-participant-request',
    async (_, { arg }: { arg: { id: number; comment?: string } }) => {
      return approveLoyaltyParticipantRequest(arg.id, arg.comment);
    }
  );

  const { trigger: rejectRequest, isMutating: isRejecting } = useSWRMutation(
    'reject-loyalty-participant-request',
    async (_, { arg }: { arg: { id: number; comment?: string } }) => {
      return rejectLoyaltyParticipantRequest(arg.id, arg.comment);
    }
  );

  const handleApproveClick = useCallback(
    (record: LoyaltyParticipantRequest) => {
      modal.confirm({
        title: t('loyaltyParticipantRequests.approveRequest'),
        content: (
          <div className="mt-4">
            <p className="mb-2">
              {t('loyaltyParticipantRequests.approvalComment')}
            </p>
            <Input.TextArea
              id="approval-comment"
              placeholder={t('loyaltyParticipantRequests.commentOptional')}
              rows={3}
            />
          </div>
        ),
        okText: t('constants.approve'),
        cancelText: t('constants.cancel'),
        onOk: async () => {
          const comment = (
            document.getElementById('approval-comment') as HTMLTextAreaElement
          )?.value;
          try {
            await approveRequest({ id: record.id, comment });
            showToast(
              t('loyaltyParticipantRequests.requestApproved'),
              'success'
            );
            mutate();
          } catch (error) {
            showToast(t('constants.errorOccurred'), 'error');
          }
        },
      });
    },
    [approveRequest, mutate, showToast, t]
  );

  const handleRejectClick = useCallback(
    (record: LoyaltyParticipantRequest) => {
      modal.confirm({
        title: t('loyaltyParticipantRequests.rejectRequest'),
        content: (
          <div className="mt-4">
            <p className="mb-2">
              {t('loyaltyParticipantRequests.rejectionComment')}
            </p>
            <Input.TextArea
              id="rejection-comment"
              placeholder={t('loyaltyParticipantRequests.commentOptional')}
              rows={3}
            />
          </div>
        ),
        okText: t('constants.reject'),
        cancelText: t('constants.cancel'),
        onOk: async () => {
          const comment = (
            document.getElementById('rejection-comment') as HTMLTextAreaElement
          )?.value;
          try {
            await rejectRequest({ id: record.id, comment });
            showToast(
              t('loyaltyParticipantRequests.requestRejected'),
              'success'
            );
            mutate();
          } catch (error) {
            showToast(t('constants.errorOccurred'), 'error');
          }
        },
      });
    },
    [rejectRequest, mutate, showToast, t]
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
      search: '',
      ltyProgramId: '',
      dateStart: '',
      dateEnd: '',
    });
  }, [searchParams, setSearchParams]);

  const getStatusTag = (status: LTYProgramRequestStatus) => {
    const statusConfig = {
      [LTYProgramRequestStatus.PENDING]: {
        color: 'orange',
        text: t('constants.pending'),
      },
      [LTYProgramRequestStatus.APPROVED]: {
        color: 'green',
        text: t('constants.approved'),
      },
      [LTYProgramRequestStatus.REJECTED]: {
        color: 'red',
        text: t('constants.rejected'),
      },
    };

    return (
      <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>
    );
  };

  const columns = [
    {
      title: t('loyaltyParticipantRequests.loyaltyProgram'),
      dataIndex: 'ltyProgramName',
      key: 'ltyProgramName',
      render: (text: string, record: LoyaltyParticipantRequest) => (
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
      render: (status: LTYProgramRequestStatus) => getStatusTag(status),
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      render: (record: LoyaltyParticipantRequest) => (
        <Space>
          {record.status === LTYProgramRequestStatus.PENDING && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                loading={isApproving}
                onClick={() => handleApproveClick(record)}
              >
                {t('constants.approve')}
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                loading={isRejecting}
                onClick={() => handleRejectClick(record)}
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
      {contextHolder}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.participantRequests')}
          </span>
        </div>
      </div>

      <GeneralFilters
        count={pagination?.total ?? 0}
        display={['search', 'dateTime', 'reset', 'count']}
        onReset={handleResetFilters}
      >
        <LoyaltyParticipantRequestStatusFilter />
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
        locale={{ emptyText: t('table.noData') }}
      />
    </>
  );
};

export default LoyaltyParticipantRequests;
