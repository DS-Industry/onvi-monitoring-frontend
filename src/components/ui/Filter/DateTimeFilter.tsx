import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DatePicker, TimePicker, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { getParam, updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants.ts';

const DateTimeFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getDateFromSearchParams = (paramName: 'dateStart' | 'dateEnd'): Dayjs | null => {
    const value = getParam(searchParams, paramName);
    if (!value) return null;

    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  };

  const [startDate, setStartDate] = useState<Dayjs | null>(() =>
    getDateFromSearchParams('dateStart')
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(() =>
    getDateFromSearchParams('dateEnd')
  );

  useEffect(() => {
    setStartDate(getDateFromSearchParams('dateStart'));
    setEndDate(getDateFromSearchParams('dateEnd'));
  }, [searchParams]);

  const handleStartDateChange = (date: any) => {
    if (date) {
      const baseDate = startDate ?? dayjs();
      const newDateTime = baseDate
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
      const baseDate = startDate ?? dayjs();
      const newDateTime = baseDate
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
      const baseDate = endDate ?? dayjs();
      const newDateTime = baseDate
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
      const baseDate = endDate ?? dayjs();
      const newDateTime = baseDate
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
