import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Table } from 'antd';
import { getPrograms } from '@/services/api/pos';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// UI components
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import TableSkeleton from '@/components/ui/Table/TableSkeleton';
import CardSkeleton from '@/components/ui/Card/CardSkeleton';

// Constants and utils
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';

// Chart.js
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
import {
  formatNumber,
  getCurrencyRender,
  getDateRender,
} from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Types
type ProgramDetail = {
  programName: string;
  counter: number;
  totalTime: number;
  averageTime: string;
  totalProfit?: number;
  averageProfit?: number;
  lastOper?: Date;
};

type ProgramDevice = {
  id: number;
  name: string;
  posType?: 'SelfService' | 'Portal' | 'SelfServiceAndPortal';
  programsInfo: ProgramDetail[];
};

const Programs: React.FC = () => {
  const { t } = useTranslation();
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  // URL search params
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const dateStart = searchParams.get('dateStart') || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${formattedDate} 23:59`;
  const posId = searchParams.get('posId') || '*';

  const [totalCount, setTotalCount] = useState(0);

  // Prepare API Filters
  const filterParams = useMemo(
    () => ({
      dateStart: new Date(dateStart),
      dateEnd: new Date(dateEnd),
      posId,
    }),
    [dateStart, dateEnd, posId]
  );

  // Get Programs Data
  const { data: programRaw, isLoading: programsLoading } = useSWR(
    ['get-programs', posId, dateStart, dateEnd],
    () =>
      getPrograms(posId, {
        dateStart: filterParams.dateStart,
        dateEnd: filterParams.dateEnd,
      }).then(data => {
        setTotalCount(data?.length || 0);
        return data?.sort((a, b) => a.id - b.id) ?? [];
      }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const deviceColumns = [
    {
      title: t('ID'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('Устройство'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProgramDevice) => (
        <Link
          to={{
            pathname: '/station/programs/device',
            search: `?posId=${posId}&deviceId=${record.id}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
          }}
          className="text-blue-500 hover:text-blue-700 font-semibold"
        >
          {text}
        </Link>
      ),
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(deviceColumns, 'programs-table-columns');

  const currencyRender = getCurrencyRender();

  const portalPrograms =
    programRaw?.filter(item => item.posType === 'Portal') || [];

  const childColumns: ColumnsType<ProgramDetail> =
    portalPrograms.length > 0
      ? [
          { title: 'Программа', dataIndex: 'programName', key: 'programName' },
          {
            title: 'Кол-во программ',
            dataIndex: 'counter',
            key: 'counter',
            render: (_value, record) => formatNumber(record.counter),
          },
          {
            title: 'Общее время (мин)',
            dataIndex: 'totalTime',
            key: 'totalTime',
            render: (_value, record) => formatNumber(record.totalTime),
          },
          {
            title: 'Среднее время (мин)',
            dataIndex: 'averageTime',
            key: 'averageTime',
          },
          {
            title: 'Выручка',
            dataIndex: 'totalProfit',
            key: 'totalProfit',
            render: currencyRender,
          },
          {
            title: 'Средний чек',
            dataIndex: 'averageProfit',
            key: 'averageProfit',
            render: currencyRender,
          },
        ]
      : [
          { title: 'Программа', dataIndex: 'programName', key: 'programName' },
          {
            title: 'Кол-во программ',
            dataIndex: 'counter',
            key: 'counter',
            render: (_value, record) => formatNumber(record.counter),
          },
          {
            title: 'Общее время (мин)',
            dataIndex: 'totalTime',
            key: 'totalTime',
            render: (_value, record) => formatNumber(record.totalTime),
          },
          {
            title: 'Среднее время (мин)',
            dataIndex: 'averageTime',
            key: 'averageTime',
          },
          {
            title: 'Последняя программа',
            dataIndex: 'lastOper',
            key: 'lastOper',
            render: getDateRender(),
          },
        ];

  const getRandomColor = (index: number) => {
    const colors = ['#5E5FCD', '#6ECD5E', '#A95ECD', '#CD5E5E'];
    return colors[index % colors.length];
  };

  const aggregateProgramsData = (programs: ProgramDevice[]) => {
    const map = new Map<
      string,
      { programName: string; counter: number; totalProfit: number }
    >();

    programs.forEach(program => {
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
        map.set(info.programName, existing);
      });
    });

    return Array.from(map.values());
  };

  const barData = aggregateProgramsData(portalPrograms);

  return (
    <>
      <div className="flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.programDevices')}
        </span>
        <QuestionMarkIcon />
      </div>

      <GeneralFilters
        count={totalCount}
        display={['pos', 'city', 'dateTime']}
      />

      <div className="mt-8 space-y-6">
        {programsLoading && (
          <div>
            <CardSkeleton cardHeight="320px" />
            <TableSkeleton columnCount={deviceColumns.length} />
          </div>
        )}

        {!programsLoading && portalPrograms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[340px] p-4 shadow-card rounded-2xl">
              <Bar
                data={{
                  labels: barData.map(item => item.programName),
                  datasets: [
                    {
                      label: 'Кол-во авто',
                      data: barData.map(item => item.counter),
                      backgroundColor: barData.map((_item, i) =>
                        getRandomColor(i)
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
                  },
                  scales: {
                    x: { beginAtZero: true },
                  },
                }}
              />
            </div>
            <div className="h-[340px] p-4 shadow-card rounded-2xl">
              <Bar
                data={{
                  labels: barData.map(item => item.programName),
                  datasets: [
                    {
                      label: 'Доход',
                      data: barData.map(item => item.totalProfit),
                      backgroundColor: barData.map((_item, i) =>
                        getRandomColor(i)
                      ),
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: {
                      display: true,
                      text: t('pos.revBy'),
                      font: { size: 20 },
                      align: 'start',
                    },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        )}

        <div className="shadow-card p-4 rounded-2xl space-y-6">
          <ColumnSelector
            checkedList={checkedList}
            options={options}
            onChange={setCheckedList}
          />
          <Table
            rowKey="id"
            loading={programsLoading}
            dataSource={programRaw}
            columns={visibleColumns}
            expandable={{
              expandedRowRender: record => (
                <Table
                  rowKey={row => `${record.id}-${row.programName}`}
                  dataSource={record.programsInfo}
                  columns={childColumns}
                  pagination={false}
                  size="small"
                  bordered
                />
              ),
              rowExpandable: record => record.programsInfo?.length > 0,
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showTotal: (_total, range) =>
                `${range[0]}-${range[1]} of ${totalCount}`,
              pageSizeOptions: ALL_PAGE_SIZES,
              onChange: (page, size) =>
                updateSearchParams(searchParams, setSearchParams, {
                  page: String(page),
                  size: String(size),
                }),
            }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
    </>
  );
};

export default Programs;
