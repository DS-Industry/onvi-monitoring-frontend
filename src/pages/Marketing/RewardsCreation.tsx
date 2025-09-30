import React from 'react';
import Settings from './Settings';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const RewardsCreation: React.FC = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return (
    <>
      <div>
        <div
          className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeftOutlined />
          <p className="ms-2">{t('login.back')}</p>
        </div>
      </div>
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
