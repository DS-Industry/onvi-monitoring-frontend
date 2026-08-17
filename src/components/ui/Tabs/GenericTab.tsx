import React from 'react';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

type TabItem = {
  key: string;
  label: React.ReactNode;
  content?: React.ReactNode;
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
  /** When true, only the tab bar is shown; panel body is rendered by the parent. */
  tabBarOnly?: boolean;
  destroyInactiveTabPane?: boolean;
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
  tabBarOnly = false,
  destroyInactiveTabPane = false,
}) => {
  return (
    <div
      className={tabBarOnly ? '[&_.ant-tabs-content-holder]:hidden' : undefined}
    >
      <Tabs
        defaultActiveKey={defaultActiveKey}
        activeKey={activeKey}
        onChange={onChange}
        tabBarGutter={tabBarGutter}
        tabBarStyle={tabBarStyle}
        type={type}
        size={size}
        destroyInactiveTabPane={destroyInactiveTabPane}
      >
        {tabs.map(tab => (
          <TabPane tab={tab.label} key={tab.key}>
            {tabBarOnly ? null : tab.content}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default GenericTabs;
