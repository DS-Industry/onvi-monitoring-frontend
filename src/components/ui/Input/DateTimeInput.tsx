import React, { useEffect, useState, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import DatePicker from 'antd/es/date-picker';
import TimePicker from 'antd/es/time-picker';

type InputProps = {
  value?: Dayjs;
  changeValue?: (dateTime: Dayjs | undefined, formatted: string) => void;
  error?: boolean;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  classname?: string;
  title?: string;
  id?: string;
  placeholder?: string;
  format?: string; // default: 'YYYY-MM-DD HH:mm'
};

const DateTimeInput: React.FC<InputProps> = ({
  value = undefined,
  changeValue,
  error = false,
  label,
  helperText,
  disabled = false,
  classname,
  title,
  format = 'YYYY-MM-DD HH:mm',
}) => {
  const { t } = useTranslation();
  const [date, setDate] = useState<Dayjs | undefined>(
    value ? value.startOf('day') : undefined
  );
  const [time, setTime] = useState<Dayjs | undefined>(
    value ? value : undefined
  );

  // Memoize the value timestamp to prevent unnecessary updates
  const valueTimestamp = useMemo(() => value?.valueOf() || undefined, [value]);

  useEffect(() => {
    if (value && value.isValid()) {
      const newDate = value.startOf('day');
      const newTime = value;

      // Only update if the actual values are different
      if (!date?.isSame(newDate, 'day') || !time?.isSame(newTime, 'minute')) {
        setDate(newDate);
        setTime(newTime);
      }
    } else if (date !== undefined || time !== undefined) {
      setDate(undefined);
      setTime(undefined);
    }
  }, [valueTimestamp]); // Use valueTimestamp instead of value

  // Handle internal changes (when user interacts with date/time pickers)
  const handleDateChange = (d: Dayjs | null) => {
    // Check if date is null or invalid
    if (!d || !d.isValid()) {
      setDate(undefined);
      setTime(undefined);
      changeValue?.(undefined, '');
      return;
    }

    setDate(d);

    // If we have both date and time, combine them
    if (d && time && time.isValid()) {
      const combined = d
        .hour(time.hour())
        .minute(time.minute())
        .second(time.second());
      changeValue?.(combined, combined.format(format));
    }
    // If we only have date but no time, don't call changeValue yet
    // Wait for user to select time
  };

  const handleTimeChange = (t: Dayjs | null) => {
    // Check if time is null or invalid
    if (!t || !t.isValid()) {
      setDate(undefined);
      setTime(undefined);
      changeValue?.(undefined, '');
      return;
    }

    setTime(t);

    // If we have both date and time, combine them
    if (date && date.isValid() && t) {
      const combined = date
        .hour(t.hour())
        .minute(t.minute())
        .second(t.second());
      changeValue?.(combined, combined.format(format));
    }
    // If we only have time but no date, don't call changeValue yet
    // Wait for user to select date
  };

  const containerClassName = `relative ${classname || ''}`;

  return (
    <div className={containerClassName}>
      {title && (
        <label className="text-sm text-text02">
          {title.endsWith('*') ? (
            <>
              {title.slice(0, -1)}
              <span className="text-errorFill">*</span>
            </>
          ) : (
            title
          )}
        </label>
      )}

      <div className="flex gap-2 items-center">
        <DatePicker
          value={date}
          onChange={handleDateChange}
          disabled={disabled}
          placeholder={label || t('finance.sel')}
          style={{ width: '100%' }}
          status={error ? 'error' : ''}
        />
        <TimePicker
          value={time}
          onChange={handleTimeChange}
          disabled={disabled}
          placeholder={t('finance.selTime')}
          format="HH:mm"
          style={{ width: '100%' }}
          status={error ? 'error' : ''}
        />
      </div>

      {helperText && (
        <div
          className={`text-xs font-normal mt-1 ${error ? 'text-errorFill' : 'text-text02'}`}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default DateTimeInput;
