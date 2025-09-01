import React from 'react';
import { Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface OperationData {
  key: string;
  id: string;
  branch: string;
  cardNo: string;
  type: string;
  date: string;
  time: string;
  amount: string;
  branchUrl: string;
}

const Operations: React.FC = () => {
  const { t } = useTranslation();

  const dataSource: OperationData[] = [
    {
      key: '1',
      id: '123213123',
      branch: 'Мойка_1',
      branchUrl: '#',
      cardNo: '000000000001',
      type: 'Списание',
      date: '11.07.2024',
      time: '13:15',
      amount: '-1 000,00 ₽',
    },
    {
      key: '2',
      id: '123235',
      branch: 'Мойка_2',
      branchUrl: '#',
      cardNo: '000000000002',
      type: 'Списание',
      date: '09.05.2024',
      time: '12:25',
      amount: '-140,00 ₽',
    },
    {
      key: '3',
      id: '12341234',
      branch: 'Мойка_3',
      branchUrl: '#',
      cardNo: '000000000003',
      type: 'Списание',
      date: '12.05.2024',
      time: '10:15',
      amount: '-100,00 ₽',
    },
    {
      key: '4',
      id: '23421342134',
      branch: 'Мойка_2',
      branchUrl: '#',
      cardNo: '000000000004',
      type: 'Пополнение',
      date: '13.07.2024',
      time: '11:17',
      amount: '+100,00 ₽',
    },
    {
      key: '5',
      id: '241234123',
      branch: 'Мойка_3',
      branchUrl: '#',
      cardNo: '000000000005',
      type: 'Пополнение',
      date: '09.05.2024',
      time: '12:25',
      amount: '+766,00 ₽',
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'left' as const,
    },
    {
      title: 'Автомойка/Филиал',
      dataIndex: 'branch',
      key: 'branch',
      render: (text: string, record: OperationData) => (
        <a
          href={record.branchUrl}
          className="text-blue-600 font-medium"
          style={{ color: '#2563eb' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '№ Карты',
      dataIndex: 'cardNo',
      key: 'cardNo',
    },
    {
      title: 'Тип операции',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Дата операции',
      key: 'date',
      render: (_: any, record: OperationData) => (
        <span>
          {record.date} <span className="ml-2">{record.time}</span>
        </span>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (text: string) => (
        <Text
          className={
            text.includes('+')
              ? 'text-successFill font-medium'
              : text.includes('-')
                ? 'text-errorFill font-medium'
                : ''
          }
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
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        bordered={false}
        className="w-full"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default Operations;
