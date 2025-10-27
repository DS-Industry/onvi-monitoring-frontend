import { getAllReports, getTransactions } from '@/services/api/reports';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import { Button, Input, Table } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import { DownloadOutlined } from '@ant-design/icons';
import { getDateRender, getStatusTagRender } from '@/utils/tableUnits';
import { useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { debounce } from 'lodash';

const Transactions: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const name = searchParams.get('name') || undefined;

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const { data: filter } = useSWR(['get-all-report'], () => getAllReports({}), {
    shouldRetryOnError: false,
  });

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        name: value || undefined,
        page: '1',
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    setSearchValue(name || '');
  }, [name]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const allReports = useMemo(() => {
    return (
      filter?.reports?.map(item => ({
        name: item.name,
        value: item.id,
      })) || []
    );
  }, [filter?.reports]);

  const filterParams = {
    page: currentPage,
    size: pageSize,
  };

  const swrKey = useMemo(() => {
    return ['get-transactions', filterParams.page, filterParams.size];
  }, [filterParams]);

  const { data: transactionData, isLoading: loadingTransactions } = useSWR(
    swrKey,
    () =>
      getTransactions({
        page: filterParams.page,
        size: filterParams.size,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const transactions = useMemo(() => {
    return (
      transactionData?.transactions.map(item => ({
        ...item,
        status: t(`analysis.${item.status}`),
        reportTemplateId:
          allReports.find(rep => rep.value === item.reportTemplateId)?.name ||
          '',
      })) || []
    ).filter(item =>
      item.reportTemplateId.toLowerCase().includes((name || '').toLowerCase())
    );
  }, [allReports, t, transactionData?.transactions, name]);

  const handleDownload = (reportKey: string, id: number) => {
    const downloadUrl = `${import.meta.env.VITE_S3_CLOUD}/report/${id}/${reportKey}`;
    window.open(downloadUrl, '_blank');
  };

  const statusRender = getStatusTagRender(t);
  const dateRender = getDateRender();

  const columnsTransactions = [
    {
      title: t('table.headers.report'),
      dataIndex: 'reportTemplateId',
      key: 'reportTemplateId',
    },
    {
      title: t('table.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: statusRender,
    },
    {
      title: t('table.headers.creationStartDate'),
      dataIndex: 'startTemplateAt',
      key: 'startTemplateAt',
      render: dateRender,
    },
    {
      title: t('table.headers.creationEndDate'),
      dataIndex: 'endTemplateAt',
      key: 'endTemplateAt',
      render: dateRender,
    },
    {
      title: '',
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
      <div className="ml-12 md:ml-0 mb-5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.my')}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <Input.Search
              placeholder={t('filters.search.placeholder')}
              value={searchValue}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              allowClear
              className="w-full sm:w-72 md:w-80"
              style={{ height: '32px' }}
            />
            <Button
              icon={<UndoOutlined style={{ color: 'orange' }} />}
              className="flex items-center justify-center"
              onClick={() => mutate(swrKey)}
            >
              {t('constants.refresh')}
            </Button>
          </div>
          <Table
            dataSource={transactions}
            columns={columnsTransactions}
            loading={loadingTransactions}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: transactionData?.count,
              pageSizeOptions: ALL_PAGE_SIZES,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} из ${total} операций`,
              onChange: (page, size) =>
                updateSearchParams(searchParams, setSearchParams, {
                  page: String(page),
                  size: String(size),
                }),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
