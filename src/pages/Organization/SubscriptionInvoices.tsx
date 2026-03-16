import React, { useEffect, useState } from 'react';
import { Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import {
  getSubscriptionInvoices,
  type SubscriptionInvoiceResponseDto,
} from '@/services/api/subscription';

const { Text } = Typography;

const SubscriptionInvoices: React.FC = () => {
  const { t } = useTranslation();
  const activeSubscription = useSubscriptionStore(
    state => state.activeSubscription
  );
  const [invoices, setInvoices] = useState<SubscriptionInvoiceResponseDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscriptionId = activeSubscription?.id;
    if (!subscriptionId) {
      setInvoices([]);
      return;
    }

    let cancelled = false;
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const data = await getSubscriptionInvoices(subscriptionId);
        if (!cancelled) {
          setInvoices(data);
        }
      } catch {
        if (!cancelled) {
          setInvoices([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInvoices();

    return () => {
      cancelled = true;
    };
  }, [activeSubscription?.id]);

  if (!activeSubscription) {
    return (
      <Text type="secondary">
        {t('subscriptions.noActiveSubscription') ||
          'No active subscription to show invoices.'}
      </Text>
    );
  }

  const columns: ColumnsType<SubscriptionInvoiceResponseDto> = [
    {
      title: t('subscriptions.invoiceNumber'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: t('subscriptions.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) =>
        `${value.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ₽`,
    },
    {
      title: t('subscriptions.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : '',
    },
    {
      title: t('subscriptions.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : '',
    },
    {
      title: t('subscriptions.status'),
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => t(`subscriptions.${value}`),
    },
    {
      title: t('subscriptions.invoiceLink'),
      dataIndex: 'invoiceLink',
      key: 'invoiceLink',
      render: (value?: string) => {
        if (!value) return null;
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary01 underline"
          >
            {t('subscriptions.openInvoice')}
          </a>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={invoices}
      columns={columns}
      pagination={false}
    />
  );
};

export default SubscriptionInvoices;

