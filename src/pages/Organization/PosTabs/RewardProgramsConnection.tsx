import React, { useEffect, useState } from 'react';
import { Transfer } from 'antd';

const rewardPrograms = [
  { id: 1, name: 'Gold Membership' },
  { id: 2, name: 'Silver Membership' },
  { id: 3, name: 'Platinum Rewards' },
  { id: 4, name: 'Loyalty Plus' },
  { id: 5, name: 'VIP Exclusive' },
];

const RewardProgramsConnection: React.FC = () => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const dataSource = rewardPrograms.map(item => ({
    key: item.id.toString(),
    title: item.name,
  }));

  useEffect(() => {
    setTargetKeys([]); 
  }, []);

  const handleChange = (nextTargetKeys: React.Key[]) => {
    setTargetKeys(nextTargetKeys.map(String));
  };

  const handleSelectChange = (sourceSelectedKeys: React.Key[], targetSelectedKeys: React.Key[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys].map(String));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reward Programs Connection</h2>
      <Transfer
        dataSource={dataSource}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        render={item => item.title}
        titles={['Available Programs', 'Selected Programs']}
        listStyle={{ width: 350, height: 400 }}
        showSearch
        style={{ margin: '24px 0' }}
      />
    </div>
  );
};

export default RewardProgramsConnection;
