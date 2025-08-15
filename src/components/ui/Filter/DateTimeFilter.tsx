import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DatePicker, TimePicker, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';

const DateTimeFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState(
    dayjs(getParam(searchParams, 'dateStart') || dayjs().format('YYYY-MM-DDTHH:mm'))
  );

  const [endDate, setEndDate] = useState(
    dayjs(getParam(searchParams, 'dateEnd') || dayjs().format('YYYY-MM-DDTHH:mm'))
  );

  const handleStartDateChange = (date: any) => {
    if (date) {
      const newDateTime = startDate
        .set('year', date.year())
        .set('month', date.month())
        .set('date', date.date());
      setStartDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        dateStart: newDateTime.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    }
  };

  const handleStartTimeChange = (time: any) => {
    if (time) {
      const newDateTime = startDate
        .set('hour', time.hour())
        .set('minute', time.minute());
      setStartDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        dateStart: newDateTime.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    }
  };

  const handleEndDateChange = (date: any) => {
    if (date) {
      const newDateTime = endDate
        .set('year', date.year())
        .set('month', date.month())
        .set('date', date.date());
      setEndDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        dateEnd: newDateTime.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    }
  };

  const handleEndTimeChange = (time: any) => {
    if (time) {
      const newDateTime = endDate
        .set('hour', time.hour())
        .set('minute', time.minute());
      setEndDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        dateEnd: newDateTime.format('YYYY-MM-DDTHH:mm'),
        page: DEFAULT_PAGE,
      });
    }
  };

  return (
    <div className="mt-4">
      <Space size="middle" direction="horizontal" className='flex flex-wrap'>
        <div className="flex flex-row gap-1">
          <DatePicker
            value={startDate}
            format="YYYY-MM-DD"
            onChange={handleStartDateChange}
            placeholder={t('filters.dateTime.startDate')}
          />
          <TimePicker
            value={startDate}
            format="HH:mm"
            onChange={handleStartTimeChange}
            placeholder={t('filters.dateTime.startTime')}
          />
        </div>

        <div className="flex flex-row gap-1">
          <DatePicker
            value={endDate}
            format="YYYY-MM-DD"
            onChange={handleEndDateChange}
            placeholder={t('filters.dateTime.endDate')}
          />
          <TimePicker
            value={endDate}
            format="HH:mm"
            onChange={handleEndTimeChange}
            placeholder={t('filters.dateTime.endTime')}
          />
        </div>
      </Space>
    </div>
  );
};

export default DateTimeFilter;
