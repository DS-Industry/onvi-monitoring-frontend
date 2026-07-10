import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  LineChartOutlined,
  ReloadOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Alert, Card, Select, Spin } from 'antd';
import {
  CampaignAnalyticsGranularity,
  CampaignAnalyticsPeriod,
  getMarketingCampaignAnalytics,
} from '@/services/api/marketing';
import UsagesChart from './UsagesChart';

type PeriodOption = 'lastWeek' | 'lastMonth' | 'lastYear';

const getGranularityForPeriod = (
  period: PeriodOption
): CampaignAnalyticsGranularity => {
  if (period === 'lastYear') {
    return 'month';
  }
  return 'day';
};

const formatTrend = (
  changePercent: number | null
): { label: string; direction: 'up' | 'down' | 'neutral' } => {
  if (changePercent === null) {
    return { label: '—', direction: 'neutral' };
  }

  const sign = changePercent > 0 ? '+' : '';
  return {
    label: `${sign}${changePercent}%`,
    direction:
      changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
  };
};

interface TrendBadgeProps {
  changePercent: number | null;
  vsPreviousPeriodLabel: string;
}

const TrendBadge: React.FC<TrendBadgeProps> = ({
  changePercent,
  vsPreviousPeriodLabel,
}) => {
  const trend = formatTrend(changePercent);

  if (trend.direction === 'neutral') {
    return null;
  }

  const colorClass =
    trend.direction === 'up' ? 'text-green-600' : 'text-red-500';
  const Icon = trend.direction === 'up' ? ArrowUpOutlined : ArrowDownOutlined;

  return (
    <div className="mt-2 flex flex-col">
      <div className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
        <Icon />
        <span>{trend.label}</span>
      </div>
      <span className="text-xs text-text02">{vsPreviousPeriodLabel}</span>
    </div>
  );
};

const MarketingCampaignStats: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const campaignId = Number(id);
  const fromCampaignsList = searchParams.get('from') === 'campaigns';
  const backPath = fromCampaignsList
    ? '/marketing/campaigns'
    : `/marketing/campaign/${campaignId}`;
  const [period, setPeriod] = useState<PeriodOption>('lastMonth');

  const granularity = useMemo(
    () => getGranularityForPeriod(period),
    [period]
  );

  const analyticsParams = useMemo(
    () => ({
      period: period as CampaignAnalyticsPeriod,
      granularity,
    }),
    [period, granularity]
  );

  const {
    data: analytics,
    error,
    isLoading,
  } = useSWR(
    campaignId
      ? ['get-marketing-campaign-analytics', campaignId, analyticsParams]
      : null,
    () => getMarketingCampaignAnalytics(campaignId, analyticsParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const periodOptions = [
    { value: 'lastWeek', label: t('marketingLoyalty.lastWeek') },
    { value: 'lastMonth', label: t('marketingLoyalty.lastMonth') },
    { value: 'lastYear', label: t('marketingLoyalty.lastYear') },
  ];

  const averageCheckValue =
    analytics?.averageOrderSum !== null && analytics?.averageOrderSum !== undefined
      ? `${(analytics.averageOrderSum).toLocaleString()}₽`
      : '—';

  const visitFrequencyValue =
    analytics?.visitFrequency !== null && analytics?.visitFrequency !== undefined
      ? analytics.visitFrequency.toLocaleString()
      : '—';

  const statsCards = [
    {
      icon: <UsergroupAddOutlined className="text-black" />,
      label: t('marketingCampaigns.uniqueParticipants'),
      value: analytics?.uniqueParticipants?.toLocaleString() ?? '—',
      showTrend: false,
      changePercent: null as number | null,
    },
    {
      icon: <LineChartOutlined className="text-black" />,
      label: t('marketingCampaigns.averageCheck'),
      value: averageCheckValue,
      showTrend: true,
      changePercent: analytics?.comparisons.averageOrderSum.changePercent ?? null,
    },
    {
      icon: <ReloadOutlined className="text-black" />,
      label: t('marketingCampaigns.visitFrequency'),
      value: visitFrequencyValue,
      showTrend: true,
      changePercent: analytics?.comparisons.visitFrequency.changePercent ?? null,
    },
  ];

  if (!campaignId) {
    return (
      <div className="px-4 md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] lg:gap-x-10 lg:gap-y-8">
          <div
            className="mb-4 flex shrink-0 cursor-pointer text-primary02 lg:col-start-1 lg:row-start-1 lg:mb-0 lg:self-center"
            onClick={() => navigate('/marketing/campaigns')}
          >
            <ArrowLeftOutlined />
            <p className="ms-2">{t('login.back')}</p>
          </div>
          <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:mr-12 lg:self-center">
            <Alert
              message={t('table.noData')}
              type="warning"
              showIcon
              className="my-4"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] lg:gap-x-10 lg:gap-y-8">
        <div className="mb-4 flex items-center gap-3 lg:mb-0 lg:contents">
          <div
            className="flex shrink-0 cursor-pointer text-primary02 lg:col-start-1 lg:row-start-1 lg:self-center"
            onClick={() => navigate(backPath)}
          >
            <ArrowLeftOutlined />
            <p className="ms-2">{t('login.back')}</p>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary02 text-white">
              <LineChartOutlined className="text-xl" />
            </div>
            <div className="truncate text-xl font-medium text-text01">
              {t('marketingLoyalty.stats')}
            </div>
          </div>
        </div>

        <div className="mb-6 hidden items-center gap-4 lg:col-start-2 lg:row-start-1 lg:mb-0 lg:flex lg:mr-12 lg:self-center">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary02 text-white">
            <LineChartOutlined className="text-2xl" />
          </div>
          <div>
            <div className="text-xl sm:text-3xl font-normal text-text01">
              {t('marketingLoyalty.stats')}
            </div>
            <div className="text-md text-text02">
              {t('marketingCampaigns.profileStatsSubtitle')}
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-start-2 lg:mr-12">
          <div className="mb-6 text-md text-text02 lg:hidden">
            {t('marketingCampaigns.profileStatsSubtitle')}
          </div>

          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert
              message={t('table.noData')}
              description={t('marketingCampaigns.statsComingSoon')}
              type="error"
              showIcon
              className="my-4"
            />
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {statsCards.map((card, index) => (
                  <Card
                    key={index}
                    className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                    bodyStyle={{ padding: '24px' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#BFFA00]">
                        <div className="text-lg">{card.icon}</div>
                      </div>

                      <div className="flex flex-col">
                        <p className="mb-1 text-sm font-medium text-gray-500">
                          {card.label}
                        </p>
                        <p className="text-2xl font-bold text-text01">{card.value}</p>
                        {card.showTrend && (
                          <TrendBadge
                            changePercent={card.changePercent}
                            vsPreviousPeriodLabel={t(
                              'marketingCampaigns.vsPreviousPeriod'
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="shadow-md">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold text-text01">
                    {t('marketingCampaigns.uses')}
                  </h3>
                  <Select
                    value={period}
                    onChange={value => setPeriod(value)}
                    options={periodOptions}
                    className="w-full sm:w-[180px]"
                  />
                </div>

                {analytics?.usagesOverTime?.length ? (
                  <UsagesChart
                    data={analytics.usagesOverTime}
                    granularity={
                      (analytics.granularity as CampaignAnalyticsGranularity) ??
                      granularity
                    }
                  />
                ) : (
                  <div className="flex h-96 items-center justify-center text-gray-500">
                    {t('table.noData')}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingCampaignStats;
