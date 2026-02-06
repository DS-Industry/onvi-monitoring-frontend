import React, { useState } from 'react';
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
import { useTranslation } from 'react-i18next';

interface TableRow {
  period: string;
  [key: string]: string;
}

interface ExpandedData {
  category: string;
  fact: string | number;
  time: string | number;
  recalculated: string | number;
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

const getExpandedDataForRow = (row: TableRow): ExpandedData[] => {
  const categories = [
    'Вода + шампунь',
    'Активная химия', 
    'Мойка дисков',
    'Щетка + пена',
    'Воск + защита',
    'T-POWER',
  ];
  
  return categories.map(category => ({
    category,
    fact: row[`${category}, факт`] || 0,
    time: row[`${category}, время`] || '-',
    recalculated: row[`${category}, пересчет`] || 0,
  }));
};

const ChemicalConsumption: React.FC = () => {
  const today = dayjs().toDate();
  const formattedDate = today.toISOString().slice(0, 10);
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
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
      shouldRetryOnError: false,
    }
  );

  const data = chemicalReports || [];
  const tableRows = transformDataToTableRows(data);

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const mainColumns: ColumnsType<TableRow> = [
    {
      title: t('chemicalConsumption.period'),
      dataIndex: 'period',
      key: 'period',
    },
  ];

  const expandedColumns: ColumnsType<ExpandedData> = [
    {
      title: 'Тип химии',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: 'Факт',
      dataIndex: 'fact',
      key: 'fact',
      render: (value: number) => formatNumber(value),
      align: 'right',
      width: 100,
    },
    {
      title: 'Пересчет',
      dataIndex: 'recalculated',
      key: 'recalculated',
      render: (value: string | number) => {
        let num: number;
        if (typeof value === 'string') {
          num = parseFloat(value.replace(',', '.'));
          if (isNaN(num)) return value;
        } else {
          num = value;
        }
        return num % 1 === 0 ? formatNumber(num) : formatNumber(num, 'double');
      },
      align: 'right',
      width: 120,
    },
    {
      title: 'Время',
      dataIndex: 'time',
      key: 'time',
      render: (value: number) => value || '-',
      align: 'right',
      width: 100,
    },
  ];

  const expandedRowRender = (row: TableRow) => {
    const expandedData = getExpandedDataForRow(row);
    
    return (
      <div style={{ margin: 0, padding: '16px 40px' }}>
        <Table
          columns={expandedColumns}
          dataSource={expandedData}
          rowKey="category"
          pagination={false}
          size="small"
          bordered
          summary={() => {
            const totals = expandedData.reduce((acc, item) => {
              const factNum = typeof item.fact === 'string' 
                ? parseFloat(item.fact.toString().replace(',', '.')) || 0 
                : item.fact || 0;
              const recalcNum = typeof item.recalculated === 'string'
                ? parseFloat(item.recalculated.toString().replace(',', '.')) || 0
                : item.recalculated || 0;
              
              return {
                fact: acc.fact + factNum,
                recalculated: acc.recalculated + recalcNum,
              };
            }, { fact: 0, recalculated: 0 });
            
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="left">
                    <strong>Итого за период:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong>{formatNumber(totals.fact)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <strong>{formatNumber(totals.recalculated)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong>-</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </div>
    );
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.chemical')}
          </span>
        </div>
      </div>
      <GeneralFilters
        count={tableRows.length}
        display={['city', 'pos', 'dateTime', 'reset', 'count']}
      />
      <div className="mt-8">
        <Table
          dataSource={tableRows}
          columns={mainColumns}
          rowKey={(record, index) => `${record.period}-${index}`}
          pagination={false}
          loading={chemicalLoading}
          expandable={{
            expandedRowRender: (record) => expandedRowRender(record),
            expandedRowKeys,
            onExpand: (expanded, record) => {
              const key = `${record.period}-${tableRows.findIndex(r => r.period === record.period)}`;
              if (expanded) {
                setExpandedRowKeys([...expandedRowKeys, key]);
              } else {
                setExpandedRowKeys(expandedRowKeys.filter(k => k !== key));
              }
            },
          }}
        />
      </div>
    </>
  );
};

export default ChemicalConsumption;
