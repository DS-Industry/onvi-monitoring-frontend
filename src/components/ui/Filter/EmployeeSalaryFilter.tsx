import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select, Collapse, DatePicker, Typography } from 'antd';
import Button from '@ui/Button/Button.tsx';
import dayjs, { Dayjs } from 'dayjs';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@/utils/constants.ts';
import PosFilter from '@/components/ui/Filter/PosFilter.tsx';

const Text = Typography.Text;

type Optional = {
  name: string;
  value?: number;
};

type SalaryCalculationFilterProps = {
  count: number;
  workers?: Optional[];
};

const SalaryCalculationFilter: React.FC<SalaryCalculationFilterProps> = ({
  count,
  workers,
}) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeFilterKey, setActiveFilterKey] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialMonth = (): Dayjs | null => {
    const startParam = getParam(searchParams, 'startPaymentDate');
    if (startParam) {
      const parsed = dayjs(startParam);
      if (parsed.isValid()) {
        return parsed.startOf('month');
      }
    }
    return dayjs().startOf('month');
  };

  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(getInitialMonth);

  const handleMonthChange = (date: Dayjs | null) => {
    setSelectedMonth(date);
    if (date) {
      const start = date.startOf('month').startOf('day');
      const end = date.endOf('month').endOf('day');
      updateSearchParams(searchParams, setSearchParams, {
        startPaymentDate: start.format('YYYY-MM-DDTHH:mm'),
        endPaymentDate: end.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    } else {
      updateSearchParams(searchParams, setSearchParams, {
        startPaymentDate: undefined,
        endPaymentDate: undefined,
        page: DEFAULT_PAGE,
      });
    }
  };

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      startPaymentDate: undefined,
      endPaymentDate: undefined,
      hrWorkerId: undefined,
      posId: undefined,
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
    });
    const defaultMonth = dayjs().startOf('month');
    setSelectedMonth(defaultMonth);
    const start = defaultMonth.startOf('month').startOf('day');
    const end = defaultMonth.endOf('month').endOf('day');
    updateSearchParams(searchParams, setSearchParams, {
      startPaymentDate: start.format('YYYY-MM-DDTHH:mm'),
      endPaymentDate: end.format('YYYY-MM-DDTHH:mm'),
      page: DEFAULT_PAGE,
    });
  };

  useEffect(() => {
    const startParam = getParam(searchParams, 'startPaymentDate');
    if (startParam) {
      const parsed = dayjs(startParam);
      if (parsed.isValid() && !selectedMonth?.isSame(parsed, 'month')) {
        setSelectedMonth(parsed.startOf('month'));
      }
    } else {
      if (selectedMonth !== null) {
        const defaultMonth = dayjs().startOf('month');
        setSelectedMonth(defaultMonth);
        const start = defaultMonth.startOf('month').startOf('day');
        const end = defaultMonth.endOf('month').endOf('day');
        updateSearchParams(searchParams, setSearchParams, {
          startPaymentDate: start.format('YYYY-MM-DDTHH:mm'),
          endPaymentDate: end.format('YYYY-MM-DDTHH:mm'),
        });
      }
    }
  }, [searchParams]);

  return (
    <Collapse
      bordered={false}
      ghost
      style={{ marginBottom: 16 }}
      activeKey={activeFilterKey}
      onChange={(keys: string[]) => setActiveFilterKey(keys)}
      items={[
        {
          key: 'filter-1',
          label: (
            <span className="font-semibold text-base">
              {Array.isArray(activeFilterKey) &&
              activeFilterKey.includes('filter-1')
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
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 w-full">
                  <div className="flex flex-col w-full sm:w-80">
                    <Text>{t('hr.billing')}</Text>
                    <DatePicker
                      picker="month"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      placeholder={t('finance.selMon')}
                      className="w-full"
                      allowClear={false}
                    />
                  </div>

                  <div className="flex flex-col w-full sm:w-80">
                    <Text>{t('routes.employees')}</Text>
                    <Select
                      className="w-full"
                      placeholder={t('warehouse.notSel')}
                      value={getParam(searchParams, 'hrWorkerId')}
                      onChange={(val: string) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          hrWorkerId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={workers?.map(item => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
                      showSearch={true}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      allowClear={true}
                    />
                  </div>

                  <PosFilter />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Button
                  title={t('analysis.reset')}
                  type="outline"
                  handleClick={resetFilters}
                  classname="w-[168px]"
                />

                <p className="font-semibold">
                  {t('analysis.found')}: {count}
                </p>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default SalaryCalculationFilter;
