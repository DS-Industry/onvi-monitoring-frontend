import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  getAllStockLevels,
  getAllStockLevelsCount,
  getCategory,
  getWarehouses,
} from '@/services/api/warehouse';
import { getOrganization } from '@/services/api/organization';
import { Select, Table } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { ColumnsType } from 'antd/es/table';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';

type StockLevel = {
  nomenclatureId: number;
  nomenclatureName: string;
  categoryName: string;
  measurement: string;
  sum?: number;
  inventoryItems: {
    warehouseName: string;
    quantity?: number;
  }[];
  [key: string]: unknown; // Allow dynamic keys for collection columns
};

const OverheadCosts: React.FC = () => {
  const { t } = useTranslation();
  const allCategoriesText = t('warehouse.all');
  const [searchParams, setSearchParams] = useSearchParams();
  const orgId = searchParams.get('orgId') || null;
  const warehouseId = Number(searchParams.get('warehouseId')) || undefined;
  const categoryId = Number(searchParams.get('categoryId')) || undefined;
  const currentPage = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;

  const baseColumns = useMemo(
    () => [
      {
        title: 'Номенклатура',
        dataIndex: 'nomenclatureName',
        key: 'nomenclatureName',
      },
      {
        title: 'Категория',
        dataIndex: 'categoryName',
        key: 'categoryName',
      },
      {
        title: 'Ед. измирения',
        dataIndex: 'measurement',
        key: 'measurement',
      },
      {
        title: 'Итого по всем автомойкам',
        dataIndex: 'sum',
        key: 'sum',
      },
    ],
    []
  );

  const posId = Number(searchParams.get('posId')) || undefined;
  const city = Number(searchParams.get('city')) || undefined;

  const { data: categoryData } = useSWR([`get-category`], () => getCategory(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const { data: warehouseData } = useSWR(
    [`get-warehouse`],
    () =>
      getWarehouses({
        posId: posId,
        placementId: city,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: organizationData } = useSWR(
    [`get-organization`],
    () => getOrganization({ placementId: city }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      onSuccess: data => {
        if (data && data.length > 0) {
          updateSearchParams(searchParams, setSearchParams, {
            orgId: data[0].id.toString(),
          });
        }
      },
    }
  );

  const categories: { name: string; value: number | string }[] =
    categoryData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const categoryAllObj = {
    name: allCategoriesText,
    value: '*',
  };

  categories.unshift(categoryAllObj);

  const warehouses: { name: string; value: number | string }[] =
    warehouseData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const warehousesAllObj = {
    name: allCategoriesText,
    value: '*',
  };

  warehouses.unshift(warehousesAllObj);

  const organizations: { name: string; value: number }[] =
    organizationData?.map(item => ({ name: item.name, value: item.id })) || [];

  const filterParams = useMemo(
    () => ({
      warehouseId: warehouseId,
      categoryId: categoryId,
      placementId: city,
      page: currentPage,
      size: pageSize,
    }),
    [warehouseId, categoryId, city, currentPage, pageSize]
  );

  const swrKey = useMemo(
    () =>
      `get-all-stock-levels-${filterParams.warehouseId}-${filterParams.placementId}-${filterParams.categoryId}-${filterParams.page}-${filterParams.size}-${orgId}`,
    [filterParams, orgId]
  );

  const { data: allStockLevels, isLoading: stocksLoading } = useSWR(
    orgId ? swrKey : null,
    () => getAllStockLevels(Number(orgId)!, {
      warehouseId: filterParams.warehouseId,
      categoryId: filterParams.categoryId,
      placementId: filterParams.placementId,
      page: filterParams.page,
      size: filterParams.size
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: allStockLevelsCount } = useSWR(
    orgId ? ["filter-params-count", filterParams.categoryId, filterParams.placementId, filterParams.warehouseId] : null,
    () => getAllStockLevelsCount(Number(orgId)!, {
      warehouseId: filterParams.warehouseId,
      categoryId: filterParams.categoryId,
      placementId: filterParams.placementId
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const stockLevels = useMemo(() => allStockLevels || [], [allStockLevels]);

  const { columns, transformedData } = useMemo(() => {
    if (!stockLevels.length)
      return { columns: baseColumns, transformedData: stockLevels };

    const warehouseColumns: {
      title: string;
      dataIndex: string;
      key: string;
    }[] = [];
    const transformedStockLevels = stockLevels.map(level => {
      const transformedLevel: StockLevel = { ...level };
      level.inventoryItems.forEach((item, index) => {
        const columnKey = `warehouse_${index}`;
        const columnLabel = item.warehouseName || `Склад ${index + 1}`;

        if (!warehouseColumns.some(col => col.key === columnKey)) {
          warehouseColumns.push({
            title: columnLabel,
            dataIndex: columnKey,
            key: columnKey,
          });
        }

        transformedLevel[columnKey] = item.quantity ?? 0;
      });
      return transformedLevel;
    });

    return {
      columns: [...baseColumns, ...warehouseColumns] as ColumnsType<StockLevel>,
      transformedData: transformedStockLevels.map(item => ({
        ...item,
        measurement:
          item.measurement !== null ? t(`tables.${item.measurement}`) : '',
      })),
    };
  }, [stockLevels, baseColumns, t]);

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columns, 'table-warehouse-leftovers-columns');

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.left')}
          </span>
        </div>
      </div>
      <GeneralFilters count={transformedData.length} display={['city']}>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('warehouse.organization')}
          </label>
          <Select
            showSearch
            allowClear={false}
            className="w-full sm:w-80"
            value={searchParams.get('orgId') || null}
            onChange={value => {
              updateSearchParams(searchParams, setSearchParams, {
                orgId: value,
              });
            }}
            options={organizations.map(item => ({
              label: item.name,
              value: String(item.value),
            }))}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('warehouse.category')}
          </label>
          <Select
            showSearch
            allowClear={false}
            className="w-full sm:w-80"
            options={categories.map(item => ({
              label: item.name,
              value: String(item.value),
            }))}
            value={searchParams.get('categoryId') || '*'}
            onChange={value => {
              updateSearchParams(searchParams, setSearchParams, {
                categoryId: value,
              });
            }}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t('warehouse.ware')}
          </label>
          <Select
            showSearch
            allowClear={false}
            className="w-full sm:w-80"
            options={warehouses.map(item => ({
              label: item.name,
              value: String(item.value),
            }))}
            value={searchParams.get('warehouseId') || '*'}
            onChange={value => {
              updateSearchParams(searchParams, setSearchParams, {
                warehouseId: value,
              });
            }}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </div>
      </GeneralFilters>
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />
        <Table
          dataSource={transformedData.map((tra, index) => ({
            ...tra,
            id: index,
          }))}
          columns={visibleColumns}
          loading={stocksLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: allStockLevelsCount?.count || 0,
            pageSizeOptions: ALL_PAGE_SIZES,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              });
            },
          }}
        />
      </div>
    </>
  );
};

export default OverheadCosts;
