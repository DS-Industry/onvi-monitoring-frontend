import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Tag, Space, Modal, Input, Select } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/hooks/useToast';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { 
  BalanceTransferResponse, 
  BalanceTransferStatus, 
  getBalanceTransfers,
  approveBalanceTransfer,
  rejectBalanceTransfer 
} from '@/services/api/marketing';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';

const useBalanceTransfers = (
  currentPage: number,
  pageSize: number,
  status?: BalanceTransferStatus,
  search?: string,
  startDate?: string,
  endDate?: string
) => {
  const { data, isLoading, mutate } = useSWR(
    [
      'get-balance-transfers',
      currentPage,
      pageSize,
      status,
      search,
      startDate,
      endDate,
    ],
    () =>
      getBalanceTransfers({
        page: currentPage,
        size: pageSize,
        status,
        search,
        startDate,
        endDate,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const transfers = data?.items || [];

  return {
    transfers,
    isLoading,
    mutate,
    pagination: data
      ? {
          total: data.total,
          currentPage: data.page,
          pageSize: data.size,
          totalPages: data.totalPages,
          hasNext: data.page < data.totalPages,
          hasPrevious: data.page > 1,
        }
      : null,
  };
};

const BalanceTransferRequests: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modal, contextHolder] = Modal.useModal();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const status = (searchParams.get('status') as BalanceTransferStatus) || undefined;
  const search = searchParams.get('search') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const { transfers, isLoading, mutate, pagination } = useBalanceTransfers(
    currentPage,
    pageSize,
    status,
    search,
    startDate,
    endDate
  );

  const { trigger: approveTransfer, isMutating: isApproving } = useSWRMutation(
    'approve-balance-transfer',
    async (_, { arg }: { arg: { id: number; comment?: string } }) => {
      return approveBalanceTransfer(arg.id, arg.comment);
    }
  );

  const { trigger: rejectTransfer, isMutating: isRejecting } = useSWRMutation(
    'reject-balance-transfer',
    async (_, { arg }: { arg: { id: number; comment?: string } }) => {
      return rejectBalanceTransfer(arg.id, arg.comment);
    }
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
      startDate: '',
      endDate: '',
    });
  }, [searchParams, setSearchParams]);

  const handleStatusChange = useCallback((value: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      status: value || undefined,
      page: String(DEFAULT_PAGE),
    });
  }, [searchParams, setSearchParams]);

  const handleApproveClick = useCallback((record: BalanceTransferResponse) => {
    let comment = '';

    modal.confirm({
      title: t('marketing.approveTransfer'),
      content: (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>{t('marketing.transferRequestId')}:</strong> {record.id}</p>
            <p><strong>{t('marketing.transferClientInfo')}:</strong> {record.clientName || t('marketing.transferNoName')} ({record.clientPhone || t('marketing.transferNoPhone')})</p>
            <p><strong>{t('marketing.transferFromCard')}:</strong> {record.fromCardNumber || '-'}</p>
            <p><strong>{t('marketing.transferToCard')}:</strong> {record.toCardNumber || '-'}</p>
            <p><strong>{t('marketing.transferAmount')}:</strong> {record.amount} ₽</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('constants.comment')} ({t('marketing.commentOptional')})
            </label>
            <Input.TextArea
              rows={3}
              placeholder={t('marketing.approvalComment')}
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
          await approveTransfer({ id: record.id, comment: comment.trim() || undefined });
          mutate();
          showToast(t('marketing.transferApproved'), 'success');
        } catch (error) {
          showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        }
      },
    });
  }, [approveTransfer, mutate, showToast, t, isApproving]);

  const handleRejectClick = useCallback((record: BalanceTransferResponse) => {
    let comment = '';

    modal.confirm({
      title: t('marketing.rejectTransfer'),
      content: (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>{t('marketing.transferRequestId')}:</strong> {record.id}</p>
            <p><strong>{t('marketing.transferClientInfo')}:</strong> {record.clientName || t('marketing.transferNoName')} ({record.clientPhone || t('marketing.transferNoPhone')})</p>
            <p><strong>{t('marketing.transferFromCard')}:</strong> {record.fromCardNumber || '-'}</p>
            <p><strong>{t('marketing.transferToCard')}:</strong> {record.toCardNumber || '-'}</p>
            <p><strong>{t('marketing.transferAmount')}:</strong> {record.amount} ₽</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('constants.comment')} ({t('marketing.commentOptional')})
            </label>
            <Input.TextArea
              rows={3}
              placeholder={t('marketing.rejectionComment')}
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
          await rejectTransfer({ id: record.id, comment: comment.trim() || undefined });
          mutate();
          showToast(t('marketing.transferRejected'), 'success');
        } catch (error) {
          showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        }
      },
    });
  }, [rejectTransfer, mutate, showToast, t, isRejecting]);

  const getStatusTag = (status: BalanceTransferStatus) => {
    const statusConfig = {
      [BalanceTransferStatus.PENDING]: { 
        color: 'orange', 
        text: t('marketing.transferStatusPending') 
      },
      [BalanceTransferStatus.APPROVED]: { 
        color: 'green', 
        text: t('marketing.transferStatusApproved') 
      },
      [BalanceTransferStatus.REJECTED]: { 
        color: 'red', 
        text: t('marketing.transferStatusRejected') 
      },
      [BalanceTransferStatus.COMPLETED]: { 
        color: 'blue', 
        text: t('marketing.transferStatusCompleted') 
      },
    };

    return (
      <Tag color={statusConfig[status]?.color || 'default'}>
        {statusConfig[status]?.text || status}
      </Tag>
    );
  };

  const columns = [
    {
      title: t('marketing.transferRequestId'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <span className="font-medium">{id}</span>,
    },
    {
      title: t('marketing.transferClientInfo'),
      key: 'clientInfo',
      width: 200,
      render: (record: BalanceTransferResponse) => (
        <div>
          <div className="font-medium">{record.clientName || t('marketing.transferNoName')}</div>
          <div className="text-sm text-gray-500">{record.clientPhone || t('marketing.transferNoPhone')}</div>
        </div>
      ),
    },
    {
      title: t('marketing.transferFromCard'),
      dataIndex: 'fromCardNumber',
      key: 'fromCardNumber',
      width: 150,
      render: (text: string | null) => text || '-',
    },
    {
      title: t('marketing.transferToCard'),
      dataIndex: 'toCardNumber',
      key: 'toCardNumber',
      width: 150,
      render: (text: string | null) => text || '-',
    },
    {
      title: t('marketing.transferAmount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount: number) => <span className="font-medium">{amount} ₽</span>,
    },
    {
      title: t('marketing.transferComment'),
      dataIndex: 'comment',
      key: 'comment',
      width: 200,
      render: (text: string | null) => text || '-',
    },
    {
      title: t('marketing.transferCreatedAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: t('marketing.transferProcessedAt'),
      dataIndex: 'processedAt',
      key: 'processedAt',
      width: 120,
      render: (date: string | null) => (date ? new Date(date).toLocaleDateString('ru-RU') : '-'),
    },
    {
      title: t('constants.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: BalanceTransferStatus) => getStatusTag(status),
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      width: 150,
      render: (record: BalanceTransferResponse) => (
        <Space>
          {record.status === BalanceTransferStatus.PENDING && (
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
          {record.status !== BalanceTransferStatus.PENDING && (
            <span className="text-gray-400 text-sm">
              {record.status === BalanceTransferStatus.APPROVED && t('marketing.alreadyApproved')}
              {record.status === BalanceTransferStatus.REJECTED && t('marketing.alreadyRejected')}
              {record.status === BalanceTransferStatus.COMPLETED && t('marketing.alreadyCompleted')}
            </span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="ml-12 md:ml-0 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.balanceTransferRequests')}
          </span>
        </div>
      </div>

      <GeneralFilters
        count={pagination?.total || 0}
        display={['count']}
        onReset={handleResetFilters}
      >
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('constants.status')}
          </label>
          <Select
            allowClear
            placeholder="Все статусы"
            className="w-full sm:w-80"
            value={status}
            onChange={handleStatusChange}
            options={[
              { label: 'Все', value: '' },
              { label: t('marketing.transferStatusPending'), value: BalanceTransferStatus.PENDING },
              { label: t('marketing.transferStatusApproved'), value: BalanceTransferStatus.APPROVED },
              { label: t('marketing.transferStatusRejected'), value: BalanceTransferStatus.REJECTED },
              { label: t('marketing.transferStatusCompleted'), value: BalanceTransferStatus.COMPLETED },
            ]}
          />
        </div>
      </GeneralFilters>

      <Table
        columns={columns}
        dataSource={transfers}
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
                  `${range[0]}-${range[1]} / ${total} ${t('marketing.transferRequestsCount')}`,
                onChange: handlePaginationChange,
                onShowSizeChange: handlePaginationChange,
              }
            : false
        }
        scroll={{ x: 1200 }}
      />
    </>
  );
};

export default BalanceTransferRequests;