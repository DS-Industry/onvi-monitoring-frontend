import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { mutate } from 'swr';
import { Avatar, Button, Empty, Modal, Progress, Skeleton } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getClientById,
  StatusUser,
  updateClient,
  type ClientLoyaltyStatsResponseDto,
  type GetCardByIdResponse,
  type PersonalPromocodeResponse,
  type UserKeyStatsResponseDto,
} from '@/services/api/marketing';
import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';
import { useToast } from '@/hooks/useToast';
import ClientCardTile from './ClientCardTile';
import ClientCardTileSkeleton from './ClientCardTileSkeleton';
import ClientEditModal from './ClientEditModal';

type CardClient = NonNullable<GetCardByIdResponse['client']>;
type ClientDetail = Awaited<ReturnType<typeof getClientById>>;

type CardProfileSidebarProps = {
  client: CardClient | null;
  clientDetail?: ClientDetail;
  loyaltyStats?: ClientLoyaltyStatsResponseDto;
  keyStats?: UserKeyStatsResponseDto;
  clientCards?: GetCardByIdResponse[];
  promocodes?: PersonalPromocodeResponse[];
  profileLoading?: boolean;
  cardsLoading?: boolean;
  promocodesLoading?: boolean;
  cardId?: number;
  onNavigateTab?: (tab: 'cards' | 'promocodes') => void;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatDate(value?: Date | string | null): string {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD.MM.YYYY') : '—';
}

function formatPromoDiscount(
  t: (key: string, options?: Record<string, unknown>) => string,
  promo: PersonalPromocodeResponse
): string {
  if (promo.discountValue == null || !promo.discountType) {
    return promo.createdReason || '—';
  }
  if (promo.discountType === 'PERCENTAGE') {
    return t('marketing.promoDiscountPercent', { value: promo.discountValue });
  }
  if (promo.discountType === 'FIXED_AMOUNT') {
    return t('marketing.promoDiscountFixed', { value: promo.discountValue });
  }
  return (
    promo.createdReason ||
    t(`tables.${promo.discountType}`, {
      defaultValue: promo.discountType,
    })
  );
}

const ProfileSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col">
    <div className="flex flex-col items-center text-center mb-6">
      <Skeleton.Avatar active size={112} shape="circle" className="mb-4" />
      <Skeleton.Input active style={{ width: 140, minWidth: 0, marginTop: 12 }} />
      <Skeleton.Input
        active
        size="small"
        style={{ width: 100, minWidth: 0, marginTop: 8 }}
      />
    </div>
    <div className="space-y-3 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex justify-between gap-3">
          <Skeleton.Input active size="small" style={{ width: 80, minWidth: 0 }} />
          <Skeleton.Input active size="small" style={{ width: 110, minWidth: 0 }} />
        </div>
      ))}
    </div>
    <div className="flex gap-2 mb-6">
      <Skeleton.Button active block style={{ height: 32 }} />
      <Skeleton.Button active block style={{ height: 32 }} />
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton.Button
          key={i}
          active
          size="small"
          style={{ width: 88, borderRadius: 999 }}
        />
      ))}
    </div>
  </div>
);

const PromoRowSkeleton: React.FC = () => (
  <div className="w-full rounded-xl bg-blue-50 px-4 py-3 space-y-2">
    <Skeleton.Input active size="small" style={{ width: '45%', minWidth: 0 }} />
    <Skeleton.Input active size="small" style={{ width: '70%', minWidth: 0 }} />
    <Skeleton.Input active size="small" style={{ width: '55%', minWidth: 0 }} />
  </div>
);

