import React, { useEffect, useState } from 'react';
import { Button, Select, Spin, Transfer } from 'antd';
import { useUser } from '@/hooks/useUserStore';
import { useToast } from '@/components/context/useContext';
import useSWR, { mutate } from 'swr';
import {
  getLoyaltyProgramPermissionById,
  getLoyaltyProgramPermissionByOrgId,
  loyaltyProgramsConnection,
} from '@/services/api/marketing';
import { getWorkers } from '@/services/api/equipment';
import { useTranslation } from 'react-i18next';
import useSWRMutation from 'swr/mutation';

const RewardProgramsConnection: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const { showToast } = useToast();

  const [workerId, setWorkerId] = useState<number>(user.id);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const { data: rewardsPermissionData = [] } = useSWR(
    user.organizationId
      ? ['get-loyalty-permission', user.organizationId]
      : null,
    () =>
      getLoyaltyProgramPermissionByOrgId({
        organizationId: String(user.organizationId),
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: rewardsPermissionUserData = [], isLoading } = useSWR(
    ['get-loyalty-permission-user', workerId],
    () => getLoyaltyProgramPermissionById(workerId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const { data: workerData = [] } = useSWR(
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
    workerData.map(w => ({
      label: `${w.name || ''} ${w.middlename || ''} ${w.surname || ''}`.trim(),
      value: w.id,
    })) || [];

  const transferData = rewardsPermissionData.map(item => ({
    key: item.id.toString(),
    title: item.name,
  }));

  useEffect(() => {
    if (rewardsPermissionUserData) {
      setTargetKeys(rewardsPermissionUserData.map(item => item.id.toString()));
    }
  }, [rewardsPermissionUserData]);

  const handleTransferChange = (nextTargetKeys: React.Key[]) => {
    setTargetKeys(nextTargetKeys.map(String));
  };

  const handleSelectChange = (
    sourceSelectedKeys: React.Key[],
    targetSelectedKeys: React.Key[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys].map(String));
  };

  const { trigger: connectLoyalty, isMutating } = useSWRMutation(
    ['connect-loyalty'],
    async () =>
      loyaltyProgramsConnection(workerId, {
        loyaltyProgramIds: targetKeys.map(Number),
      })
  );

  const handleConnection = async () => {
    try {
      const result = await connectLoyalty();
      if (result) {
        mutate(['get-loyalty-permission-user', workerId]);
        mutate(['get-loyalty-permission']);
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
            notFoundContent={t('table.noData')}
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

export default RewardProgramsConnection;
