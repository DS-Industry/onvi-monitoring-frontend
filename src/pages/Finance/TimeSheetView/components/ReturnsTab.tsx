import React, { useState } from 'react';

import { useSearchParams } from 'react-router-dom';

// utils
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  StatusWorkDayShiftReport,
  getCashOperRefundById,
} from '@/services/api/finance';
import { getDevices } from '@/services/api/equipment';
import { getCurrencyRender, getDateRender } from '@/utils/tableUnits';

// components
import { Table } from 'antd';
import CreateReturnModal from './CreateReturnModal';
import { PlusOutlined } from '@ant-design/icons';

// types
import type { ColumnsType } from 'antd/es/table';

interface ReturnsTabProps {
  status?: StatusWorkDayShiftReport;
}

const ReturnsTab: React.FC<ReturnsTabProps> = ({ status }) => {
  const { t } = useTranslation();
  const [isModalOpenReturn, setIsModalOpenReturn] = useState(false);

  const [searchParams] = useSearchParams();

  const shiftId = searchParams.get('id')
    ? Number(searchParams.get('id'))
    : undefined;
  const posId = searchParams.get('posId')
    ? Number(searchParams.get('posId'))
    : undefined;

  const { data: deviceData } = useSWR(
    posId ? [`get-device-${posId}`] : null,
    () => getDevices(posId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const {
    data: cashOperReturnData,
    isLoading: loadingCashOperReturn,
    isValidating: validatingCashOperReturn,
  } = useSWR(
    shiftId ? [`get-cash-oper-return-data-${shiftId}`] : null,
    () => getCashOperRefundById(shiftId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const cashOperReturnArray =
    cashOperReturnData?.map(item => ({
      ...item.props,
      deviceName: deviceData?.find(
        dev => dev.props.id === item.props.carWashDeviceId
      )?.props.name,
    })) || [];

  const currencyRender = getCurrencyRender();
  const dateRender = getDateRender();

  // Antd Table columns configuration
  const columns: ColumnsType<any> = [
    {
      title: t('equipment.device'),
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: t('finance.dateTime'),
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: dateRender,
    },
    {
      title: t('finance.sum'),
      dataIndex: 'sum',
      key: 'sum',
      render: currencyRender,
    },
    {
      title: t('equipment.comment'),
      dataIndex: 'comment',
      key: 'comment',
    },
  ];

  const handleFormSuccess = () => {
    setIsModalOpenReturn(false);
  };

  const handleFormCancel = () => {
    setIsModalOpenReturn(false);
  };

  return (
    <>
      <div>
        {status !== StatusWorkDayShiftReport.SENT && (
          <button
            className="px-2 py-1 rounded text-primary02 bg-background07/50 text-sm font-normal mb-3 flex items-center gap-1"
            onClick={() => setIsModalOpenReturn(true)}
          >
            <PlusOutlined />
            {t('routes.add')}
          </button>
        )}

        <Table
          dataSource={cashOperReturnArray}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          loading={loadingCashOperReturn || validatingCashOperReturn}
          scroll={{ x: '500px' }}
          locale={{ emptyText: t('table.noData') }}
        />
      </div>

      <CreateReturnModal
        open={isModalOpenReturn}
        shiftId={shiftId!}
        posId={posId!}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </>
  );
};

export default ReturnsTab;
