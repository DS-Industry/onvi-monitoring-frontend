import React, { useState } from 'react';
import { Steps } from 'antd';
import Settings from './Settings';
import Levels from './Levels';
import { useTranslation } from 'react-i18next';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

const { Step } = Steps;

const RewardsCreation: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => setCurrentStep(prev => prev + 1);
  const prev = () => setCurrentStep(prev => prev - 1);

  const steps = [
    {
      title: t('marketing.basic'),
      content: <Settings nextStep={next} />,
    },
    {
      title: t('marketing.levels'),
      content: <Levels prevStep={prev} />,
    },
  ];

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.bonus')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>
      <div className="p-6 bg-white rounded shadow-md">
        <Steps current={currentStep} className="mb-6">
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>

        <div className="mb-6">{steps[currentStep].content}</div>
      </div>
    </>
  );
};

export default RewardsCreation;
