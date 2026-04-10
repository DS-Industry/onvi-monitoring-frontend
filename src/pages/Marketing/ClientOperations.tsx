import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  CardOperationFeedItemResponseDto,
  getCardOperationsById,
} from '@/services/api/marketing';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

interface ClientOperationsProps {
  cardId?: number;
}

const ClientOperations: React.FC<ClientOperationsProps> = ({ cardId }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('operationsPage') || DEFAULT_PAGE);
  const size = Number(searchParams.get('operationsSize') || DEFAULT_PAGE_SIZE);

  const { data, isLoading } = useSWR(
    cardId ? ['get-card-operations', cardId, page, size] : null,
    () =>
      getCardOperationsById(cardId!, {
        page,
        size,
      }),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  const translateOrderStatus = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return t('marketingTransactions.statuses.completed');
      case 'CREATED':
        return t('marketingTransactions.statuses.created');
      case 'CANCELED':
      case 'CANCELLED':
        return t('marketingTransactions.statuses.canceled');
      case 'FREE_PROCESSING':
        return t('marketingTransactions.statuses.freeProcessing');
      case 'PAYED':
        return t('marketingTransactions.statuses.payed');
      case 'FAILED':
        return t('marketingTransactions.statuses.failed');
      case 'POS_PROCESSED':
        return t('marketingTransactions.statuses.posProcessed');
      case 'PAYMENT_PROCESSING':
        return t('marketingTransactions.statuses.paymentProcessing');
      case 'WAITING_PAYMENT':
        return t('marketingTransactions.statuses.waitingPayment');
      default:
        return t(`tables.${status}`, status);
    }
  };

  const translatePaymentStatus = (status: string | null): string => {
    if (!status) return '-';
    if (status === 'CANCELED') {
      return t('tables.CANCELLED');
    }
    return t(`tables.${status}`, status);
  };

  const columns: ColumnsType<CardOperationFeedItemResponseDto> = [
    {
      title: t('marketing.operationId'),
      key: 'id',
      render: (_, record) => record.id,
      width: 100,
    },
    {
      title: t('marketing.operationType'),
      key: 'kind',
      render: (_, record) => {
        if (record.kind === 'order') {
          return <Tag color="blue">{t('marketing.orderType')}</Tag>;
        }
        return <Tag color="purple">{t('marketing.equiringType')}</Tag>;
      },
      width: 140,
    },
    {
      title: t('marketing.operationDate'),
      key: 'occurredAt',
      render: (_, record) =>
        new Date(record.occurredAt).toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      width: 180,
    },
    {
      title: t('marketing.amount'),
      key: 'amount',
      align: 'right',
      render: (_, record) => {
        if (record.kind === 'order') {
          return record.sumReal.toLocaleString('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        return record.amount.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
      width: 140,
    },
    {
      title: t('marketing.status'),
      key: 'status',
      render: (_, record) => {
        if (record.kind === 'order') {
          return translateOrderStatus(record.orderStatus);
        }
        return translatePaymentStatus(record.paymentStatus);
      },
      width: 160,
    },
    {
      title: t('marketing.reason'),
      key: 'reason',
      render: (_, record) => {
        if (record.kind === 'order') {
          return record.carWashDeviceName || '-';
        }
        return record.reason || '-';
      },
    },
  ];

  return (
    <Table<CardOperationFeedItemResponseDto>
      rowKey={record => `${record.kind}-${record.id}`}
      columns={columns}
      dataSource={data?.items || []}
      loading={isLoading}
      scroll={{ x: 'max-content' }}
      pagination={{
        current: page,
        pageSize: size,
        total: data?.total || 0,
        showSizeChanger: true,
        pageSizeOptions: ALL_PAGE_SIZES,
        onChange: (nextPage, nextSize) =>
          updateSearchParams(searchParams, setSearchParams, {
            operationsPage: String(nextPage),
            operationsSize: String(nextSize),
          }),
      }}
    />
  );
};

export default ClientOperations;
