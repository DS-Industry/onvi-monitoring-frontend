import React from "react";
import { Tabs } from "antd";
import { useTranslation } from "react-i18next";
import News from "./News";
import Indicators from "./Indicators";
import RatingOfCarWases from "./RatingOfCarWases";

const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-5">
      <Tabs
        defaultActiveKey="0"
        tabBarGutter={32}
        tabBarStyle={{ marginBottom: 32 }}
        type="line"
        size="large"
      >
        <TabPane tab={t("dashboard.news")} key="0">
          <News />
        </TabPane>
        <TabPane tab={t("dashboard.indicators")} key="1">
          <Indicators />
        </TabPane>
        <TabPane tab={t("dashboard.rating")} key="2">
          <RatingOfCarWases />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard;
