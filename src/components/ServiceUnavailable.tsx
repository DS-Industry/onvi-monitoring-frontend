import { Result } from 'antd';
import { useTranslation } from 'react-i18next';

const ServiceUnavailable: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center bg-white px-4"
      role="alert"
    >
      <Result
        status="500"
        title={
          <span className="text-3xl font-semibold sm:text-4xl">
            {t('serviceUnavailable.title')}
          </span>
        }
        subTitle={
          <span className="text-lg">{t('serviceUnavailable.description')}</span>
        }
      />
    </div>
  );
};

export default ServiceUnavailable;
