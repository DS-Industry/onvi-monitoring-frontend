import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Select } from 'antd';
import { getPoses } from '@/services/api/equipment';
import { parseIdsParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';
import { useUser } from '@/hooks/useUserStore';
import { getNumericPrefix } from '@/utils/getNumericPrefix';

const PosFilterMulti: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();

  const cityIds = parseIdsParam(searchParams, 'cityIds');
  const posIds = parseIdsParam(searchParams, 'posIds');

  const { data: posData, isLoading } = useSWR(
    cityIds.length && user.organizationId
      ? [`get-pos-multi`, cityIds.join(','), user.organizationId]
      : null,
    () =>
      getPoses({
        placementIds: cityIds,
        organizationId: user.organizationId!,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const sortedPoses = useMemo(
    () =>
      posData
        ?.slice()
        .sort((a, b) => {
          const numA = getNumericPrefix(a.name);
          const numB = getNumericPrefix(b.name);
          if (numA !== numB) return numA - numB;
          return a.name.localeCompare(b.name);
        })
        .map(item => ({
          label: item.name,
          value: String(item.id),
        })) || [],
    [posData]
  );

  const validPosIdSet = useMemo(
    () => new Set(sortedPoses.map(opt => Number(opt.value))),
    [sortedPoses]
  );

  useEffect(() => {
    if (!posData || cityIds.length === 0) return;

    const currentPosIds = parseIdsParam(searchParams, 'posIds');
    const pruned = currentPosIds.filter(id => validPosIdSet.has(id));
    if (pruned.length === currentPosIds.length) return;

    updateSearchParams(searchParams, setSearchParams, {
      posIds: pruned.length ? pruned : undefined,
    });
  }, [cityIds.join(','), posData, validPosIdSet, searchParams, setSearchParams]);

  const handleChange = (values: string[]) => {
    const selected = values.map(v => Number(v)).filter(id => !Number.isNaN(id));

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
        options={sortedPoses}
        optionFilterProp="label"
        filterOption={(input, option) =>
          (option?.label ?? '')
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    </div>
  );
};

export default PosFilterMulti;
