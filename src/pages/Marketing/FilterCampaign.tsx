import { useState, useEffect } from 'react';
import { Button, Popover, Checkbox } from 'antd';
import { CheckOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { MarketingCampaignStatus } from '@/utils/constants';

interface FilterValues {
  status: string[];
  participantRole: string[];
}

type FilterType = 'status';

interface FilterCampaignProps {
  display?: FilterType[];
}

const FilterCampaign: React.FC<FilterCampaignProps> = ({
  display = ['status'],
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const shouldShow = (filter: FilterType): boolean => {
    return display.includes(filter);
  };

  const statusOptions = [
    {
      value: MarketingCampaignStatus.DRAFT,
      label: t(`tables.${MarketingCampaignStatus.DRAFT}`),
    },
    {
      value: MarketingCampaignStatus.ACTIVE,
      label: t(`tables.${MarketingCampaignStatus.ACTIVE}`),
    },
    {
      value: MarketingCampaignStatus.PAUSED,
      label: t(`tables.${MarketingCampaignStatus.PAUSED}`),
    },
    {
      value: MarketingCampaignStatus.COMPLETED,
      label: t(`tables.${MarketingCampaignStatus.COMPLETED}`),
    },
    {
      value: MarketingCampaignStatus.CANCELLED,
      label: t(`tables.${MarketingCampaignStatus.CANCELLED}`),
    },
  ];

  const [filters, setFilters] = useState<FilterValues>(() => {
    const status = searchParams.get('status');
    const participantRole = searchParams.get('participantRole');

    return {
      status: status ? [status] : [],
      participantRole: participantRole ? [participantRole] : [],
    };
  });

  const [tempFilters, setTempFilters] = useState<FilterValues>(filters);

  const defaultFilters: FilterValues = {
    status: [],
    participantRole: [],
  };

  const updateFiltersToSearchParams = (newFilters: FilterValues) => {
    const updates: Record<string, string | undefined> = {};

    if (shouldShow('status') && newFilters.status.length > 0) {
      updates.status = newFilters.status[0];
    } else if (shouldShow('status')) {
      updates.status = undefined;
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
                const isActive = option.value === MarketingCampaignStatus.ACTIVE;
                const isPause = option.value === MarketingCampaignStatus.DRAFT;
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

export default FilterCampaign;
