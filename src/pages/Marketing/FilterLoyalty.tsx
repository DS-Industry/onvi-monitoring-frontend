import { useState, useEffect } from 'react';
import { Button, Popover, Select, Checkbox } from 'antd';
import { CheckOutlined, FilterOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getWorkers } from '@/services/api/equipment';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';
import { getAvatarColorClasses } from '@/utils/avatarColors';
import { LoyaltyProgramStatus } from '@/services/api/marketing';

interface FilterValues {
  branch: string;
  status: string[];
  tags: string[];
  assigned: string[];
  dateFrom: dayjs.Dayjs | null;
  dateTo: dayjs.Dayjs | null;
}

type FilterType = 'status' | 'assigned';

interface FilterLoyaltyProps {
  display?: FilterType[];
}

const FilterLoyalty: React.FC<FilterLoyaltyProps> = ({
  display = ['status'],
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const user = useUser();

  const shouldShow = (filter: FilterType): boolean => {
    return display.includes(filter);
  };

  const { data: workersData } = useSWR(
    user.organizationId && shouldShow('assigned')
      ? ['get-workers', user.organizationId]
      : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const workerOptions =
    workersData?.map(worker => ({
      label: worker.name + ' ' + worker.surname,
      value: worker.id.toString(),
      id: worker.id,
    })) || [];

  const statusOptions = [
    { label: t('tables.ACTIVE'), value: LoyaltyProgramStatus.ACTIVE },
    { label: t('tables.PAUSE'), value: LoyaltyProgramStatus.PAUSE },
  ];

  const [filters, setFilters] = useState<FilterValues>(() => {
    const posId = searchParams.get('posId');
    const status = searchParams.get('status');
    const assigned = searchParams.get('assigned');
    const tags =
      searchParams
        .get('tags')
        ?.split(',')
        .map(tag => tag.trim()) || [];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    return {
      branch: posId || t('filters.filterTechTasks.all'),
      status: status ? [status] : [],
      assigned: assigned ? [assigned] : [],
      tags: tags,
      dateFrom: startDate ? dayjs(startDate) : null,
      dateTo: endDate ? dayjs(endDate) : null,
    };
  });

  const [tempFilters, setTempFilters] = useState<FilterValues>(filters);

  const defaultFilters: FilterValues = {
    branch: t('filters.filterTechTasks.all'),
    status: [],
    assigned: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
  };

  const updateFiltersToSearchParams = (newFilters: FilterValues) => {
    const updates: Record<string, string | undefined> = {};

    if (shouldShow('status') && newFilters.status.length > 0) {
      updates.status = newFilters.status[0];
    } else if (shouldShow('status')) {
      updates.status = undefined;
    }

    if (shouldShow('assigned') && newFilters.assigned.length > 0) {
      updates.assigned = newFilters.assigned[0];
    } else if (shouldShow('assigned')) {
      updates.assigned = undefined;
    }

    updates.page = '1';

    updateSearchParams(searchParams, setSearchParams, updates);
  };

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleApply = () => {
    setFilters(tempFilters);
    updateFiltersToSearchParams(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    updateFiltersToSearchParams(defaultFilters);
    setIsOpen(false);
  };

  const popoverContent = (
    <div className="px-3 pb-3 w-[90vw] max-w-[500px] sm:w-[400px]">
      <div className="flex justify-end space-x-2 mb-6">
        <Button
          onClick={handleReset}
          className="border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          {t('filters.filterTechTasks.clear')}
        </Button>
        <Button
          type="primary"
          onClick={handleApply}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {t('filters.filterTechTasks.apply')}
        </Button>
      </div>

      <div className="space-y-6">
        {shouldShow('status') && (
          <div>
            <div className="flex items-center mb-3">
              <CheckOutlined className="mr-2 font-bold text-black" />
              <span className="text-sm font-bold">
                {t('filters.filterTechTasks.status')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => {
                const isActive = option.value === LoyaltyProgramStatus.ACTIVE;
                const isPause = option.value === LoyaltyProgramStatus.PAUSE;
                const isSelected = tempFilters.status.includes(option.value);

                return (
                  <div
                    key={option.value}
                    className={`flex items-center p-2 rounded border-2 h-[32px] cursor-pointer hover:opacity-80 transition-opacity ${
                      isPause
                        ? 'border-orange-500 bg-orange-50'
                        : isActive
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 bg-gray-50'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setTempFilters(prev => ({ ...prev, status: [] }));
                      } else {
                        setTempFilters(prev => ({
                          ...prev,
                          status: [option.value],
                        }));
                      }
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={e => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setTempFilters(prev => ({
                            ...prev,
                            status: [option.value],
                          }));
                        } else {
                          setTempFilters(prev => ({ ...prev, status: [] }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{option.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {shouldShow('assigned') && (
          <div>
            <div className="flex items-center mb-3">
              <UserOutlined className="mr-2 font-bold text-black" />
              <span className="text-sm font-bold">
                {t('filters.filterTechTasks.assigned')}
              </span>
            </div>
            <Select
              className="w-full"
              placeholder={t('filters.filterTechTasks.selectAssignee')}
              value={
                tempFilters.assigned.length > 0
                  ? tempFilters.assigned[0]
                  : undefined
              }
              onChange={value => {
                setTempFilters(prev => ({
                  ...prev,
                  assigned: value ? [value] : [],
                }));
              }}
              allowClear
              showSearch
              filterOption={(input, option) => {
                const worker = workerOptions.find(
                  w => w.value === option?.value
                );
                return (
                  worker?.label.toLowerCase().includes(input.toLowerCase()) ||
                  false
                );
              }}
            >
              {workerOptions.map(worker => {
                const nameParts = worker.label.split(' ');
                const initials =
                  nameParts.length >= 2
                    ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
                    : worker.label.charAt(0).toUpperCase();

                const avatarColors = getAvatarColorClasses(worker.id);

                return (
                  <Select.Option key={worker.value} value={worker.value}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${avatarColors}`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{worker.label}</div>
                      </div>
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger="click"
      placement="bottomRight"
      classNames={{ root: 'filter-popover' }}
      styles={{ root: { maxWidth: 'calc(100vw - 16px)' } }}
      getPopupContainer={trigger => trigger.parentElement || document.body}
    >
      <Button icon={<FilterOutlined />}>
        {t('filters.filterTechTasks.title')}
      </Button>
    </Popover>
  );
};

export default FilterLoyalty;
