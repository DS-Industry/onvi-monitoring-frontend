import React from 'react';
import Settings from './Settings';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const RewardsCreation: React.FC = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.bonus')}
          </span>
        </div>
      </div>
      <Settings
        nextStep={id =>
          navigate(`/marketing/loyalty/bonus?loyaltyId=${id}&tab=levels`)
        }
      />
    </>
  );
};

export default RewardsCreation;
