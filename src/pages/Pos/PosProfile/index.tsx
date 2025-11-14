import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import BasicInformation from './BasicInformation';
import ShiftCost from './ShiftCost';
import GenericTabs from '@/components/ui/Tabs/GenericTab';

const PosProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab') || 'basic';

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      tab: key,
    });
  };

  const tabItems = [
    {
      key: 'basic',
      label: t('pos.basicInformation'),
      content: <BasicInformation />,
    },
    {
      key: 'shift',
      label: t('pos.shiftCost'),
      content: <ShiftCost />,
    },
  ];

  return (
    <div>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.viewBranch')}
          </span>
        </div>
      </div>
      <div className="max-w-5xl bg-white">
        <div className="py-5">
          <GenericTabs
            tabs={tabItems}
            activeKey={tabFromUrl}
            onChange={handleTabChange}
            tabBarGutter={24}
            tabBarStyle={{ marginBottom: 24 }}
            type="line"
          />
        </div>
      </div>
    </div>
  );
};

export default PosProfile;
