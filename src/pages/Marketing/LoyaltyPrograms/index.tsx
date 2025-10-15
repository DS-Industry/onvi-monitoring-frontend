import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Steps, Button } from 'antd';
import BasicData from './BasicData';
import WriteOffRules from './WriteOffRules';
import LevelsBonuses from './LevelsBonuses';
import Participants from './Participants';
import Publications from './Publications';
import { updateSearchParams } from '@/utils/searchParamsUtils';

const { Step } = Steps;

const LoyaltyPrograms: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = (Number(searchParams.get('step')) || 1) - 1;

  const steps = [
    {
      title: t('marketingLoyalty.basicData'),
      content: <BasicData />,
    },
    {
      title: t('marketingLoyalty.writeOff'),
      content: <WriteOffRules />,
    },
    {
      title: t('marketingLoyalty.levelsAndBonuses'),
      content: <LevelsBonuses />,
    },
    {
      title: t('marketingLoyalty.participants'),
      content: <Participants />,
    },
    {
      title: t('marketingLoyalty.publication'),
      content: <Publications />,
    },
  ];

  const next = () => {
    updateSearchParams(searchParams, setSearchParams, {
      step: Math.min(currentStep + 2, steps.length),
    });
  };

  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-10">
          <div
            className="flex text-primary02 cursor-pointer"
            onClick={() => navigate('/marketing/loyalty')}
          >
            <ArrowLeftOutlined />
            <p className="ms-2">{t('login.back')}</p>
          </div>
          <div>
            <span className="text-xl sm:text-3xl font-normal text-text01">
              {t('routes.createLoyalty')}
            </span>
          </div>
        </div>
      </div>

      <div className="ml-12">
        <Steps current={currentStep} size="default" labelPlacement="vertical">
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>

        <div className="mt-5">{steps[currentStep].content}</div>

        <div className="mt-5 flex gap-2">
          <Button
            onClick={next}
            disabled={currentStep === steps.length - 1}
            type="primary"
          >
            {t('common.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPrograms;
