import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore.ts';
import PosSearchSelect from './PosSearchSelect';

const parsePosIdParam = (searchParams: URLSearchParams) => {
  const raw = getParam(searchParams, 'posId');
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isNaN(id) ? undefined : id;
};

const PosFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city');
  const placementId = useMemo(() => {
    if (!cityParam) return undefined;
    const id = Number(cityParam);
    return Number.isNaN(id) ? undefined : id;
  }, [cityParam]);
  const selectedPosId = useMemo(() => parsePosIdParam(searchParams), [searchParams]);
  const user = useUser();
  const prevPlacementIdRef = useRef(placementId);

  useEffect(() => {
    if (getParam(searchParams, 'posId') && selectedPosId === undefined) {
      updateSearchParams(searchParams, setSearchParams, {
        posId: undefined,
        page: DEFAULT_PAGE,
      });
    }
  }, [searchParams, selectedPosId, setSearchParams]);

  useEffect(() => {
    if (prevPlacementIdRef.current === placementId) return;
    prevPlacementIdRef.current = placementId;
    if (!getParam(searchParams, 'posId')) return;
    updateSearchParams(searchParams, setSearchParams, {
      posId: undefined,
      page: DEFAULT_PAGE,
    });
  }, [placementId, searchParams, setSearchParams]);

  const handleChange = useCallback(
    (val: number | undefined) => {
      updateSearchParams(searchParams, setSearchParams, {
        posId: val ? String(val) : undefined,
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
      <PosSearchSelect
        key={placementId ?? ''}
        value={selectedPosId}
        placementId={placementId}
        organizationId={user.organizationId}
        placeholder={t('filters.pos.placeholder')}
        className="w-full"
        onChange={handleChange}
      />
    </div>
  );
};

export default PosFilter;
