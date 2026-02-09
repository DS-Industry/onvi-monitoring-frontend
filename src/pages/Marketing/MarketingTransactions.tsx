import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Table, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import useSWR from 'swr';
import { getLoyaltyPrograms, getLoyaltyProgramOrders, SignOper, OrderItem } from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';
import { ContractType } from '@/utils/constants';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { SearchOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { ALL_PAGE_SIZES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { debounce } from 'lodash';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';

interface ExpandedRowData {
  id: number;
  operDate: string;
  loadDate: string;
  typeName: string;
  signOper: SignOper | string;
  sum: number;
  comment: string | null;
}

const MarketingTransactions: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const [selectedLoyaltyProgram, setSelectedLoyaltyProgram] = useState<number | undefined>(undefined);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>(searchParams.get('search') || '');

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const dateRender = getDateRender();
  const currencyRender = getCurrencyRender();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        search: value || undefined,
        page: '1',
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const { data: loyaltyProgramsData, isLoading: programsLoading } = useSWR(
    user.organizationId ? ['get-loyalty-programs', user.organizationId] : null,
    () => getLoyaltyPrograms(user.organizationId!),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const { data: ordersData, isLoading: ordersLoading } = useSWR(
    selectedLoyaltyProgram ? [
      'get-loyalty-program-orders',
      selectedLoyaltyProgram,
      currentPage,
      pageSize,
      searchParams.get('search')
    ] : null,
    () => getLoyaltyProgramOrders(
      selectedLoyaltyProgram!,
      {
        page: currentPage,
        size: pageSize,
        search: searchParams.get('search') || undefined
      }
    ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const handleLoyaltyProgramChange = (value: number | undefined) => {
    setSelectedLoyaltyProgram(value);
    setExpandedRowKeys([]);
    setSearchValue('');
    updateSearchParams(searchParams, setSearchParams, {
      page: String(DEFAULT_PAGE),
      search: undefined,
    });
  };

  const handlePageChange = (page: number, size: number) => {
    updateSearchParams(searchParams, setSearchParams, {
      page: String(page),
      size: String(size),
    });
    setExpandedRowKeys([]);
  };

  const handleRowClick = (record: OrderItem) => {
    const orderId = record.id;
    if (expandedRowKeys.includes(orderId)) {
      setExpandedRowKeys(expandedRowKeys.filter(id => id !== orderId));
    } else {
      setExpandedRowKeys([...expandedRowKeys, orderId]);
    }
  };

  const translateContractType = (contractType: ContractType): string => {
    switch (contractType) {
      case ContractType.INDIVIDUAL:
        return t('marketingTransactions.contractType.individual');
      case ContractType.CORPORATE:
        return t('marketingTransactions.contractType.corporate');
      default:
        return contractType;
    }
  };

  const translateSignOper = (signOper: SignOper): string => {
    switch (signOper) {
      case SignOper.REPLENISHMENT:
        return t('marketingTransactions.signOper.replenishment');
      case SignOper.DEDUCTION:
        return t('marketingTransactions.signOper.deduction');
      default:
        return signOper;
    }
  };

  const getExpandedData = (order: OrderItem): ExpandedRowData[] => {
    if (!order.bonusOpers || order.bonusOpers.length === 0) {
      return [];
    }

    return order.bonusOpers.map(oper => ({
      id: oper.id,
      operDate: dateRender(oper.operDate.toString()),
      loadDate: dateRender(oper.loadDate.toString()),
      typeName: oper.type?.name || '-',
      signOper: oper.type?.signOper || '-',
      sum: oper.sum,
      comment: oper.comment
    }));
  };

  const translateOrderStatus = (status: string): string => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return t('marketingTransactions.statuses.completed');
      case 'created':
        return t('marketingTransactions.statuses.created');
      case 'canceled':
        return t('marketingTransactions.statuses.canceled');
      case 'processing':
        return t('marketingTransactions.statuses.processing');
      case 'refunded':
        return t('marketingTransactions.statuses.refunded');
      case 'payed':
        return t('marketingTransactions.statuses.payed');
      case 'waiting_payment':
        return t('marketingTransactions.statuses.waitingPayment');
      case 'pos_processed':
        return t('marketingTransactions.statuses.posProcessed');
      default:
        return status;
    }
  };

  const mainColumns: ColumnsType<OrderItem> = [
    {
      title: t('marketingTransactions.columns.orderId'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => `#${id}`,
    },
    {
      title: t('marketingTransactions.columns.transactionId'),
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 200,
      render: (transactionId: string | null) => transactionId || '-',
    },
    {
      title: t('marketingTransactions.columns.orderDate'),
      dataIndex: 'orderData',
      key: 'orderData',
      width: 140,
      render: getDateRender(),
    },
    {
      title: t('marketingTransactions.columns.client'),
      key: 'client',
      width: 180,
      render: (_, record) => {
        if (!record.client) return '-';
        return (
          <div>
            <div>{record.client.name}</div>
            <div className="text-text02 text-sm">{record.client.phone}</div>
          </div>
        );
      },
    },
    {
      title: t('marketingTransactions.columns.card'),
      key: 'card',
      width: 120,
      render: (_, record) => {
        if (!record.card) return '-';
        return record.card.number;
      },
    },
    {
      title: t('marketingTransactions.columns.pos'),
      key: 'pos',
      width: 120,
      render: (_, record) => {
        if (!record.pos) return '-';
        return record.pos.name;
      },
    },
    {
      title: t('marketingTransactions.columns.device'),
      key: 'device',
      width: 180,
      render: (_, record) => {
        if (!record.device) return '-';
        return (
          <div>
            <div>{record.device.name}</div>
            <div className="text-text02 text-sm">
              {record.device.carWashDeviceType?.name || '-'}
            </div>
          </div>
        );
      },
    },
    {
      title: t('marketingTransactions.columns.platform'),
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
    },
    {
      title: t('marketingTransactions.columns.contractType'),
      dataIndex: 'contractType',
      key: 'contractType',
      width: 120,
      render: (contractType: ContractType) => translateContractType(contractType),
    },
    {
      title: t('marketingTransactions.columns.sums'),
      key: 'sums',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{t('marketingTransactions.full')}: {currencyRender(record.sumFull)}</div>
          <div>{t('marketingTransactions.real')}: {currencyRender(record.sumReal)}</div>
        </div>
      ),
    },
    {
      title: t('marketingTransactions.columns.bonuses'),
      key: 'bonuses',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{t('marketingTransactions.bonuses')}: {record.sumBonus}</div>
          <div>{t('marketingTransactions.discount')}: {currencyRender(record.sumDiscount)}</div>
          <div>{t('marketingTransactions.cashback')}: {currencyRender(record.sumCashback)}</div>
        </div>
      ),
    },
    {
      title: t('marketingTransactions.columns.statuses'),
      key: 'statuses',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{t('marketingTransactions.order')}: {translateOrderStatus(record.orderStatus)}</div>
          <div>{t('marketingTransactions.processing')}: {translateOrderStatus(record.orderStatus)}</div>
          <div>{t('marketingTransactions.execution')}: {record.executionStatus || '-'}</div>
        </div>
      ),
    },
  ];

  const expandedColumns: ColumnsType<ExpandedRowData> = [
    {
      title: t('marketingTransactions.expandedColumns.operationId'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('marketingTransactions.expandedColumns.operationDate'),
      dataIndex: 'operDate',
      key: 'operDate',
      width: 140,
    },
    {
      title: t('marketingTransactions.expandedColumns.loadDate'),
      dataIndex: 'loadDate',
      key: 'loadDate',
      width: 140,
    },
    {
      title: t('marketingTransactions.expandedColumns.operationType'),
      dataIndex: 'typeName',
      key: 'typeName',
      width: 120,
    },
    {
      title: t('marketingTransactions.expandedColumns.operationSign'),
      dataIndex: 'signOper',
      key: 'signOper',
      width: 120,
      render: (signOper: SignOper | string) => translateSignOper(signOper as SignOper),
    },
    {
      title: t('marketingTransactions.expandedColumns.amount'),
      dataIndex: 'sum',
      key: 'sum',
      width: 100,
      render: getCurrencyRender(),
    },
    {
      title: t('marketingTransactions.expandedColumns.comment'),
      dataIndex: 'comment',
      key: 'comment',
      width: 200,
      render: (comment: string | null) => comment || '—',
    },
  ];

  const expandedRowRender = (record: OrderItem) => {
    const expandedData = getExpandedData(record);

    if (expandedData.length === 0) {
      return (
        <div style={{ margin: 0, padding: '16px 40px' }}>
          <div className="text-text02 text-center">{t('marketingTransactions.noBonusOperations')}</div>
        </div>
      );
    }

    return (
      <div style={{ margin: 0, padding: '16px 40px' }}>
        <div className="font-semibold text-text01 mb-2">{t('marketingTransactions.bonusOperations')}:</div>
        <Table
          columns={expandedColumns}
          dataSource={expandedData}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
        />
      </div>
    );
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.marketingTransactions')}
          </span>
        </div>

        {user.organizationId && (
          <div className="flex flex-col md:flex-row md:items-center mt-4 xs:mt-0">
            <label className="block text-sm font-medium text-gray-700 mr-2">
              {t('marketing.loyaltyProgram')}
            </label>
            <Select
              className="w-40 truncate"
              placeholder={t('marketing.selectLoyaltyProgram')}
              value={selectedLoyaltyProgram}
              onChange={handleLoyaltyProgramChange}
              loading={programsLoading}
              options={loyaltyProgramsData?.map(program => ({
                label: program.props.name,
                value: program.props.id,
              }))}
              allowClear
            />
          </div>
        )}
      </div>

      {selectedLoyaltyProgram && (
        <GeneralFilters count={ordersData?.orders?.length || 0} display={[]}>
          <div>
            <div className="text-sm text-text02 mb-1">
              {t('marketingTransactions.searchLabel')}
            </div>
            <Input
              placeholder={t('filters.search.placeholder')}
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={handleSearchChange}
              allowClear
              className="w-full sm:w-80"
            />
          </div>
        </GeneralFilters>
      )}

      <div className="mt-4 flex flex-col min-h-screen">
        {selectedLoyaltyProgram ? (
          <div className="bg-background05 rounded-lg p-4">
            <Table
              dataSource={ordersData?.orders?.map(order => ({ ...order, key: order.id })) || []}
              columns={mainColumns}
              rowKey="id"
              loading={ordersLoading}
              expandable={{
                expandedRowRender: (record) => expandedRowRender(record),
                expandedRowKeys,
                onExpand: (expanded, record) => {
                  if (expanded) {
                    setExpandedRowKeys([...expandedRowKeys, record.id]);
                  } else {
                    setExpandedRowKeys(expandedRowKeys.filter(id => id !== record.id));
                  }
                },
                rowExpandable: () => true,
              }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: 'pointer' },
              })}
              scroll={{ x: 'max-content' }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: ordersData?.total || 0,
                showSizeChanger: true,
                pageSizeOptions: ALL_PAGE_SIZES,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} ${t('marketingTransactions.of')} ${total} ${t('marketingTransactions.transactions')}`,
                onChange: handlePageChange,
                onShowSizeChange: handlePageChange,
              }}
            />
          </div>
        ) : (
          <div className="p-4 bg-background05 rounded-lg">
            <p className="text-text02">
              {t('marketing.selectProgramToViewTransactions')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default MarketingTransactions;