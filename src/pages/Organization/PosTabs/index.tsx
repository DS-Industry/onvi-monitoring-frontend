import React from 'react';
import { useTranslation } from 'react-i18next';
import PosConnection from './PosConnection';
import RewardProgramsConnection from './RewardProgramsConnection';
import GenericTabs from '@/components/ui/Tabs/GenericTab';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { ArrowLeftOutlined } from '@ant-design/icons';

const PosTabs: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'pos';

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      tab: key,
    });
  };

  const tabItems = [
    {
      key: 'pos',
      label: t('constants.pos'),
      content: <PosConnection />,
    },
    {
      key: 'rewardPrograms',
      label: t('constants.rewardPrograms'),
      content: <RewardProgramsConnection />,
    },
  ];

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 flex items-center space-x-2 mb-5">
        <span className="text-xl sm:text-3xl font-normal text-text01">
          {t('routes.pos')}
        </span>
      </div>
      <div className="max-w-5xl bg-white">
        <GenericTabs
          tabs={tabItems}
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarGutter={24}
          tabBarStyle={{ marginBottom: 24 }}
          type="line"
        />
      </div>
    </>
  );
};

export default PosTabs;
