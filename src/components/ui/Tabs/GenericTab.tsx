import React from 'react';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

type TabItem = {
  key: string;
  label: string;
  content: React.ReactNode;
};

type GenericTabsProps = {
  tabs: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  tabBarGutter?: number;
  tabBarStyle?: React.CSSProperties;
  type?: 'line' | 'card';
  size?: 'large' | 'middle' | 'small';
};

const GenericTabs: React.FC<GenericTabsProps> = ({
  tabs,
  defaultActiveKey = '0',
  activeKey,
  onChange,
  tabBarGutter = 32,
  tabBarStyle = { marginBottom: 32 },
  type = 'line',
  size = 'large',
}) => {
  return (
    <Tabs
      defaultActiveKey={defaultActiveKey}
      activeKey={activeKey}
      onChange={onChange}
      tabBarGutter={tabBarGutter}
      tabBarStyle={tabBarStyle}
      type={type}
      size={size}
    >
      {tabs.map(tab => (
        <TabPane tab={tab.label} key={tab.key}>
          {tab.content}
        </TabPane>
      ))}
    </Tabs>
  );
};

export default GenericTabs;
