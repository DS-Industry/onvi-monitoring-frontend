import React from 'react';
import { Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { getCorporateClientCardsById } from '@/services/api/marketing';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import Search from 'antd/es/input/Search';

const { Text } = Typography;

const Cards: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const search = searchParams.get('search') || '';

  const { data: cards, isLoading } = useSWR(
    clientId
      ? ['get-client-cards', clientId, currentPage, pageSize, search]
      : null,
    () =>
      getCorporateClientCardsById(Number(clientId!), {
        page: currentPage,
        size: pageSize,
        search: search,
      }),
    {
      shouldRetryOnError: false,
    }
  );

  const dataSource =
    cards?.data.map(card => ({
      key: card.id.toString(),
      name: card.ownerName,
      unqCard: card.cardUnqNumber,
      cardNumber: card.cardNumber,
      level: card.cardTier?.name || '-',
      discount: card.cardTier
        ? `${t('marketing.discount')} ${Math.floor(card.cardTier.limitBenefit)}%`
        : '-',
      balance: card.cardBalance.toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
      }),
    })) || [];

  const columns = [
    {
      title: t('marketing.clientName'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Text style={{ color: '#2563eb', fontWeight: 500 }}>{text}</Text>
      ),
    },
    {
      title: t('marketing.uniqueCardNumber'),
      dataIndex: 'unqCard',
      key: 'unqCard',
    },
    {
      title: t('marketing.cardNumber'),
      dataIndex: 'cardNumber',
      key: 'cardNumber',
    },
    {
      title: t('marketing.level'),
      dataIndex: 'level',
      key: 'level',
      render: (_: string, record: (typeof dataSource)[0]) => (
        <div>
          <Text
            style={{
              color: '#2563eb',
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
      title: t('marketing.balance'),
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
          total: cards?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ALL_PAGE_SIZES,
          showTotal: (total, range) =>
            `${range[0]}–${range[1]} из ${total} записей`,
          onChange: (page, size) =>
            updateSearchParams(searchParams, setSearchParams, {
              page: String(page),
              size: String(size),
            }),
        }}
        bordered={false}
        loading={isLoading}
        style={{ background: '#fff' }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default Cards;
