import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DatePicker, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';

const TechTaskDateRangeFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs(getParam(searchParams, 'startDate'))
  );

  const [endDate, setEndDate] = useState<Dayjs | null>(
    dayjs(getParam(searchParams, 'endDate')) 
  );

  const handleStartDateChange = (date: any) => {
    if (date) {
      setStartDate(date);
      updateSearchParams(searchParams, setSearchParams, {
        startDate: date.format('YYYY-MM-DD'),
        page: DEFAULT_PAGE,
      });
    } else {
      setStartDate(null);
      updateSearchParams(searchParams, setSearchParams, {
        startDate: undefined,
        page: DEFAULT_PAGE,
      });
    }
  };

  const handleEndDateChange = (date: any) => {
    if (date) {
      setEndDate(date);
      updateSearchParams(searchParams, setSearchParams, {
        endDate: date.format('YYYY-MM-DD'),
        page: DEFAULT_PAGE,
      });
    } else {
      setEndDate(null);
      updateSearchParams(searchParams, setSearchParams, {
        endDate: undefined,
        page: DEFAULT_PAGE,
      });
    }
  };

  return (
    <div className="w-full sm:w-80">
      <label className="block mb-1 text-sm font-medium text-text02">
        {t('equipment.dateRange')}
      </label>
      <Space size="middle" direction="horizontal" className='flex flex-wrap'>
        <DatePicker
          value={startDate}
          format="YYYY-MM-DD"
          onChange={handleStartDateChange}
          placeholder={t('filters.dateTime.startDate')}
        />
        <DatePicker
          value={endDate}
          format="YYYY-MM-DD"
          onChange={handleEndDateChange}
          placeholder={t('filters.dateTime.endDate')}
        />
      </Space>
    </div>
  );
};

export default TechTaskDateRangeFilter;
