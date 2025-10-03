import React, { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUserStore';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  connectPosPermission,
  getPosPermission,
  getPosPermissionUser,
} from '@/services/api/organization';
import { getWorkers } from '@/services/api/equipment';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/context/useContext';
import { Transfer, Button, Spin, Select } from 'antd';

const PosConnection: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const { showToast } = useToast();

  const [workerId, setWorkerId] = useState<number>(user.id);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const { data: posPermissionData = [] } = useSWR(
    ['get-pos-permission'],
    getPosPermission,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: posPermissionUserData = [], isLoading } = useSWR(
    ['get-pos-permission-user', workerId],
    () => getPosPermissionUser(workerId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: workerData } = useSWR(
    user.organizationId ? ['get-worker', user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const workers =
    workerData?.map(w => ({
      label: `${w.name || ''} ${w.middlename || ''} ${w.surname || ''}`.trim(),
      value: w.id,
    })) || [];

  const transferData = posPermissionData.map(item => ({
    key: item.id.toString(),
    title: item.name,
  }));

  useEffect(() => {
    if (posPermissionUserData) {
      setTargetKeys(posPermissionUserData.map(item => item.id.toString()));
    }
  }, [posPermissionUserData]);

  const handleTransferChange = (nextTargetKeys: React.Key[]) => {
    setTargetKeys(nextTargetKeys.map(String));
  };

  const handleSelectChange = (
    sourceSelectedKeys: React.Key[],
    targetSelectedKeys: React.Key[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys].map(String));
  };

  const { trigger: connectPos, isMutating } = useSWRMutation(
    ['connect-pos'],
    async () =>
      connectPosPermission({ posIds: targetKeys.map(Number) }, workerId)
  );

  const handleConnection = async () => {
    try {
      const result = await connectPos();
      if (result) {
        mutate(['get-pos-permission-user', workerId]);
        mutate(['get-pos-permission']);
        showToast(t('analysis.the'), 'success');
      }
    } catch {
      showToast(t('errors.other.theOperationUnsuccessful'), 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="h-[600px] w-full flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-2 sm:items-center">
        <div>
          <div className="text-text02 text-sm">{t('equipment.user')}</div>
          <Select
            options={workers}
            className="w-full sm:w-72"
            value={workerId}
            onChange={setWorkerId}
            showSearch={true}
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </div>
        <Button
          loading={isMutating}
          onClick={handleConnection}
          type="primary"
          className="mt-5"
        >
          {t('organizations.save')}
        </Button>
      </div>
      <Transfer
        dataSource={transferData}
        titles={[t('analysis.branch'), t('analysis.added')]}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={handleTransferChange}
        onSelectChange={handleSelectChange}
        render={item => item.title}
        listStyle={{ width: 350, height: 400 }}
        showSearch
        rowKey={item => item.key}
        style={{ margin: '24px 0' }}
        locale={{
          itemUnit: t('transfer.item'),
          itemsUnit: t('transfer.items'),
          notFoundContent: t('transfer.notFound'),
          searchPlaceholder: t('transfer.search'),
          remove: t('transfer.remove'),
          selectAll: t('transfer.selectAll'),
          selectCurrent: t('transfer.selectCurrent'),
          selectInvert: t('transfer.selectInvert'),
          removeAll: t('transfer.removeAll'),
          removeCurrent: t('transfer.removeCurrent'),
        }}
      />
    </div>
  );
};

export default PosConnection;
