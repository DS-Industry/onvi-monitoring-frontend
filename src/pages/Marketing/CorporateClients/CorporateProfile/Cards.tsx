import React from 'react';
import { Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface CardData {
  key: string;
  name: string;
  unqCard: string;
  cardNumber: string;
  level: string;
  discount: string;
  balance: string;
}

const Cards: React.FC = () => {
  const { t } = useTranslation();

  const dataSource: CardData[] = [
    {
      key: '1',
      name: 'Олег Сидоров',
      unqCard: '000000000001',
      cardNumber: '000000000001',
      level: 'Новичок',
      discount: 'Скидка 3%',
      balance: '1 000,00 ₽',
    },
    {
      key: '2',
      name: 'Мария Петрова',
      unqCard: '000000000001',
      cardNumber: '000000000002',
      level: 'Любитель',
      discount: 'Скидка 5%',
      balance: '14 000,00 ₽',
    },
    {
      key: '3',
      name: 'Юлия Сергеева',
      unqCard: '000000000001',
      cardNumber: '000000000003',
      level: 'Новичок',
      discount: 'Скидка 3%',
      balance: '00,00 ₽',
    },
    {
      key: '4',
      name: 'Анна',
      unqCard: '000000000001',
      cardNumber: '000000000004',
      level: 'Новичок',
      discount: 'Скидка 3%',
      balance: '00,00 ₽',
    },
    {
      key: '5',
      name: 'Алексей Фёдоров',
      unqCard: '000000000001',
      cardNumber: '000000000005',
      level: 'Любитель',
      discount: 'Скидка 5%',
      balance: '22 766,00 ₽',
    },
  ];

  const columns = [
    {
      title: 'Имя клиента',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Text style={{ color: '#2563eb', fontWeight: 500 }}>{text}</Text>
      ),
    },
    {
      title: '№ УН Карты',
      dataIndex: 'unqCard',
      key: 'unqCard',
    },
    {
      title: '№ Карты',
      dataIndex: 'cardNumber',
      key: 'cardNumber',
    },
    {
      title: 'Уровень',
      dataIndex: 'level',
      key: 'level',
      render: (_: string, record: CardData) => (
        <div>
          <Text
            style={{
              color: record.level === 'Любитель' ? '#2563eb' : '#2563eb',
              fontWeight: 500,
            }}
          >
            {record.level}
          </Text>
          <br />
          <Text>{record.discount}</Text>
        </div>
      ),
    },
    {
      title: 'Баланс',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="font-semibold text-text01 text-2xl">
        {t('marketing.cards')}
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        bordered={false}
        style={{ background: '#fff' }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default Cards;
