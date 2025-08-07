import React, { useState } from 'react';
import { Steps } from 'antd';
import Settings from './Settings';
import Levels from './Levels';
import { useTranslation } from 'react-i18next';

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
    <div className="p-6 bg-white rounded shadow-md">
      <Steps current={currentStep} className="mb-6">
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>

      <div className="mb-6">{steps[currentStep].content}</div>
    </div>
  );
};

export default RewardsCreation;
