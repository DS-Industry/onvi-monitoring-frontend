import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select, Collapse, DatePicker, TimePicker, Typography } from 'antd';
import Button from '@ui/Button/Button.tsx';
import dayjs, { Dayjs } from 'dayjs';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@/utils/constants.ts';

const Text = Typography.Text;

type Optional = {
  name: string;
  value: string | number;
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

  const rawStart = getParam(searchParams, 'startPaymentDate');
  const [startDate, setStartDate] = useState<Dayjs | null>(
    rawStart ? dayjs(rawStart) : null
  );

  const rawEnd = getParam(searchParams, 'endPaymentDate');
  const [endDate, setEndDate] = useState<Dayjs | null>(
    rawEnd ? dayjs(rawEnd) : null
  );

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      startPaymentDate: undefined,
      endPaymentDate: undefined,
      hrWorkerId: undefined,
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
    });

    setStartDate(null);
    setEndDate(null);
  };

  const handleStartDateChange = (date: Dayjs | null) => {
    if (date) {
      const newDateTime = (startDate || dayjs())
        .set('year', date.year())
        .set('month', date.month())
        .set('date', date.date());
      setStartDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        startPaymentDate: newDateTime.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    } else {
      setStartDate(null);
      updateSearchParams(searchParams, setSearchParams, {
        startPaymentDate: undefined,
        page: DEFAULT_PAGE,
      });
    }
  };

  const handleStartTimeChange = (time: Dayjs | null) => {
    if (time) {
      const newDateTime = (startDate || dayjs())
        .set('hour', time.hour())
        .set('minute', time.minute());
      setStartDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        startPaymentDate: newDateTime.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    } else {
      if (startDate) {
        const newDateTime = startDate.startOf('day');
        setStartDate(newDateTime);
        updateSearchParams(searchParams, setSearchParams, {
          startPaymentDate: newDateTime.format('YYYY-MM-DDTHH:mm'),
          page: DEFAULT_PAGE,
        });
      }
    }
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    if (date) {
      const newDateTime = (endDate || dayjs())
        .set('year', date.year())
        .set('month', date.month())
        .set('date', date.date());
      setEndDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        endPaymentDate: newDateTime.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    } else {
      setEndDate(null);
      updateSearchParams(searchParams, setSearchParams, {
        endPaymentDate: undefined,
        page: DEFAULT_PAGE,
      });
    }
  };

  const handleEndTimeChange = (time: Dayjs | null) => {
    if (time) {
      const newDateTime = (endDate || dayjs())
        .set('hour', time.hour())
        .set('minute', time.minute());
      setEndDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        endPaymentDate: newDateTime.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    } else {
      if (endDate) {
        const newDateTime = endDate.startOf('day');
        setEndDate(newDateTime);
        updateSearchParams(searchParams, setSearchParams, {
          endPaymentDate: newDateTime.format('YYYY-MM-DDTHH:mm'),
          page: DEFAULT_PAGE,
        });
      }
    }
  };

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
                    <Text>{t('hr.startPaymentDate')}</Text>
                    <div className="flex flex-row gap-1 w-full">
                      <DatePicker
                        value={startDate}
                        format="YYYY-MM-DD"
                        onChange={handleStartDateChange}
                        placeholder={t('finance.sel')}
                        className="w-1/2 sm:w-full"
                      />
                      <TimePicker
                        value={startDate}
                        format="HH:mm"
                        onChange={handleStartTimeChange}
                        placeholder={t('finance.selTime')}
                        disabled={!startDate}
                        className="w-1/2 sm:w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col w-full sm:w-80">
                    <Text>{t('hr.endPaymentDate')}</Text>
                    <div className="flex flex-row gap-1 w-full">
                      <DatePicker
                        value={endDate}
                        format="YYYY-MM-DD"
                        onChange={handleEndDateChange}
                        placeholder={t('finance.sel')}
                        className="w-1/2 sm:w-full"
                      />
                      <TimePicker
                        value={endDate}
                        format="HH:mm"
                        onChange={handleEndTimeChange}
                        placeholder={t('finance.selTime')}
                        disabled={!endDate}
                        className="w-1/2 sm:w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col w-full sm:w-80">
                    <Text>{t('routes.employees')}</Text>
                    <Select
                      className="w-full"
                      value={getParam(searchParams, 'hrWorkerId', '*')}
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
                      notFoundContent={t('table.noData')}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>
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
