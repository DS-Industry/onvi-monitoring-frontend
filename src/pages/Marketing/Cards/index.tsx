import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Table, Typography, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { debounce } from 'lodash';
import dayjs from 'dayjs';
import {
  getCardsPaginated,
  GetCardsPaginatedPayload,
} from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';

const { Text } = Typography;

const Cards: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useUser();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const unqNumberParam = searchParams.get('unqNumber') || '';
  const numberParam = searchParams.get('number') || '';

  const [unqNumberValue, setUnqNumberValue] = useState(unqNumberParam);
  const [numberValue, setNumberValue] = useState(numberParam);

  useEffect(() => {
    setUnqNumberValue(unqNumberParam);
  }, [unqNumberParam]);

  useEffect(() => {
    setNumberValue(numberParam);
  }, [numberParam]);

  const debouncedUpdateUnqNumber = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        unqNumber: value || undefined,
        page: DEFAULT_PAGE,
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  const debouncedUpdateNumber = useCallback(
    debounce((value: string) => {
      updateSearchParams(searchParams, setSearchParams, {
        number: value || undefined,
        page: DEFAULT_PAGE,
      });
    }, 500),
    [searchParams, setSearchParams]
  );

  const handleUnqNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUnqNumberValue(value);
    debouncedUpdateUnqNumber(value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNumberValue(value);
    debouncedUpdateNumber(value);
  };

  const cardParams: GetCardsPaginatedPayload = useMemo(
    () => ({
      organizationId: user.organizationId!,
      page: currentPage,
      size: pageSize,
      ...(unqNumberParam && { unqNumber: unqNumberParam }),
      ...(numberParam && { number: numberParam }),
    }),
    [user.organizationId, currentPage, pageSize, unqNumberParam, numberParam]
  );

  const { data: cardsData, isLoading } = useSWR(
    user.organizationId
      ? ['get-cards-paginated', cardParams]
      : null,
    ([, params]) => getCardsPaginated(params),
    {
      shouldRetryOnError: false,
    }
  );

  const dataSource = useMemo(
    () =>
      cardsData?.cards.map(card => ({
        key: card.id.toString(),
        id: card.id,
        number: card.number,
        unqNumber: card.unqNumber,
        balance: card.balance,
        type: card.type,
        cardTier: card.cardTier,
        isCorporate: card.isCorporate,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      })) || [],
    [cardsData]
  );

  const columns = [
    {
      title: t('table.columns.id') || 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('marketing.cardNumber'),
      dataIndex: 'number',
      key: 'number',
      render: (text: string, record: (typeof dataSource)[0]) => (
        <Text
          style={{ color: '#2563eb', fontWeight: 500, cursor: 'pointer' }}
          onClick={() => navigate(`/marketing/cards/card/${record.id}`)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: t('marketing.uniqueCardNumber'),
      dataIndex: 'unqNumber',
      key: 'unqNumber',
    },
    {
      title: t('marketing.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Text>{type === 'VIRTUAL' ? t('marketing.virtual') || 'Virtual' : t('marketing.physical') || 'Physical'}</Text>
      ),
    },
    {
      title: t('marketing.balance'),
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number) =>
        balance.toLocaleString('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 2,
        }),
    },
    {
      title: t('marketing.level'),
      dataIndex: 'cardTier',
      key: 'cardTier',
      render: (cardTier: { name: string; limitBenefit: number } | undefined) =>
        cardTier ? (
          <div>
            <Text style={{ color: '#2563eb', fontWeight: 500 }}>
              {cardTier.name}
            </Text>
            <br />
            <Text>
              {t('marketing.discount')} {Math.floor(cardTier.limitBenefit)}%
            </Text>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: t('marketing.isCorporate'),
      dataIndex: 'isCorporate',
      key: 'isCorporate',
      render: (isCorporate: boolean) => (
        <Text>{isCorporate ? t('equipment.yes') : t('equipment.no')}</Text>
      ),
    },
    {
      title: t('table.headers.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) =>
        date ? dayjs(date).format('DD.MM.YYYY HH:mm:ss') : '-',
    },
    {
      title: t('table.headers.updated'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) =>
        date ? dayjs(date).format('DD.MM.YYYY HH:mm:ss') : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="font-semibold text-text01 text-2xl">
        {t('marketing.cards')}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="w-full sm:w-80">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('marketing.uniqueCardNumber')}
          </label>
          <Input
            placeholder={t('marketing.uniqueCardNumber')}
            allowClear
            value={unqNumberValue}
            onChange={handleUnqNumberChange}
          />
        </div>
        <div className="w-full sm:w-80">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('marketing.cardNumber')}
          </label>
          <Input
            placeholder={t('marketing.cardNumber')}
            allowClear
            value={numberValue}
            onChange={handleNumberChange}
          />
        </div>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: cardsData?.total || 0,
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
