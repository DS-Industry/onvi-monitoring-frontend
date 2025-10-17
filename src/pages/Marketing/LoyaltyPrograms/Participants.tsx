import React from 'react';
import { useTranslation } from 'react-i18next';
import CarIcon from '@icons/CarIcon.svg?react';

const Participants: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-10 bg-background02 p-4">
      <div className="flex flex-col rounded-lg p-8 w-full md:p-0 space-y-10">
        <div className="flex items-center space-x-4">
          <CarIcon />
          <div>
            <div className="font-semibold text-text01">
              {t('marketingLoyalty.participants')}
            </div>
            <div className="text-text03 text-xs">
              {t('marketingLoyalty.displaying')}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex space-x-2">
          <div className="font-semibold text-text01">
            {t('marketingLoyalty.participatingBranches')} —
          </div>
          <div className="font-semibold text-primary02">10</div>
        </div>
        <div className="text-text03 text-sm">
          {t('marketingLoyalty.theLoyalty')}
        </div>
      </div>
      <div>
        <div className="font-semibold text-text01">
          {t('marketingLoyalty.expansion')}
        </div>
        <div className="text-text03 text-sm">
          {t('marketingLoyalty.toExpand')}
        </div>
      </div>
    </div>
  );
};

export default Participants;
