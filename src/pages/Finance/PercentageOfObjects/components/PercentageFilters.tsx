import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { DEFAULT_PAGE } from '@/utils/constants';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { SelectOptionString } from '../types';

type Props = {
  totalCount: number;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
  isPosFilterLoading: boolean;
  posFilterOptions: SelectOptionString[];
  partnerSelectOptions: Array<{ value: number; label: string }>;
};

const PercentageFilters: React.FC<Props> = ({
  totalCount,
  searchParams,
  setSearchParams,
  isPosFilterLoading,
  posFilterOptions,
  partnerSelectOptions,
}) => {
  const { t } = useTranslation();

  return (
    <GeneralFilters count={totalCount} display={['city']}>
      <div className="w-full sm:w-80">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {t('analysis.posId')}
        </label>
        <Select
          showSearch
          allowClear
          placeholder={t('filters.pos.placeholder')}
          value={searchParams.get('posId') ?? undefined}
          loading={isPosFilterLoading}
          options={posFilterOptions}
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={value =>
            updateSearchParams(searchParams, setSearchParams, {
              posId: value,
              page: DEFAULT_PAGE,
            })
          }
        />
      </div>
      <div className="w-full">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {t('finance.partnerName')}
        </label>
        <Select
          showSearch
          allowClear
          placeholder={t('finance.selectPartner')}
          value={searchParams.get('partnerId') ?? undefined}
          options={partnerSelectOptions.map(option => ({
            value: String(option.value),
            label: option.label,
          }))}
          style={{ minWidth: '200px' }}
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={value =>
            updateSearchParams(searchParams, setSearchParams, {
              partnerId: value,
              page: DEFAULT_PAGE,
            })
          }
        />
      </div>
    </GeneralFilters>
  );
};

export default PercentageFilters;
