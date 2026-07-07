import React, { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parseIdsParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore';
import PosSearchSelectMulti from './PosSearchSelectMulti';

const PosFilterMulti: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const cityIds = parseIdsParam(searchParams, 'cityIds');
  const posIds = parseIdsParam(searchParams, 'posIds');
  const cityIdsKey = cityIds.join(',');
  const prevCityIdsKeyRef = useRef(cityIdsKey);

  useEffect(() => {
    if (prevCityIdsKeyRef.current === cityIdsKey) return;
    prevCityIdsKeyRef.current = cityIdsKey;
    if (!parseIdsParam(searchParams, 'posIds').length) return;
    updateSearchParams(searchParams, setSearchParams, {
      posIds: undefined,
      page: DEFAULT_PAGE,
    });
  }, [cityIdsKey, searchParams, setSearchParams]);

  const handleChange = useCallback(
    (selected: number[]) => {
      updateSearchParams(searchParams, setSearchParams, {
        posIds: selected.length ? selected : undefined,
        page: DEFAULT_PAGE,
      });
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.posId')}
      </label>
      <PosSearchSelectMulti
        key={cityIdsKey}
        value={posIds}
        placementIds={cityIds.length ? cityIds : undefined}
        organizationId={user.organizationId}
        disabled={cityIds.length === 0}
        placeholder={t('filters.pos.placeholder')}
        className="w-full"
        onChange={handleChange}
      />
    </div>
  );
};

export default PosFilterMulti;
