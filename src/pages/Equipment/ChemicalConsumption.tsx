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

const parseValueToNumber = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const parseTimeToSeconds = (timeValue: string | number): number => {
  if (!timeValue || timeValue === '-') return 0;
  
  if (typeof timeValue === 'number') {
    return timeValue * 60;
  }
  
  if (typeof timeValue === 'string') {
    if (timeValue.includes('ч') || timeValue.includes('мин') || timeValue.includes('сек')) {
      let totalSeconds = 0;
      const hoursMatch = timeValue.match(/(\d+)\s*ч/);
      const minutesMatch = timeValue.match(/(\d+)\s*мин/);
      const secondsMatch = timeValue.match(/(\d+)\s*сек/);
      
      if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
      if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
      if (secondsMatch) totalSeconds += parseInt(secondsMatch[1]);
      return totalSeconds;
    }
    
    const num = parseFloat(timeValue.replace(',', '.'));
    if (!isNaN(num)) {
      return num * 60;
    }
  }
  
  return 0;
};


const formatSecondsToTime = (seconds: number): string => {
  if (seconds === 0) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} ч`);
  if (mins > 0) parts.push(`${mins} мин`);
  if (secs > 0) parts.push(`${secs} сек`);
  
  return parts.length > 0 ? parts.join(' ') : '0 сек';
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

  useEffect(() => {
    setExpandedRowKeys([]);
  }, [data]);

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
      'Вода + шампунь',
      'Активная химия', 
      'Мойка дисков',
      'Щетка + пена',
      'Воск + защита',
      'T-POWER',
    ];

    return categories.map(category => ({
      category,
      fact: totals[category].fact,
      time: formatSecondsToTime(totals[category].timeSeconds),
      recalculated: totals[category].recalculated,
    }));
  };

  const mainColumns: ColumnsType<TableRow> = [
    {
      title: t('chemicalConsumption.period'),
      dataIndex: 'period',
      key: 'period',
      render: (text: string, record: any) => {
        if (record.key === 'total') {
          return <strong style={{ color: 'black', fontWeight: 'bold' }}>{text}</strong>;
        }
        return text;
      },
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
      render: (value: string | number) => value || '-',
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
        />
      </div>
    );
  };

  const totalExpandedRowRender = () => {
    const totalExpandedData = getTotalExpandedData();
    
    return (
      <div style={{ margin: 0, padding: '16px 40px' }}>
        <Table
          columns={expandedColumns}
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
        { period: 'Итого', key: 'total' }
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
    </>
  );
};

export default ChemicalConsumption;