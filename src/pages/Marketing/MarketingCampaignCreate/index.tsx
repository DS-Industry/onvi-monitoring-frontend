import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  SettingOutlined,
  CreditCardOutlined,
  CarOutlined,
  FireOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import BasicInformation from './BasicInformation';
import Terms from './Terms';
import Promotion from './Promotion';
import Geography from './Geography';
import { Steps } from 'antd';
import Stats from './Stats';

const { Step } = Steps;

const MarketingCampaignCreate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = (Number(searchParams.get('step')) || 1) - 1;

  const steps = [
    {
      title: t('warehouse.basic'),
      content: <BasicInformation />,
      icon: <SettingOutlined />,
    },
    {
      title: t('marketingCampaigns.terms'),
      content: <Terms />,
      icon: <CreditCardOutlined />,
    },
    {
      title: t('marketingCampaigns.promotion'),
      content: <Promotion />,
      icon: <CarOutlined />,
    },
    {
      title: t('marketingCampaigns.geography'),
      content: <Geography />,
      icon: <FireOutlined />,
    },
    {
      title: t('marketingLoyalty.stats'),
      content: <Stats />,
      icon: <LineChartOutlined />,
    },
  ];

  const handleStepClick = (stepIndex: number) => {
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
              {t('routes.creatingCampaign')}
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
              icon={null}
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
