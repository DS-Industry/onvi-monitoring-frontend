import React, { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUserStore';
import useSWR from 'swr';
import {
  connectPosPermission,
  getPosPermission,
  getPosPermissionUser,
} from '@/services/api/organization';
import Button from '@/components/ui/Button/Button';
import { useTranslation } from 'react-i18next';
import useSWRMutation from 'swr/mutation';
import { getWorkers } from '@/services/api/equipment';
import { useToast } from '@/components/context/useContext';
import SearchDropdownInput from '@/components/ui/Input/SearchDropdownInput';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
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

  const { data: posPermissionData } = useSWR(
    [`get-pos-permission`],
    () => getPosPermission(),
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

  const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const { trigger: connectPos, isMutating } = useSWRMutation(
    ['connect-pos'],
    async () =>
      connectPosPermission(
        {
          posIds: selected,
        },
        workerId
      )
  );

  const workers: { name: string; value: number }[] =
    workerData?.map(item => ({
      name: item.name + ' ' + item.middlename + ' ' + item.surname,
      value: item.id,
    })) || [];

  useEffect(() => {
    if (posPermissionUserData) setSelectedItems(posPermissionUserData);
  }, [posPermissionUserData]);

  useEffect(() => {
    if (posPermissionData && posPermissionUserData) {
      const filteredAvailableItems = posPermissionData.filter(
        (item: Item) =>
          !posPermissionUserData.some(
            (selectedItem: Item) => selectedItem.id === item.id
          )
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
    setAvailableItems(
      availableItems.filter(item => !selected.includes(item.id))
    );
    setSelectedItems([...selectedItems, ...movingItems]);
  };

  const handleTransferToAvailable = () => {
    const movingItems = selectedItems.filter(item =>
      selected.includes(item.id)
    );
    setSelectedItems(selectedItems.filter(item => !selected.includes(item.id)));
    setAvailableItems([...availableItems, ...movingItems]);
  };

  const toggleSelection = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleConnection = async () => {
    try {
      const result = await connectPos();
      if (result) {
        showToast(t('analysis.the'), 'success');
      }
    } catch (error) {
      showToast(t('errors.other.theOperationUnsuccessful'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-2 items-center">
        <SearchDropdownInput
          title={t('equipment.user')}
          options={workers}
          classname="w-full sm:w-72"
          value={workerId}
          onChange={value => setWorkerId(value)}
          allowClear={true}
        />
        <Button
          title={t('organizations.save')}
          isLoading={isMutating}
          handleClick={handleConnection}
          classname="h-10 mt-2 sm:mt-5 w-full sm:w-auto"
        />
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Available Items List */}
        <div className="border rounded w-full md:w-1/3">
          <div className="flex border-b-[1px] bg-background05 text-xs">
            <div className="font-normal text-text01 p-2">
              {t('analysis.branch')}
            </div>
            <div className="ml-auto mr-2 text-text01 p-2">
              {availableItems.length}
            </div>
          </div>
          <div className="border-b-[1px] h-64 md:h-96 overflow-y-auto w-full">
            {availableItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleSelection(item.id)}
                className={`border-b-[1px] text-text01 pl-3 p-1 cursor-pointer ${selected.includes(item.id) ? 'bg-background06' : 'hover:bg-background06'}`}
              >
                <div className="font-light text-[11px]">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons in the center */}
        <div className="flex flex-row md:flex-col max-w-full md:max-w-96 justify-center items-center my-2 space-x-2 md:space-x-0 md:space-y-2">
          <button
            className="border border-b-0 bg-white text-black cursor-pointer p-2"
            onClick={handleTransferToSelected}
            disabled={selected.length === 0}
            title={'→'}
          >
            <ArrowRightOutlined />
          </button>
          <button
            className="border border-t-0 bg-white text-black cursor-pointer p-2"
            onClick={handleTransferToAvailable}
            disabled={selected.length === 0}
            title={'←'}
          >
            <ArrowLeftOutlined />
          </button>
        </div>

        {/* Selected Items List */}
        <div className="border rounded w-full md:w-1/3">
          <div className="flex border-b-[1px] bg-background05 text-xs">
            <div className="font-normal text-text01 p-2">
              {t('analysis.added')}
            </div>
            <div className="ml-auto mr-2 text-text01 p-2">
              {selectedItems.length}
            </div>
          </div>
          <div className="border-b-[1px] h-64 md:h-96 overflow-y-auto w-full">
            {selectedItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleSelection(item.id)}
                className={`border-b-[1px] text-text01 pl-3 p-1 cursor-pointer ${selected.includes(item.id) ? 'bg-background06' : 'hover:bg-background06'}`}
              >
                <div className="text-[11px] font-light">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosConnection;
