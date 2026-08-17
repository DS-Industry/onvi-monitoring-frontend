import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Empty, Popconfirm, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import useSWR from 'swr';
import {
  getLoyaltyPrograms,
  getLoyaltyProgramOrders,
  updateOrderStatus,
  GetCardByIdResponse,
  OrderItem,
  OrderStatus,
  SignOper,
} from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';
import { useToast } from '@/hooks/useToast';
import { ContractType } from '@/utils/constants';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';

type CardOrdersTabProps = {
  card: GetCardByIdResponse;
};

interface ExpandedRowData {
  id: number;
  operDate: string;
  loadDate: string;
  typeName: string;
  signOper: SignOper | string;
  sum: number;
  comment: string | null;
}

const REFUNDABLE_STATUSES = [
  OrderStatus.COMPLETED,
  OrderStatus.PAYED,
  OrderStatus.POS_PROCESSED,
] as const;

const canRefundOrder = (status: OrderStatus) =>
  REFUNDABLE_STATUSES.includes(status as (typeof REFUNDABLE_STATUSES)[number]);

const CardOrdersTab: React.FC<CardOrdersTabProps> = ({ card }) => {
  const { t } = useTranslation();
  const user = useUser();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [refundingOrderId, setRefundingOrderId] = useState<number | null>(null);
  const [selectedLoyaltyProgram, setSelectedLoyaltyProgram] = useState<
    number | undefined
  >(card.cardTier?.ltyProgramId);

  const currentPage = Number(searchParams.get('ordersPage') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('ordersSize') || DEFAULT_PAGE_SIZE);
  const orderStatusParam = searchParams.get('orderStatus');
  const effectiveOrderStatus =
    orderStatusParam === 'ALL' ? undefined : orderStatusParam || undefined;

  const dateRender = getDateRender();
  const currencyRender = getCurrencyRender();
  const client = card.client;

  const { data: loyaltyProgramsData, isLoading: programsLoading } = useSWR(
    user.organizationId
      ? ['get-loyalty-programs-card-orders', user.organizationId]
      : null,
    () => getLoyaltyPrograms(user.organizationId!),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  useEffect(() => {
    if (card.cardTier?.ltyProgramId) {
      setSelectedLoyaltyProgram(card.cardTier.ltyProgramId);
      return;
    }
    if (loyaltyProgramsData && loyaltyProgramsData.length > 0) {
      setSelectedLoyaltyProgram(
        prev => prev ?? loyaltyProgramsData[0].props.id
      );
    }
  }, [card.cardTier?.ltyProgramId, loyaltyProgramsData]);

  const { data: ordersData, isLoading: ordersLoading, mutate: mutateOrders } =
    useSWR(
      selectedLoyaltyProgram && client?.phone
        ? [
            'card-client-orders',
            selectedLoyaltyProgram,
            client.phone,
            currentPage,
            pageSize,
            effectiveOrderStatus,
          ]
        : null,
      () =>
        getLoyaltyProgramOrders(selectedLoyaltyProgram!, {
          page: currentPage,
          size: pageSize,
          search: client!.phone,
          orderStatus: effectiveOrderStatus,
        }),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
        shouldRetryOnError: false,
      }
    );

  const orderStatusOptions = useMemo(
    () => [
      { label: t('constants.all'), value: 'ALL' },
      {
        label: t('marketingTransactions.statuses.created'),
        value: OrderStatus.CREATED,
      },
      {
        label: t('marketingTransactions.statuses.completed'),
        value: OrderStatus.COMPLETED,
      },
      {
        label: t('marketingTransactions.statuses.canceled'),
        value: OrderStatus.CANCELED,
      },
      {
        label: t('marketingTransactions.statuses.freeProcessing'),
        value: OrderStatus.FREE_PROCESSING,
      },
      {
        label: t('marketingTransactions.statuses.payed'),
        value: OrderStatus.PAYED,
      },
      {
        label: t('marketingTransactions.statuses.failed'),
        value: OrderStatus.FAILED,
      },
      {
        label: t('marketingTransactions.statuses.posProcessed'),
        value: OrderStatus.POS_PROCESSED,
      },
      {
        label: t('marketingTransactions.statuses.paymentProcessing'),
        value: OrderStatus.PAYMENT_PROCESSING,
      },
      {
        label: t('marketingTransactions.statuses.waitingPayment'),
        value: OrderStatus.WAITING_PAYMENT,
      },
      {
        label: t('marketingTransactions.statuses.refunded'),
        value: OrderStatus.REFUNDED,
      },
    ],
    [t]
  );

  const handleOrderStatusChange = (value: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      orderStatus: value === 'ALL' ? 'ALL' : value || undefined,
      ordersPage: String(DEFAULT_PAGE),
    });
    setExpandedRowKeys([]);
  };

  const handlePageChange = (page: number, size: number) => {
    updateSearchParams(searchParams, setSearchParams, {
      ordersPage: String(page),
      ordersSize: String(size),
    });
    setExpandedRowKeys([]);
  };

  const handleRowClick = (record: OrderItem) => {
    if (expandedRowKeys.includes(record.id)) {
      setExpandedRowKeys(expandedRowKeys.filter(id => id !== record.id));
    } else {
      setExpandedRowKeys([...expandedRowKeys, record.id]);
    }
  };

  const handleRefund = async (orderId: number) => {
    if (!selectedLoyaltyProgram) return;
    setRefundingOrderId(orderId);
    try {
      await updateOrderStatus(
        selectedLoyaltyProgram,
        orderId,
        OrderStatus.REFUNDED
      );
      await mutateOrders();
      showToast(t('marketingTransactions.refundSuccess'), 'success');
    } finally {
      setRefundingOrderId(null);
    }
  };

  const translateContractType = (contractType: ContractType): string => {
    switch (contractType) {
      case ContractType.INDIVIDUAL:
        return t('marketingTransactions.contractType.individual');
      case ContractType.CORPORATE:
        return t('marketingTransactions.contractType.corporate');
      default:
        return contractType;
    }
  };

  const translateSignOper = (signOper: SignOper): string => {
    switch (signOper) {
      case SignOper.REPLENISHMENT:
        return t('marketingTransactions.signOper.replenishment');
      case SignOper.DEDUCTION:
        return t('marketingTransactions.signOper.deduction');
      default:
        return signOper;
    }
  };

  const getOrderStatusBadgeColor = (
    status: string
  ): 'error' | 'success' | 'warning' => {
    const s = (status || '').toUpperCase();
    if (['FAILED', 'CANCELED', 'ERROR'].includes(s)) return 'error';
    if (s === 'COMPLETED') return 'success';
    return 'warning';
  };

  const translateOrderStatus = (status: OrderStatus | string): string => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return t('marketingTransactions.statuses.completed');
      case OrderStatus.CREATED:
        return t('marketingTransactions.statuses.created');
      case OrderStatus.CANCELED:
        return t('marketingTransactions.statuses.canceled');
      case OrderStatus.FREE_PROCESSING:
        return t('marketingTransactions.statuses.freeProcessing');
      case OrderStatus.PAYED:
        return t('marketingTransactions.statuses.payed');
      case OrderStatus.FAILED:
        return t('marketingTransactions.statuses.failed');
      case OrderStatus.POS_PROCESSED:
        return t('marketingTransactions.statuses.posProcessed');
      case OrderStatus.PAYMENT_PROCESSING:
        return t('marketingTransactions.statuses.paymentProcessing');
      case OrderStatus.WAITING_PAYMENT:
        return t('marketingTransactions.statuses.waitingPayment');
      case OrderStatus.REFUNDED:
        return t('marketingTransactions.statuses.refunded');
      default:
        return status;
    }
  };

  const getExpandedData = (order: OrderItem): ExpandedRowData[] => {
    if (!order.bonusOpers || order.bonusOpers.length === 0) {
      return [];
    }
    return order.bonusOpers.map(oper => ({
      id: oper.id,
      operDate: dateRender(oper.operDate.toString()),
      loadDate: dateRender(oper.loadDate.toString()),
      typeName: oper.type?.name || '-',
      signOper: oper.type?.signOper || '-',
      sum: oper.sum,
      comment: oper.comment,
    }));
  };

  const mainColumns: ColumnsType<OrderItem> = [
    {
      title: t('marketingTransactions.columns.orderId'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => `#${id}`,
    },
    {
      title: t('marketingTransactions.columns.transactionId'),
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 200,
      render: (transactionId: string | null) => transactionId || '-',
    },
    {
      title: t('marketingTransactions.columns.orderDate'),
      dataIndex: 'orderData',
      key: 'orderData',
      width: 140,
      render: getDateRender(),
    },
    {
      title: t('marketingTransactions.columns.card'),
      key: 'card',
      width: 120,
      render: (_, record) => record.card?.number || '-',
    },
    {
      title: t('marketingTransactions.columns.pos'),
      key: 'pos',
      width: 120,
      render: (_, record) => record.pos?.name || '-',
    },
    {
      title: t('marketingTransactions.columns.device'),
      key: 'device',
      width: 180,
      render: (_, record) => {
        if (!record.device) return '-';
        return (
          <div>
            <div>{record.device.name}</div>
            <div className="text-text02 text-sm">
              {record.device.carWashDeviceType?.name || '-'}
            </div>
          </div>
        );
      },
    },
    {
      title: t('marketingTransactions.columns.platform'),
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
    },
    {
      title: t('marketingTransactions.columns.contractType'),
      dataIndex: 'contractType',
      key: 'contractType',
      width: 120,
      render: (contractType: ContractType) =>
        translateContractType(contractType),
    },
    {
      title: t('marketingTransactions.full'),
      dataIndex: 'sumFull',
      key: 'sumFull',
      width: 120,
      render: (sum: number) => currencyRender(sum),
    },
    {
      title: t('marketingTransactions.real'),
      dataIndex: 'sumReal',
      key: 'sumReal',
      width: 120,
      render: (sum: number) => currencyRender(sum),
    },
    {
      title: t('marketingTransactions.columns.bonuses'),
      key: 'bonuses',
      width: 150,
      render: (_, record) => (
        <div>
          <div>
            {t('marketingTransactions.bonuses')}: {record.sumBonus}
          </div>
          <div>
            {t('marketingTransactions.discount')}:{' '}
            {currencyRender(record.sumDiscount)}
          </div>
          <div>
            {t('marketingTransactions.cashback')}:{' '}
            {currencyRender(record.sumCashback)}
          </div>
        </div>
      ),
    },
    {
      title: t('marketingTransactions.columns.statuses'),
      key: 'statuses',
      width: 150,
      render: (_, record) => (
        <Tag color={getOrderStatusBadgeColor(record.orderStatus)}>
          {translateOrderStatus(record.orderStatus)}
        </Tag>
      ),
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) =>
        canRefundOrder(record.orderStatus) ? (
          <Popconfirm
            title={t('marketingTransactions.confirmRefund')}
            onConfirm={() => handleRefund(record.id)}
            okText={t('marketingTransactions.refund')}
            okType="danger"
            cancelText={t('common.cancel')}
            onCancel={e => e?.stopPropagation()}
          >
            <Button
              danger
              size="small"
              loading={refundingOrderId === record.id}
              onClick={e => e.stopPropagation()}
            >
              {t('marketingTransactions.refund')}
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const expandedColumns: ColumnsType<ExpandedRowData> = [
    {
      title: t('marketingTransactions.expandedColumns.operationId'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('marketingTransactions.expandedColumns.operationDate'),
      dataIndex: 'operDate',
      key: 'operDate',
      width: 140,
    },
    {
      title: t('marketingTransactions.expandedColumns.loadDate'),
      dataIndex: 'loadDate',
      key: 'loadDate',
      width: 140,
    },
    {
      title: t('marketingTransactions.expandedColumns.operationType'),
      dataIndex: 'typeName',
      key: 'typeName',
      width: 120,
    },
    {
      title: t('marketingTransactions.expandedColumns.operationSign'),
      dataIndex: 'signOper',
      key: 'signOper',
      width: 120,
      render: (signOper: SignOper | string) =>
        translateSignOper(signOper as SignOper),
    },
    {
      title: t('marketingTransactions.expandedColumns.amount'),
      dataIndex: 'sum',
      key: 'sum',
      width: 100,
      render: getCurrencyRender(),
    },
    {
      title: t('marketingTransactions.expandedColumns.comment'),
      dataIndex: 'comment',
      key: 'comment',
      width: 200,
      render: (comment: string | null) => comment || '—',
    },
  ];

  const expandedRowRender = (record: OrderItem) => {
    const expandedData = getExpandedData(record);
    if (expandedData.length === 0) {
      return (
        <div style={{ margin: 0, padding: '16px 40px' }}>
          <div className="text-text02 text-center">
            {t('marketingTransactions.noBonusOperations')}
          </div>
        </div>
      );
    }
    return (
      <div style={{ margin: 0, padding: '16px 40px' }}>
        <div className="font-semibold text-text01 mb-2">
          {t('marketingTransactions.bonusOperations')}:
        </div>
        <Table
          columns={expandedColumns}
          dataSource={expandedData}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
        />
      </div>
    );
  };

  if (!client) {
    return (
      <div className="py-10">
        <Empty description={t('marketing.noClientAttached')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-base font-semibold text-text01">
          {t('marketing.orderHistory')}
        </div>
        <Link
          to="/marketing/marketing-transactions"
          className="text-primary02 text-sm hover:underline"
        >
          {t('marketing.goToAllOrders')}
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <div className="text-sm text-text02 mb-1">{t('constants.status')}</div>
          <Select
            allowClear={false}
            className="w-full sm:w-64"
            value={orderStatusParam || 'ALL'}
            onChange={handleOrderStatusChange}
            options={orderStatusOptions}
          />
        </div>
        <div>
          <div className="text-sm text-text02 mb-1">
            {t('marketing.loyaltyProgram')}
          </div>
          <Select
            className="w-full sm:w-64"
            placeholder={t('marketing.selectLoyaltyProgram')}
            value={selectedLoyaltyProgram}
            onChange={value => {
              setSelectedLoyaltyProgram(value);
              setExpandedRowKeys([]);
              updateSearchParams(searchParams, setSearchParams, {
                ordersPage: String(DEFAULT_PAGE),
              });
            }}
            loading={programsLoading}
            options={loyaltyProgramsData?.map(program => ({
              label: program.props.name,
              value: program.props.id,
            }))}
            allowClear
          />
        </div>
      </div>

      {!selectedLoyaltyProgram ? (
        <div className="py-6 text-text02">
          {t('marketing.selectProgramToViewTransactions')}
        </div>
      ) : (
        <Table
          dataSource={
            ordersData?.orders?.map(order => ({ ...order, key: order.id })) ||
            []
          }
          columns={mainColumns}
          rowKey="id"
          loading={ordersLoading}
          locale={{ emptyText: t('table.noData') }}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              if (expanded) {
                setExpandedRowKeys([...expandedRowKeys, record.id]);
              } else {
                setExpandedRowKeys(
                  expandedRowKeys.filter(id => id !== record.id)
                );
              }
            },
            rowExpandable: () => true,
          }}
          onRow={record => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: currentPage,
            pageSize,
            total: ordersData?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t('marketingTransactions.of')} ${total} ${t('marketingTransactions.transactions')}`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
          }}
        />
      )}
    </div>
  );
};

export default CardOrdersTab;
