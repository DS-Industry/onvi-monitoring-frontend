import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Space, message, Modal, Descriptions, Select } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';
import {
  getOrganizationVerificationRequests,
  approveOrganizationVerification,
  declineOrganizationVerification,
  type OrganizationVerificationItem,
  type OrganizationVerificationStatus,
} from '@/services/api/organization';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

const OrganizationRequests: React.FC = () => {
  const { t } = useTranslation();
  const STATUS_OPTIONS: OrganizationVerificationStatus[] = [
    'VERIFICATE',
    'ACTIVE',
    'BLOCKED',
  ];

  const [data, setData] = useState<OrganizationVerificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [status, setStatus] =
    useState<OrganizationVerificationStatus>('VERIFICATE');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] =
    useState<OrganizationVerificationItem | null>(null);

  const fetchData = useCallback(
    async (
      pageValue: number,
      sizeValue: number,
      statusValue: OrganizationVerificationStatus
    ) => {
      setLoading(true);
      try {
        const response = await getOrganizationVerificationRequests({
          page: pageValue,
          size: sizeValue,
          status: statusValue,
        });
        setData(response.data);
        setTotal(response.total);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(page, pageSize, status);
  }, [fetchData, page, pageSize, status]);

  const handleApprove = async (id: number) => {
    setUpdatingId(id);
    try {
      await approveOrganizationVerification(id);
      message.success(
        t('organizations.approveSuccess') || 'Organization approved'
      );
      await fetchData(page, pageSize, status);
    } catch (error) {
      console.error('Failed to approve organization:', error);
      message.error(
        t('organizations.approveError') || 'Failed to approve organization'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecline = async (id: number) => {
    setUpdatingId(id);
    try {
      await declineOrganizationVerification(id);
      message.success(
        t('organizations.declineSuccess') || 'Organization declined'
      );
      await fetchData(page, pageSize, status);
    } catch (error) {
      console.error('Failed to decline organization:', error);
      message.error(
        t('organizations.declineError') || 'Failed to decline organization'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const current = pagination.current ?? DEFAULT_PAGE;
    const size = pagination.pageSize ?? DEFAULT_PAGE_SIZE;
    setPage(current);
    setPageSize(size);
  };

  const handleStatusChange = (value: OrganizationVerificationStatus) => {
    setStatus(value);
    setPage(DEFAULT_PAGE);
  };

  const openDetails = (record: OrganizationVerificationItem) => {
    setSelectedOrg(record);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedOrg(null);
  };

  const columns: ColumnsType<OrganizationVerificationItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('organizations.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('organizations.address'),
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: t('organizations.status'),
      dataIndex: 'organizationStatus',
      key: 'organizationStatus',
      render: (value: string) => t(`tables.${value}`) || value,
    },
    {
      title: t('organizations.type'),
      dataIndex: 'organizationType',
      key: 'organizationType',
      render: (value: string) =>
        value === 'LegalEntity'
          ? t('organizations.legalEntity')
          : value === 'IndividualEntrepreneur'
          ? t('organizations.ip')
          : value,
    },
    {
      title: t('organizations.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : '',
    },
    {
      title: t('organizations.ownerId'),
      dataIndex: 'ownerId',
      key: 'ownerId',
      width: 120,
    },
    {
      title: '',
      key: 'view',
      width: 48,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openDetails(record)}
        />
      ),
    },
  ];

  if (status === 'VERIFICATE') {
    columns.push({
      title: t('subscriptions.actions') || 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const isProcessing = updatingId === record.id;
        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              loading={isProcessing}
              onClick={() => handleApprove(record.id)}
            >
              {t('organizations.approve') || 'Approve'}
            </Button>
            <Button
              danger
              size="small"
              loading={isProcessing}
              onClick={() => handleDecline(record.id)}
            >
              {t('organizations.decline') || 'Decline'}
            </Button>
          </Space>
        );
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="ml-0 flex items-center space-x-2">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.organizationRequests')}
        </span>
      </div>
      <div className="flex justify-end">
        <Select<OrganizationVerificationStatus>
          value={status}
          onChange={handleStatusChange}
          style={{ minWidth: 220 }}
          options={STATUS_OPTIONS.map((item) => ({
            value: item,
            label: t(`tables.${item}`) || item,
          }))}
        />
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ALL_PAGE_SIZES.map(String),
        }}
        onChange={handleTableChange}
      />
      <Modal
        open={detailsOpen}
        onCancel={closeDetails}
        footer={null}
        width={720}
        title={
          selectedOrg
            ? `${selectedOrg.name} (#${selectedOrg.id})`
            : t('organizations.details') || 'Organization details'
        }
      >
        {selectedOrg && (
          <Descriptions
            bordered
            size="small"
            column={2}
            labelStyle={{ width: 180 }}
          >
            <Descriptions.Item label={t('organizations.name')}>
              {selectedOrg.name}
            </Descriptions.Item>
            <Descriptions.Item label={t('organizations.shortName')}>
              {selectedOrg.shortName || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('organizations.address')}>
              {selectedOrg.address}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('organizations.additionalAddress')}
            >
              {selectedOrg.additionalAddress || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('register.phone')}>
              {selectedOrg.phone || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('register.email')}>
              {selectedOrg.email || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('organizations.inn')}>
              {selectedOrg.inn || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('organizations.kpp')}>
              {selectedOrg.kpp || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('organizations.ogrn')}>
              {selectedOrg.ogrn || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('organizations.okpo')}>
              {selectedOrg.okpo || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('createOrganization.details.rateVat')}>
              {selectedOrg.rateVat || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('createOrganization.details.bank')}>
              {selectedOrg.bank || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('createOrganization.details.bik')}>
              {selectedOrg.bik || '—'}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('createOrganization.details.settlementAccount')}
            >
              {selectedOrg.settlementAccount || '—'}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('createOrganization.details.correspondentAccount')}
            >
              {selectedOrg.correspondentAccount || '—'}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('createOrganization.details.addressBank')}
            >
              {selectedOrg.addressBank || '—'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OrganizationRequests;

