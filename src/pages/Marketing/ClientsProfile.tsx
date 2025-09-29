import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
const BasicInformation = React.lazy(() => import('./BasicInformation'));
const KeyTab = React.lazy(() => import('./KeyTab'));
const Loyalty = React.lazy(() => import('./Loyalty'));
import GenericTabs from '@ui/Tabs/GenericTab';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import useSWR from 'swr';
import { getClientById } from '@/services/api/marketing';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Skeleton, Spin } from 'antd';

const ClientsProfile: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'basic';

  const navigate = useNavigate();

  const handleTabChange = (key: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      tab: key,
    });
  };

  const userId = searchParams.get('userId')
    ? Number(searchParams.get('userId'))
    : undefined;

  const { data: clientData, isLoading, isValidating } = useSWR(
    userId ? [`get-client-by-id`] : null,
    () => getClientById(userId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const showLoading = isLoading || isValidating;


  const tabItems = [
    {
      key: 'basic',
      label: t('warehouse.basic'),
      content: <BasicInformation />,
    },
    {
      key: 'key',
      label: t('marketing.key'),
      content: <KeyTab />,
    },
    {
      key: 'loyalty',
      label: t('news.loyalty'),
      content: <Loyalty />,
    },
  ];

  return (
    <>
    <Suspense
        fallback={
          <div className="max-w-5xl bg-white">
            <div className="flex text-primary02 mb-5 cursor-pointer">
              <Skeleton.Input
                active
                size="small"
                style={{ width: 80, marginLeft: 8 }}
              />
            </div>

            <div className="ml-12 md:ml-0 mb-5">
              <div className="flex items-center space-x-2">
                <Skeleton.Input
                  active
                  style={{ width: 200, height: 28 }}
                />
              </div>
            </div>
            <div className="flex items-center justify-center w-full h-full min-h-[400px]">
              <Spin size="large" />
            </div>
          </div>
        }
      >
        <div
          className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
          onClick={()=> {
            navigate(-1)
          }}
        >
          <ArrowLeftOutlined />
          <p className="ms-2">{t('login.back')}</p>
        </div>
        <div className="ml-12 md:ml-0 mb-5">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-3xl font-normal text-text01">
              {t('marketing.client')} {showLoading ? <Skeleton.Input active size="small" style={{ width: 200, height: 28 }} /> : clientData?.name}
            </span>
          </div>
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
      </Suspense>
    </>
  );
};

export default ClientsProfile;
