import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Card, Spin, Alert, Select, Button } from 'antd';
import { 
  LineChartOutlined, 
  CarOutlined, 
  UsergroupAddOutlined, 
  CalendarOutlined, 
  LeftOutlined
} from '@ant-design/icons';
import useSWR from 'swr';
import { 
  getLoyaltyProgramAnalytics, 
  getLoyaltyProgramTransactionAnalytics,
  TransactionAnalyticsParams,
} from '@/services/api/marketing';
import TransactionAnalyticsChart from '@/components/ui/TransactionAnalyticsChart';

import { updateSearchParams } from '@/utils/searchParamsUtils';

interface StatsProps {
  isEditable?: boolean;
}

const Stats: React.FC<StatsProps> = ({isEditable = true}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));
  
  const [period, setPeriod] = useState<'lastMonth' | 'lastWeek' | 'lastYear'>('lastMonth');
  
  const isUpdate = Boolean(searchParams.get('mode') === 'edit');
  const currentStep = Number(searchParams.get('step')) || 1;

  const { data: analytics, error, isLoading } = useSWR(
    loyaltyProgramId ? [`get-loyalty-program-analytics`, loyaltyProgramId] : null,
    () => getLoyaltyProgramAnalytics(loyaltyProgramId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const transactionParams: TransactionAnalyticsParams = {
    period
  };

  const { data: transactionAnalytics, error: transactionError, isLoading: transactionLoading } = useSWR(
    loyaltyProgramId ? [`get-loyalty-program-transaction-analytics`, loyaltyProgramId, transactionParams] : null,
    () => getLoyaltyProgramTransactionAnalytics(loyaltyProgramId, transactionParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const goBack = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: currentStep - 1,
    });
  };

  if (!loyaltyProgramId) {
    return (
      <div className="px-4 md:px-0">
        <Alert
          message="No Program ID"
          description="Please provide a loyalty program ID in the URL parameters"
          type="warning"
          showIcon
          className="my-4 md:my-5"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-0">
        <Alert
          message="Error Loading Analytics"
          description="Failed to load loyalty program analytics. Please try again later."
          type="error"
          showIcon
          className="my-4 md:my-5"
        />
      </div>
    );
  }

  const periodOptions = [
    { value: 'lastWeek', label: t('marketingLoyalty.lastWeek') },
    { value: 'lastMonth', label: t('marketingLoyalty.lastMonth') },
    { value: 'lastYear', label: t('marketingLoyalty.lastYear') },
  ];

  const statsCards = [
    {
      icon: <CarOutlined className="text-black" />,
      label: t('marketingLoyalty.connectedBranches'),
      value: analytics?.connectedPoses || 0,
      bgColor: 'bg-[#BFFA00]',
      iconBgColor:'bg-[#BFFA00]',
    },
    {
      icon: <UsergroupAddOutlined className="text-black" />,
      label: t('marketingLoyalty.engagedClients'),
      value: analytics?.engagedClients || 0,
      bgColor: 'bg-[#BFFA00]',
      iconBgColor: 'bg-[#BFFA00]',
    },
    {
      icon: <CalendarOutlined className="text-black" />,
      label: t('marketingLoyalty.programDurationDays'),
      value: analytics?.programDurationDays || 0,
      bgColor: '#CCC',
      iconBgColor: 'bg-[#BFFA00]',
    },
  ];

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-10 bg-background02">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <LineChartOutlined className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text01">
            {t('marketingLoyalty.stats')}
          </h2>
          <p className="text-gray-500 text-sm">
            {t('marketingLoyalty.statsSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statsCards.map((card, index) => (
          <Card
            key={index}
            className="shadow-md hover:shadow-lg transition-shadow duration-200"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${card.iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <div className="text-white text-lg">
                  {card.icon}
                </div>
              </div>
              
              <div className="flex flex-col">
                <p className="text-gray-500 text-sm font-medium mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-text01">
                  {card.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

        <div className="grid grid-cols-1">
          <Card className="shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-text01">
                {t('marketingLoyalty.accrualsAndDebits')}
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <Select
                  value={period}
                  onChange={(value) => {
                    setPeriod(value);
                  }}
                  options={periodOptions}
                  className="w-full sm:w-[150px]"
                />
              </div>
            </div>
            
            {transactionLoading ? (
              <div className="flex items-center justify-center h-96">
                <Spin size="large" />
              </div>
            ) : transactionError ? (
              <Alert
                message="Error Loading Chart Data"
                description="Failed to load transaction analytics. Please try again later."
                type="error"
                showIcon
              />
            ) : transactionAnalytics?.data ? (
              <TransactionAnalyticsChart data={transactionAnalytics.data} />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                {t("table.noData")}
              </div>
            )}
          </Card>
        </div>
        {isEditable && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
        <div className="order-2 sm:order-1">
          {currentStep > 1 && isUpdate && (
            <Button
              icon={<LeftOutlined />}
              onClick={goBack}
              className="w-full sm:w-auto"
            >
              {t('common.back')}
            </Button>
          )}
        </div></div>)}
    </div>
  );
};

export default Stats;