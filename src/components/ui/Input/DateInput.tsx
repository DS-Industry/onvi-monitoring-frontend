import React, { useEffect, useState, useId } from "react";
import { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import DatePicker from "antd/es/date-picker";

type InputProps = {
    value?: Dayjs | null;
    changeValue?: (date: Dayjs | null, dateString: string) => void;
    error?: boolean;
    label?: string;
    helperText?: string;
    disabled?: boolean;
    inputType?: "primary" | "secondary" | "tertiary" | "forth";
    showIcon?: boolean;
    IconComponent?: React.ReactNode;
    classname?: string;
    title?: string;
    id?: string;
    placeholder?: string;
};

const DateInput: React.FC<InputProps> = ({
    value = null,
    changeValue,
    error = false,
    helperText,
    disabled = false,
    classname,
    title,
    id,
}) => {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const autoId = useId();
    const inputId = id || `date-input-${autoId}`;

    useEffect(() => {
        setHasValue(!!value);
    }, [value]);

    const isLabelFloating = isFocused || hasValue;

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

            <div className="relative">
                <div>
                    <DatePicker
                        id={inputId}
                        value={value}
                        onChange={(date, dateString) => {
                            changeValue?.(date, dateString.toString());
                            setHasValue(!!date);
                        }}
                        disabled={disabled}
                        placeholder={isLabelFloating ? "" : t("finance.sel")}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        allowClear
                        style={{
                            boxShadow: "none",
                            backgroundColor: "transparent",
                            width: "100%",
                            paddingLeft: 10,
                            height: 40
                        }}
                        status={error ? 'error' : ''}
                    />
                </div>
            </div>
            {helperText && (
                <div className={`text-xs font-normal ${error ? "text-errorFill" : "text-text02"}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
};

export default DateInput;