const CardProfileSidebar: React.FC<CardProfileSidebarProps> = ({
  client,
  clientDetail,
  loyaltyStats,
  keyStats,
  clientCards,
  promocodes,
  profileLoading = false,
  cardsLoading = false,
  promocodesLoading = false,
  cardId,
  onNavigateTab,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const userPermissions = usePermissions();
  const [modal, contextHolder] = Modal.useModal();
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const clientId = clientDetail?.id;
  const canUpdate = hasPermission(
    [
      { action: 'update', subject: 'LTYProgram' },
      { action: 'manage', subject: 'LTYProgram' },
    ],
    userPermissions
  );
  const actionsEnabled = !!clientId && canUpdate;

  const displayName = clientDetail?.name || client?.name || '';
  const displayPhone = clientDetail?.phone || client?.phone || '—';
  const status = clientDetail?.status;
  const cardsCount = clientCards?.length;
  const previewPromos = (promocodes ?? []).slice(0, 2);

  const handleDelete = async () => {
    if (!clientId) {
      showToast(
        t('marketingLoyalty.deleteError') || 'Ошибка удаления клиента',
        'error'
      );
      return;
    }

    setIsDeleting(true);
    try {
      await updateClient({ clientId, status: StatusUser.DELETED });
      showToast(
        t('marketingLoyalty.deleteSuccess') || 'Клиент успешно удален',
        'success'
      );
      await mutate(['get-client-by-id', clientId]);
      navigate('/marketing/cards', { replace: true });
    } catch (error) {
      console.error('Delete failed:', error);
      showToast(
        t('marketingLoyalty.deleteError') || 'Ошибка удаления клиента',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const showDeleteConfirm = () => {
    if (!actionsEnabled) return;

    modal.confirm({
      title: t('marketingLoyalty.confirmDelete'),
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: t('marketingLoyalty.confirmDeleteMessage'),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      centered: true,
      zIndex: 100000,
      async onOk() {
        await handleDelete();
      },
      okButtonProps: {
        loading: isDeleting,
        disabled: isDeleting,
      },
    });
  };

  const progressPercent = useMemo(() => {
    if (!loyaltyStats) return 0;
    if (loyaltyStats.amountToNextTier <= 0) return 100;
    return Math.min(
      Math.round(
        (loyaltyStats.accumulatedAmount / loyaltyStats.amountToNextTier) * 100
      ),
      100
    );
  }, [loyaltyStats]);

  const progressLabel = useMemo(() => {
    if (!loyaltyStats) return t('marketing.cardStubProgress');
    const tier = loyaltyStats.nextTierName || t('marketing.level');
    return t('marketing.percentToTier', {
      percent: progressPercent,
      tier,
    });
  }, [loyaltyStats, progressPercent, t]);

  const clientSince = formatDate(
    keyStats?.firstOrderDate ?? clientDetail?.createdAt ?? null
  );
  const lastVisit = formatDate(keyStats?.lastOrderDate ?? null);
  const level = loyaltyStats?.currentTierName || '—';

  const statusLabel = status
    ? t(`tables.${status}`, { defaultValue: status })
    : t('marketing.active');
  const isActive = !status || status === StatusUser.ACTIVE;

  const pills = useMemo(
    () => [
      { key: 'cars', label: t('marketing.cardStubCars') },
      { key: 'account', label: t('marketing.cardStubAccount') },
      {
        key: 'orders',
        label:
          keyStats?.totalOrdersCount != null
            ? t('marketing.cardStubOrdersCount', {
                count: keyStats.totalOrdersCount,
              })
            : t('marketing.cardStubOrders'),
      },
      {
        key: 'cards',
        label:
          cardsCount != null
            ? t('marketing.cardStubCardsCount', { count: cardsCount })
            : t('marketing.cardStubCards'),
      },
      { key: 'giftCards', label: t('marketing.cardStubGiftCards') },
      { key: 'refusals', label: t('marketing.cardStubRefusals') },
      { key: 'loyalty', label: t('marketing.cardStubLoyalty') },
    ],
    [t, cardsCount, keyStats?.totalOrdersCount]
  );

  if (!client && !clientDetail && !profileLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 h-full">
        <Empty description={t('marketing.noClientAttached')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contextHolder}
      {clientId != null && (
        <ClientEditModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          clientId={clientId}
          cardId={cardId}
          initial={clientDetail}
        />
      )}
      {profileLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <Progress
                type="circle"
                percent={progressPercent}
                size={112}
                strokeWidth={6}
                strokeColor="#0B68E1"
                trailColor="#e5e7eb"
                format={() => (
                  <Avatar
                    size={88}
                    className="bg-lime-400 text-white text-2xl font-semibold"
                  >
                    {getInitials(displayName)}
                  </Avatar>
                )}
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-900 px-2 py-0.5 text-[10px] text-white">
                {progressLabel}
              </div>
            </div>
            <div className="text-xl font-semibold text-text01">{displayName}</div>
            <div
              className={`mt-1 text-sm ${isActive ? 'text-green-600' : 'text-text02'}`}
            >
              • {statusLabel}
            </div>
          </div>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between gap-3">
              <span className="text-text02">{t('marketing.clientPhone')}</span>
              <span className="text-text01 text-right">{displayPhone}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text02">{t('marketing.clientSince')}</span>
              <span className="text-text01">{clientSince}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text02">{t('marketing.level')}</span>
              <span className="text-text01 text-right">{level}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text02">{t('marketing.lastVisit')}</span>
              <span className="text-text01">{lastVisit}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              type="primary"
              className="flex-1"
              disabled={!actionsEnabled}
              onClick={() => setEditOpen(true)}
            >
              {t('actions.edit')}
            </Button>
            <Button
              danger
              className="flex-1"
              disabled={!actionsEnabled}
              loading={isDeleting}
              onClick={showDeleteConfirm}
            >
              {t('actions.delete')}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {pills.map(pill => (
              <span
                key={pill.key}
                className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs text-text02 bg-gray-50"
              >
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
        <div className="text-base font-semibold text-text01 mb-3">
          {t('marketing.clientCards')}
        </div>
        {cardsLoading ? (
          <div className="space-y-3">
            <ClientCardTileSkeleton compact count={2} />
          </div>
        ) : !clientCards?.length ? (
          <div className="text-sm text-text02">{t('table.noData')}</div>
        ) : (
          <div className="space-y-3">
            {clientCards.map(item => (
              <ClientCardTile
                key={item.id}
                card={item}
                compact
                onClick={() => onNavigateTab?.('cards')}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="text-base font-semibold text-text01">
            {t('marketing.cardTabPromocodes')}
          </div>
          <button
            type="button"
            className="text-sm text-primary02 hover:underline shrink-0"
            onClick={() => onNavigateTab?.('promocodes')}
          >
            {t('marketing.viewAll')}
          </button>
        </div>
        {promocodesLoading ? (
          <div className="space-y-2">
            <PromoRowSkeleton />
            <PromoRowSkeleton />
          </div>
        ) : !previewPromos.length ? (
          <div className="text-sm text-text02">{t('table.noData')}</div>
        ) : (
          <div className="space-y-2">
            {previewPromos.map(promo => (
              <button
                key={promo.id}
                type="button"
                onClick={() => onNavigateTab?.('promocodes')}
                className="w-full text-left rounded-xl bg-blue-50 px-4 py-3 hover:bg-blue-100/70 transition-colors"
              >
                <div className="font-semibold text-primary02">{promo.code}</div>
                <div className="text-sm text-text01 mt-0.5">
                  {formatPromoDiscount(t, promo)}
                </div>
                <div className="text-xs text-text02 mt-1">
                  {promo.validUntil
                    ? t('marketing.validUntilDate', {
                        date: dayjs(promo.validUntil).format('DD.MM.YYYY'),
                      })
                    : '—'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardProfileSidebar;
