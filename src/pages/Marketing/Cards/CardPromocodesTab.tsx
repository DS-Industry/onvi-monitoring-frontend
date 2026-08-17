import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Empty,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import dayjs from 'dayjs';
import {
  deletePromocode,
  getPromocodes,
  PersonalPromocodeResponse,
  PromocodeFilterType,
  PromocodeType,
} from '@/services/api/marketing';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { useToast } from '@/components/context/useContext';
import PromoCodeDrawer from '../PromoCodeManagement/PromoCodeDrawer';
import { cardPageSwr } from './cardPageSwr';

type CardPromocodesTabProps = {
  organizationId: number;
  personalUserId?: number;
};

const CardPromocodesTab: React.FC<CardPromocodesTabProps> = ({
  organizationId,
  personalUserId,
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const userPermissions = usePermissions();

  const [promoDrawerOpen, setPromoDrawerOpen] = useState(false);
  const [editingPromo, setEditingPromo] =
    useState<PersonalPromocodeResponse | null>(null);

  const canUpdate = hasPermission(
    [
      { action: 'update', subject: 'LTYProgram' },
      { action: 'manage', subject: 'LTYProgram' },
    ],
    userPermissions
  );

  const currentPage = Number(searchParams.get('promoPage') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('promoSize') || DEFAULT_PAGE_SIZE);

  const { data: promocodesData, isLoading } = useSWR(
    personalUserId
      ? [
        'card-personal-promocodes',
        organizationId,
        personalUserId,
        currentPage,
        pageSize,
      ]
      : null,
    () =>
      getPromocodes({
        organizationId,
        filter: PromocodeFilterType.PERSONAL,
        personalUserId,
        page: currentPage,
        size: pageSize,
      }),
    cardPageSwr
  );

  const { trigger: deletePromoMutation } = useSWRMutation(
    ['delete-promocode'],
    async (_, { arg }: { arg: number }) => {
      return deletePromocode(arg);
    }
  );

  const invalidateCardPromocodes = () => {
    if (!personalUserId) return;
    mutate(
      key =>
        Array.isArray(key) &&
        key[0] === 'card-personal-promocodes' &&
        key[1] === organizationId &&
        key[2] === personalUserId
    );
  };

  const handleCreatePromo = () => {
    setEditingPromo(null);
    setPromoDrawerOpen(true);
  };

  const handleEditPromo = (id: number) => {
    const promo = promocodesData?.data?.find(p => p.id === id);
    if (!promo) {
      message.error(t('common.somethingWentWrong'));
      return;
    }
    setEditingPromo(promo);
    setPromoDrawerOpen(true);
  };

  const handleDeletePromo = async (id: number) => {
    try {
      await deletePromoMutation(id);
      invalidateCardPromocodes();
      showToast(t('success.recordDeleted'), 'success');
    } catch {
      showToast(t('errors.deleteFailed'), 'error');
    }
  };

  const handlePromoDrawerClose = () => {
    setPromoDrawerOpen(false);
    setEditingPromo(null);
  };

  const handlePromoSubmitSuccess = () => {
    invalidateCardPromocodes();
    handlePromoDrawerClose();
  };

  const columns: ColumnsType<PersonalPromocodeResponse> = useMemo(
    () => [
      {
        title: t('marketing.promoCode'),
        dataIndex: 'code',
        key: 'code',
        render: (text: string) => (
          <span className="font-semibold">{text}</span>
        ),
      },
      {
        title: t('marketing.discountType'),
        dataIndex: 'discountType',
        key: 'discountType',
        render: (type: string | null) => {
          if (!type) return '—';
          return t(`tables.${type}`) || type;
        },
      },
      {
        title: t('marketing.discountValue'),
        dataIndex: 'discountValue',
        key: 'discountValue',
        render: (value: number | null, record) => {
          if (value == null) return '—';
          if (record.discountType === 'PERCENTAGE') {
            return `${value}%`;
          }
          return String(value);
        },
      },
      {
        title: t('marketing.usage'),
        key: 'usage',
        render: (_: unknown, record) =>
          `${record.currentUsage ?? 0} / ${record.maxUsage ?? '—'}`,
      },
      {
        title: t('marketing.validFrom'),
        dataIndex: 'validFrom',
        key: 'validFrom',
        render: (date: string) =>
          date ? dayjs(date).format('DD.MM.YYYY') : '—',
      },
      {
        title: t('marketing.validUntil'),
        dataIndex: 'validUntil',
        key: 'validUntil',
        render: (date: string | null) =>
          date ? dayjs(date).format('DD.MM.YYYY') : '—',
      },
      {
        title: t('constants.status'),
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive: boolean) => (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? t('constants.active') : t('constants.inactive')}
          </Tag>
        ),
      },
      {
        title: t('marketing.createdReason'),
        dataIndex: 'createdReason',
        key: 'createdReason',
        render: (reason: string | null) => reason || '—',
      },
      ...(canUpdate
        ? [
          {
            title: t('constants.actions'),
            key: 'actions',
            render: (_: unknown, record: PersonalPromocodeResponse) => {
              const isCampaignPromocode =
                record.promocodeType === PromocodeType.CAMPAIGN;

              return (
                <Space>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditPromo(record.id)}
                  >
                    {t('constants.edit')}
                  </Button>
                  {isCampaignPromocode ? (
                    <Tooltip
                      title={t('marketing.campaignPromocodeDeleteWarning')}
                    >
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        disabled
                      >
                        {t('common.delete')}
                      </Button>
                    </Tooltip>
                  ) : (
                    <Popconfirm
                      title={t('techTasks.confirmDelete')}
                      onConfirm={() => handleDeletePromo(record.id)}
                    >
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        {t('common.delete')}
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              );
            },
          } as const,
        ]
        : []),
    ],
    [t, canUpdate, promocodesData]
  );

  if (!personalUserId) {
    return (
      <div className="py-10">
        <Empty description={t('marketing.noClientAttached')} />
      </div>
    );
  }

  return (
    <>
      {canUpdate && (
        <div className="mb-4 flex justify-end">
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleCreatePromo}
          >
            {t('routes.add')}
          </Button>
        </div>
      )}

      <Table
        dataSource={promocodesData?.data || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        locale={{ emptyText: t('table.noData') }}
        pagination={{
          current: currentPage,
          pageSize,
          total: promocodesData?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ALL_PAGE_SIZES,
          showTotal: (total, range) =>
            `${range[0]}–${range[1]} / ${total}`,
          onChange: (page, size) => {
            updateSearchParams(searchParams, setSearchParams, {
              promoPage: String(page),
              promoSize: String(size),
            });
          },
        }}
        scroll={{ x: 'max-content' }}
      />

      <PromoCodeDrawer
        isOpen={promoDrawerOpen}
        onClose={handlePromoDrawerClose}
        editingPromo={editingPromo}
        organizationId={organizationId}
        lockedPersonalUserId={personalUserId}
        onSuccess={handlePromoSubmitSuccess}
      />
    </>
  );
};

export default CardPromocodesTab;
