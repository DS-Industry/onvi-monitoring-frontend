import NoDataUI from '@ui/NoDataUI.tsx';
import SalyIamge from '@/assets/Saly-11.png';
import { useTranslation } from 'react-i18next';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

const Default = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('default.default')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>
      <NoDataUI title={t('default.default')} description={t('default.come')}>
        <img src={SalyIamge} className="mx-auto" loading="lazy" alt="DEFAULT" />
      </NoDataUI>
    </div>
  );
};

export default Default;
