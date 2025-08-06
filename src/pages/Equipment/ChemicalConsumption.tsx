import React from 'react';
import useSWR from 'swr';
import {
  ChemicalConsumptionResponse,
  getChemicalReport,
} from '@/services/api/equipment';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { Table } from 'antd';
import { formatNumber } from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';

interface TableRow {
  period: string;
  [key: string]: string;
}

const transformDataToTableRows = (
  data: ChemicalConsumptionResponse[]
): TableRow[] => {
  return data.map(task => {
    const row: TableRow = { period: task.period };
    task.techRateInfos.forEach(info => {
      const prefixMap: { [key: string]: string } = {
        SOAP: 'Вода + шампунь',
        PRESOAK: 'Активная химия',
        TIRE: 'Мойка дисков',
        BRUSH: 'Щетка + пена',
        WAX: 'Воск + защита',
        TPOWER: 'T-POWER',
      };

      const prefix = prefixMap[info.code];
      if (prefix) {
        row[`${prefix}, факт`] = info.spent;
        row[`${prefix}, время`] = info.time;
        row[`${prefix}, пересчет`] = info.recalculation;
      }
    });

    return row;
  });
};

const ChemicalConsumption: React.FC = () => {
  const today = dayjs().toDate();
  const formattedDate = today.toISOString().slice(0, 10);
  const [searchParams] = useSearchParams();

  const posId = searchParams.get('posId') || '*';
  const dateStart = searchParams.get('dateStart') || `${formattedDate}T00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${formattedDate}T23:59`;

  const cityParam = Number(searchParams.get('city')) || '*';

  const filterParams = {
    dateStart,
    dateEnd,
    posId: posId || '*',
    placementId: cityParam,
  };

  const swrKey =
    posId !== '*'
      ? `chemical-report-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.posId}-${filterParams.placementId}`
      : null;

  const { data: chemicalReports, isLoading: chemicalLoading } = useSWR(
    swrKey,
    () => getChemicalReport(filterParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const data = chemicalReports || [];
  const tableRows = transformDataToTableRows(data);

  const columnsChemicalConsumption: ColumnsType<TableRow> = [
    {
      title: 'Период',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Вода + шампунь, факт',
      dataIndex: 'Вода + шампунь, факт',
      key: 'Вода + шампунь, факт',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Вода + шампунь, время',
      dataIndex: 'Вода + шампунь, время',
      key: 'Вода + шампунь, время',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Вода + шампунь, пересчет',
      dataIndex: 'Вода + шампунь, пересчет',
      key: 'Вода + шампунь, пересчет',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Активная химия, факт',
      dataIndex: 'Активная химия, факт',
      key: 'Активная химия, факт',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Активная химия, время',
      dataIndex: 'Активная химия, время',
      key: 'Активная химия, время',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Активная химия, пересчет',
      dataIndex: 'Активная химия, пересчет',
      key: 'Активная химия, пересчет',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Мойка дисков, факт',
      dataIndex: 'Мойка дисков, факт',
      key: 'Мойка дисков, факт',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Мойка дисков, время',
      dataIndex: 'Мойка дисков, время',
      key: 'Мойка дисков, время',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Мойка дисков, пересчет',
      dataIndex: 'Мойка дисков, пересчет',
      key: 'Мойка дисков, пересчет',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Щетка + пена, факт',
      dataIndex: 'Щетка + пена, факт',
      key: 'Щетка + пена, факт',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Щетка + пена, время',
      dataIndex: 'Щетка + пена, время',
      key: 'Щетка + пена, время',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Щетка + пена, пересчет',
      dataIndex: 'Щетка + пена, пересчет',
      key: 'Щетка + пена, пересчет',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Воск + защита, факт',
      dataIndex: 'Воск + защита, факт',
      key: 'Воск + защита, факт',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Воск + защита, время',
      dataIndex: 'Воск + защита, время',
      key: 'Воск + защита, время',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Воск + защита, пересчет',
      dataIndex: 'Воск + защита, пересчет',
      key: 'Воск + защита, пересчет',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'T-POWER, факт',
      dataIndex: 'T-POWER, факт',
      key: 'T-POWER, факт',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'T-POWER, время',
      dataIndex: 'T-POWER, время',
      key: 'T-POWER, время',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'T-POWER, пересчет',
      dataIndex: 'T-POWER, пересчет',
      key: 'T-POWER, пересчет',
      render: (value: number) => formatNumber(value),
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(
      columnsChemicalConsumption,
      'chemical-consumption-table-columns'
    );

  return (
    <>
      <GeneralFilters
        count={tableRows.length}
        display={['city', 'pos', 'dateTime', 'reset', 'count']}
      />
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />
        <Table
          dataSource={tableRows}
          columns={visibleColumns}
          rowKey="id"
          pagination={false}
          loading={chemicalLoading}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  );
};

export default ChemicalConsumption;
