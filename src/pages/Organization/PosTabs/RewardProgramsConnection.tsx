import React, { useEffect, useState } from 'react';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import ItemList from '@/components/ui/ItemList/ItemList';

interface Item {
  id: number;
  name: string;
}

const RewardProgramsConnection: React.FC = () => {
  const [selected, setSelected] = useState<number[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const screens = useBreakpoint();

  const rewardPrograms: Item[] = [
    { id: 1, name: 'Gold Membership' },
    { id: 2, name: 'Silver Membership' },
    { id: 3, name: 'Platinum Rewards' },
    { id: 4, name: 'Loyalty Plus' },
    { id: 5, name: 'VIP Exclusive' },
  ];

  useEffect(() => {
    setAvailableItems(rewardPrograms);
  }, []);

  const handleTransferToSelected = () => {
    const movingItems = availableItems.filter(item =>
      selected.includes(item.id)
    );
    setAvailableItems(prev => prev.filter(item => !selected.includes(item.id)));
    setSelectedItems(prev => [...prev, ...movingItems]);
    setSelected([]); 
  };

  const handleTransferToAvailable = () => {
    const movingItems = selectedItems.filter(item =>
      selected.includes(item.id)
    );
    setSelectedItems(prev => prev.filter(item => !selected.includes(item.id)));
    setAvailableItems(prev => [...prev, ...movingItems]);
    setSelected([]); 
  };

  const toggleSelection = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reward Programs Connection</h2>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <ItemList
          title="Available Programs"
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
          title="Selected Programs"
          items={selectedItems}
          selected={selected}
          toggleSelection={toggleSelection}
        />
      </div>
    </div>
  );
};

export default RewardProgramsConnection;
