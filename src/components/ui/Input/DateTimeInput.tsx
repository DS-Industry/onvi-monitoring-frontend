import React, { useEffect, useState, useMemo } from "react";
import { DatePicker, TimePicker } from "antd";
import { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

type InputProps = {
    value?: Dayjs | null;
    changeValue?: (dateTime: Dayjs | null, formatted: string) => void;
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
    value = null,
    changeValue,
    error = false,
    label,
    helperText,
    disabled = false,
    classname,
    title,
    format = "YYYY-MM-DD HH:mm",
}) => {
    const { t } = useTranslation();
    const [date, setDate] = useState<Dayjs | null>(value ? value.startOf("day") : null);
    const [time, setTime] = useState<Dayjs | null>(value ? value : null);

    // Memoize the value timestamp to prevent unnecessary updates
    const valueTimestamp = useMemo(() => value?.valueOf() || null, [value]);

    useEffect(() => {
        if (value) {
            const newDate = value.startOf("day");
            const newTime = value;
            
            // Only update if the actual values are different
            if (!date?.isSame(newDate, 'day') || !time?.isSame(newTime, 'minute')) {
                setDate(newDate);
                setTime(newTime);
            }
        } else if (date !== null || time !== null) {
            setDate(null);
            setTime(null);
        }
    }, [valueTimestamp]); // Use valueTimestamp instead of value

    // Handle internal changes (when user interacts with date/time pickers)
    const handleDateChange = (d: Dayjs | null) => {
        setDate(d);
        if (d && time) {
            const combined = d.hour(time.hour()).minute(time.minute()).second(time.second());
            changeValue?.(combined, combined.format(format));
        } else if (!d) {
            changeValue?.(null, "");
        }
    };

    const handleTimeChange = (t: Dayjs | null) => {
        setTime(t);
        if (date && t) {
            const combined = date.hour(t.hour()).minute(t.minute()).second(t.second());
            changeValue?.(combined, combined.format(format));
        } else if (!t) {
            changeValue?.(null, "");
        }
    };

    const containerClassName = `relative ${classname || ""}`;

    return (
        <div className={containerClassName}>
            {title && (
                <label className="text-sm text-text02">
                    {title.endsWith("*") ? (
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
                    placeholder={label || t("finance.sel")}
                    style={{ width: "100%", height: 40 }}
                    status={error ? 'error' : ''}
                />
                <TimePicker
                    value={time}
                    onChange={handleTimeChange}
                    disabled={disabled}
                    placeholder={t("finance.selTime")}
                    format="HH:mm"
                    style={{ width: "100%", height: 40 }}
                    status={error ? 'error' : ''}
                />
            </div>

            {helperText && (
                <div className={`text-xs font-normal mt-1 ${error ? "text-errorFill" : "text-text02"}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
};

export default DateTimeInput;