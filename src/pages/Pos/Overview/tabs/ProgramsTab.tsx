import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Empty, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  getPrograms,
  Program,
  ProgramDetail,
  TurningType,
} from '@/services/api/pos';
import {
  getStationDevices,
  OverviewDeviceItem,
} from '@/services/api/pos/overview';
import { formatNumber, getCurrencyRender } from '@/utils/tableUnits';
import { formatSecondsToTime } from '@/utils/timeFormatter';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { useOverviewCurrency } from '../hooks/OverviewCurrencyContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const CHART_COLORS = ['#5E5FCD', '#6ECD5E', '#A95ECD', '#CD5E5E'];

type ProgramsTabProps = {
  posId: number;
  dateStart: string;
  dateEnd: string;
  isRobot?: boolean;
};

const ProgramsTab: React.FC<ProgramsTabProps> = ({
  posId,
  dateStart,
  dateEnd,
  isRobot = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('progPage') || DEFAULT_PAGE);
  const size = Number(searchParams.get('progSize') || DEFAULT_PAGE_SIZE);

  if (isRobot) {
    return (
      <RobotProgramsTable
        posId={posId}
        dateStart={dateStart}
        dateEnd={dateEnd}
        page={page}
        size={size}
        onPageChange={(nextPage, nextSize) => {
          updateSearchParams(searchParams, setSearchParams, {
            progPage: nextPage,
            progSize: nextSize,
          });
        }}
      />
    );
  }

  return <SelfServiceDevicesList posId={posId} />;
};

type RobotProgramsTableProps = {
  posId: number;
  dateStart: string;
  dateEnd: string;
  page: number;
  size: number;
  onPageChange: (page: number, size: number) => void;
};

