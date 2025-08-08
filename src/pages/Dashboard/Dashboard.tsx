import React from 'react';
import { useTranslation } from 'react-i18next';
const News = React.lazy(() => import('./News'));
// const Indicators = React.lazy(() => import("./Indicators"));
// const RatingOfCarWases = React.lazy(() => import("./RatingOfCarWases"));
import GenericTabs from '@ui/Tabs/GenericTab';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    {
      key: '0',
      label: t('dashboard.news'),
      content: <News />,
    },
    // {
    //   key: "1",
    //   label: t("dashboard.indicators"),
    //   content: <Indicators />,
    // },
    // {
    //   key: "2",
    //   label: t("dashboard.rating"),
    //   content: <RatingOfCarWases />,
    // },
  ];

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.dashboard')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>
      <div className="py-5">
        <GenericTabs tabs={tabItems} />
      </div>
    </div>
  );
};

export default Dashboard;
