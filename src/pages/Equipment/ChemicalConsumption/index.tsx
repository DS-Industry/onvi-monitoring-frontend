import React, { useState, useEffect } from 'react';
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
import {
  parseTimeToSeconds,
  formatSecondsToTime,
  formatTimeDisplay
} from '@/utils/timeFormatter';

import MiniChart from './MiniChart';
import ChartModal from './ChartModal';

interface TableRow {
  period: string;
  [key: string]: string;
}

interface ExpandedData {
  category: string;
  fact: string | number;
  time: string | number;
  recalculated: string | number;
  chartDataFact?: { period: string; value: number }[];
  chartDataRecalculated?: { period: string; value: number }[];
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

const parseValueToNumber = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }
  return 0;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState<{
    category: string;
    dataFact: { period: string; value: number }[];
    dataRecalculated: { period: string; value: number }[];
  } | null>(null);

  useEffect(() => {
    setExpandedRowKeys([]);
  }, [data]);

  const getChartDataForCategory = (categoryKey: string, type: 'fact' | 'recalculated') => {
    if (!tableRows || tableRows.length === 0) return [];

    const dataKey = type === 'fact' ? 'факт' : 'пересчет';
    return tableRows
      .filter(row => row.period)
      .map(row => ({
        period: row.period,
        value: parseValueToNumber(row[`${categoryKey}, ${dataKey}`])
      }))
      .filter(item => !isNaN(item.value) && item.value !== null);
  };

  const getExpandedDataForRow = (row: TableRow): ExpandedData[] => {
    const categories = [
      {
        translationKey: 'chemicalConsumption.waterShampoo',
        dataKey: 'Вода + шампунь'
      },
      {
        translationKey: 'chemicalConsumption.activeChemistry',
        dataKey: 'Активная химия'
      },
      {
        translationKey: 'chemicalConsumption.diskWash',
        dataKey: 'Мойка дисков'
      },
      {
        translationKey: 'chemicalConsumption.brushFoam',
        dataKey: 'Щетка + пена'
      },
      {
        translationKey: 'chemicalConsumption.waxProtection',
        dataKey: 'Воск + защита'
      },
      {
        translationKey: 'chemicalConsumption.tPower',
        dataKey: 'T-POWER'
      },
    ];

    return categories.map(({ translationKey, dataKey }) => ({
      category: t(translationKey),
      fact: row[`${dataKey}, факт`] || 0,
      time: row[`${dataKey}, время`] || '-',
      recalculated: row[`${dataKey}, пересчет`] || 0,
    }));
  };

  const calculateTotals = () => {
    const categories = [
      'Вода + шампунь',
      'Активная химия',
      'Мойка дисков',
      'Щетка + пена',
      'Воск + защита',
      'T-POWER',
    ];

    const totals: { [key: string]: { fact: number, recalculated: number, timeSeconds: number } } = {};

    categories.forEach(category => {
      totals[category] = {
        fact: 0,
        recalculated: 0,
        timeSeconds: 0
      };
    });

    tableRows.forEach(row => {
      categories.forEach(category => {
        totals[category].fact += parseValueToNumber(row[`${category}, факт`]);
        totals[category].recalculated += parseValueToNumber(row[`${category}, пересчет`]);

        const timeValue = row[`${category}, время`];
        if (timeValue && timeValue !== '-' && timeValue !== '') {
          totals[category].timeSeconds += parseTimeToSeconds(timeValue);
        }
      });
    });

    return totals;
  };

  const totals = calculateTotals();

  const getTotalExpandedData = (): ExpandedData[] => {
    const categories = [
      {
        translationKey: 'chemicalConsumption.waterShampoo',
        dataKey: 'Вода + шампунь'
      },
      {
        translationKey: 'chemicalConsumption.activeChemistry',
        dataKey: 'Активная химия'
      },
      {
        translationKey: 'chemicalConsumption.diskWash',
        dataKey: 'Мойка дисков'
      },
      {
        translationKey: 'chemicalConsumption.brushFoam',
        dataKey: 'Щетка + пена'
      },
      {
        translationKey: 'chemicalConsumption.waxProtection',
        dataKey: 'Воск + защита'
      },
      {
        translationKey: 'chemicalConsumption.tPower',
        dataKey: 'T-POWER'
      },
    ];

    return categories.map(({ translationKey, dataKey }) => {
      const chartDataFact = getChartDataForCategory(dataKey, 'fact');
      const chartDataRecalculated = getChartDataForCategory(dataKey, 'recalculated');

      return {
        category: t(translationKey),
        fact: totals[dataKey].fact,
        time: formatSecondsToTime(totals[dataKey].timeSeconds),
        recalculated: totals[dataKey].recalculated,
        chartDataFact: chartDataFact.length > 0 ? chartDataFact : undefined,
        chartDataRecalculated: chartDataRecalculated.length > 0 ? chartDataRecalculated : undefined,
      };
    });
  };

  const mainColumns: ColumnsType<TableRow> = [
    {
      title: t('chemicalConsumption.period'),
      dataIndex: 'period',
      key: 'period',
      render: (text: string, record: any) => {
        if (record.key === 'total') {
          return <strong style={{ color: 'black', fontWeight: 'bold' }}>{t('finance.total')}</strong>;
        }
        return text;
      },
    },
  ];

  const expandedColumnsPeriod: ColumnsType<ExpandedData> = [
    {
      title: t('chemicalConsumption.type'),
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: t('chemicalConsumption.fact'),
      dataIndex: 'fact',
      key: 'fact',
      render: (value: number) => formatNumber(value),
      align: 'right',
      width: 100,
    },
    {
      title: t('chemicalConsumption.recalculation'),
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
      title: t('chemicalConsumption.time'),
      dataIndex: 'time',
      key: 'time',
      render: (value: string | number) => formatTimeDisplay(value),
      align: 'right',
      width: 100,
    },
  ];

  const expandedColumnsTotal: ColumnsType<ExpandedData> = [
    {
      title: t('chemicalConsumption.type'),
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: t('chemicalConsumption.fact'),
      dataIndex: 'fact',
      key: 'fact',
      render: (value: number) => formatNumber(value),
      align: 'right',
      width: 100,
    },
    {
      title: t('chemicalConsumption.recalculation'),
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
      title: t('chemicalConsumption.time'),
      dataIndex: 'time',
      key: 'time',
      render: (value: string | number) => formatTimeDisplay(value),
      align: 'right',
      width: 100,
    },
    {
      title: t('chemicalConsumption.trend'),
      key: 'chart',
      align: 'center',
      width: 130,
      render: (_, record) => {
        if (record.chartDataFact && record.chartDataRecalculated) {
          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '4px'
              }}
              onClick={() => {
                setSelectedChartData({
                  category: record.category,
                  dataFact: record.chartDataFact!,
                  dataRecalculated: record.chartDataRecalculated!
                });
                setModalVisible(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderRadius = '4px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <MiniChart
                dataFact={record.chartDataFact}
                dataRecalculated={record.chartDataRecalculated}
                width={110}
                height={32}
                isLarge={false}
              />
            </div>
          );
        }
        return (
          <div style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
            {t('chemicalConsumption.noData')}
          </div>
        );
      },
    },
  ];

  const expandedRowRender = (row: TableRow) => {
    const expandedData = getExpandedDataForRow(row);

    return (
      <div style={{ margin: 0, padding: '16px 40px' }}>
        <Table
          columns={expandedColumnsPeriod}
          dataSource={expandedData}
          rowKey="category"
          pagination={false}
          size="small"
          bordered
        />
      </div>
    );
  };

  const totalExpandedRowRender = () => {
    const totalExpandedData = getTotalExpandedData();

    return (
      <div style={{ margin: 0, padding: '16px 40px' }}>
        <Table
          columns={expandedColumnsTotal}
          dataSource={totalExpandedData}
          rowKey="category"
          pagination={false}
          size="small"
          bordered
        />
      </div>
    );
  };

  const allData = tableRows.length > 0
    ? [
        ...tableRows.map((row, index) => ({ ...row, key: `${row.period}-${index}` })),
        { period: t('finance.total'), key: 'total' }
      ]
    : tableRows.map((row, index) => ({ ...row, key: `${row.period}-${index}` }));

  const handleRowClick = (record: any) => {
    const key = record.key;
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys(expandedRowKeys.filter(k => k !== key));
    } else {
      setExpandedRowKeys([...expandedRowKeys, key]);
    }
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
          dataSource={allData}
          columns={mainColumns}
          rowKey="key"
          pagination={false}
          loading={chemicalLoading}
          expandable={{
            expandedRowRender: (record) => {
              if (record.key === 'total') {
                return totalExpandedRowRender();
              }
              return expandedRowRender(record);
            },
            expandedRowKeys,
            onExpand: (expanded, record) => {
              const key = record.key as string;
              if (expanded) {
                setExpandedRowKeys([...expandedRowKeys, key]);
              } else {
                setExpandedRowKeys(expandedRowKeys.filter(k => k !== key));
              }
            },
            rowExpandable: () => true,
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
        />
      </div>

      {selectedChartData && (
        <ChartModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          category={selectedChartData.category}
          dataFact={selectedChartData.dataFact}
          dataRecalculated={selectedChartData.dataRecalculated}
        />
      )}
    </>
  );
};

export default ChemicalConsumption;