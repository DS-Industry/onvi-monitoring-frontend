import React from "react";
import { useTranslation } from "react-i18next";
const News = React.lazy(() => import("./News"));
const Indicators = React.lazy(() => import("./Indicators"));
const RatingOfCarWases = React.lazy(() => import("./RatingOfCarWases"));
import GenericTabs from "@ui/Tabs/GenericTab";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    {
      key: "0",
      label: t("dashboard.news"),
      content: <News />,
    },
    {
      key: "1",
      label: t("dashboard.indicators"),
      content: <Indicators />,
    },
    {
      key: "2",
      label: t("dashboard.rating"),
      content: <RatingOfCarWases />,
    },
  ];

  return (
    <div className="py-5">
      <GenericTabs tabs={tabItems} />
    </div>
  );
};

export default Dashboard;
