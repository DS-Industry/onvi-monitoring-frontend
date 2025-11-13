import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  SettingOutlined,
  CreditCardOutlined,
  CarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import BasicInformation from './BasicInformation';
import Terms from './Terms';
import ExecutionType from './ExecutionType';
import RewardValidityPeriod from './RewardValidityPeriod';
import Promotion from './Promotion';
import Geography from './Geography';
import { Steps } from 'antd';
import BasicInformationUpdate from './update/BasicInformationUpdate';
import { getMarketingCampaignById } from '@/services/api/marketing';
import useSWR from 'swr';

const { Step } = Steps;

const MarketingCampaignCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = (Number(searchParams.get('step')) || 1) - 1;

  const marketingCampaignId = Number(searchParams.get('marketingCampaignId'));

  const isUpdate = Boolean(searchParams.get('mode') === 'edit');

  const {
    data: marketingCampaign,
    isValidating,
    isLoading,
    mutate,
  } = useSWR(
    marketingCampaignId
      ? [`get-marketing-campaign-by-id`, marketingCampaignId]
      : null,
    () => getMarketingCampaignById(marketingCampaignId),
    {
      revalidateOnFocus: false,
    }
  );

  const isHubPlus = marketingCampaign?.ltyProgramHubPlus;

  const steps = [
    {
      title: t('warehouse.basic'),
      content: isUpdate ? (
        <BasicInformationUpdate
          campaign={marketingCampaign}
          isLoading={isLoading || isValidating}
          mutate={mutate}
        />
      ) : (
        <BasicInformation />
      ),
      icon: <SettingOutlined />,
    },
    {
      title: t('marketingCampaigns.executionType'),
      content: <ExecutionType />,
      icon: <ThunderboltOutlined />,
    },
    {
      title: t('marketingCampaigns.terms'),
      content: <Terms />,
      icon: <CreditCardOutlined />,
    },
    {
      title: t('marketingCampaigns.rewardValidityPeriod'),
      content: <RewardValidityPeriod />,
      icon: <CalendarOutlined />,
    },
    ...(!isHubPlus
      ? [
        {
          title: t('marketingCampaigns.promotion'),
          content: <Promotion />,
          icon: <CarOutlined />,
        },
      ]
      : []),
    {
      title: t('marketingCampaigns.geography'),
      content: <Geography />,
      icon: <FireOutlined />,
    }
  ];

  const handleStepClick = (stepIndex: number) => {
    if (!isUpdate) return;
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('step', (stepIndex + 1).toString());
    setSearchParams(newSearchParams);
  };

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-10">
          <div
            className="flex text-primary02 cursor-pointer"
            onClick={() => navigate('/marketing/campaigns')}
          >
            <ArrowLeftOutlined />
            <p className="ms-2">{t('login.back')}</p>
          </div>
          <div>
            <span className="text-xl sm:text-3xl font-normal text-text01">
              {isUpdate
                ? marketingCampaign?.name
                : t('routes.creatingCampaign')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        <Steps
          current={currentStep}
          size="default"
          labelPlacement="vertical"
          onChange={handleStepClick}
        >
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              icon={isUpdate ? step.icon : undefined}
            />
          ))}
        </Steps>
        <div className="mt-5">
          <div>{steps[currentStep].content}</div>
        </div>
      </div>
    </div>
  );
};

export default MarketingCampaignCreate;
