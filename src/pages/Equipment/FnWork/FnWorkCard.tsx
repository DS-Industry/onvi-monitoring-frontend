import { useEffect } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import PeriodToggle from '@/pages/Pos/Overview/components/PeriodToggle';
import {
  getFiscalCard,
  type FiscalHistoryRow,
  type FiscalMiniPcHistoryRow,
} from '@/services/api/pos/fiscal';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

const formatMoney = (value: number): string =>
  `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

const historyRowKey = (row: FiscalHistoryRow): string =>
  `${row.operationTime}|${row.deviceName}|${row.amount}`;

const FnWorkCard = () => {
  const { t } = useTranslation();
  const { posId: posIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const posId = Number(posIdParam);
  const posIdInvalid = !posIdParam || Number.isNaN(posId);
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');
  const datesReady = Boolean(dateStart && dateEnd);

  useEffect(() => {
    if (searchParams.get('dateStart') && searchParams.get('dateEnd')) return;
    updateSearchParams(searchParams, setSearchParams, {
      dateStart: dayjs().startOf('day').format('YYYY-MM-DDTHH:mm'),
      dateEnd: dayjs().endOf('day').format('YYYY-MM-DDTHH:mm'),
      page: DEFAULT_PAGE,
    });
  }, [searchParams, setSearchParams]);

  const periodParams = new URLSearchParams();
  if (dateStart) periodParams.set('dateStart', dateStart);
  if (dateEnd) periodParams.set('dateEnd', dateEnd);
  const periodSearch = periodParams.toString();

  const { data, error, isLoading } = useSWR(
    !posIdInvalid && dateStart && dateEnd
      ? ['fiscal-card', posId, dateStart, dateEnd]
      : null,
    () => {
      if (posIdInvalid || !dateStart || !dateEnd) {
        return Promise.reject(new Error('fiscal card is not ready'));
      }
      return getFiscalCard(posId, { dateStart, dateEnd });
    }
  );

  const paymentLabel = (paymentType: string): string => {
    if (
      paymentType === 'PAPER' ||
      paymentType === 'COIN' ||
      paymentType === 'CASH' ||
      paymentType === 'Наличные'
    ) {
      return t('fnWork.cash');
    }
    if (
      paymentType === 'POS' ||
      paymentType === 'CASHLESS' ||
      paymentType === 'Безналичные'
    ) {
      return t('fnWork.cashless');
    }
    return paymentType;
  };

  const historyColumns = <T extends FiscalHistoryRow>(): ColumnsType<T> => [
    {
      title: t('fnWork.time'),
      key: 'operationTime',
      render: (_, row: T) => dayjs(row.operationTime).format('HH:mm'),
    },
    {
      title: t('fnWork.device'),
      key: 'deviceName',
      render: (_, row: T) => row.deviceName,
    },
    {
      title: t('fnWork.amount'),
      key: 'amount',
      render: (_, row: T) => formatMoney(row.amount),
    },
    {
      title: t('fnWork.payment'),
      key: 'payment',
      render: (_, row: T) => paymentLabel(row.paymentType),
    },
  ];

  const objectColumns = historyColumns<FiscalHistoryRow>();
  const miniPcColumns: ColumnsType<FiscalMiniPcHistoryRow> = [
    ...historyColumns<FiscalMiniPcHistoryRow>(),
    {
      title: t('fnWork.qr'),
      key: 'qr',
      render: (_, row) => (row.qr?.trim() ? row.qr : ''),
    },
  ];

  const title = data
    ? `${data.posName} — ${t('fnWork.cardTitle')}`
    : t('fnWork.title');

  return (
    <>
      <Link
        to={{
          pathname: '/equipment/fn',
          search: periodSearch ? `?${periodSearch}` : '',
        }}
        className="mb-5 ml-12 inline-flex items-center text-primary02 md:ml-0"
      >
        <ArrowLeftOutlined />
        <span className="ms-2">{t('fnWork.back')}</span>
      </Link>

      <div className="ml-12 md:ml-0 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {title}
        </span>
      </div>

      <div className="mb-5">
        <PeriodToggle />
      </div>

      {posIdInvalid || error ? (
        <Alert type="error" showIcon message={t('fnWork.loadError')} />
      ) : null}

      {!posIdInvalid && !error && (!datesReady || isLoading) ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : null}

      {!posIdInvalid && !error && data ? (
        <>
          <div className="mb-6 flex flex-col gap-2 text-base text-text01 sm:flex-row sm:justify-between">
            <div>
              {`${t('fnWork.objectHistoryTitle')}: ${t('fnWork.sumLabel')} ${formatMoney(data.objectSum)}, ${t('fnWork.countLabel')} ${data.objectCount}`}
            </div>
            <div>
              {`${t('fnWork.miniPcHistoryTitle')}: ${t('fnWork.sumLabel')} ${formatMoney(data.miniPcSum)}, ${t('fnWork.countLabel')} ${data.miniPcCount}`}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 text-text01">{t('fnWork.objectTable')}</div>
              <Table<FiscalHistoryRow>
                columns={objectColumns}
                dataSource={data.objectHistory}
                pagination={false}
                rowKey={historyRowKey}
              />
            </div>
            <div>
              <div className="mb-2 text-text01">{t('fnWork.miniPcTable')}</div>
              <Table<FiscalMiniPcHistoryRow>
                columns={miniPcColumns}
                dataSource={data.miniPcHistory}
                pagination={false}
                rowKey={historyRowKey}
              />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default FnWorkCard;
