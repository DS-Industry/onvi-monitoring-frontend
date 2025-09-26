import React from 'react';
import { Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getCorporateClientOperationsById } from '@/services/api/marketing';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import useSWR from 'swr';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import Search from 'antd/es/input/Search';

const { Text } = Typography;

const Operations: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const search = searchParams.get('search') || '';

  const { data: operations, isLoading } = useSWR(
    clientId
      ? ['get-client-operations', clientId, currentPage, pageSize, search]
      : null,
    () =>
      getCorporateClientOperationsById(Number(clientId!), {
        page: currentPage,
        size: pageSize,
        search: search
      }),
      {
        shouldRetryOnError: false
      }
  );

  const dataSource =
    operations?.data.map(operation => {
      const dateObj = new Date(operation.orderData);
      const date = dateObj.toLocaleDateString('ru-RU');
      const time = dateObj.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Determine amount display with + or -
      const amountNumber = operation.sumReal;
      const amountStr =
        (amountNumber < 0 ? '-' : '') +
        amountNumber.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) +
        ' ₽';

      return {
        key: operation.id.toString(),
        id: operation.transactionId,
        branch: operation.carWashDeviceName || '-',
        branchUrl: '#', // or add real url if you have one
        cardNo: operation.cardUnqNumber,
        date,
        time,
        amount: amountStr,
      };
    }) || [];

  const columns = [
    {
      title: t('marketing.operationId'),
      dataIndex: 'id',
      key: 'id',
      align: 'left' as const,
    },
    {
      title: t('marketing.carWashBranch'),
      dataIndex: 'branch',
      key: 'branch',
      render: (text: string) => (
        <div
          className="text-primary02 font-medium"
          style={{ color: '#2563eb' }}
        >
          {text}
        </div>
      ),
    },
    {
      title: t('marketing.cardNumber'),
      dataIndex: 'cardNo',
      key: 'cardNo',
    },
    {
      title: t('marketing.operationDate'),
      key: 'date',
      render: (record: (typeof dataSource)[0]) => (
        <span>
          {record.date} <span className="ml-2">{record.time}</span>
        </span>
      ),
    },
    {
      title: t('marketing.amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (text: string) => (
        <Text
          className={text.includes('-') ? 'text-errorFill font-medium' : ''}
        >
          {text}
        </Text>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="font-semibold text-text01 text-2xl">
        {t('marketing.operations')}
      </div>
      <div className="w-full sm:w-80">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {t('analysis.search')}
        </label>
        <Search
          placeholder={t('filters.search.placeholder')}
          allowClear
          onSearch={(val: string) => {
            updateSearchParams(searchParams, setSearchParams, {
              search: val,
              page: DEFAULT_PAGE,
            });
          }}
        />
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: operations?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ALL_PAGE_SIZES,
          showTotal: (total, range) =>
            `${range[0]}–${range[1]} из ${total} ${t('marketing.records')}`,
          onChange: (page, size) =>
            updateSearchParams(searchParams, setSearchParams, {
              page: String(page),
              size: String(size),
            }),
        }}
        bordered={false}
        className="w-full"
        loading={isLoading}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default Operations;
