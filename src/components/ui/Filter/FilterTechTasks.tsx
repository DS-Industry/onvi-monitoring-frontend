import { useState, useEffect } from 'react';
import { Button, Popover, Select, Checkbox, DatePicker } from 'antd';
import { CarOutlined, CheckOutlined, FilterOutlined, ScheduleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { getTags, getPoses, StatusTechTask } from '@/services/api/equipment';
import useSWR from 'swr';
import dayjs from 'dayjs';

interface FilterValues {
  branch: string;
  status: string[];
  tags: string[];
  dateFrom: dayjs.Dayjs | null;
  dateTo: dayjs.Dayjs | null;
}


const FilterTechTasks = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const { data: tagsData } = useSWR('get-tags', getTags, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const { data: posesData } = useSWR('get-poses', () => getPoses({}), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  const tagOptions = tagsData?.map(tag => ({
    label: tag.props.name,
    value: tag.props.name,
  })) || [];

  const branchOptions = posesData?.map(pos => ({
    label: pos.name,
    value: pos.id.toString(),
  })) || [];

  const statusOptions = [
    { label: t('tables.ACTIVE'), value: StatusTechTask.ACTIVE },
    { label: t('tables.OVERDUE'), value: StatusTechTask.OVERDUE },
  ];

  const [filters, setFilters] = useState<FilterValues>(() => {
    const posId = searchParams.get('posId');
    const status = searchParams.get('status');
    const tags = searchParams.get('tags')?.split(',').map(tag => tag.trim()) || [];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    return {
      branch: posId || t('filters.filterTechTasks.all'),
      status: status ? [status] : [],
      tags: tags,
      dateFrom: startDate ? dayjs(startDate) : null,
      dateTo: endDate ? dayjs(endDate) : null,
    };
  });

  const [tempFilters, setTempFilters] = useState<FilterValues>(filters);

  const defaultFilters: FilterValues = {
    branch: t('filters.filterTechTasks.all'),
    status: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
  };

  const updateFiltersToSearchParams = (newFilters: FilterValues) => {
    const updates: Record<string, string | undefined> = {};
    
    if (newFilters.branch !== t('filters.filterTechTasks.all')) {
      updates.posId = newFilters.branch;
    } else {
      updates.posId = undefined;
    }
    
    if (newFilters.status.length > 0) {
      updates.status = newFilters.status[0];
    } else {
      updates.status = undefined;
    }
    
    if (newFilters.tags.length > 0) {
      updates.tags = newFilters.tags.join(',');
    } else {
      updates.tags = undefined;
    }
    
    if (newFilters.dateFrom) {
      updates.startDate = newFilters.dateFrom.format('YYYY-MM-DD');
    } else {
      updates.startDate = undefined;
    }
    
    if (newFilters.dateTo) {
      updates.endDate = newFilters.dateTo.format('YYYY-MM-DD');
    } else {
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
              
              return (
                <div 
                  key={option.value} 
                  className={`flex items-center p-2 rounded border-2 h-[32px] ${
                    isOverdue 
                      ? 'border-red-500 bg-red-50' 
                      : isActive 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <Checkbox
                    checked={tempFilters.status.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempFilters(prev => ({ ...prev, status: [...prev.status, option.value] }));
                      } else {
                        setTempFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== option.value) }));
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
