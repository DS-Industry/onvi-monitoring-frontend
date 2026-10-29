import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  className?: string;
};

const RequiredFieldsHint: React.FC<Props> = ({ className = '' }: Props) => {
  const { t } = useTranslation();

  return (
    <p className={`font-semibold text-sm text-text01 ${className}`}>
      {t('routine.fields')} <span className="text-errorFill">*</span>{' '}
      {t('routine.are')}
    </p>
  );
};

export default RequiredFieldsHint;
