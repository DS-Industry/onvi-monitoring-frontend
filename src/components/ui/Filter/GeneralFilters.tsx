import React, { useEffect, useRef, useState } from 'react';
import { Collapse } from 'antd';
import { useTranslation } from 'react-i18next';
import SearchInputFilter from './SearchInputFilter';
import CityFilter from './CityFilter';
import OrganizationFilter from './OrganizationFilter';
import PosFilter from './PosFilter';
import DeviceFilter from './DeviceFilter';
import WarehouseFilter from './WarehouseFilter';
import DateTimeFilter from './DateTimeFilter';
import ResetButton from './ResetButton';
import FilterCount from './FilterCount';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import EmployeeFilter from './EmployeeFilter';
import PhoneFilter from './PhoneFilter';
import UserTypeFilter from './UserTypeFilter';
import TagsFilter from './TagsFilter';
import PaperTypeFilter from './PaperTypeFilter';
import GroupFilter from './GroupFilter';

type FilterType =
  | 'search'
  | 'city'
  | 'organization'
  | 'pos'
  | 'device'
  | 'warehouse'
  | 'dateTime'
  | 'reset'
  | 'count'
  | 'employee'
  | 'phone'
  | 'userType'
  | 'tagIds'
  | 'paper'
  | 'group';

type GeneralFiltersProps = {
  count: number;
  display?: FilterType[];
  children?: React.ReactNode;
  onReset?: () => void;
};

const GeneralFilters: React.FC<GeneralFiltersProps> = ({
  count,
  display = [
    'search',
    'city',
    'organization',
    'pos',
    'device',
    'warehouse',
    'dateTime',
    'reset',
    'count',
    'employee',
    'phone',
    'userType',
    'tagIds',
    'paper',
    'group',
  ],
  children,
  onReset,
}) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeFilterKey, setActiveFilterKey] = useState<string[]>([]);

  const shouldShow = (filter: FilterType) => display.includes(filter);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (shouldShow('dateTime')) {
      const currentStart = searchParams.get('dateStart');
      const currentEnd = searchParams.get('dateEnd');

      if (!currentStart || !currentEnd) {
        const defaultStart = dayjs()
          .subtract(7, 'day')
          .format('YYYY-MM-DDTHH:mm');
        const defaultEnd = dayjs().format('YYYY-MM-DDTHH:mm');

        updateSearchParams(searchParams, setSearchParams, {
          dateStart: defaultStart,
          dateEnd: defaultEnd,
        });
      }
    }
  }, [shouldShow, display]);

  return (
    <Collapse
      bordered={false}
      ghost
      style={{ marginBottom: 16 }}
      activeKey={activeFilterKey}
      onChange={keys => setActiveFilterKey(keys as string[])}
      items={[
        {
          key: 'filter-1',
          label: (
            <span className="font-semibold text-base">
              {activeFilterKey.includes('1')
                ? t('routes.filter')
                : t('routes.expand')}
            </span>
          ),
          style: { background: '#fafafa', borderRadius: 8 },
          children: (
            <div
              ref={contentRef}
              className="overflow-hidden transition-all duration-500 ease-in-out"
            >
              <div className="flex flex-wrap gap-4">
                {shouldShow('search') && <SearchInputFilter />}
                {shouldShow('city') && <CityFilter />}
                {shouldShow('organization') && <OrganizationFilter />}
                {shouldShow('pos') && <PosFilter />}
                {shouldShow('device') && <DeviceFilter />}
                {shouldShow('warehouse') && <WarehouseFilter />}
                {shouldShow('employee') && <EmployeeFilter />}
                {shouldShow('phone') && <PhoneFilter />}
                {shouldShow('userType') && <UserTypeFilter />}
                {shouldShow('tagIds') && <TagsFilter />}
                {shouldShow('paper') && <PaperTypeFilter />}
                {shouldShow('group') && <GroupFilter />}
                {children}
              </div>

              <div className="flex flex-wrap">
                {shouldShow('dateTime') && <DateTimeFilter />}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {shouldShow('reset') && <ResetButton onReset={onReset} />}
                {shouldShow('count') && <FilterCount count={count} />}
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default GeneralFilters;
