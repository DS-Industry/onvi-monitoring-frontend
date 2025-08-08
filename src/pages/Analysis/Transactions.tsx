import TableSkeleton from '@/components/ui/Table/TableSkeleton';
import {
  useCurrentPage,
  usePageNumber,
  useSetCurrentPage,
  useSetPageSize,
} from '@/hooks/useAuthStore';
import { getAllReports, getTransactions } from '@/services/api/reports';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import DynamicTable from '@/components/ui/Table/DynamicTable';
import { Button } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

const Transactions: React.FC = () => {
  const { t } = useTranslation();
  const pageNumber = usePageNumber();
  const currentPage = useCurrentPage();
  const setTotalCount = useSetPageSize();
  const [tableLoading, setTableLoading] = useState(false);
  const location = useLocation();
  const setCurrentPage = useSetCurrentPage();
  const pageSize = usePageNumber();

  const { data: filter } = useSWR(['get-all-report'], () => getAllReports({}));

  const allReports = useMemo(() => {
    return (
      filter?.reports?.map(item => ({
        name: item.name,
        value: item.id,
      })) || []
    );
  }, [filter?.reports]);

  useEffect(() => {
    setCurrentPage(1);
  }, [location, setCurrentPage]);

  const {
    data: transactionData,
    mutate: mutateTransactions,
    isLoading: loadingTransactions,
  } = useSWR(
    [`get-transaction`],
    () =>
      getTransactions({
        page: currentPage,
        size: pageNumber,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const totalRecords = transactionData?.count || 0;
  const maxPages = Math.ceil(totalRecords / pageSize);

  useEffect(() => {
    if (currentPage > maxPages) {
      setCurrentPage(maxPages > 0 ? maxPages : 1);
    }
  }, [maxPages, currentPage, setCurrentPage]);

  useEffect(() => {
    setTableLoading(true);
    mutateTransactions().then(() => setTableLoading(false));
  }, [mutateTransactions]);

  useEffect(() => {
    if (!loadingTransactions && transactionData?.count)
      setTotalCount(transactionData?.count);
  }, [transactionData?.count, loadingTransactions, setTotalCount]);

  const transactions = useMemo(() => {
    return (
      transactionData?.transactions.map(item => ({
        ...item,
        status: t(`analysis.${item.status}`),
        reportTemplateId:
          allReports.find(rep => rep.value === item.reportTemplateId)?.name ||
          '',
      })) || []
    ).sort(
      (a, b) =>
        new Date(b.startTemplateAt).getTime() -
        new Date(a.startTemplateAt).getTime()
    );
  }, [allReports, t, transactionData?.transactions]);

  const handleDownload = (reportKey: string, id: number) => {
    const downloadUrl = `https://storage.yandexcloud.net/onvi-business/report/${id}/${reportKey}`; 
    window.open(downloadUrl, '_blank');
  };

  const columnsTransactions = [
    {
      label: 'Отчет',
      key: 'reportTemplateId',
    },
    {
      label: 'Статус',
      key: 'status',
    },
    {
      label: 'Дата начала создания',
      key: 'startTemplateAt',
      type: 'date',
    },
    {
      label: 'Дата окончания создания',
      key: 'endTemplateAt',
      type: 'date',
    },
    {
      label: '',
      key: 'Download',
      render: (row: { status: string; reportKey: string; userId: number }) =>
        row.status === t('analysis.DONE') && (
          <div>
            <button
              onClick={() => handleDownload(row.reportKey, row.userId)}
              className="flex space-x-2 items-center text-primary02"
            >
              <div>{t('tables.Download')}</div>
              <DownloadOutlined className="w-5 h-5" />
            </button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.my')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>

      <div className="mt-5">
        {loadingTransactions || tableLoading ? (
          <TableSkeleton columnCount={columnsTransactions.length} />
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            <Button
              icon={
                <UndoOutlined style={{ color: 'orange', fontSize: '24px' }} />
              }
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <DynamicTable
              data={transactions}
              columns={columnsTransactions}
              showPagination={true}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-40 text-text02">
            <div>{t('analysis.there')}</div>
            <div>{t('analysis.you')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