const RobotProgramsTable: React.FC<RobotProgramsTableProps> = ({
  posId,
  dateStart,
  dateEnd,
  page,
  size,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const { convert, displayCurrencySymbol } = useOverviewCurrency();
  const currencyRender = getCurrencyRender();

  const { data: programRaw, isLoading, error } = useSWR(
    ['pos-overview-robot-programs', posId, dateStart, dateEnd],
    () =>
      getPrograms(posId, {
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
        turningType: TurningType.PAYMENT,
      }).then(data => data?.sort((a, b) => a.id - b.id) ?? []),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const devices = programRaw ?? [];
  const totalCount = devices.length;
  const portalPrograms = devices.filter(item => item.posType === 'Portal');

  const fullTableHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('posId', String(posId));
    params.set('dateStart', dateStart);
    params.set('dateEnd', dateEnd);
    return `/station/programs/devices?${params.toString()}`;
  }, [posId, dateStart, dateEnd]);

  const barData = useMemo(() => {
    const map = new Map<
      string,
      { programName: string; counter: number; totalProfit: number }
    >();

    portalPrograms.forEach(program => {
      program.programsInfo?.forEach(info => {
        if (!map.has(info.programName)) {
          map.set(info.programName, {
            programName: info.programName,
            counter: 0,
            totalProfit: 0,
          });
        }
        const existing = map.get(info.programName)!;
        existing.counter += info.counter ?? 0;
        existing.totalProfit += info.totalProfit ?? 0;
      });
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      totalProfit: convert(item.totalProfit) ?? item.totalProfit,
    }));
  }, [portalPrograms, convert]);

  const programColumns: ColumnsType<ProgramDetail> = useMemo(
    () => [
      {
        title: t('equipment.program'),
        dataIndex: 'programName',
        key: 'programName',
      },
      {
        title: t('table.headers.programs'),
        dataIndex: 'counter',
        key: 'counter',
        render: (_value, record) => formatNumber(record.counter),
      },
      {
        title: t('finance.totalTime'),
        dataIndex: 'totalTime',
        key: 'totalTime',
        render: (_value, record) => formatNumber(record.totalTime),
      },
      {
        title: t('table.headers.averageTime'),
        dataIndex: 'averageTime',
        key: 'averageTime',
      },
      {
        title: t('finance.REVENUE'),
        dataIndex: 'totalProfit',
        key: 'totalProfit',
        render: (value: number) => currencyRender(convert(value) ?? value),
      },
      {
        title: t('marketing.avg'),
        dataIndex: 'averageProfit',
        key: 'averageProfit',
        render: (value: number) => currencyRender(convert(value) ?? value),
      },
    ],
    [t, currencyRender, convert]
  );

  const deviceColumns: ColumnsType<Program> = useMemo(
    () => [
      {
        title: t('table.columns.id'),
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: t('equipment.device'),
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => (
          <span className="text-primary02 font-semibold">{text}</span>
        ),
      },
    ],
    [t]
  );

  const renderExpandedRow = (record: Program) => {
    const programsInfo = record.programsInfo || [];
    const totalCounter = programsInfo.reduce(
      (acc, item) => acc + (item.counter || 0),
      0
    );
    const totalTimeMinutes = programsInfo.reduce(
      (acc, item) => acc + (item.totalTime || 0),
      0
    );
    const totalProfit = programsInfo.reduce(
      (acc, item) => acc + (item.totalProfit || 0),
      0
    );
    const totalTimeSeconds = totalTimeMinutes * 60;
    const avgTimeSeconds =
      totalCounter > 0 ? totalTimeSeconds / totalCounter : 0;
    const formattedAvgTime = formatSecondsToTime(avgTimeSeconds);
    const avgProfit = totalCounter > 0 ? totalProfit / totalCounter : 0;

    const totalRecord: ProgramDetail = {
      programName: t('finance.total'),
      counter: totalCounter,
      totalTime: totalTimeMinutes,
      averageTime: formattedAvgTime,
      totalProfit,
      averageProfit: avgProfit,
    };

    const modifiedColumns = programColumns.map(col => {
      if (!('dataIndex' in col)) return col;
      const dataIndex = col.dataIndex as string;
      if (dataIndex !== 'counter' && dataIndex !== 'totalProfit') return col;

      return {
        ...col,
        render: (value: number, row: ProgramDetail) => {
          if (row.programName === t('finance.total')) {
            if (dataIndex === 'counter') return formatNumber(value);
            return currencyRender(convert(value) ?? value);
          }

          const total = dataIndex === 'counter' ? totalCounter : totalProfit;
          const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
          const formattedValue =
            dataIndex === 'counter'
              ? formatNumber(value)
              : currencyRender(convert(value) ?? value);

          return (
            <>
              {formattedValue}{' '}
              <span className="font-bold">- {percent}%</span>
            </>
          );
        },
      };
    });

    const dataSourceWithTotal = [...programsInfo, totalRecord];

    return (
      <Table
        rowKey={row =>
          row.programName === t('finance.total')
            ? `${record.id}-total`
            : `${record.id}-${row.programName}`
        }
        dataSource={dataSourceWithTotal}
        columns={modifiedColumns}
        pagination={false}
        size="small"
        bordered
        rowClassName={row =>
          row.programName === t('finance.total') ? 'font-bold' : ''
        }
      />
    );
  };

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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-base font-semibold text-text01">
          {t('posOverview.programDevices')}
          {totalCount ? ` (${totalCount})` : ''}
        </div>
        <Link to={fullTableHref} className="text-sm text-primary02">
          {t('posOverview.goToFullTable')}
        </Link>
      </div>

      {!isLoading && portalPrograms.length > 0 ? (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <Bar
              data={{
                labels: barData.map(item => item.programName),
                datasets: [
                  {
                    label: t('pos.no'),
                    data: barData.map(item => item.counter),
                    backgroundColor: barData.map(
                      (_item, i) => CHART_COLORS[i % CHART_COLORS.length]
                    ),
                  },
                ],
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: t('routes.programs'),
                    font: { size: 20 },
                    align: 'start',
                  },
                  datalabels: {
                    color: '#000000',
                  },
                },
                scales: { x: { beginAtZero: true } },
              }}
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm h-[340px] p-4">
            <Bar
              data={{
                labels: barData.map(item => item.programName),
                datasets: [
                  {
                    label: t('finance.REVENUE'),
                    data: barData.map(item => item.totalProfit),
                    backgroundColor: barData.map(
                      (_item, i) => CHART_COLORS[i % CHART_COLORS.length]
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: t('pos.revBy'),
                    font: { size: 20 },
                    align: 'start',
                  },
                  datalabels: {
                    color: '#000000',
                    formatter: (value: number) =>
                      `${Number(value).toLocaleString()} ${displayCurrencySymbol}`,
                  },
                },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm p-5 overflow-x-auto">
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={devices}
          columns={deviceColumns}
          scroll={{ x: 'max-content' }}
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: record =>
              Array.isArray(record.programsInfo) &&
              record.programsInfo.length > 0,
            defaultExpandAllRows: true,
          }}
          pagination={{
            current: page,
            pageSize: size,
            total: totalCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showSizeChanger: true,
            onChange: onPageChange,
          }}
          locale={{
            emptyText: <Empty description={t('table.noData')} />,
          }}
        />
      </div>
    </div>
  );
};

const SelfServiceDevicesList: React.FC<{ posId: number }> = ({ posId }) => {
  const { t } = useTranslation();

  const { data, isLoading, error } = useSWR(
    ['pos-overview-devices', posId],
    () => getStationDevices(posId),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const isActiveStatus = (status: string) => {
    const normalized = (status || '').toLowerCase();
    return (
      normalized.includes('active') ||
      normalized.includes('действ') ||
      normalized === 'working' ||
      normalized === 'online' ||
      !status
    );
  };

  const items = useMemo(() => data?.items ?? [], [data]);

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

      <div className="mb-4 text-base font-semibold text-text01">
        {t('posOverview.programDevices')}
        {data?.totalCount != null ? ` (${data.totalCount})` : ''}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-text02">
          <span>{t('posOverview.devices')}</span>
          <span>{t('posOverview.statusLabel')}</span>
        </div>

        <Spin spinning={isLoading}>
          {!items.length && !isLoading ? (
            <Empty description={t('table.noData')} />
          ) : (
            <ul className="m-0 p-0 list-none divide-y divide-borderFill">
              {items.map((device: OverviewDeviceItem) => {
                const active = isActiveStatus(device.status);
                return (
                  <li
                    key={device.id}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <span className="text-sm text-primary02 text-left">
                      {device.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        active
                          ? 'bg-[#E6F7EF] text-successFill'
                          : 'bg-background05 text-text02'
                      }`}
                    >
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          active ? 'bg-successFill' : 'bg-text02'
                        }`}
                      />
                      {active
                        ? t('posOverview.deviceActive')
                        : device.status || '—'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ProgramsTab;
