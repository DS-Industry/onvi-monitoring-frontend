import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore.ts';
import { usePosSearchOptions } from '@/hooks/usePosSearchOptions';

const PosFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const placementId = Number(searchParams.get('city')) || undefined;
  const posIdParam = getParam(searchParams, 'posId');
  const selectedPosId = posIdParam ? Number(posIdParam) : undefined;
  const user = useUser();

  const handleSelectedIdsPruned = useCallback(
    (validIds: number[]) => {
      updateSearchParams(searchParams, setSearchParams, {
        posId: validIds[0] ? String(validIds[0]) : undefined,
        page: DEFAULT_PAGE,
      });
    },
    [searchParams, setSearchParams]
  );

  const { options, isLoading, debouncedSearchUpdate, resetSearch, updateCachedSelections } =
    usePosSearchOptions({
      placementId,
      organizationId: user.organizationId,
      enabled: Boolean(user.organizationId),
      contextKey: String(placementId ?? ''),
      selectedIds: selectedPosId ? [selectedPosId] : [],
      onSelectedIdsPruned: handleSelectedIdsPruned,
    });

  const handleChange = (val: string | undefined) => {
    if (val) {
      updateCachedSelections([Number(val)]);
    }
    resetSearch();
    updateSearchParams(searchParams, setSearchParams, {
      posId: val,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.posId')}
      </label>
      <Select
        showSearch
        allowClear
        placeholder={t('filters.pos.placeholder')}
        value={posIdParam}
        onChange={handleChange}
        loading={isLoading}
        className="w-full"
        options={options}
        filterOption={false}
        onSearch={debouncedSearchUpdate}
      />
    </div>
  );
};

export default PosFilter;
