import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Table } from 'antd';
import { getProgramPos, Program, ProgramDetail } from '@/services/api/pos';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { formatNumber, getDateRender } from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import { useUser } from '@/hooks/useUserStore';
import { formatSecondsToTime } from '@/utils/timeFormatter';

const ProgramDevices: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const user = useUser();
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const posId = Number(searchParams.get('posId')) || undefined;
  const dateStart = searchParams.get('dateStart') || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${formattedDate} 23:59`;
  const cityParam = Number(searchParams.get('city')) || undefined;

  const filterParams = useMemo(
    () => ({
      dateStart: new Date(dateStart || `${formattedDate} 00:00`),
      dateEnd: new Date(dateEnd?.toString() || `${formattedDate} 23:59`),
      posId: posId || location.state?.ownerId,
      placementId: cityParam,
      page: currentPage,
      size: pageSize,
      organizationId: user.organizationId
    }),
    [
      dateStart,
      dateEnd,
      posId,
      cityParam,
      currentPage,
      pageSize,
      location.state,
      user.organizationId
    ]
  );

  const swrKey = useMemo(
    () =>
      `get-pos-programs-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}-${filterParams.organizationId}`,
    [filterParams]
  );

  const [totalCount, setTotalCount] = useState(0);

  const { data: programRaw, isLoading: programsLoading } = useSWR(
    swrKey,
    () =>
      getProgramPos(filterParams).then(data => {
        setTotalCount(data?.totalCount || 0);
        return data?.prog ? data.prog.sort((a, b) => a.id - b.id) : [];
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const programColumns: ColumnsType<ProgramDetail> = [
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
      sorter: (a: ProgramDetail, b: ProgramDetail) => a.counter - b.counter,
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
      title: t('table.headers.latestProgram'),
      dataIndex: 'lastOper',
      key: 'lastOper',
      render: getDateRender(),
    },
  ];

  const deviceColumns = [
    {
      title: t('equipment.device'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Program) => (
        <Link
          to={{
            pathname: '/station/programs/devices',
            search: `?posId=${record.id}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
          }}
          className="text-primary02 hover:text-primary02_Hover font-semibold"
        >
          {text}
        </Link>
      ),
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(deviceColumns, 'programs-device-table-columns');

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

    const totalTimeSeconds = totalTimeMinutes * 60;
    const avgTimeSeconds = totalCounter > 0 ? totalTimeSeconds / totalCounter : 0;
    const formattedAvgTime = formatSecondsToTime(avgTimeSeconds);

    const totalRecord: any = {
      programName: t('finance.total'),
      counter: totalCounter,
      totalTime: totalTimeMinutes,
      averageTime: formattedAvgTime,
      lastOper: null,
    };

    const dataSourceWithTotal = [...programsInfo, totalRecord];

    const modifiedColumns = programColumns.map(col => {
      if ('dataIndex' in col && col.dataIndex === 'counter') {
        return {
          ...col,
          render: (value: number, record: any) => {
            if (record.programName === t('finance.total')) {
              return formatNumber(value);
            }
            const percent = totalCounter > 0 ? ((value / totalCounter) * 100).toFixed(0) : 0;
            return (
              <>
                {formatNumber(value)} <span className="font-bold">- {percent}%</span>
              </>
            );
          },
        };
      }
      return col;
    });

    return (
      <Table
        rowKey={row => {
          if (row === totalRecord) return `${record.id}-total`;
          return `${record.id}-${row.programName}`;
        }}
        dataSource={dataSourceWithTotal}
        columns={modifiedColumns}
        pagination={false}
        bordered
        size="small"
        rowClassName={(row) => {
          if (row.programName === t('finance.total')) {
            return 'font-bold';
          }
          return '';
        }}
      />
    );
  };

  return (
    <>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.programs')}
        </span>
      </div>

      <GeneralFilters
        count={totalCount}
        display={['pos', 'city', 'dateTime']}
      />

      <div className="mt-8">
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
          scroll={{ x: 'max-content' }}
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: record =>
              Array.isArray(record.programsInfo) &&
              record.programsInfo.length > 0,
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (_total, range) =>
              `${range[0]}-${range[1]} of ${totalCount} devices`,
            onChange: (page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              });
            },
          }}
        />
      </div>
    </>
  );
};

export default ProgramDevices;
