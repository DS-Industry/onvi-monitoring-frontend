import {
  deleteTransaction,
  getAllReports,
  getTransactions,
} from '@/services/api/reports';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import { Button, Input, Popconfirm, Space, Table, Typography } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import { DownloadOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';
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
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    number | null
  >(null);
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

  const swrKey = useMemo(
    () => ['get-transactions', currentPage, pageSize],
    [currentPage, pageSize]
  );

  const { data: transactionData, isLoading: loadingTransactions } = useSWR(
    swrKey,
    () =>
      getTransactions({
        page: currentPage,
        size: pageSize,
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

  const handleDeleteTransaction = async (transactionId: number) => {
    setDeletingTransactionId(transactionId);
    try {
      await deleteTransaction(transactionId);
      await mutate(swrKey);
    } finally {
      setDeletingTransactionId(null);
    }
  };

  const statusRender = getStatusTagRender(t);
  const dateRender = getDateRender();

  const formatApplyParams = (
    value: Record<string, unknown> | undefined
  ): string => {
    if (value == null || Object.keys(value).length === 0) {
      return '—';
    }
    const lines = Object.entries(value)
      .filter(
        ([, v]) =>
          v != null && v !== '' && !(typeof v === 'number' && Number.isNaN(v))
      )
      .map(([k, v]) => {
        const label = t(`analysis.applyParams.${k}`, { defaultValue: k });
        const shown =
          v !== null && typeof v === 'object'
            ? JSON.stringify(v)
            : String(v);
        return `${label}: ${shown}`;
      });
    return lines.length === 0 ? '—' : lines.join('\n');
  };

  const columnsTransactions = [
    {
      title: t('table.headers.report'),
      dataIndex: 'reportTemplateId',
      key: 'reportTemplateId',
    },
    {
      title: t('table.headers.applyParams'),
      dataIndex: 'applyParams',
      key: 'applyParams',
      width: 280,
      render: (value: Record<string, unknown> | undefined) => (
        <Typography.Paragraph
          className="!mb-0 whitespace-pre-wrap font-mono text-xs text-text02 max-w-[320px]"
          ellipsis={{ rows: 4, expandable: true, symbol: '…' }}
        >
          {formatApplyParams(value)}
        </Typography.Paragraph>
      ),
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
      render: (row: {
        id: number;
        status: string;
        reportKey?: string;
        userId: number;
      }) => (
        <Space>
          {row.status === t('analysis.DONE') && row.reportKey && (
            <button
              onClick={() => handleDownload(row.reportKey!, row.userId)}
              className="flex space-x-2 items-center text-primary02"
            >
              <div>{t('tables.Download')}</div>
              <DownloadOutlined className="w-5 h-5" />
            </button>
          )}
          <Popconfirm
            title={t('techTasks.confirmDelete')}
            onConfirm={() => handleDeleteTransaction(row.id)}
            okText={t('common.delete')}
            okType="danger"
            cancelText={t('common.cancel')}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deletingTransactionId === row.id}
            >
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
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
