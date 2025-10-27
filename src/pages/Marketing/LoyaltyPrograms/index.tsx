import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  SettingOutlined,
  CreditCardOutlined,
  CarOutlined,
  FireOutlined,
  SyncOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Steps, Skeleton } from 'antd';
import BasicData from './BasicData';
import BasicDataUpdate from './update/BasicDataUpdate';
import WriteOffRules from './WriteOffRules';
import LevelsBonuses from './LevelsBonuses';
import Participants from './Participants';
import Publications from './Publications';
import Stats from './Stats';
import useSWR from 'swr';
import { getLoyaltyProgramById, getTiers } from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';

const { Step } = Steps;

const LoyaltyPrograms: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = (Number(searchParams.get('step')) || 1) - 1;

  const loyaltyProgramId = Number(searchParams.get('loyaltyProgramId'));

  const isUpdate = Boolean(searchParams.get('mode') === 'edit');

  const { data: program, isValidating, isLoading, mutate } = useSWR(
    loyaltyProgramId ? [`get-loyalty-program-by-id`, loyaltyProgramId] : null,
    () => getLoyaltyProgramById(loyaltyProgramId),
    {
      revalidateOnFocus: false,
    }
  );

  const { data: tiersData, isLoading: tiersLoading } = useSWR(loyaltyProgramId ?
    [`get-tiers`, loyaltyProgramId] : null,
    () => getTiers({ programId: loyaltyProgramId || '*' }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const tiers = tiersData || [];


  const user = useUser()

  const isOwner = program?.ownerOrganizationId === user?.organizationId;

  const handleStepClick = (stepIndex: number) => {
    if (!isUpdate) return
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('step', (stepIndex + 1).toString());
    setSearchParams(newSearchParams);
  };

  const steps = [
    {
      title: t('marketingLoyalty.basicData'),
      content: isUpdate ? <BasicDataUpdate program={program} isLoading={isValidating || isLoading || tiersLoading} mutate={mutate} isEditable={isOwner} minLevels={tiers.length > 0 ? tiers.length : 1} /> : <BasicData isEditable={true} />,
      icon: <SettingOutlined />,
    },
    {
      title: t('marketingLoyalty.writeOff'),
      content: <WriteOffRules program={program} isLoading={isValidating || isLoading} mutate={mutate} isEditable={isOwner} />,
      icon: <CreditCardOutlined />,
    },
    {
      title: t('marketingLoyalty.participants'),
      content: <Participants isEditable={isOwner} />,
      icon: <CarOutlined />,
    },
    {
      title: t('marketingLoyalty.levelsAndBonuses'),
      content: <LevelsBonuses program={program} isEditable={isOwner} />,
      icon: <FireOutlined />,
    },
    ...(isOwner || !isUpdate ? [{
      title: t('marketingLoyalty.publication'),
      content: <Publications program={program} loadingProgram={isValidating || isLoading} />,
      icon: <SyncOutlined />,
    }] : []),
    ...(isUpdate
      ? [{
        title: t('marketingLoyalty.stats'),
        content: <Stats isEditable={isOwner} />,
        icon: <LineChartOutlined />,
      }]
      : []),
  ];

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
              {isUpdate ? t('routes.viewLoyalty') : t('routes.createLoyalty')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        {(isLoading || tiersLoading) && isUpdate ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
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
        )}
        <div className="mt-5">
          <div>
            {steps[currentStep].content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPrograms;
