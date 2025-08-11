import React from 'react';
import { useTranslation } from 'react-i18next';

type FilterCountProps = {
  count: number;
};

const FilterCount: React.FC<FilterCountProps> = ({ count }) => {
  const { t } = useTranslation();

  return (
    <p className="font-semibold">
      {t('analysis.found')}: {count}
    </p>
  );
};

export default FilterCount;
