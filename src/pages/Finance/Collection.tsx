import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getPoses, getWorkers } from '@/services/api/equipment';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getCollections } from '@/services/api/finance';
import dayjs from 'dayjs';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { Table, Button } from 'antd';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { ColumnsType } from 'antd/es/table';
import {
  getCurrencyRender,
  getFormatPeriodType,
  getStatusTagRender,
} from '@/utils/tableUnits';
import { PlusOutlined } from '@ant-design/icons';
import { useUser } from '@/hooks/useUserStore';

type CashCollectionLevel = {
  id: number;
  posId: number;
  period: string;
  sumFact: number;
  sumCard: number;
  sumVirtual: number;
  profit: number;
  status: string;
  shortage: number;
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  updatedById: number;
  cashCollectionDeviceType: {
    typeName: string;
    typeShortage: number;
  }[];
  [key: string]: unknown; // Allow dynamic keys for collection columns
};

const Collection: React.FC = () => {
  const { t } = useTranslation();
  const allCategoriesText = t('warehouse.all');
  const navigate = useNavigate();

  const today = dayjs().toDate();
  const formattedDate = today.toISOString().slice(0, 10);

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const posId = Number(searchParams.get('posId')) || undefined;
  const dateStart =
    searchParams.get('dateStart') ?? dayjs(`${formattedDate} 00:00`).toDate();

  const dateEnd =
    searchParams.get('dateEnd') ?? dayjs(`${formattedDate} 23:59`).toDate();

  const cityParam = Number(searchParams.get('city')) || undefined;
  const user = useUser();

  const formatPeriodType = getFormatPeriodType();
  const renderCurrency = getCurrencyRender();
  const renderStatus = getStatusTagRender(t);

  const filterParams = useMemo(
    () => ({
      dateStart: dayjs(dateStart || `${formattedDate} 00:00`).toDate(),
      dateEnd: dayjs(dateEnd?.toString() || `${formattedDate} 23:59`).toDate(),
      posId: posId,
      page: currentPage,
      size: pageSize,
      placementId: cityParam,
    }),
    [dateStart, dateEnd, posId, currentPage, pageSize, formattedDate, cityParam]
  );

  const swrKey = `get-collections-${filterParams.posId}-${filterParams.dateStart}-${filterParams.dateEnd}-${filterParams.page}-${filterParams.size}-${filterParams.placementId}`;

  const [totalCollectionsCount, setTotalCollectionsCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data: collectionsData, isLoading: collectionsLoading } = useSWR(
    swrKey,
    () =>
      getCollections(filterParams)
        .then(data => {
          setTotalCollectionsCount(data.totalCount || 0);
          const sorted = [...(data.cashCollectionsData ?? [])].sort(
            (a, b) => a.id - b.id
          );

          return sorted;
        })
        .finally(() => {
          setIsInitialLoading(false);
        }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const { data: posData } = useSWR(
    [`get-pos`, cityParam],
    () => getPoses({ placementId: cityParam }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );


  const poses: { name: string; value: number | string }[] = useMemo(() => {
    const mappedPoses =
      posData?.map(item => ({ name: item.name, value: item.id })) || [];
    const posesAllObj = {
      name: allCategoriesText,
      value: '*',
    };
    return [posesAllObj, ...mappedPoses];
  }, [posData, allCategoriesText]);

  const baseColumns = useMemo(
    () => [
      {
        title: '№ Документа',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Мойка/Филиал',
        dataIndex: 'posName',
        key: 'posName',
        render: (text: string, record: { id: number; status: string }) => {
          return (
            <Link
              to={{
                pathname: '/finance/collection/creation',
                search: `?id=${record.id}&status=${record.status}`,
              }}
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              {text}
            </Link>
          );
        },
      },
      {
        title: 'Период',
        dataIndex: 'period',
        key: 'period',
        render: formatPeriodType,
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        render: renderStatus,
      },
      {
        title: 'Инкассация',
        dataIndex: 'sumFact',
        key: 'sumFact',
        render: renderCurrency,
      },
      {
        title: 'Сумма по картам',
        dataIndex: 'sumCard',
        key: 'sumCard',
        render: renderCurrency,
      },
      {
        title: 'Безналичная оплата',
        dataIndex: 'sumVirtual',
        key: 'sumVirtual',
        render: renderCurrency,
      },
      {
        title: 'Прибыль',
        dataIndex: 'profit',
        key: 'profit',
        render: renderCurrency,
      },
      {
        title: 'Недостача',
        dataIndex: 'shortage',
        key: 'shortage',
        render: renderCurrency,
      },
      {
        title: 'Создал',
        dataIndex: 'createdByName',
        key: 'createdByName',
      }
    ],
    []
  );

  const { columns, transformedData } = useMemo(() => {
    if (!collectionsData?.length)
      return { columns: baseColumns, transformedData: collectionsData };

    const dynamicColumns: { title: string; dataIndex: string; key: string }[] =
      [];

    const workerMap = new Map<number, { id: number; name: string; surname: string }>();
    workerData?.forEach(work => workerMap.set(work.id, work));

    const transformedData = collectionsData.map(item => {
      const creator = workerMap.get(item.createdById);
      const transformed: CashCollectionLevel & { parsedPeriod: Date } = {
        ...item,
        posName: poses.find(pos => pos.value === item.posId)?.name || '',
        status: t(`tables.${item.status}`),
        parsedPeriod: dayjs(item.period.split('-')[0]).toDate(),
        createdByName: creator ? `${creator.name} ${creator.surname}` : "-"
      };

      item.cashCollectionDeviceType.forEach((deviceType, index) => {
        const columnKey = `collection_${index}`;
        const columnTitle = deviceType.typeName || `Склад ${index + 1}`;

        if (!dynamicColumns.find(col => col.key === columnKey)) {
          dynamicColumns.push({
            title: columnTitle,
            dataIndex: columnKey,
            key: columnKey,
          });
        }
        transformed[columnKey] = deviceType.typeShortage ?? 0;
      });

      return transformed;
    });
    const sortedData = transformedData.sort(
      (a, b) =>
        (b.parsedPeriod as Date).getTime() - (a.parsedPeriod as Date).getTime()
    );

    return {
      columns: [
        ...baseColumns,
        ...dynamicColumns,
      ] as ColumnsType<CashCollectionLevel>,
      transformedData: sortedData,
    };
  }, [collectionsData, baseColumns, poses, t]);

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns, 'collections-table-columns');

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.collection')}
          </span>
        </div>
        <Button
          icon={<PlusOutlined />}
          className="btn-primary"
          onClick={() => navigate('/finance/collection/creation')}
        >
          <span className='hidden sm:flex'>{t('routes.create')}</span>
        </Button>
      </div>

      <div className="mt-8">
        <GeneralFilters
          count={collectionsData?.length || 0}
          display={['pos', 'city', 'dateTime']}
        />

        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          dataSource={transformedData}
          columns={visibleColumns}
          loading={collectionsLoading || isInitialLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCollectionsCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              });
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default Collection;
