import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Button, Empty, Popconfirm, Table, Tag, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import useSWR from 'swr';
import {
  getCardOperationsById,
  CardOperationOrderResponseDto,
  CardOperationEquaringResponseDto,
  updateOrderStatus,
  OrderStatus,
  GetCardByIdResponse,
} from '@/services/api/marketing';
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
  clientCards?: GetCardByIdResponse[];
  clientId?: number;
  loyaltyProgramId?: number;
};

type UnifiedRow = {
  key: string;
  kind: 'order' | 'equaring';
  orderId?: number;
  transactionId?: string | null;
  orderData?: Date;
  cardNumber?: string;
  posName?: string;
  deviceName?: string;
  deviceTypeName?: string;
  platform?: string;
  contractType?: ContractType;
  sumFull?: number;
  sumReal?: number;
  sumBonus?: number;
  sumDiscount?: number;
  sumCashback?: number;
  orderStatus?: OrderStatus;
  equaringId?: number;
  occurredAt?: Date;
  equaringType?: string;
  source?: string;
  amount?: number;
  balanceSnapshot?: number | null;
  currency?: string;
  paymentProvider?: string;
  providerPaymentId?: string | null;
  paymentStatus?: string | null;
  reason?: string | null;
  initiatedByUserName?: string | null;
  canRefund?: boolean;
};

const REFUNDABLE_STATUSES = [
  OrderStatus.COMPLETED,
  OrderStatus.PAYED,
  OrderStatus.POS_PROCESSED,
];

const canRefundOrder = (status: OrderStatus) =>
  REFUNDABLE_STATUSES.includes(status as any);

