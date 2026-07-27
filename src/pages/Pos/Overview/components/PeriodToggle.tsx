import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Popover } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { DownOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE } from '@/utils/constants';

const { RangePicker } = DatePicker;

type Duration = 'today' | 'week' | 'month' | 'custom';

const PeriodToggle: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [periodOpen, setPeriodOpen] = useState(false);

  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');

  const rangeValue = useMemo((): [Dayjs, Dayjs] | null => {
    if (!dateStart || !dateEnd) return null;
    const start = dayjs(dateStart);
    const end = dayjs(dateEnd);
    if (!start.isValid() || !end.isValid()) return null;
    return [start, end];
  }, [dateStart, dateEnd]);

  const activeDuration = useMemo((): Duration | null => {
    if (!rangeValue) return null;
    const [start, end] = rangeValue;
    const todayStart = dayjs().startOf('day');
    const todayEnd = dayjs().endOf('day');

    if (start.isSame(todayStart, 'minute') && end.isSame(todayEnd, 'day')) {
      return 'today';
    }

    const weekStart = dayjs().subtract(7, 'day').startOf('day');
    if (start.isSame(weekStart, 'day') && end.isSame(todayEnd, 'day')) {
      return 'week';
    }

    const monthStart = dayjs().subtract(1, 'month').startOf('day');
    if (start.isSame(monthStart, 'day') && end.isSame(todayEnd, 'day')) {
      return 'month';
    }

    return 'custom';
  }, [rangeValue]);

  const setPeriod = (duration: Exclude<Duration, 'custom'>) => {
    const end = dayjs().endOf('day');
    let start = dayjs().startOf('day');

    if (duration === 'week') {
      start = dayjs().subtract(7, 'day').startOf('day');
    } else if (duration === 'month') {
      start = dayjs().subtract(1, 'month').startOf('day');
    }

    updateSearchParams(searchParams, setSearchParams, {
      dateStart: start.format('YYYY-MM-DDTHH:mm'),
      dateEnd: end.format('YYYY-MM-DDTHH:mm'),
      page: DEFAULT_PAGE,
    });
  };

  const handleRangeChange: RangePickerProps['onChange'] = dates => {
    if (!dates?.[0] || !dates?.[1]) return;

    updateSearchParams(searchParams, setSearchParams, {
      dateStart: dates[0].format('YYYY-MM-DDTHH:mm'),
      dateEnd: dates[1].format('YYYY-MM-DDTHH:mm'),
      page: DEFAULT_PAGE,
    });
    setPeriodOpen(false);
  };

  const durations: { label: string; value: Exclude<Duration, 'custom'> }[] = [
    { label: t('dashboard.today'), value: 'today' },
    { label: t('posOverview.week'), value: 'week' },
    { label: t('posOverview.month'), value: 'month' },
  ];

  const pillClass = (active: boolean) =>
    `!h-9 !px-4 !text-sm !rounded-full !border-0 shadow-none ${
      active
        ? '!bg-primary02 !text-white'
        : '!bg-background03 !text-text01 hover:!bg-opacity01'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {durations.map(item => (
        <Button
          key={item.value}
          type="default"
          className={pillClass(activeDuration === item.value)}
          onClick={() => setPeriod(item.value)}
        >
          {item.label}
        </Button>
      ))}
      <Popover
        trigger="click"
        open={periodOpen}
        onOpenChange={setPeriodOpen}
        placement="bottomLeft"
        content={
          <RangePicker
            value={rangeValue}
            onChange={handleRangeChange}
            allowClear={false}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
          />
        }
      >
        <Button
          type="default"
          className={`${pillClass(activeDuration === 'custom')} !inline-flex !items-center !gap-1.5`}
        >
          {t('posOverview.period')}
          <DownOutlined className="text-[10px]" />
        </Button>
      </Popover>
    </div>
  );
};

export default PeriodToggle;
