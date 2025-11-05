import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarOutlined,
  CarOutlined,
  LineChartOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Button, Card, Select } from 'antd';
import TransactionAnalyticsChart from '@/components/ui/TransactionAnalyticsChart';

const Stats: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'lastMonth' | 'lastWeek' | 'lastYear'>(
    'lastMonth'
  );

  const periodOptions = [
    { value: 'lastWeek', label: t('marketingLoyalty.lastWeek') },
    { value: 'lastMonth', label: t('marketingLoyalty.lastMonth') },
    { value: 'lastYear', label: t('marketingLoyalty.lastYear') },
  ];

  const statsCards = [
    {
      icon: <CarOutlined className="text-black text-2xl" />,
      label: t('marketingLoyalty.connectedBranches'),
      value: 0,
      bgColor: 'bg-[#BFFA00]',
      iconBgColor: 'bg-[#BFFA00]',
    },
    {
      icon: <UsergroupAddOutlined className="text-black text-2xl" />,
      label: t('marketingLoyalty.engagedClients'),
      value: 0,
      bgColor: 'bg-[#BFFA00]',
      iconBgColor: 'bg-[#BFFA00]',
    },
    {
      icon: <CalendarOutlined className="text-black text-2xl" />,
      label: t('marketingLoyalty.programDurationDays'),
      value: 0,
      bgColor: '#CCC',
      iconBgColor: 'bg-[#BFFA00]',
    },
  ];

  return (
    <div className="flex flex-col space-y-6 bg-background02">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary02 flex items-center justify-center rounded-full text-white">
          <LineChartOutlined style={{ fontSize: 24 }} />
        </div>
        <div>
          <div className="font-bold text-text01 text-2xl">
            {t('marketingLoyalty.stats')}
          </div>
          <div className="text-base03 text-md">
            {t('marketingCampaigns.displaying')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statsCards.map((card, index) => (
          <Card
            key={`${card.label}-${index}`}
            className="shadow-md hover:shadow-lg transition-shadow duration-200"
            styles={{ body: { padding: '24px' } }}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 ${card.iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <div className="text-white flex items-center justify-center">
                  {card.icon}
                </div>
              </div>

              <div className="flex flex-col">
                <p className="text-base03 text-sm mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-text01">{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1">
        <Card className="shadow-md">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-text01">
              {t('marketingCampaigns.uses')}
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Select
                value={period}
                onChange={value => {
                  setPeriod(value);
                }}
                options={periodOptions}
                className="w-full sm:w-[150px]"
              />
            </div>
          </div>

          <TransactionAnalyticsChart data={[]} />
        </Card>
      </div>

      <div className="flex justify-end gap-2 mt-auto">
        <Button className="w-full sm:w-auto">
          {t('marketingLoyalty.saveAndExit')}
        </Button>
      </div>
    </div>
  );
};

export default Stats;
