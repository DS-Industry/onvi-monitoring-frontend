import React, { useEffect, useState } from "react";
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

    useEffect(() => {
        if (value) {
            setDate(value.startOf("day"));
            setTime(value);
        } else {
            setDate(null);
            setTime(null);
        }
    }, [value]);

    useEffect(() => {
        if (date && time) {
            const combined = date
                .hour(time.hour())
                .minute(time.minute())
                .second(time.second());
            changeValue?.(combined, combined.format(format));
        } else {
            changeValue?.(null, "");
        }
    }, [date, time]);

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
                    onChange={(d) => setDate(d)}
                    disabled={disabled}
                    placeholder={label || t("finance.sel")}
                    style={{ width: "100%", height: 40 }}
                    status={error ? 'error' : ''}
                />
                <TimePicker
                    value={time}
                    onChange={(t) => setTime(t)}
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
