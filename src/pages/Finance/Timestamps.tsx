import Button from '@/components/ui/Button/Button';
import PosFilter from '@/components/ui/Filter/PosFilter';
import { getTimestamp, postTimestamp } from '@/services/api/finance';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Can } from '@/permissions/Can';
import useAuthStore from '@/config/store/authSlice';

type TimestampResponse = {
  deviceId: number;
  deviceName: string;
  oldTookMoneyTime?: Date;
  tookMoneyTime?: Date;
};

type TimestampBody = {
  dateTimeStamp: Date;
};

const Timestamps: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const posId = searchParams.get('posId');
  const [disabledButtons, setDisabledButtons] = useState<{
    [key: number]: boolean;
  }>({});
  const { showToast } = useToast();
  const userPermissions = useAuthStore(state => state.permissions);

  const {
    data: timestampData,
    isLoading,
    mutate,
  } = useSWR<TimestampResponse[]>(
    posId !== '*' && posId ? [`get-timestamp`, posId] : null,
    () => getTimestamp(Number(posId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: postTime } = useSWRMutation(
    ['post-timestamp'],
    async (_, { arg }: { arg: { body: TimestampBody; id: number } }) => {
      return postTimestamp(arg.body, arg.id);
    }
  );

  const handleBegin = async (deviceId: number) => {
    try {
      const body = { dateTimeStamp: new Date() }; // Send current timestamp
      const response = await postTime({ body, id: deviceId });

      if (response) {
        setDisabledButtons(prev => ({ ...prev, [deviceId]: true }));
      }

      mutate(prevData => {
        if (!prevData) return prevData;
        return prevData.map(item =>
          item.deviceId === deviceId
            ? { ...item, tookMoneyTime: response.tookMoneyTime }
            : item
        );
      }, false);
    } catch (error) {
      console.error('Error in postTimestamp:', error);
      showToast(t('errors.other.errorInPostTimestamp'), 'error');
    }
  };

  const columnsTimestamp = [
    {
      title: t('equipment.device'),
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: t('routes.collection'),
      key: 'begin',
      render: (_: unknown, record: TimestampResponse) => (
        <Can
          requiredPermissions={[{ action: 'create', subject: 'CashCollection' }, { action: 'manage', subject: 'CashCollection' }]}
          userPermissions={userPermissions}
        >
          {allowed => allowed && (
            <div className="flex justify-start">
              <Button
                title="Проинкассировал"
                classname="border border-successFill rounded px-2 py-2 text-successFill hover:border-successFill/80 hover:text-successFill/80"
                type="outline"
                handleClick={() => handleBegin(record.deviceId)}
                disabled={disabledButtons[record.deviceId]}
              />
            </div>
          )}
        </Can>
      ),
    },
    {
      title: t('table.headers.datePrevious'),
      dataIndex: 'oldTookMoneyTime',
      key: 'oldTookMoneyTime',
      render: (val: Date) =>
        val ? dayjs(val).format('DD.MM.YYYY HH:mm:ss') : '-',
    },
    {
      title: t('table.headers.dateCurrent'),
      dataIndex: 'tookMoneyTime',
      key: 'tookMoneyTime',
      render: (val: Date) =>
        val ? dayjs(val).format('DD.MM.YYYY HH:mm:ss') : '-',
    },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.timestamp')}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <PosFilter />

        <div className="mt-8">
          <Table
            dataSource={timestampData?.sort((a, b) => a.deviceId - b.deviceId)}
            columns={columnsTimestamp}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Timestamps;
