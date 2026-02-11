import React, { useState } from 'react';
import { Table, Typography, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getCorporateClientOperationsById } from '@/services/api/marketing';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import useSWR, { mutate } from 'swr';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import Search from 'antd/es/input/Search';
import { PlusOutlined } from '@ant-design/icons';
import CreateBonusOperationModal from './CreateBonusOperationModal';

const { Text } = Typography;

const Operations: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleSuccess = () => {
    if (clientId) {
      mutate([
        'get-client-operations',
        clientId,
        currentPage,
        pageSize,
        search,
      ]);
    }
  };

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

      const bonusNumber = operation.sumBonus || 0;
      const bonusStr =
        (bonusNumber < 0 ? '-' : bonusNumber > 0 ? '+' : '') +
        Math.abs(bonusNumber).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) +
        ' ₽';

      const cashbackNumber = operation.sumCashback || 0;
      const cashbackStr =
        (cashbackNumber < 0 ? '-' : cashbackNumber > 0 ? '+' : '') +
        Math.abs(cashbackNumber).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) +
        ' ₽';

      const operationType = bonusNumber < 0 ? 'DEDUCTION' : 'REPLENISHMENT';

      return {
        key: operation.id.toString(),
        id: operation.transactionId,
        branch: operation.carWashDeviceName || '-',
        branchUrl: '#',
        cardNo: operation.cardUnqNumber,
        date,
        time,
        amount: amountStr,
        sumBonus: bonusStr,
        sumCashback: cashbackStr,
        operationType,
        bonusNumber,
        cashbackNumber,
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
    {
      title: t('marketingTransactions.bonuses') || 'Bonuses',
      dataIndex: 'sumBonus',
      key: 'sumBonus',
      align: 'right' as const,
      render: (text: string, record: (typeof dataSource)[0]) => (
        <Text
          className={
            record.bonusNumber < 0
              ? 'text-errorFill font-medium'
              : record.bonusNumber > 0
                ? 'text-green-600 font-medium'
                : ''
          }
        >
          {text}
        </Text>
      ),
    },
    {
      title: t('marketingTransactions.cashback') || 'Cashback',
      dataIndex: 'sumCashback',
      key: 'sumCashback',
      align: 'right' as const,
      render: (text: string, record: (typeof dataSource)[0]) => (
        <Text
          className={
            record.cashbackNumber < 0
              ? 'text-errorFill font-medium'
              : record.cashbackNumber > 0
                ? 'text-green-600 font-medium'
                : ''
          }
        >
          {text}
        </Text>
      ),
    },
    {
      title: t('marketingTransactions.expandedColumns.operationType') || 'Operation Type',
      dataIndex: 'operationType',
      key: 'operationType',
      render: (type: string) => {
        const translationKey =
          type === 'DEDUCTION'
            ? 'marketingTransactions.signOper.deduction'
            : 'marketingTransactions.signOper.replenishment';
        return (
          <Text
            className={
              type === 'DEDUCTION' ? 'text-errorFill font-medium' : 'text-green-600 font-medium'
            }
          >
            {t(translationKey) || type}
          </Text>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-text01 text-2xl">
          {t('marketing.operations')}
        </div>
        {clientId && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('marketing.createOperation')}
          </Button>
        )}
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
      {clientId && (
        <CreateBonusOperationModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          corporateClientId={Number(clientId)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Operations;
