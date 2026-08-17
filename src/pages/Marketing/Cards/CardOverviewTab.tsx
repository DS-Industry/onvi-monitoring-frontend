import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { Button, Empty, Skeleton, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getLoyaltyPrograms,
  getLoyaltyProgramOrders,
  getClientNotes,
  GetCardByIdResponse,
  OrderItem,
  SignOper,
  type ClientNote,
} from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getCurrencyRender } from '@/utils/tableUnits';
import ClientActivityPanel from './ClientActivityPanel';
import HorizontalBarList from '@/pages/Pos/Overview/components/HorizontalBarList';
import { cardPageSwr } from './cardPageSwr';

type CardOverviewTabProps = {
  card: GetCardByIdResponse;
  clientId?: number;
  organizationId?: number;
  onNavigateTab?: (
    tab: 'orders' | 'cards' | 'promocodes' | 'activity' | 'notes'
  ) => void;
};

type OverviewStatusFilter = 'ALL' | 'PAYED' | 'PAYMENT_PROCESSING';

const OVERVIEW_ORDERS_SIZE = 5;

const CardOverviewTab: React.FC<CardOverviewTabProps> = ({
  card,
  clientId,
  organizationId,
  onNavigateTab,
}) => {
  const { t } = useTranslation();
  const user = useUser();
  const userPermissions = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const currencyRender = getCurrencyRender();
  const client = card.client;

  const canUpdate = hasPermission(
    [
      { action: 'update', subject: 'LTYProgram' },
      { action: 'manage', subject: 'LTYProgram' },
    ],
    userPermissions
  );

  const [selectedLoyaltyProgram, setSelectedLoyaltyProgram] = useState<
    number | undefined
  >(card.cardTier?.ltyProgramId);

  const statusParam = searchParams.get('overviewOrderStatus');
  const statusFilter: OverviewStatusFilter =
    statusParam === 'PAYED' || statusParam === 'PAYMENT_PROCESSING'
      ? statusParam
      : 'ALL';

  const effectiveOrderStatus =
    statusFilter === 'ALL' ? undefined : statusFilter;

  const { data: loyaltyProgramsData } = useSWR(
    user.organizationId
      ? ['get-loyalty-programs-card-orders', user.organizationId]
      : null,
    () => getLoyaltyPrograms(user.organizationId!),
    { revalidateOnFocus: false, shouldRetryOnError: false }
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

  const { data: ordersData, isLoading: ordersLoading } = useSWR(
    selectedLoyaltyProgram && client?.phone
      ? [
          'card-overview-orders',
          selectedLoyaltyProgram,
          client.phone,
          effectiveOrderStatus ?? 'ALL',
        ]
      : null,
    () =>
      getLoyaltyProgramOrders(selectedLoyaltyProgram!, {
        page: 1,
        size: OVERVIEW_ORDERS_SIZE,
        search: client!.phone,
        orderStatus: effectiveOrderStatus,
      }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
    }
  );

  const { data: notes, isLoading: notesLoading } = useSWR(
    clientId ? ['get-client-notes', clientId] : null,
    ([, id]) => getClientNotes(id),
    cardPageSwr
  );

  const previewNotes = (notes ?? []).slice(0, 3);

  const statusChips: { key: OverviewStatusFilter; label: string }[] = [
    { key: 'ALL', label: t('constants.all') },
    { key: 'PAYED', label: t('marketing.orderStatusPaid') },
    { key: 'PAYMENT_PROCESSING', label: t('marketing.orderStatusProcessing') },
  ];

  const setStatusFilter = (next: OverviewStatusFilter) => {
    updateSearchParams(searchParams, setSearchParams, {
      overviewOrderStatus: next === 'ALL' ? undefined : next,
    });
  };

  const columns: ColumnsType<OrderItem> = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 100,
      },
      {
        title: t('marketing.operationDate'),
        dataIndex: 'orderData',
        key: 'orderData',
        render: (value: string | Date) =>
          value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—',
      },
      {
        title: t('marketing.carWashBranch'),
        key: 'pos',
        render: (_: unknown, record) => (
          <span className="text-primary02">{record.pos?.name || '—'}</span>
        ),
      },
      {
        title: t('marketing.amount'),
        dataIndex: 'sumReal',
        key: 'sumReal',
        render: (value: number) => currencyRender(-Math.abs(value ?? 0)),
      },
      {
        title: t('marketing.cardNumber'),
        key: 'cardNumber',
        render: (_: unknown, record) => record.card?.number || '—',
      },
      {
        title: t('marketing.operationType'),
        key: 'operationType',
        render: (_: unknown, record) => {
          const sign = record.bonusOpers?.[0]?.type?.signOper;
          if (sign === SignOper.DEDUCTION) return t('marketing.decrease');
          if (sign === SignOper.REPLENISHMENT) return t('marketing.topUp');
          return record.bonusOpers?.[0]?.type?.name || '—';
        },
      },
    ],
    [t, currencyRender]
  );

  const pillClass = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm border cursor-pointer transition-colors ${
      active
        ? 'bg-primary02 text-white border-primary02'
        : 'bg-white text-text02 border-gray-200 hover:border-primary02'
    }`;

  if (!client) {
    return <Empty description={t('marketing.noClientAttached')} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-base font-semibold text-text01">
            {t('marketing.orderHistory')}
          </div>
          <button
            type="button"
            className="text-primary02 text-sm hover:underline"
            onClick={() => onNavigateTab?.('orders')}
          >
            {ordersData?.total != null
              ? t('marketing.allOrdersCount', { count: ordersData.total })
              : t('marketing.goToAllOrders')}
          </button>
        </div>

        <div>
          <div className="text-xs font-medium text-text02 uppercase mb-2">
            {t('marketing.filterByOrders')}
          </div>
          <div className="flex flex-wrap gap-2">
            {statusChips.map(chip => (
              <button
                key={chip.key}
                type="button"
                className={pillClass(statusFilter === chip.key)}
                onClick={() => setStatusFilter(chip.key)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {!selectedLoyaltyProgram || ordersLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Table
            dataSource={ordersData?.orders ?? []}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: t('table.noData') }}
            scroll={{ x: 'max-content' }}
            size="middle"
          />
        )}
      </div>

      {clientId ? (
        <ClientActivityPanel
          clientId={clientId}
          organizationId={organizationId}
        />
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="text-base font-semibold text-text01">
              {t('marketing.cardTabNotes')}
            </div>
            {canUpdate && (
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                className="p-0 h-auto"
                onClick={() => onNavigateTab?.('notes')}
              >
                {t('marketing.addNote')}
              </Button>
            )}
          </div>
          {notesLoading && !notes ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : !previewNotes.length ? (
            <Empty description={t('marketing.noNotes')} />
          ) : (
            <div className="space-y-3 flex-1">
              {previewNotes.map((note: ClientNote) => {
                const name = note.author?.name?.trim() || '';
                const surname = note.author?.surname?.trim() || '';
                const author = `${name} ${surname}`.trim() || '—';
                return (
                  <div key={note.id} className="space-y-1">
                    <div className="text-sm text-text01 line-clamp-2 whitespace-pre-wrap">
                      {note.content}
                    </div>
                    <div className="text-xs text-text02">
                      {author}
                      {' · '}
                      {note.createdAt
                        ? dayjs(note.createdAt).format('DD.MM.YYYY HH:mm')
                        : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            type="button"
            className="text-primary02 text-sm hover:underline mt-4 self-start"
            onClick={() => onNavigateTab?.('notes')}
          >
            {t('marketing.allNotes')}
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-base font-semibold text-text01 mb-4">
            {t('marketing.serviceTypes')}
          </div>
          <Empty description={t('marketing.comingSoon')} />
        </div>
        <HorizontalBarList
          title={t('marketing.favoriteCarWash')}
          items={[]}
          emptyText={t('marketing.comingSoon')}
          showBullet
          className="border border-gray-100 shadow-none"
        />
      </div>
    </div>
  );
};

export default CardOverviewTab;
