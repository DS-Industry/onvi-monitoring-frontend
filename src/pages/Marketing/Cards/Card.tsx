import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  getCardById,
  getClientById,
  getClientCards,
  getClientLoyaltyStats,
  getPromocodes,
  getUserKeyStatsByOrganizationId,
  PromocodeFilterType,
} from '@/services/api/marketing';
import { Spin, Typography, Empty } from 'antd';
import { DoubleLeftOutlined } from '@ant-design/icons';
import GenericTabs from '@/components/ui/Tabs/GenericTab';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useUser } from '@/hooks/useUserStore';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { cardPageSwr } from './cardPageSwr';
import CardProfileSidebar from './CardProfileSidebar';
import CardNotesTab from './CardNotesTab';
import CardPromocodesTab from './CardPromocodesTab';
import CardOrdersTab from './CardOrdersTab';
import CardClientCardsTab from './CardClientCardsTab';
import CardActivityTab from './CardActivityTab';
import CardOverviewTab from './CardOverviewTab';

const { Text } = Typography;

type CardTab =
  | 'overview'
  | 'orders'
  | 'cards'
  | 'activity'
  | 'promocodes'
  | 'notes';

const Card: React.FC = () => {
  const { t } = useTranslation();
  const { cardId: cardIdParam } = useParams<{ cardId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useUser();

  const cardId = cardIdParam ? Number(cardIdParam) : undefined;
  const fromOrders = searchParams.get('from') === 'orders';
  const activeTab = (searchParams.get('tab') as CardTab) || 'overview';
  const loyaltyProgramParam = searchParams.get('loyaltyProgram')
    ? Number(searchParams.get('loyaltyProgram'))
    : undefined;

  const { data: card, isLoading: cardLoading } = useSWR(
    cardId ? ['get-card-by-id', cardId] : null,
    ([, id]) => getCardById(id),
    cardPageSwr
  );

  const clientId = card?.client?.id;

  const { data: clientDetail, isLoading: clientLoading } = useSWR(
    clientId ? ['get-client-by-id', clientId] : null,
    ([, id]) => getClientById(id),
    cardPageSwr
  );

  const { data: loyaltyStats, isLoading: loyaltyLoading } = useSWR(
    clientId && user.organizationId
      ? ['get-client-loyalty-stats', clientId]
      : null,
    () =>
      getClientLoyaltyStats({
        clientId: clientId!,
        organizationId: user.organizationId!,
      }),
    cardPageSwr
  );

  const { data: keyStats, isLoading: keyStatsLoading } = useSWR(
    clientId && user.organizationId
      ? ['user-key-stats', user.organizationId, clientId]
      : null,
    () =>
      getUserKeyStatsByOrganizationId({
        clientId: clientId!,
        organizationId: user.organizationId!,
      }),
    cardPageSwr
  );

  const { data: clientCards, isLoading: cardsLoading } = useSWR(
    clientId ? ['get-client-cards', clientId] : null,
    ([, id]) => getClientCards(id),
    cardPageSwr
  );

  const { data: promocodesData, isLoading: promocodesLoading } = useSWR(
    clientId && user.organizationId
      ? [
          'card-personal-promocodes',
          user.organizationId,
          clientId,
          DEFAULT_PAGE,
          DEFAULT_PAGE_SIZE,
        ]
      : null,
    () =>
      getPromocodes({
        organizationId: user.organizationId!,
        filter: PromocodeFilterType.PERSONAL,
        personalUserId: clientId,
        page: DEFAULT_PAGE,
        size: DEFAULT_PAGE_SIZE,
      }),
    cardPageSwr
  );

  const profileLoading =
    !!clientId &&
    (clientLoading || loyaltyLoading || keyStatsLoading) &&
    (!clientDetail || !loyaltyStats || !keyStats);

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, { tab: key });
  };

  const handleNavigateTab = (
    tab: 'orders' | 'cards' | 'promocodes' | 'activity' | 'notes'
  ) => {
    handleTabChange(tab);
  };

  const tabLabels = useMemo(
    () => [
      { key: 'overview', label: t('marketing.cardTabOverview') },
      { key: 'orders', label: t('marketing.cardTabOrders') },
      { key: 'cards', label: t('marketing.cardTabCards') },
      { key: 'activity', label: t('marketing.cardTabActivity') },
      { key: 'promocodes', label: t('marketing.cardTabPromocodes') },
      { key: 'notes', label: t('marketing.cardTabNotes') },
    ],
    [t]
  );

  if (cardLoading && !card) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!card || !cardId) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <Text>{t('marketing.cardNotFound') || 'Card not found'}</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('login.back')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary02 bg-white text-primary02 hover:bg-blue-50 transition-colors"
          onClick={() =>
            navigate(
              fromOrders
                ? '/marketing/marketing-transactions'
                : '/marketing/cards'
            )
          }
        >
          <DoubleLeftOutlined className="text-base" />
        </button>
        <h1 className="font-semibold text-text01 text-2xl sm:text-3xl m-0">
          {t('routes.clients')}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <CardProfileSidebar
            cardId={cardId}
            client={card.client ?? null}
            clientDetail={clientDetail}
            loyaltyStats={loyaltyStats}
            keyStats={keyStats}
            clientCards={clientCards}
            promocodes={promocodesData?.data}
            profileLoading={profileLoading}
            cardsLoading={!!clientId && cardsLoading}
            promocodesLoading={
              !!clientId && !!user.organizationId && promocodesLoading
            }
            onNavigateTab={handleNavigateTab}
            loyaltyProgramId={loyaltyProgramParam}
          />
        </div>

        <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
          <GenericTabs
            tabs={tabLabels}
            activeKey={activeTab}
            onChange={handleTabChange}
            tabBarGutter={24}
            tabBarStyle={{ marginBottom: 24 }}
            type="line"
            size="middle"
            tabBarOnly
          />

          <div>
            {activeTab === 'overview' && (
              <CardOverviewTab
                card={card}
                clientId={clientId}
                organizationId={user.organizationId}
                onNavigateTab={handleNavigateTab}
              />
            )}
            {activeTab === 'orders' && (
              <CardOrdersTab
                card={card}
                clientCards={clientCards}
                clientId={clientId}
                loyaltyProgramId={loyaltyProgramParam}
              />
            )}
            {activeTab === 'cards' && (
              <CardClientCardsTab
                clientId={clientId}
                routeCardId={cardId}
                fallbackCard={card}
                clientCards={clientCards}
                cardsLoading={!!clientId && cardsLoading}
                loyaltyProgramId={loyaltyProgramParam}
              />
            )}
            {activeTab === 'activity' &&
              (clientId ? (
                <CardActivityTab
                  clientId={clientId}
                  organizationId={user.organizationId}
                />
              ) : (
                <Empty description={t('marketing.noClientAttached')} />
              ))}
            {activeTab === 'promocodes' &&
              (user.organizationId != null ? (
                <CardPromocodesTab
                  organizationId={user.organizationId}
                  personalUserId={card.client?.id}
                />
              ) : null)}
            {activeTab === 'notes' && <CardNotesTab clientId={clientId} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
