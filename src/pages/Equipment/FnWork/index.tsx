import { useEffect } from 'react';
import { Alert, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import PeriodToggle from '@/pages/Pos/Overview/components/PeriodToggle';
import {
  listFiscal,
  type FiscalLastCredit,
  type FiscalListItem,
  type FiscalStateView,
} from '@/services/api/pos/fiscal';
import { useUser } from '@/hooks/useUserStore';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

const formatMoney = (value: number): string =>
  `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

const formatDateTime = (value: string): string =>
  dayjs(value).format('DD.MM.YYYY HH:mm');

const FnWork = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');
  const warningParam = searchParams.get('warning');
  const warning = warningParam === 'warning' ? 'warning' : 'all';
  const currentPage = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;
  const organizationId = user?.organizationId;
  const datesReady = Boolean(dateStart && dateEnd);

  useEffect(() => {
    if (searchParams.get('dateStart') && searchParams.get('dateEnd')) return;
    updateSearchParams(searchParams, setSearchParams, {
      dateStart: dayjs().startOf('day').format('YYYY-MM-DDTHH:mm'),
      dateEnd: dayjs().endOf('day').format('YYYY-MM-DDTHH:mm'),
      page: DEFAULT_PAGE,
    });
  }, [searchParams, setSearchParams]);

  const { data, error, isLoading } = useSWR(
    organizationId && dateStart && dateEnd
      ? [
          'fiscal-list',
          organizationId,
          dateStart,
          dateEnd,
          currentPage,
          pageSize,
          warning,
        ]
      : null,
    () => {
      if (!organizationId || !dateStart || !dateEnd) {
        return Promise.reject(new Error('fiscal list is not ready'));
      }
      return listFiscal({
        organizationId,
        dateStart,
        dateEnd,
        page: currentPage,
        size: pageSize,
        warning,
      });
    }
  );

  const openCard = (posId: number) => {
    const params = new URLSearchParams();
    if (dateStart) params.set('dateStart', dateStart);
    if (dateEnd) params.set('dateEnd', dateEnd);
    const search = params.toString();
    navigate({
      pathname: `/equipment/fn/${posId}`,
      search: search ? `?${search}` : '',
    });
  };

  const renderLast = (last: FiscalLastCredit | null) => {
    if (!last) return t('fnWork.warningEmpty');
    return (
      <div>
        <div>{last.deviceName}</div>
        <div>{formatMoney(last.amount)}</div>
        <div>{formatDateTime(last.operationTime)}</div>
      </div>
    );
  };

  const renderSum = (count: number, sum: number) => (
    <div>
      <div>{t('fnWork.creditCount', { count })}</div>
      <div>{formatMoney(sum)}</div>
    </div>
  );

  const renderState = (state: FiscalStateView | null) => {
    if (!state) return t('fnWork.warningEmpty');
    return (
      <div>
        <div>{state.statusLine}</div>
        <div>
          {t('fnWork.receivedAt')}: {formatDateTime(state.receivedAt)}
        </div>
        {state.fnMemoryOverflow ? <div>{t('fnWork.fnMemoryOverflow')}</div> : null}
        {state.fnResourceExhausted ? (
          <div>{t('fnWork.fnResourceExhausted')}</div>
        ) : null}
        {state.fnReplacementRequired ? (
          <div>{t('fnWork.fnReplacementRequired')}</div>
        ) : null}
        {state.ofdUnsentDocumentsCount > 0 ? (
          <div>
            {t('fnWork.ofdUnsent', { count: state.ofdUnsentDocumentsCount })}
          </div>
        ) : null}
      </div>
    );
  };

  const columns: ColumnsType<FiscalListItem> = [
    {
      title: t('fnWork.object'),
      dataIndex: 'posName',
      key: 'posName',
    },
    {
      title: t('fnWork.objectCredit'),
      key: 'objectCredit',
      render: (_, record) => renderLast(record.objectLast),
    },
    {
      title: t('fnWork.miniPcCredit'),
      key: 'miniPcCredit',
      render: (_, record) => renderLast(record.miniPcLast),
    },
    {
      title: t('fnWork.objectSum'),
      key: 'objectSum',
      render: (_, record) => renderSum(record.objectCount, record.objectSum),
    },
    {
      title: t('fnWork.miniPcSum'),
      key: 'miniPcSum',
      render: (_, record) => renderSum(record.miniPcCount, record.miniPcSum),
    },
    {
      title: t('fnWork.state'),
      key: 'state',
      render: (_, record) => renderState(record.state),
    },
    {
      title: t('fnWork.warning'),
      key: 'warning',
      render: (_, record) => {
        if (record.warnings.length === 0) return t('fnWork.warningEmpty');
        return (
          <div>
            {record.warnings.map((warningText, index) => (
              <div key={`${warningText}-${index}`}>{warningText}</div>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('fnWork.title')}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <PeriodToggle />
        <Select
          aria-label={t('fnWork.warning')}
          className="w-full sm:w-64"
          value={warning}
          options={[
            { value: 'all', label: t('fnWork.warningAll') },
            { value: 'warning', label: t('fnWork.warningOnly') },
          ]}
          onChange={(value: 'all' | 'warning') => {
            updateSearchParams(searchParams, setSearchParams, {
              warning: value,
              page: DEFAULT_PAGE,
            });
          }}
        />
      </div>

      {error ? (
        <Alert type="error" showIcon message={t('fnWork.loadError')} />
      ) : (
        <div className="overflow-x-auto">
          <Table<FiscalListItem>
            columns={columns}
            dataSource={datesReady ? data?.items ?? [] : []}
            rowKey="posId"
            loading={!datesReady || isLoading}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: t('fnWork.empty') }}
            pagination={{
              current: currentPage,
              pageSize,
              total: data?.total ?? 0,
              pageSizeOptions: ALL_PAGE_SIZES,
              showSizeChanger: true,
              onChange: (page, size) => {
                updateSearchParams(searchParams, setSearchParams, {
                  page,
                  size,
                });
              },
            }}
            onRow={record => ({
              onClick: () => openCard(record.posId),
              onKeyDown: event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openCard(record.posId);
                }
              },
              tabIndex: 0,
              className: 'cursor-pointer',
            })}
          />
        </div>
      )}
    </>
  );
};

export default FnWork;
