import { useState, useEffect } from 'react';
import { Button, Popover, Select, Checkbox, DatePicker, Avatar } from 'antd';
import { CarOutlined, CheckOutlined, FilterOutlined, ScheduleOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getTags, getPoses, StatusTechTask, getWorkers } from '@/services/api/equipment';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useUser } from '@/hooks/useUserStore';

interface FilterValues {
  branch: string;
  status: string[];
  tags: string[];
  assigned: string[];
  dateFrom: dayjs.Dayjs | null;
  dateTo: dayjs.Dayjs | null;
}

type FilterType = 'status' | 'assigned' | 'tags' | 'dateRange' | 'branch';

interface FilterTechTasksProps {
  display?: FilterType[];
}

const FilterTechTasks: React.FC<FilterTechTasksProps> = ({
  display = ['status', 'tags', 'dateRange', 'branch'],
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const user = useUser()

  const shouldShow = (filter: FilterType): boolean => {
    return display.includes(filter);
  };

  const { data: tagsData } = useSWR(['get-tags'], getTags, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const { data: posesData } = useSWR( user.organizationId ? ['get-poses'] : null, () => getPoses({
    organizationId: user.organizationId,
  }), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const { data: workersData } = useSWR(
    user.organizationId && shouldShow('assigned') ? ['get-workers', user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  );

  const tagOptions = tagsData?.map(tag => ({
    label: tag.props.name,
    value: tag.props.name,
  })) || [];

  const branchOptions = posesData?.map(pos => ({
    label: pos.name,
    value: pos.id.toString(),
  })) || [];

  const workerOptions = workersData?.map(worker => ({
    label: worker.name,
    value: worker.id.toString(),
  })) || [];

  const statusOptions = [
    { label: t('tables.ACTIVE'), value: StatusTechTask.ACTIVE },
    { label: t('tables.FINISHED'), value: StatusTechTask.FINISHED },
    { label: t('tables.OVERDUE'), value: StatusTechTask.OVERDUE },
    { label: t('tables.RETURNED'), value: StatusTechTask.RETURNED },
  ];

  const [filters, setFilters] = useState<FilterValues>(() => {
    const posId = searchParams.get('posId');
    const status = searchParams.get('status');
    const assigned = searchParams.get('assigned');
    const tags = searchParams.get('tags')?.split(',').map(tag => tag.trim()) || [];
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
    
    if (shouldShow('branch') && newFilters.branch !== t('filters.filterTechTasks.all')) {
      updates.posId = newFilters.branch;
    } else if (shouldShow('branch')) {
      updates.posId = undefined;
    }
    
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
    
    if (shouldShow('tags') && newFilters.tags.length > 0) {
      updates.tags = newFilters.tags.join(',');
    } else if (shouldShow('tags')) {
      updates.tags = undefined;
    }
    
    if (shouldShow('dateRange') && newFilters.dateFrom) {
      updates.startDate = newFilters.dateFrom.format('YYYY-MM-DD');
    } else if (shouldShow('dateRange')) {
      updates.startDate = undefined;
    }
    
    if (shouldShow('dateRange') && newFilters.dateTo) {
      updates.endDate = newFilters.dateTo.format('YYYY-MM-DD');
    } else if (shouldShow('dateRange')) {
      updates.endDate = undefined;
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
        <Button onClick={handleReset} className="border-blue-500 text-blue-500 hover:bg-blue-50">
          {t('filters.filterTechTasks.clear')}
        </Button>
        <Button type="primary" onClick={handleApply} className="bg-blue-500 hover:bg-blue-600">
          {t('filters.filterTechTasks.apply')}
        </Button>
      </div>

      <div className="space-y-6">
        {shouldShow('branch') && (
          <div>
            <div className="flex items-center mb-3">
              <CarOutlined className="mr-2 font-bold text-black" />
              <span className="text-sm font-bold">
                {t('filters.filterTechTasks.branch')}
              </span>
            </div>
            <Select
              className="w-full"
              value={tempFilters.branch}
              onChange={(value) => setTempFilters(prev => ({ ...prev, branch: value }))}
              options={[
                { label: t('filters.filterTechTasks.all'), value: t('filters.filterTechTasks.all') },
                ...branchOptions
              ]}
              suffixIcon={<span className="text-gray-400">▼</span>}
            />
          </div>
        )}

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
                const isOverdue = option.value === StatusTechTask.OVERDUE;
                const isActive = option.value === StatusTechTask.ACTIVE;
                const isFinished = option.value === StatusTechTask.FINISHED;
                const isReturned = option.value === StatusTechTask.RETURNED;
                const isSelected = tempFilters.status.includes(option.value);
                
                return (
                  <div 
                    key={option.value} 
                    className={`flex items-center p-2 rounded border-2 h-[32px] cursor-pointer hover:opacity-80 transition-opacity ${
                      isOverdue 
                        ? 'border-red-500 bg-red-50' 
                        : isActive 
                          ? 'border-orange-500 bg-orange-50' 
                          : isFinished
                            ? 'border-green-500 bg-green-50'
                            : isReturned
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 bg-gray-50'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setTempFilters(prev => ({ ...prev, status: [] }));
                      } else {
                        setTempFilters(prev => ({ ...prev, status: [option.value] }));
                      }
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setTempFilters(prev => ({ ...prev, status: [option.value] }));
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

        {shouldShow('tags') && (
          <div>
            <div className="flex items-center mb-3">
              <UnorderedListOutlined className="mr-2 font-bold text-black" />
              <span className="text-sm font-bold">
                {t('filters.filterTechTasks.tags')}
              </span>
            </div>
            <Select
              mode="multiple"
              className="w-full"
              value={tempFilters.tags}
              onChange={(value) => setTempFilters(prev => ({ ...prev, tags: value }))}
              options={tagOptions}
              placeholder={t('filters.filterTechTasks.all')}
              suffixIcon={<span className="text-gray-400">▼</span>}
            />
          </div>
        )}

        {shouldShow('dateRange') && (
          <div>
            <div className="flex items-center mb-3">
              <ScheduleOutlined className="mr-2 font-bold text-black" />
              <span className="text-sm font-bold">
                {t('filters.filterTechTasks.dateRange')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <DatePicker
                className="flex-1"
                value={tempFilters.dateFrom}
                onChange={(date) => setTempFilters(prev => ({ ...prev, dateFrom: date }))}
                placeholder={t('filters.filterTechTasks.startDatePlaceholder')}
                format="DD.MM.YYYY"
                suffixIcon={<span className="text-gray-400">📅</span>}
              />
              <div className="text-center text-gray-500 text-sm whitespace-nowrap">по</div>
              <DatePicker
                className="flex-1"
                value={tempFilters.dateTo}
                onChange={(date) => setTempFilters(prev => ({ ...prev, dateTo: date }))}
                placeholder={t('filters.filterTechTasks.endDatePlaceholder')}
                format="DD.MM.YYYY"
                suffixIcon={<span className="text-gray-400">📅</span>}
              />
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
              value={tempFilters.assigned.length > 0 ? tempFilters.assigned[0] : undefined}
              onChange={(value) => {
                setTempFilters(prev => ({ 
                  ...prev, 
                  assigned: value ? [value] : [] 
                }));
              }}
              allowClear
              showSearch
              filterOption={(input, option) => {
                const worker = workerOptions.find(w => w.value === option?.value);
                return worker?.label.toLowerCase().includes(input.toLowerCase()) || false;
              }}
            >
              {workerOptions.map(worker => {
                const nameParts = worker.label.split(' ');
                const initials = nameParts.length >= 2 
                  ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
                  : worker.label.charAt(0).toUpperCase();
                
                const colors = ['#f56a00', '#87d068', '#108ee9', '#722ed1', '#eb2f96'];
                const colorIndex = initials.charCodeAt(0) % colors.length;
                const avatarColor = colors[colorIndex];
                
                return (
                  <Select.Option key={worker.value} value={worker.value}>
                    <div className="flex items-center gap-3">
                      <Avatar size="small" style={{ backgroundColor: avatarColor }}>
                        {initials}
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{worker.label}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {worker.label.toLowerCase().replace(/\s+/g, '')}
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
      overlayClassName="filter-popover"
      overlayStyle={{ maxWidth: 'calc(100vw - 16px)' }}
      getPopupContainer={(trigger) => trigger.parentElement || document.body}
    >
      <Button icon={<FilterOutlined />}>
        {t('filters.filterTechTasks.title')}
      </Button>
    </Popover>
  );
};

export default FilterTechTasks;
