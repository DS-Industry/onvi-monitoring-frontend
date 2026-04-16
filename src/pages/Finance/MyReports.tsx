import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { Table } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import useSWR from 'swr';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { useToast } from '@/hooks/useToast';
import {
  getPosCalculations,
  getPosPartnerReportsMe,
  PosCalculationResponse,
  PosPartnerReportMeResponse,
} from '@/services/api/finance';
import { getPresignedDownloadUrl } from '@/services/api/s3';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, ALL_PAGE_SIZES } from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getCurrencyRender } from '@/utils/tableUnits';

interface MyReportItem {
  id: number;
  posCalculationId: number;
  billingMonth: Date;
  month: string;
  region: string;
  posName: string;
  revenue: number;
  expenditure: number;
  posCalculationCost: number;
  profit: number;
  percentProfitability: number;
  percentReturnAssets: number;
  percentPartner: number;
  sumPartner: number;
  reportFileKey: string;
}

const MyReports: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const placementId = Number(searchParams.get('city')) || undefined;
  const posId = Number(searchParams.get('posId')) || undefined;
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');

  const parsedDateStart = dateStart ? dayjs(dateStart) : null;
  const parsedDateEnd = dateEnd ? dayjs(dateEnd) : null;

  const requestDateStart =
    parsedDateStart && parsedDateStart.isValid()
      ? parsedDateStart.format('YYYY-MM-DD')
      : undefined;
  const requestDateEnd =
    parsedDateEnd && parsedDateEnd.isValid() ? parsedDateEnd.format('YYYY-MM-DD') : undefined;

  const { data: posCalculations = [] } = useSWR(['get-pos-calculations-all'], () => getPosCalculations(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const selectedPosCalculationId = useMemo(() => {
    if (!posId) return undefined;
    const matchedPosCalculation = posCalculations.find((item: PosCalculationResponse) => item.pos.id === posId);
    return matchedPosCalculation?.posCalculationId;
  }, [posCalculations, posId]);

  const reportFilters = useMemo(
    () => ({
      dateStart,
      dateEnd,
      placementId,
      selectedPosCalculationId,
    }),
    [dateStart, dateEnd, placementId, selectedPosCalculationId]
  );

  const { data: allReports = [], isLoading } = useSWR(
    ['get-pos-partner-reports-me', reportFilters],
    async () =>
      getPosPartnerReportsMe({
        dateStart: requestDateStart,
        dateEnd: requestDateEnd,
        placementId,
        posCalculationId: selectedPosCalculationId,
      }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
    }
  );

  const normalizedData = useMemo<MyReportItem[]>(() => {
    return allReports.map((report: PosPartnerReportMeResponse) => ({
      id: report.id,
      posCalculationId: report.posCalculationId,
      billingMonth: report.billingMonth,
      month: dayjs(report.billingMonth).format('MMMM YYYY'),
      region: report.region,
      posName: report.posName,
      revenue: report.revenue,
      expenditure: report.expenditure,
      posCalculationCost: report.posCalculationCost,
      profit: report.profit,
      percentProfitability: report.percentProfitability,
      percentReturnAssets: report.percentReturnAssets,
      percentPartner: report.percentPartner,
      sumPartner: report.sumPartner,
      reportFileKey: report.reportFileKey,
    }));
  }, [allReports]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return normalizedData.slice(start, start + pageSize);
  }, [normalizedData, currentPage, pageSize]);

  const totalCount = normalizedData.length;
  const totalDividends = useMemo(
    () => normalizedData.reduce((sum, item) => sum + item.sumPartner, 0),
    [normalizedData]
  );
  const currencyRender = getCurrencyRender();

  const handleFileDownload = async (fileKey: string) => {
    if (!fileKey) return;

    try {
      const { url } = await getPresignedDownloadUrl(fileKey);
      const fileName = fileKey.split('/').pop() || fileKey;
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (error) {
      console.error('Error downloading report file:', error);
      showToast(t('analysis.ERROR'), 'error');
    }
  };

  const columns: ColumnsType<MyReportItem> = [
    { title: t('finance.id'), dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
    { title: t('finance.month'), dataIndex: 'month', key: 'month' },
    { title: t('finance.city'), dataIndex: 'region', key: 'region' },
    { title: t('finance.carWash'), dataIndex: 'posName', key: 'posName' },
    { title: t('finance.revenue'), dataIndex: 'revenue', key: 'revenue', render: currencyRender },
    { title: t('finance.expense'), dataIndex: 'expenditure', key: 'expenditure', render: currencyRender },
    {
      title: t('finance.cost'),
      dataIndex: 'posCalculationCost',
      key: 'posCalculationCost',
      render: currencyRender,
    },
    { title: t('finance.profit'), dataIndex: 'profit', key: 'profit', render: currencyRender },
    {
      title: t('finance.profitabilityPercent'),
      dataIndex: 'percentProfitability',
      key: 'percentProfitability',
      render: (val: number) => `${val.toFixed(2)}%`,
    },
    {
      title: t('finance.profitPercent'),
      dataIndex: 'percentReturnAssets',
      key: 'percentReturnAssets',
      render: (val: number) => `${val.toFixed(2)}%`,
    },
    {
      title: t('finance.partnerShare'),
      dataIndex: 'percentPartner',
      key: 'percentPartner',
      render: (val: number) => `${val.toFixed(2)}%`,
    },
    { title: t('finance.dividendSum'), dataIndex: 'sumPartner', key: 'sumPartner', render: currencyRender },
    {
      title: t('finance.file'),
      dataIndex: 'reportFileKey',
      key: 'reportFileKey',
      render: (value: string) =>
        value ? (
          <button
            type="button"
            className="text-primary02 underline"
            onClick={() => {
              void handleFileDownload(value);
            }}
          >
            {value.split('/').pop() || value}
          </button>
        ) : (
          '-'
        ),
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns, 'my-reports-table-columns');
  const sumPartnerColumnIndex = useMemo(
    () => visibleColumns.findIndex(column => column.key === 'sumPartner'),
    [visibleColumns]
  );

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>

      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.myReports')}
          </span>
        </div>
      </div>

      <GeneralFilters count={totalCount} display={['dateTime', 'city', 'pos']} />

      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={paginatedData}
          columns={visibleColumns}
          summary={() => {
            if (sumPartnerColumnIndex === -1) {
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={visibleColumns.length}>
                    <span className="font-semibold">
                      {t('finance.total')}: {currencyRender(totalDividends)}
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }

            const cells: React.ReactNode[] = [];

            if (sumPartnerColumnIndex > 0) {
              cells.push(
                <Table.Summary.Cell key="label" index={0} colSpan={sumPartnerColumnIndex}>
                  <span className="font-semibold">{t('finance.total')}</span>
                </Table.Summary.Cell>
              );
            }

            cells.push(
              <Table.Summary.Cell key="sum" index={sumPartnerColumnIndex}>
                <span className="font-semibold">{currencyRender(totalDividends)}</span>
              </Table.Summary.Cell>
            );

            const tailColumnsCount = visibleColumns.length - sumPartnerColumnIndex - 1;
            if (tailColumnsCount > 0) {
              cells.push(
                <Table.Summary.Cell
                  key="tail"
                  index={sumPartnerColumnIndex + 1}
                  colSpan={tailColumnsCount}
                />
              );
            }

            return <Table.Summary.Row>{cells}</Table.Summary.Row>;
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} ${t('finance.records')}`,
            onChange: (page, size) =>
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              }),
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  );
};

export default MyReports;
