import React, { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUserStore';
import useSWR from 'swr';
import {
  connectPosPermission,
  getPosPermission,
  getPosPermissionUser,
} from '@/services/api/organization';
import { useTranslation } from 'react-i18next';
import useSWRMutation from 'swr/mutation';
import { getWorkers } from '@/services/api/equipment';
import { useToast } from '@/components/context/useContext';
import SearchDropdownInput from '@/components/ui/Input/SearchDropdownInput';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import ItemList from '@/components/ui/ItemList/ItemList';

interface Item {
  id: number;
  name: string;
}

const PosConnection: React.FC = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const user = useUser();
  const [workerId, setWorkerId] = useState(user.id);
  const { showToast } = useToast();
  const screens = useBreakpoint();

  const { data: posPermissionData } = useSWR(
    [`get-pos-permission`],
    getPosPermission,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: posPermissionUserData } = useSWR(
    [`get-pos-permission-user`, workerId],
    () => getPosPermissionUser(workerId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: connectPos, isMutating } = useSWRMutation(
    ['connect-pos'],
    async () => connectPosPermission({ posIds: selected }, workerId)
  );

  const workers: { name: string; value: number }[] =
    workerData?.map(item => ({
      name: `${item.name} ${item.middlename} ${item.surname}`,
      value: item.id,
    })) || [];

  useEffect(() => {
    if (posPermissionUserData) setSelectedItems(posPermissionUserData);
  }, [posPermissionUserData]);

  useEffect(() => {
    if (posPermissionData && posPermissionUserData) {
      const filteredAvailableItems = posPermissionData.filter(
        (item: Item) =>
          !posPermissionUserData.some((s: Item) => s.id === item.id)
      );
      setAvailableItems(filteredAvailableItems);
      setSelectedItems(posPermissionUserData);
    }
  }, [posPermissionData, posPermissionUserData]);

  useEffect(() => {
    setSelected(selectedItems.map(item => item.id));
  }, [selectedItems]);

  const handleTransferToSelected = () => {
    const movingItems = availableItems.filter(item =>
      selected.includes(item.id)
    );
    setAvailableItems(prev => prev.filter(item => !selected.includes(item.id)));
    setSelectedItems(prev => [...prev, ...movingItems]);
  };

  const handleTransferToAvailable = () => {
    const movingItems = selectedItems.filter(item =>
      selected.includes(item.id)
    );
    setSelectedItems(prev => prev.filter(item => !selected.includes(item.id)));
    setAvailableItems(prev => [...prev, ...movingItems]);
  };

  const toggleSelection = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConnection = async () => {
    try {
      const result = await connectPos();
      if (result) showToast(t('analysis.the'), 'success');
    } catch {
      showToast(t('errors.other.theOperationUnsuccessful'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-2 sm:items-center">
        <SearchDropdownInput
          title={t('equipment.user')}
          options={workers}
          classname="w-full sm:w-72"
          value={workerId}
          onChange={setWorkerId}
          allowClear
        />
        <Button
          loading={isMutating}
          onClick={handleConnection}
          type="primary"
          className="mt-5 h-10"
        >
          {t('organizations.save')}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <ItemList
          title={t('analysis.branch')}
          items={availableItems}
          selected={selected}
          toggleSelection={toggleSelection}
        />

        <div className="flex flex-row md:flex-col justify-center items-center space-x-2 md:space-x-0 md:space-y-2">
          <button
            className="border bg-white text-black cursor-pointer p-2"
            onClick={handleTransferToSelected}
            disabled={selected.length === 0}
            title="→"
          >
            {screens.md ? <ArrowRightOutlined /> : <ArrowDownOutlined />}
          </button>
          <button
            className="border bg-white text-black cursor-pointer p-2"
            onClick={handleTransferToAvailable}
            disabled={selected.length === 0}
            title="←"
          >
            {screens.md ? <ArrowLeftOutlined /> : <ArrowUpOutlined />}
          </button>
        </div>

        <ItemList
          title={t('analysis.added')}
          items={selectedItems}
          selected={selected}
          toggleSelection={toggleSelection}
        />
      </div>
    </div>
  );
};

export default PosConnection;
