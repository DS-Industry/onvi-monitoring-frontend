import React from 'react';
import { useTranslation } from 'react-i18next';
import OverviewKpiCard from '../components/OverviewKpiCard';
import HorizontalBarList from '../components/HorizontalBarList';
import { getIdleLoadColor } from '../utils/goalStatus';

/** Mock UI — bay idle API is not implemented */
const MOCK_BOXES = [
  { key: '1', label: 'Пост 1', value: 27 },
  { key: '3', label: 'Пост 3', value: 23 },
  { key: '4', label: 'Пост 4', value: 21 },
];

type IdleBoxesTabProps = {
  posId: number;
  dateStart: string;
  dateEnd: string;
};

const IdleBoxesTab: React.FC<IdleBoxesTabProps> = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <OverviewKpiCard label={t('posOverview.idleEpisodes')} value="4" />
        <OverviewKpiCard
          label={t('posOverview.idleTotal')}
          value={`92 ${t('posOverview.min')}`}
        />
        <OverviewKpiCard
          label={t('posOverview.idleMaxLoad')}
          value={`27 ${t('posOverview.minPerHour')}`}
        />
      </div>

      <HorizontalBarList
        title={t('posOverview.idleLoadByBoxes')}
        showBullet
        headerRight={
          <span className="text-sm text-primary02 opacity-50 cursor-default">
            {t('posOverview.goToFullTable')}
          </span>
        }
        items={MOCK_BOXES.map(box => ({
          key: box.key,
          label: box.label,
          value: box.value,
          displayValue: `${box.value} ${t('posOverview.minPerHour')}`,
          barColor: getIdleLoadColor(box.value),
          maxScale: 40,
        }))}
        footer={
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text02">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-successFill" />
              {t('posOverview.idleLegendNormal')}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-warningFill" />
              {t('posOverview.idleLegendAttention')}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-errorFill" />
              {t('posOverview.idleLegendCritical')}
            </span>
          </div>
        }
      />
    </div>
  );
};

export default IdleBoxesTab;
