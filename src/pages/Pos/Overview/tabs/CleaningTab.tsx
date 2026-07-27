import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Spin } from 'antd';
import {
  getStationCleaningByProgram,
  getStationCleaningSummary,
} from '@/services/api/pos/overview';
import { formatNumber } from '@/utils/tableUnits';
import OverviewKpiCard from '../components/OverviewKpiCard';
import HorizontalBarList from '../components/HorizontalBarList';

type CleaningTabProps = {
  posId: number;
  dateStart: string;
  dateEnd: string;
};

const CleaningTab: React.FC<CleaningTabProps> = ({
  posId,
  dateStart,
  dateEnd,
}) => {
  const { t } = useTranslation();
  const dateRange = { dateStart, dateEnd };

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSWR(
    ['pos-overview-cleaning-summary', posId, dateStart, dateEnd],
    () => getStationCleaningSummary(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const {
    data: byProgram,
    isLoading: byProgramLoading,
    error: byProgramError,
  } = useSWR(
    ['pos-overview-cleaning-by-program', posId, dateStart, dateEnd],
    () => getStationCleaningByProgram(posId, dateRange),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const fullTableHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('dateStart', dateStart);
    params.set('dateEnd', dateEnd);
    params.set('posId', String(posId));
    params.set('turningType', 'CLEANING');
    return `/station/programs?${params.toString()}`;
  }, [dateStart, dateEnd, posId]);

  const error = summaryError || byProgramError;

  return (
    <div>
      {error ? (
        <Alert
          type="error"
          showIcon
          message={t('posOverview.loadError')}
          className="mb-4"
        />
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <OverviewKpiCard
          label={t('posOverview.cleaningPrograms')}
          value={formatNumber(summary?.programsCount)}
          loading={summaryLoading}
        />
        <OverviewKpiCard
          label={t('posOverview.totalCleaningTime')}
          value={`${formatNumber(summary?.totalCleaningMinutes)} ${t('posOverview.min')}`}
          loading={summaryLoading}
        />
        <OverviewKpiCard
          label={t('posOverview.averageCycleTime')}
          value={`${formatNumber(summary?.averageCycleMinutes, 'double')} ${t('posOverview.min')}`}
          loading={summaryLoading}
        />
      </div>

      <Spin spinning={byProgramLoading}>
        <HorizontalBarList
          title={t('posOverview.timeByProgram')}
          emptyText={t('table.noData')}
          showBullet
          headerRight={
            <Link to={fullTableHref} className="text-sm text-primary02">
              {t('posOverview.goToFullTable')}
            </Link>
          }
          items={
            byProgram?.items?.map(item => ({
              key: item.programName,
              label: item.programName,
              value: item.totalMinutes,
              displayValue: `${formatNumber(item.totalMinutes)} ${t('posOverview.min')}`,
            })) ?? []
          }
          footer={
            <div className="flex justify-between text-xs uppercase tracking-wide text-text02">
              <span>
                {t('posOverview.programsCount')} · {t('posOverview.totalByTime')}
              </span>
              <span className="text-text01 font-semibold normal-case">
                {formatNumber(summary?.programsCount)} |{' '}
                {formatNumber(summary?.totalCleaningMinutes)}{' '}
                {t('posOverview.min')}
              </span>
            </div>
          }
        />
      </Spin>
    </div>
  );
};

export default CleaningTab;
