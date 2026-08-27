import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { Button, DatePicker, Empty, Popover, Select, Skeleton } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import {
  ClientActivityPeriod,
  getClientActivity,
} from '@/services/api/marketing';
import { getPoses } from '@/services/api/equipment';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import LineChart from '@/components/ui/LineChart';

const { RangePicker } = DatePicker;

type ClientActivityPanelProps = {
  clientId: number;
  organizationId?: number;
};

const PERIODS: Exclude<ClientActivityPeriod, 'custom'>[] = [
  'today',
  'week',
  'month',
];

const ClientActivityPanel: React.FC<ClientActivityPanelProps> = ({
  clientId,
  organizationId,
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [periodOpen, setPeriodOpen] = useState(false);

  const periodParam = searchParams.get('activityPeriod');
  const period: ClientActivityPeriod =
    periodParam === 'today' ||
    periodParam === 'week' ||
    periodParam === 'month' ||
    periodParam === 'custom'
      ? periodParam
      : 'month';

  const dateFrom = searchParams.get('activityDateFrom') || undefined;
  const dateTo = searchParams.get('activityDateTo') || undefined;
  const posIdParam = searchParams.get('activityPosId');
  const posId = posIdParam ? Number(posIdParam) : undefined;

  const rangeValue = useMemo((): [Dayjs, Dayjs] | null => {
    if (!dateFrom || !dateTo) return null;
    const start = dayjs(dateFrom);
    const end = dayjs(dateTo);
    if (!start.isValid() || !end.isValid()) return null;
    return [start, end];
  }, [dateFrom, dateTo]);

  const { data: posData } = useSWR(
    organizationId ? ['get-pos-card-activity', organizationId] : null,
    () => getPoses({ organizationId }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const canFetch = period !== 'custom' || Boolean(dateFrom && dateTo);

  const { data: activityData, isLoading } = useSWR(
    canFetch
      ? [
          'client-activity',
          clientId,
          period,
          dateFrom ?? null,
          dateTo ?? null,
          posId ?? null,
        ]
      : null,
    () =>
      getClientActivity(clientId, {
        period,
        dateFrom: period === 'custom' ? dateFrom : undefined,
        dateTo: period === 'custom' ? dateTo : undefined,
        posId,
      }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const chartData = useMemo(
    () =>
      (activityData?.data ?? []).map(point => ({
        date: dayjs(point.date).toDate(),
        sum: point.value,
      })),
    [activityData]
  );

  const setPeriod = (next: Exclude<ClientActivityPeriod, 'custom'>) => {
    updateSearchParams(searchParams, setSearchParams, {
      activityPeriod: next,
      activityDateFrom: undefined,
      activityDateTo: undefined,
    });
  };

  const handleRangeChange: RangePickerProps['onChange'] = dates => {
    if (!dates?.[0] || !dates?.[1]) return;
    updateSearchParams(searchParams, setSearchParams, {
      activityPeriod: 'custom',
      activityDateFrom: dates[0].format('YYYY-MM-DD'),
      activityDateTo: dates[1].format('YYYY-MM-DD'),
    });
    setPeriodOpen(false);
  };

  const handlePosChange = (value: number | undefined) => {
    updateSearchParams(searchParams, setSearchParams, {
      activityPosId: value != null ? String(value) : undefined,
    });
  };

  const periodLabel = (value: Exclude<ClientActivityPeriod, 'custom'>) => {
    if (value === 'today') return t('dashboard.today');
    if (value === 'week') return t('dashboard.week');
    return t('dashboard.month');
  };

  const pillClass = (active: boolean) =>
    `!h-9 !px-4 !text-sm !rounded-full !border-0 shadow-none ${
      active
        ? '!bg-primary02 !text-white'
        : '!bg-background03 !text-text01 hover:!bg-opacity01'
    }`;

  const rangeButtonLabel = rangeValue
    ? `${rangeValue[0].format('DD.MM.YYYY')} – ${rangeValue[1].format('DD.MM.YYYY')}`
    : t('marketing.period');

  const formattedTotal =
    activityData?.total != null
      ? activityData.total.toLocaleString('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          maximumFractionDigits: 0,
        })
      : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
      <div className="flex flex-col gap-4 mb-4">
        <div className="text-base font-semibold text-text01">
          {t('marketing.activityByPeriod')}
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between">
          <Select
            className="w-full sm:w-56"
            value={posId ?? 'all'}
            onChange={value =>
              handlePosChange(value === 'all' ? undefined : Number(value))
            }
            options={[
              { label: t('marketing.allCarWashes'), value: 'all' },
              ...(posData ?? []).map(pos => ({
                label: pos.name,
                value: pos.id,
              })),
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            {PERIODS.map(value => (
              <Button
                key={value}
                type="default"
                className={pillClass(period === value)}
                onClick={() => setPeriod(value)}
              >
                {periodLabel(value)}
              </Button>
            ))}
            <Popover
              trigger="click"
              open={periodOpen}
              onOpenChange={setPeriodOpen}
              placement="bottomRight"
              content={
                <RangePicker
                  value={rangeValue}
                  onChange={handleRangeChange}
                  allowClear={false}
                  format="DD.MM.YYYY"
                />
              }
            >
              <Button
                type="default"
                className={`${pillClass(period === 'custom')} !inline-flex !items-center !gap-1`}
              >
                {rangeButtonLabel}
                <DownOutlined className="text-[10px]" />
              </Button>
            </Popover>
          </div>
        </div>

        {formattedTotal ? (
          <div className="text-sm text-text02">
            {t('marketing.activityTotal', { total: formattedTotal })}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="h-[280px] flex items-center">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : !canFetch ? (
        <div className="h-[280px] flex items-center justify-center text-text02">
          {t('marketing.selectCustomPeriod')}
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center">
          <Empty description={t('table.noData')} />
        </div>
      ) : (
        <div className="h-[280px]">
          <LineChart revenueData={chartData} />
        </div>
      )}
    </div>
  );
};

export default ClientActivityPanel;
