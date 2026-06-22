import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { parseIdsParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore';
import { usePosSearchOptions } from '@/hooks/usePosSearchOptions';

const PosFilterMulti: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const cityIds = parseIdsParam(searchParams, 'cityIds');
  const posIds = parseIdsParam(searchParams, 'posIds');
  const cityIdsKey = cityIds.join(',');

  const handleSelectedIdsPruned = useCallback(
    (validIds: number[]) => {
      updateSearchParams(searchParams, setSearchParams, {
        posIds: validIds.length ? validIds : undefined,
        page: DEFAULT_PAGE,
      });
    },
    [searchParams, setSearchParams]
  );

  const handleContextKeyChange = useCallback(() => {
    if (parseIdsParam(searchParams, 'posIds').length === 0) return;
    updateSearchParams(searchParams, setSearchParams, {
      posIds: undefined,
      page: DEFAULT_PAGE,
    });
  }, [searchParams, setSearchParams]);

  const { options, isLoading, debouncedSearchUpdate, resetSearch, updateCachedSelections } =
    usePosSearchOptions({
      placementIds: cityIds.length ? cityIds : undefined,
      organizationId: user.organizationId,
      enabled: Boolean(cityIds.length && user.organizationId),
      contextKey: cityIdsKey,
      selectedIds: posIds,
      onSelectedIdsPruned: handleSelectedIdsPruned,
      onContextKeyChange: handleContextKeyChange,
    });

  const handleChange = (values: string[]) => {
    const selected = values.map(v => Number(v)).filter(id => !Number.isNaN(id));
    updateCachedSelections(selected);
    resetSearch();
    updateSearchParams(searchParams, setSearchParams, {
      posIds: selected.length ? selected : undefined,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {t('analysis.posId')}
      </label>
      <Select
        mode="multiple"
        showSearch
        allowClear
        disabled={cityIds.length === 0}
        placeholder={t('filters.pos.placeholder')}
        value={posIds.map(String)}
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

export default PosFilterMulti;