const CardOrdersTab: React.FC<CardOrdersTabProps> = ({
  card,
  clientCards = [],
  loyaltyProgramId,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('ordersPage') || DEFAULT_PAGE);
  const size = Number(searchParams.get('ordersSize') || DEFAULT_PAGE_SIZE);

  const filteredCards = useMemo(() => {
    if (!clientCards || clientCards.length === 0) {
      return [card];
    }
    if (!loyaltyProgramId) {
      return clientCards;
    }
    return clientCards.filter(
      (c) => c.cardTier?.ltyProgramId === loyaltyProgramId
    );
  }, [clientCards, loyaltyProgramId, card]);

  const defaultCardId = useMemo(() => {
    if (filteredCards.length === 0) return card.id;
    const found = filteredCards.find((c) => c.id === card.id);
    return found ? card.id : filteredCards[0].id;
  }, [filteredCards, card]);

  const [selectedCardId, setSelectedCardId] = useState<number>(defaultCardId);
  const [refundingOrderId, setRefundingOrderId] = useState<number | null>(null);

  const dateRender = getDateRender();
  const currencyRender = getCurrencyRender();

  const { data, isLoading, mutate } = useSWR(
    selectedCardId ? ['card-operations', selectedCardId, page, size] : null,
    () =>
      getCardOperationsById(selectedCardId, {
        page,
        size,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const unifiedData: UnifiedRow[] = (data?.items || []).map((item) => {
    if (item.kind === 'order') {
      const order = item as CardOperationOrderResponseDto;
      return {
        key: `order-${order.id}`,
        kind: 'order',
        orderId: order.id,
        transactionId: order.transactionId,
        orderData: order.occurredAt,
        cardNumber: card.number,
        posName: order.carWashPosName || '-',
        deviceName: order.carWashDeviceName || '-',
        platform: order.platform,
        contractType: order.contractType as ContractType,
        sumFull: order.sumFull,
        sumReal: order.sumReal,
        sumBonus: order.sumBonus,
        sumDiscount: order.sumDiscount,
        sumCashback: order.sumCashback,
        orderStatus: order.orderStatus as OrderStatus,
        canRefund: canRefundOrder(order.orderStatus as OrderStatus),
      };
    } else {
      const equaring = item as CardOperationEquaringResponseDto;
      return {
        key: `equaring-${equaring.id}`,
        kind: 'equaring',
        equaringId: equaring.id,
        occurredAt: equaring.occurredAt,
        equaringType: equaring.type,
        source: equaring.source,
        amount: equaring.amount,
        balanceSnapshot: equaring.balanceSnapshot,
        currency: equaring.currency,
        paymentProvider: equaring.paymentProvider,
        providerPaymentId: equaring.providerPaymentId,
        paymentStatus: equaring.paymentStatus,
        reason: equaring.reason,
        initiatedByUserName: equaring.initiatedByUserName,
        cardNumber: card.number,
        canRefund: false,
      };
    }
  });

  const handleRefund = useCallback(
    async (orderId: number) => {
      const programId = card.cardTier?.ltyProgramId;
      if (!programId) {
        showToast(t('marketing.noLoyaltyProgram'), 'error');
        return;
      }
      setRefundingOrderId(orderId);
      try {
        await updateOrderStatus(programId, orderId, OrderStatus.REFUNDED);
        await mutate();
        showToast(t('marketingTransactions.refundSuccess'), 'success');
      } catch (e) {
        showToast(t('marketingTransactions.refundError'), 'error');
      } finally {
        setRefundingOrderId(null);
      }
    },
    [card.cardTier?.ltyProgramId, mutate, showToast, t]
  );

  const handleCardChange = useCallback(
    (value: number) => {
      setSelectedCardId(value);
      updateSearchParams(searchParams, setSearchParams, {
        ordersPage: String(DEFAULT_PAGE),
        ordersSize: String(size),
      });
    },
    [searchParams, setSearchParams, size]
  );

  const handlePageChange = useCallback(
    (page: number, size: number) => {
      updateSearchParams(searchParams, setSearchParams, {
        ordersPage: String(page),
        ordersSize: String(size),
      });
    },
    [searchParams, setSearchParams]
  );

  const cardOptions = useMemo(() => {
    if (filteredCards.length === 0) {
      return [{ label: card.number, value: card.id }];
    }
    return filteredCards.map((c) => ({
      label: `${c.number}${c.cardTier ? ` (${c.cardTier.name})` : ''}`,
      value: c.id,
    }));
  }, [filteredCards, card]);

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

  const translatePaymentStatus = (status: string | null | undefined): string => {
    if (!status) return '-';
    return t(`tables.${status}`, status);
  };

  const getOrderStatusBadgeColor = (status: string): 'error' | 'success' | 'warning' => {
    const s = (status || '').toUpperCase();
    if (['FAILED', 'CANCELED', 'ERROR'].includes(s)) return 'error';
    if (s === 'COMPLETED') return 'success';
    return 'warning';
  };

  const columns: ColumnsType<UnifiedRow> = [
    {
      title: t('marketingTransactions.columns.type'),
      key: 'kind',
      width: 100,
      render: (_, record) => (
        <Tag color={record.kind === 'order' ? 'blue' : 'purple'}>
          {record.kind === 'order'
            ? t('marketing.orderType')
            : t('marketing.equiringType')}
        </Tag>
      ),
    },
    {
      title: t('marketingTransactions.columns.orderId'),
      key: 'id',
      width: 100,
      render: (_, record) => {
        if (record.kind === 'order') return `#${record.orderId}`;
        return `#${record.equaringId}`;
      },
    },
    {
      title: t('marketingTransactions.columns.transactionId'),
      key: 'transactionId',
      width: 200,
      render: (_, record) =>
        record.kind === 'order' ? record.transactionId || '-' : '-',
    },
    {
      title: t('marketingTransactions.columns.orderDate'),
      key: 'occurredAt',
      width: 160,
      render: (_, record) => {
        const date = record.kind === 'order' ? record.orderData : record.occurredAt;
        return date ? dateRender(date.toString()) : '-';
      },
    },
    {
      title: t('marketingTransactions.columns.client'),
      key: 'client',
      width: 180,
      render: (_, record) => {
        if (record.kind === 'order') {
          return card.client?.name || '-';
        }
        return record.initiatedByUserName || '-';
      },
    },
    {
      title: t('marketingTransactions.columns.card'),
      key: 'card',
      width: 120,
      render: () => card.number || '-',
    },
    {
      title: t('marketingTransactions.columns.pos'),
      key: 'pos',
      width: 120,
      render: (_, record) => (record.kind === 'order' ? record.posName || '-' : '-'),
    },
    {
      title: t('marketingTransactions.columns.device'),
      key: 'device',
      width: 180,
      render: (_, record) => {
        if (record.kind === 'order') {
          return (
            <div>
              <div>{record.deviceName}</div>
              <div className="text-text02 text-sm">
                {record.deviceTypeName || '-'}
              </div>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: t('marketingTransactions.columns.platform'),
      key: 'platform',
      width: 100,
      render: (_, record) => (record.kind === 'order' ? record.platform || '-' : '-'),
    },
    {
      title: t('marketingTransactions.columns.contractType'),
      key: 'contractType',
      width: 120,
      render: (_, record) =>
        record.kind === 'order' && record.contractType
          ? translateContractType(record.contractType)
          : '-',
    },
    {
      title: t('marketingTransactions.full'),
      key: 'sumFull',
      width: 120,
      align: 'right',
      render: (_, record) => {
        if (record.kind === 'order') return currencyRender(record.sumFull || 0);
        return currencyRender(record.amount || 0);
      },
    },
    {
      title: t('marketingTransactions.real'),
      key: 'sumReal',
      width: 120,
      align: 'right',
      render: (_, record) =>
        record.kind === 'order' ? currencyRender(record.sumReal || 0) : '-',
    },
    {
      title: t('marketingTransactions.columns.bonuses'),
      key: 'bonuses',
      width: 150,
      render: (_, record) => {
        if (record.kind === 'order') {
          return (
            <div>
              <div>{t('marketingTransactions.bonuses')}: {record.sumBonus ?? 0}</div>
              <div>{t('marketingTransactions.discount')}: {currencyRender(record.sumDiscount || 0)}</div>
              <div>{t('marketingTransactions.cashback')}: {currencyRender(record.sumCashback || 0)}</div>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: t('marketingTransactions.columns.statuses'),
      key: 'status',
      width: 160,
      render: (_, record) => {
        if (record.kind === 'order') {
          return (
            <Tag color={getOrderStatusBadgeColor(record.orderStatus || '')}>
              {translateOrderStatus(record.orderStatus || '')}
            </Tag>
          );
        }
        return (
          <Tag color={record.paymentStatus === 'COMPLETED' ? 'success' : 'warning'}>
            {translatePaymentStatus(record.paymentStatus)}
          </Tag>
        );
      },
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => {
        if (record.kind === 'order' && record.canRefund && record.orderId) {
          return (
            <Popconfirm
              title={t('marketingTransactions.confirmRefund')}
              onConfirm={() => handleRefund(record.orderId!)}
              okText={t('marketingTransactions.refund')}
              okType="danger"
              cancelText={t('common.cancel')}
            >
              <Button
                danger
                size="small"
                loading={refundingOrderId === record.orderId}
                onClick={(e) => e.stopPropagation()}
              >
                {t('marketingTransactions.refund')}
              </Button>
            </Popconfirm>
          );
        }
        return null;
      },
    },
  ];

  if (!card.client) {
    return (
      <div className="py-10">
        <Empty description={t('marketing.noClientAttached')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text02">{t('marketing.selectCard')}</span>
          <Select
            className="w-64"
            value={selectedCardId}
            onChange={handleCardChange}
            options={cardOptions}
            loading={false}
          />
        </div>
      </div>

      <Table<UnifiedRow>
        dataSource={unifiedData}
        columns={columns}
        rowKey="key"
        loading={isLoading}
        locale={{ emptyText: t('table.noData') }}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize: size,
          total: data?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ALL_PAGE_SIZES,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} ${t('marketingTransactions.of')} ${total} ${t('marketingTransactions.transactions')}`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
        }}
      />
    </div>
  );
};

export default CardOrdersTab;
