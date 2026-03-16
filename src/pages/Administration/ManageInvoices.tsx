import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Switch,
  Typography,
  Space,
  Modal,
  Upload,
  message,
  Popconfirm,
  Button,
} from 'antd';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getOrganizationSubscriptions,
  type OrganizationSubscriptionResponseDto,
} from '@/services/api/subscription';
import type { OrganizationSubscriptionInvoiceShortDto } from '@/services/api/subscription';
import { getPresignedUploadUrl, uploadFileToS3 } from '@/services/api/s3';
import {
  createSubscriptionInvoice,
  deleteSubscriptionInvoice,
  approveSubscriptionInvoice,
} from '@/services/api/subscription';

const { Text } = Typography;

const ManageInvoices: React.FC = () => {
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState<
    OrganizationSubscriptionResponseDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<OrganizationSubscriptionResponseDto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const refetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await getOrganizationSubscriptions({ overdue: overdueOnly });
      setSubscriptions(data);
    } catch {
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    try {
      await deleteSubscriptionInvoice(invoiceId);
      message.success(t('subscriptions.invoiceDeleted'));
      await refetchSubscriptions();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      message.error(
        t('subscriptions.invoiceDeleteError')
      );
    }
  };

  const handleApproveInvoice = async (invoiceId: number) => {
    setApprovingId(invoiceId);
    try {
      await approveSubscriptionInvoice(invoiceId);
      message.success(
        t('subscriptions.invoiceApproved')
      );
      await refetchSubscriptions();
    } catch (error) {
      console.error('Failed to approve invoice:', error);
      message.error(
        t('subscriptions.invoiceApproveError')
      );
    } finally {
      setApprovingId(null);
    }
  };

  const invoiceColumns: ColumnsType<OrganizationSubscriptionInvoiceShortDto> = [
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
      title: t('subscriptions.status'),
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => t(`subscriptions.${value}`),
    },
    {
      title: t('subscriptions.invoiceLink'),
      dataIndex: 'invoiceLink',
      key: 'invoiceLink',
      render: (value?: string | null) => {
        if (!value) return null;
        const base = import.meta.env.VITE_S3_CLOUD || '';
        const href =
          value.startsWith('http://') || value.startsWith('https://')
            ? value
            : base
              ? `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
              : value;
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="text-primary01 underline"
          >
            {t('subscriptions.openInvoice')}
          </a>
        );
      },
    },
    {
      title: t('subscriptions.actions'),
      key: 'invoiceActions',
      width: 140,
      render: (_, record) => {
        const statusUpper = record.status?.toUpperCase() ?? '';
        const isPaid = statusUpper === 'PAID';
        const isDraft = statusUpper === 'DRAFT';

        if (record.id == null) return null;

        return (
          <Space size="small">
            {!isPaid && (
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                loading={approvingId === record.id}
                onClick={() => handleApproveInvoice(record.id!)}
                aria-label={t('subscriptions.approveInvoice')}
              >
                {t('subscriptions.approveInvoice')}
              </Button>
            )}
            {isDraft && (
              <Popconfirm
                title={
                  t('subscriptions.deleteInvoiceConfirm')
                }
                onConfirm={() => handleDeleteInvoice(record.id!)}
                okText={t('actions.delete')}
                cancelText={t('actions.cancel')}
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  aria-label={t('actions.delete')}
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    let cancelled = false;

    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const data = await getOrganizationSubscriptions({
          overdue: overdueOnly,
        });
        if (!cancelled) {
          setSubscriptions(data);
        }
      } catch {
        if (!cancelled) {
          setSubscriptions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSubscriptions();

    return () => {
      cancelled = true;
    };
  }, [overdueOnly]);

  const columns: ColumnsType<OrganizationSubscriptionResponseDto> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('subscriptionRequests.organizationId'),
      dataIndex: 'organizationId',
      key: 'organizationId',
      width: 140,
    },
    {
      title: t('subscriptionRequests.planCode'),
      dataIndex: 'planName',
      key: 'planName',
    },
    {
      title: t('subscriptionRequests.onviFeature'),
      dataIndex: 'onviFeature',
      key: 'onviFeature',
      width: 100,
      render: (value: boolean) =>
        value ? t('common.yes') : t('common.no'),
    },
    {
      title: t('subscriptionRequests.corporateClientsFeature') || 'Corporate',
      dataIndex: 'corporateClientsFeature',
      key: 'corporateClientsFeature',
      width: 120,
      render: (value: boolean) =>
        value ? t('common.yes') : t('common.no'),
    },
    {
      title: t('subscriptions.dueDate'),
      dataIndex: 'nextBillingAt',
      key: 'nextBillingAt',
      width: 150,
      render: (value: string | null) =>
        value ? new Date(value).toLocaleDateString() : '',
    },
    {
      title: t('subscriptions.status'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: string) => value,
    },
    {
      title: t('subscriptions.actions'),
      key: 'actions',
      width: 160,
      render: (_, record) => {
        if (!overdueOnly) return null;


        const hasNonPaidInvoice =
          record.invoices &&
          record.invoices.some(
            inv => inv.status && inv.status.toUpperCase() !== 'PAID' && inv.status.toUpperCase() !== 'CANCELLED'
          );

        if (hasNonPaidInvoice) return null;

        return (
          <button
            type="button"
            className="px-3 py-1 rounded-md bg-primary01 text-black text-sm font-medium hover:opacity-90"
            onClick={() => {
              setSelectedSubscription(record);
              setIsModalOpen(true);
              setFile(null);
            }}
          >
            {t('subscriptions.createInvoice')}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="ml-0 flex items-center justify-between">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.invoices')}
        </span>
        <Space align="center">
          <Text>{t('subscriptions.needsInvoice')}</Text>
          <Switch
            checked={overdueOnly}
            onChange={setOverdueOnly}
            size="small"
          />
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={subscriptions}
        columns={columns}
        expandable={{
          expandedRowRender: record => (
            <Table
              rowKey="invoiceNumber"
              dataSource={record.invoices || []}
              columns={invoiceColumns}
              pagination={false}
              size="small"
            />
          ),
          rowExpandable: record => !!record.invoices && record.invoices.length > 0,
        }}
        pagination={false}
      />
      <Modal
        open={isModalOpen}
        title={t('subscriptions.uploadInvoice')}
        onCancel={() => {
          if (uploading) return;
          setIsModalOpen(false);
          setSelectedSubscription(null);
          setFile(null);
        }}
        onOk={async () => {
          if (!selectedSubscription || !file) {
            message.error(
              t('subscriptions.selectInvoiceFile')
            );
            return;
          }
          setUploading(true);
          try {
            const timestamp = Date.now();
            const key = `invoices/${selectedSubscription.id}/${timestamp}-${file.name}`;
            const { url } = await getPresignedUploadUrl(key);
            await uploadFileToS3(file, url);
            const invoiceLink = `${import.meta.env.VITE_S3_CLOUD}/${key}`;
            await createSubscriptionInvoice(selectedSubscription.id, {
              invoiceLink,
            });
            message.success(
              t('subscriptions.invoiceCreated')
            );
            setIsModalOpen(false);
            setSelectedSubscription(null);
            setFile(null);
            await refetchSubscriptions();
          } catch (error) {
            console.error('Failed to create invoice:', error);
            message.error(
              t('subscriptions.invoiceCreateError')
            );
          } finally {
            setUploading(false);
          }
        }}
        okButtonProps={{ loading: uploading, disabled: !file }}
      >
        <Upload
          maxCount={1}
          beforeUpload={f => {
            setFile(f);
            return false;
          }}
          fileList={file ? [file as any] : []}
          onRemove={() => {
            setFile(null);
          }}
        >
          <button
            type="button"
            className="px-3 py-1 rounded-md bg-background03 text-text01 text-sm font-medium hover:opacity-90"
          >
            {t('subscriptions.selectFile')}
          </button>
        </Upload>
      </Modal>
    </div>
  );
};

export default ManageInvoices;

