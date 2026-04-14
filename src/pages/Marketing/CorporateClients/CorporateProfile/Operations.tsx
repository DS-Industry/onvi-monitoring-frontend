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
import { Can } from '@/permissions/Can';
import useAuthStore from '@/config/store/authSlice';

const { Text } = Typography;

type OperationType = 'ORDER' | 'DEDUCTION' | 'REPLENISHMENT';

type OperationRow = {
  key: string;
  id: string | number;
  branch: string;
  cardNo: string;
  date: string;
  time: string;
  amount: string;
  amountNumber: number;
  sumBonus: string;
  sumCashback: string;
  operationType: OperationType;
  bonusNumber: number;
  cashbackNumber: number;
};

const formatCurrency = (value: number): string =>
  `${Math.abs(value).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`;

const formatSignedCurrency = (
  value: number,
  withPositiveSign = false
): string => {
  const sign = value < 0 ? '-' : value > 0 && withPositiveSign ? '+' : '';
  return `${sign}${formatCurrency(value)}`;
};

const Operations: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clientId = searchParams.get('clientId');
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const search = searchParams.get('search') || '';
  const userPermissions = useAuthStore(state => state.permissions);

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

  const dataSource: OperationRow[] =
    operations?.data.map(operation => {
      const occurredAtRaw =
        'occurredAt' in operation ? operation.occurredAt : operation.orderData;
      const isEquaring =
        'kind' in operation ? operation.kind === 'equaring' : false;
      const equaringType = 'type' in operation ? operation.type : null;
      const transactionId =
        'transactionId' in operation ? operation.transactionId : null;
      const branchName =
        'carWashDeviceName' in operation ? operation.carWashDeviceName : null;
      const amountRaw =
        'amount' in operation ? operation.amount : operation.sumReal;
      const bonus = 'sumBonus' in operation ? operation.sumBonus : 0;
      const cashback = 'sumCashback' in operation ? operation.sumCashback : 0;

      const occurredAt =
        occurredAtRaw instanceof Date ||
        typeof occurredAtRaw === 'string' ||
        typeof occurredAtRaw === 'number'
          ? occurredAtRaw
          : new Date().toISOString();
      const dateObj = new Date(occurredAt);
      const date = dateObj.toLocaleDateString('ru-RU');
      const time = dateObj.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const amountNumber =
        typeof amountRaw === 'number' ? amountRaw : Number(amountRaw ?? 0);
      const bonusNumber = isEquaring ? 0 : (bonus ?? 0);
      const cashbackNumber = isEquaring ? 0 : (cashback ?? 0);

      const operationType: OperationType = isEquaring
        ? equaringType === 'TOP_UP'
          ? 'REPLENISHMENT'
          : 'DEDUCTION'
        : 'ORDER';

      return {
        key: `${isEquaring ? 'equaring' : 'order'}-${operation.id}`,
        id: isEquaring ? operation.id : transactionId || operation.id,
        branch: isEquaring ? '-' : branchName || '-',
        cardNo: operation.cardUnqNumber,
        date,
        time,
        amount: formatSignedCurrency(amountNumber),
        amountNumber,
        sumBonus: formatSignedCurrency(bonusNumber, true),
        sumCashback: formatSignedCurrency(cashbackNumber, true),
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
      render: (record: OperationRow) => (
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
      render: (text: string, record: OperationRow) => (
        <Text
          className={record.amountNumber < 0 ? 'text-errorFill font-medium' : ''}
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
      render: (text: string, record: OperationRow) => (
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
      render: (text: string, record: OperationRow) => (
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
        if (type === 'ORDER') {
          return <Text>{t('marketingTransactions.order') || 'Order'}</Text>;
        }

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
          <Can requiredPermissions={[{ action: 'delete', subject: 'LTYProgram' }]} userPermissions={userPermissions}>
            {allowed => allowed && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                {t('marketing.createOperation')}
              </Button>
            )}
          </Can>
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
