import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Modal, Button } from 'antd';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';
import { useToast } from '@/components/context/useContext';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import useSWR, { mutate } from 'swr';
import {
  deleteFalseOperations,
  FalseDepositDeviceResponse,
  getFalseDepositDeviceById,
} from '@/services/api/pos';
import Table, { ColumnsType } from 'antd/es/table';
import { updateSearchParams } from '@/utils/searchParamsUtils';

const FalseDeposit: React.FC = () => {
  const { t } = useTranslation();
  const formattedDate = dayjs().format('YYYY-MM-DD');
  const [searchParams, setSearchParams] = useSearchParams();

  const deviceId = Number(searchParams.get('deviceId') || 0);
  const dateStart = searchParams.get('dateStart') || `${formattedDate} 00:00`;
  const dateEnd = searchParams.get('dateEnd') || `${formattedDate} 23:59`;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);

  const { data: filterData, isLoading } = useSWR(
    [`get-false-device`, dateStart, dateEnd, currentPage, pageSize],
    () =>
      getFalseDepositDeviceById(deviceId, {
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
        page: currentPage,
        size: pageSize,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { showToast } = useToast();

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

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
              `get-false-device`,
              dateStart,
              dateEnd,
              currentPage,
              pageSize,
            ]);
            setSelectedRowKeys([]);
          }
        } catch (error) {
          console.error('Error deleting false deposit:', error);
        }
      },
      onCancel() {
        showToast(t('info.deleteCancelled'), 'info');
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns: ColumnsType<FalseDepositDeviceResponse['oper'][0]> = [
    {
      title: t('table.columns.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('equipment.device'),
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: t('deposit.columns.sumOper'),
      dataIndex: 'sumOper',
      key: 'sumOper',
      render: currencyRender,
    },
    {
      title: t('marketing.operationDate'),
      dataIndex: 'dateOper',
      key: 'dateOper',
      render: dateRender,
    },
    {
      title: t('deposit.columns.uploadDate'),
      dataIndex: 'dateLoad',
      key: 'dateLoad',
      render: dateRender,
    },
    {
      title: t('deposit.columns.currency'),
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

  return (
    <div>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate('/finance/debugging/false/deposits');
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.falseDeposit')}
        </span>
      </div>
      <div className="ml-12 md:ml-0">
        <Table
          dataSource={falseDeposits}
          columns={columns}
          rowKey="id"
          rowSelection={rowSelection}
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          rowClassName={record => (record.falseCheck ? 'bg-red-100' : '')}
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

export default FalseDeposit;
