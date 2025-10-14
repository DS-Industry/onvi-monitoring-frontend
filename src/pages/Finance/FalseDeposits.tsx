import { useToast } from '@/components/context/useContext';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import {
  deleteFalseOperations,
  FalseDepositResponse,
  getFalseDepositDevice,
} from '@/services/api/pos';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';
import { Button, Modal } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';

const FalseDeposits: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const formattedDate = dayjs().format('YYYY-MM-DD');

  const posId = Number(searchParams.get('posId') || 0);
  const dateStart = searchParams.get('dateStart') || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${formattedDate} 23:59`;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { showToast } = useToast();

  const filterParams = useMemo(
    () => ({
      dateStart,
      dateEnd,
      page: currentPage,
      size: pageSize,
      posId,
    }),
    [dateStart, dateEnd, currentPage, pageSize, posId]
  );

  const swrKey = useMemo(() => {
    if (posId === 0) return null;
    return [
      'get-false-deposits-pos-devices',
      posId,
      filterParams.dateStart,
      filterParams.dateEnd,
      filterParams.page,
      filterParams.size,
    ];
  }, [posId, filterParams]);

  const { data: filterData, isLoading } = useSWR(
    posId !== 0 ? swrKey : null,
    () =>
      getFalseDepositDevice(posId, {
        dateStart: new Date(filterParams.dateStart),
        dateEnd: new Date(filterParams.dateEnd),
        page: filterParams.page,
        size: filterParams.size,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const handleDeleteRow = async () => {
    Modal.confirm({
      title: t('common.title'),
      content: t('common.content'),
      okText: t('common.okText'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          const result = await mutate(
            [`delete-manager-data`],
            () =>
              deleteFalseOperations({
                ids: selectedRowKeys.map(key => Number(key)),
              }),
            false
          );

          if (result) {
            mutate([
              'get-false-deposits-pos-devices',
              posId,
              dateStart,
              dateEnd,
              currentPage,
              pageSize,
            ]);
            setSelectedRowKeys([]);
          }
        } catch (error) {
          console.error('Error deleting nomenclature:', error);
        }
      },
      onCancel() {
        showToast(t('info.deleteCancelled'), 'info');
      },
    });
  };

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columnsFalseDeposit: ColumnsType<FalseDepositResponse['oper'][0]> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Устройство',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: 'Сумма операции',
      dataIndex: 'sumOper',
      key: 'sumOper',
      render: currencyRender,
    },
    {
      title: 'Дата операции',
      dataIndex: 'dateOper',
      key: 'dateOper',
      render: dateRender,
    },
    {
      title: 'Дата загрузки',
      dataIndex: 'dateLoad',
      key: 'dateLoad',
      render: dateRender,
    },
    {
      title: 'Счетчик',
      dataIndex: 'counter',
      key: 'counter',
    },
    {
      title: 'Локальный ID',
      dataIndex: 'localId',
      key: 'localId',
    },
    {
      title: 'Валюта',
      dataIndex: 'currencyType',
      key: 'currencyType',
    },
  ];

  const falseDeposits = useMemo(() => {
    return (
      filterData?.oper?.sort(
        (a, b) =>
          new Date(a.dateOper).getTime() - new Date(b.dateOper).getTime()
      ) || []
    );
  }, [filterData]);

  const totalCount = filterData?.totalCount || 0;

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(columnsFalseDeposit, 'false-deposits-table-columns');

  return (
    <div>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.falseDeposits')}
        </span>
      </div>

      <GeneralFilters count={0} display={['pos', 'dateTime']} />

      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={options}
          onChange={setCheckedList}
        />

        <Table
          rowKey="id"
          dataSource={falseDeposits}
          columns={visibleColumns}
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          rowSelection={rowSelection}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            pageSizeOptions: ALL_PAGE_SIZES,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} из ${total} операций`,
            onChange: (page, size) =>
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              }),
          }}
        />
      </div>
      {selectedRowKeys.length > 0 && (
        <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-1/2 right-2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50">
          <div className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg flex items-center justify-between sm:justify-center gap-2 sm:gap-4 max-w-full sm:max-w-none">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setSelectedRowKeys([])}
                className="text-white hover:text-gray-200 p-0 h-auto flex-shrink-0"
              />
              <span className="text-xs sm:text-sm font-medium truncate">
                {t('techTasks.selectedTasks', {
                  count: selectedRowKeys.length,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-px h-4 bg-white hidden sm:block"></div>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={handleDeleteRow}
                className="text-white hover:text-gray-200 p-0 h-auto flex-shrink-0"
              >
                <span className="hidden sm:inline">
                  {t('techTasks.delete')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FalseDeposits;
