import NoDataUI from '@ui/NoDataUI.tsx';
import SalyIamge from '@/assets/Saly-11.png';
import { useTranslation } from 'react-i18next';

const LoyaltyPrograms = () => {
  const { t } = useTranslation();
  return (
    <div>
      <NoDataUI title={t('default.default')} description={t('default.come')}>
        <img src={SalyIamge} className="mx-auto" loading="lazy" alt="Loyalty" />
      </NoDataUI>
    </div>
  );
};

export default LoyaltyPrograms;
