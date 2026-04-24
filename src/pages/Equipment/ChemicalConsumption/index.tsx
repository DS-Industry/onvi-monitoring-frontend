import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  ConsumablesType,
  PosChemistryProduction,
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
import MiniChartLevel from './MiniChartLevel';
import ChartModalLevel from './ChartModalLevel';

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
  levelChartData?: { date: string; value: number }[];
  addChartData?: { date: string; value: number }[];
}

const chemicalNameMap: Record<ConsumablesType, string> = {
  [ConsumablesType.SOAP]: 'Вода + шампунь',
  [ConsumablesType.PRESOAK]: 'Активная химия',
  [ConsumablesType.TIRE]: 'Мойка дисков',
  [ConsumablesType.BRUSH]: 'Щетка + пена',
  [ConsumablesType.WAX]: 'Воск + защита',
  [ConsumablesType.TPOWER]: 'T-POWER',
  [ConsumablesType.SPARE_EQUIPMENT]: 'Запчасти',
  [ConsumablesType.SALT]: 'Соль',
};

const suffixMap = {
  fact: 'факт',
  time: 'время',
  recalc: 'пересчет',
};

const usedChemicalTypes: ConsumablesType[] = [
  ConsumablesType.SOAP,
  ConsumablesType.PRESOAK,
  ConsumablesType.TIRE,
  ConsumablesType.BRUSH,
  ConsumablesType.WAX,
  ConsumablesType.TPOWER,
];

const transformDataToTableRows = (data: PosChemistryProduction[]): TableRow[] => {
  return data.map(task => {
    const row: TableRow = { period: task.period };
    task.techRateInfos.forEach(info => {
      const code = info.code as ConsumablesType;
      const name = chemicalNameMap[code];
      if (name) {
        row[`${name}, ${suffixMap.fact}`] = info.spent;
        row[`${name}, ${suffixMap.time}`] = info.time;
        row[`${name}, ${suffixMap.recalc}`] = info.recalculation;
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

  const { data: reportData, isLoading: chemicalLoading } = useSWR(
    swrKey,
    () => getChemicalReport(filterParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const productions = reportData?.posChemistryProductions ?? [];
  const chemistryAddLevels = reportData?.chemistryAddLevels ?? [];
  const tableRows = transformDataToTableRows(productions);

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState<{
    category: string;
    dataFact: { period: string; value: number }[];
    dataRecalculated: { period: string; value: number }[];
  } | null>(null);

  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [selectedLevelData, setSelectedLevelData] = useState<{
    category: string;
    data: { date: string; value: number }[];
    dataAdd: { date: string; value: number }[];
  } | null>(null);

  useEffect(() => {
    setExpandedRowKeys([]);
  }, [productions]);

  const getChartDataForCategory = (categoryKey: string, type: 'fact' | 'recalculated') => {
    if (!tableRows || tableRows.length === 0) return [];
    const dataKey = type === 'fact' ? suffixMap.fact : suffixMap.recalc;
    return tableRows
      .filter(row => row.period)
      .map(row => ({
        period: row.period,
        value: parseValueToNumber(row[`${categoryKey}, ${dataKey}`]),
      }))
      .filter(item => !isNaN(item.value) && item.value !== null);
  };

  const getLevelChartData = (code: ConsumablesType): {
    levelData: { date: string; value: number }[];
    addData: { date: string; value: number }[];
  } => {
    const levelData: { date: string; value: number }[] = [];
    const addData: { date: string; value: number }[] = [];
    chemistryAddLevels.forEach(item => {
      if (item.code === code) {
        const formattedDate = dayjs(item.techTaskDate).format('DD.MM.YYYY HH:mm');
        if (item.level !== null) {
          levelData.push({ date: formattedDate, value: item.level });
        }
        if (item.add !== null) {
          addData.push({ date: formattedDate, value: item.add });
        }
      }
    });
    const sortFn = (a: { date: string }, b: { date: string }) =>
      dayjs(a.date, 'DD.MM.YYYY HH:mm').valueOf() - dayjs(b.date, 'DD.MM.YYYY HH:mm').valueOf();
    return {
      levelData: levelData.sort(sortFn),
      addData: addData.sort(sortFn),
    };
  };

  const getExpandedDataForRow = (row: TableRow): ExpandedData[] => {
    return usedChemicalTypes.map(code => {
      const name = chemicalNameMap[code];
      return {
        category: t(`chemicalNames.${code}`, name),
        fact: row[`${name}, ${suffixMap.fact}`] || 0,
        time: row[`${name}, ${suffixMap.time}`] || '-',
        recalculated: row[`${name}, ${suffixMap.recalc}`] || 0,
      };
    });
  };

  const calculateTotals = () => {
    const totals: { [key in ConsumablesType]?: { fact: number; recalculated: number; timeSeconds: number } } = {};
    usedChemicalTypes.forEach(code => {
      totals[code] = { fact: 0, recalculated: 0, timeSeconds: 0 };
    });
    tableRows.forEach(row => {
      usedChemicalTypes.forEach(code => {
        const name = chemicalNameMap[code];
        totals[code]!.fact += parseValueToNumber(row[`${name}, ${suffixMap.fact}`]);
        totals[code]!.recalculated += parseValueToNumber(row[`${name}, ${suffixMap.recalc}`]);
        const timeValue = row[`${name}, ${suffixMap.time}`];
        if (timeValue && timeValue !== '-' && timeValue !== '') {
          totals[code]!.timeSeconds += parseTimeToSeconds(timeValue);
        }
      });
    });
    return totals;
  };

  const totals = calculateTotals();

  const getTotalExpandedData = (): ExpandedData[] => {
    return usedChemicalTypes.map(code => {
      const name = chemicalNameMap[code];
      const chartDataFact = getChartDataForCategory(name, 'fact');
      const chartDataRecalculated = getChartDataForCategory(name, 'recalculated');
      const { levelData, addData } = getLevelChartData(code);
      return {
        category: t(`chemicalNames.${code}`, name),
        fact: totals[code]!.fact,
        time: formatSecondsToTime(totals[code]!.timeSeconds),
        recalculated: totals[code]!.recalculated,
        chartDataFact: chartDataFact.length > 0 ? chartDataFact : undefined,
        chartDataRecalculated: chartDataRecalculated.length > 0 ? chartDataRecalculated : undefined,
        levelChartData: levelData.length > 0 ? levelData : undefined,
        addChartData: addData.length > 0 ? addData : undefined,
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
    {
      title: t('chemicalConsumption.chartLevelTitle'),
      key: 'levelChart',
      align: 'center',
      width: 130,
      render: (_, record) => {
        if (record.levelChartData && record.levelChartData.length > 0) {
          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '4px',
              }}
              onClick={() => {
                setSelectedLevelData({
                  category: record.category,
                  data: record.levelChartData!,
                  dataAdd: record.addChartData || [],
                });
                setLevelModalVisible(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderRadius = '4px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <MiniChartLevel
                data={record.levelChartData}
                dataAdd={record.addChartData}
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

      {selectedLevelData && (
        <ChartModalLevel
          visible={levelModalVisible}
          onClose={() => setLevelModalVisible(false)}
          category={selectedLevelData.category}
          data={selectedLevelData.data}
          dataAdd={selectedLevelData.dataAdd}
        />
      )}
    </>
  );
};

export default ChemicalConsumption;