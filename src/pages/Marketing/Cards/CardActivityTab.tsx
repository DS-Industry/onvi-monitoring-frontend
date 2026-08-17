import React from 'react';
import { useTranslation } from 'react-i18next';
import { Empty } from 'antd';
import ClientActivityPanel from './ClientActivityPanel';
import HorizontalBarList from '@/pages/Pos/Overview/components/HorizontalBarList';

type CardActivityTabProps = {
  clientId: number;
  organizationId?: number;
};

const CardActivityTab: React.FC<CardActivityTabProps> = ({
  clientId,
  organizationId,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <ClientActivityPanel
        clientId={clientId}
        organizationId={organizationId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HorizontalBarList
          title={t('marketing.favoriteCarWash')}
          items={[]}
          emptyText={t('marketing.comingSoon')}
          showBullet
          className="border border-gray-100 shadow-none"
        />
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="text-base font-semibold text-text01 mb-4">
            {t('marketing.serviceTypes')}
          </div>
          <Empty description={t('marketing.comingSoon')} />
        </div>
      </div>
    </div>
  );
};

export default CardActivityTab;
