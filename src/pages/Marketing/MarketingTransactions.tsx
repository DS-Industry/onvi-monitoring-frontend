import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import useSWR from 'swr';
import { getLoyaltyPrograms, getLoyaltyProgramOrders, SignOper, OrderItem } from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';
import { ContractType } from '@/utils/constants';

interface ExpandedRowData {
  id: number;
  operDate: string;
  loadDate: string;
  typeName: string;
  signOper: SignOper | string; // Изменено: может быть string если тип null
  sum: number;
  comment: string | null;
}

const MarketingTransactions: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const [selectedLoyaltyProgram, setSelectedLoyaltyProgram] = useState<number | undefined>(undefined);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  // Получение программ лояльности
  const { data: loyaltyProgramsData, isLoading: programsLoading } = useSWR(
    user.organizationId ? ['get-loyalty-programs', user.organizationId] : null,
    () => getLoyaltyPrograms(user.organizationId!),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Получение транзакций для выбранной программы лояльности
  const { data: ordersData, isLoading: ordersLoading } = useSWR(
    selectedLoyaltyProgram ? ['get-loyalty-program-orders', selectedLoyaltyProgram] : null,
    () => getLoyaltyProgramOrders(selectedLoyaltyProgram!),
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
  };

  const handleRowClick = (record: OrderItem) => {
    const orderId = record.id;
    if (expandedRowKeys.includes(orderId)) {
      setExpandedRowKeys(expandedRowKeys.filter(id => id !== orderId));
    } else {
      setExpandedRowKeys([...expandedRowKeys, orderId]);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Форматирование суммы
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + '₽';
  };

  // Функция для перевода типа контракта
  const translateContractType = (contractType: ContractType): string => {
    switch (contractType) {
      case 'INDIVIDUAL':
        return t('marketingTransactions.contractType.individual');
      case 'CORPORATE':
        return t('marketingTransactions.contractType.corporate');
      default:
        return contractType;
    }
  };

  // Функция для перевода знака операции
  const translateSignOper = (signOper: SignOper): string => {
    switch (signOper) {
      case 'REPLENISHMENT':
        return t('marketingTransactions.signOper.replenishment');
      case 'DEDUCTION':
        return t('marketingTransactions.signOper.deduction');
      default:
        return signOper;
    }
  };

  // Получение расширенных данных для операций бонусов
  const getExpandedData = (order: OrderItem): ExpandedRowData[] => {
    if (!order.bonusOpers || order.bonusOpers.length === 0) {
      return [];
    }

    return order.bonusOpers.map(oper => ({
      id: oper.id,
      operDate: formatDate(oper.operDate.toString()),
      loadDate: formatDate(oper.loadDate.toString()),
      typeName: oper.type?.name || 'N/A',
      signOper: oper.type?.signOper || 'N/A', // Если тип null, возвращаем 'N/A'
      sum: oper.sum,
      comment: oper.comment
    }));
  };

  // Основные колонки таблицы
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
      render: (transactionId: string | null) => transactionId || 'N/A',
    },
    {
      title: t('marketingTransactions.columns.orderDate'),
      dataIndex: 'orderData',
      key: 'orderData',
      width: 140,
      render: (date: string) => formatDate(date),
    },
    {
      title: t('marketingTransactions.columns.client'),
      key: 'client',
      width: 180,
      render: (_, record) => {
        if (!record.client) return 'N/A';
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
        if (!record.card) return 'N/A';
        return record.card.number;
      },
    },
    {
      title: t('marketingTransactions.columns.pos'),
      key: 'pos',
      width: 120,
      render: (_, record) => {
        if (!record.pos) return 'N/A';
        return record.pos.name;
      },
    },
    {
      title: t('marketingTransactions.columns.device'),
      key: 'device',
      width: 180,
      render: (_, record) => {
        if (!record.device) return 'N/A';
        return (
          <div>
            <div>{record.device.name}</div>
            <div className="text-text02 text-sm">
              {record.device.carWashDeviceType?.name || 'N/A'}
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
          <div>Полная: {formatCurrency(record.sumFull)}</div>
          <div>Реальная: {formatCurrency(record.sumReal)}</div>
        </div>
      ),
    },
    {
      title: t('marketingTransactions.columns.bonuses'),
      key: 'bonuses',
      width: 150,
      render: (_, record) => (
        <div>
          <div>Бонусы: {record.sumBonus}</div>
          <div>Скидка: {formatCurrency(record.sumDiscount)}</div>
          <div>Кэшбэк: {formatCurrency(record.sumCashback)}</div>
        </div>
      ),
    },
    {
      title: t('marketingTransactions.columns.statuses'),
      key: 'statuses',
      width: 150,
      render: (_, record) => (
        <div>
          <div>Заказ: {record.orderStatus}</div>
          <div>Обработка: {record.orderHandlerStatus || 'N/A'}</div>
          <div>Выполнение: {record.executionStatus || 'N/A'}</div>
        </div>
      ),
    },
  ];

  // Колонки для раскрываемой части (операции бонусов)
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
      render: (signOper: SignOper) => translateSignOper(signOper),
    },
    {
      title: t('marketingTransactions.expandedColumns.amount'),
      dataIndex: 'sum',
      key: 'sum',
      width: 100,
      render: (sum: number) => formatCurrency(sum),
    },
    {
      title: t('marketingTransactions.expandedColumns.comment'),
      dataIndex: 'comment',
      key: 'comment',
      width: 200,
      render: (comment: string | null) => comment || '—',
    },
  ];

  // Рендер раскрываемой части
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

  // Получение названия выбранной программы
  const selectedProgramName = selectedLoyaltyProgram 
    ? loyaltyProgramsData?.find(program => program.props.id === selectedLoyaltyProgram)?.props.name
    : '';

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5 xs:flex xs:items-start xs:justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.marketingTransactions')}
          </span>
        </div>
        
        {/* Выпадающий список для выбора программы лояльности */}
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

      <div className="mt-4 flex flex-col min-h-screen">
        {selectedLoyaltyProgram ? (
          <div className="bg-background05 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text01">
                {t('marketing.selectedProgram')}: {selectedProgramName} (ID: {selectedLoyaltyProgram})
              </h3>
            </div>

            {/* Загрузка */}
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="text-text02">{t('common.loading')}...</div>
              </div>
            ) : (
              /* Таблица транзакций */
              <div>
                {ordersData?.orders && ordersData.orders.length > 0 ? (
                  <div>
                    <Table
                      dataSource={ordersData.orders.map(order => ({ ...order, key: order.id }))}
                      columns={mainColumns}
                      rowKey="id"
                      pagination={false}
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
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-text02">{t('common.noData')}</div>
                  </div>
                )}
              </div>
            )}
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