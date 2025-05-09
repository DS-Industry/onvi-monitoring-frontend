import React, { useState } from 'react';
import { Select } from 'antd';

type Option = {
    name: string;
    value: any;
    render?: any;
};

type DropdownInputProps = {
    value: any;
    onChange?: (value: any) => void;
    options: Option[];
    isDisabled?: boolean;
    label?: string;
    isLoading?: boolean;
    isMultiSelect?: boolean;
    title?: string;
    classname?: string;
    error?: boolean;
    helperText?: string;
    renderOption?: (option: Option) => JSX.Element;
    inputType?: string;
};

const DropdownInput: React.FC<DropdownInputProps> = ({
    value,
    onChange,
    options,
    isDisabled = false,
    label,
    isLoading = false,
    isMultiSelect = false,
    title,
    classname,
    error = false,
    helperText,
    renderOption,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const validOptionValues = options.map((opt) => opt.value);

    const sanitizedValue = isMultiSelect
        ? Array.isArray(value)
            ? value.filter((v) => validOptionValues.includes(v))
            : []
        : validOptionValues.includes(value)
            ? value
            : undefined;

    const hasValue = isMultiSelect
        ? Array.isArray(sanitizedValue) && sanitizedValue.length > 0
        : sanitizedValue !== undefined && sanitizedValue !== null && sanitizedValue !== '' && sanitizedValue !== 0;

    const isLabelFloating = isFocused || hasValue;

    const valueToName = new Map(options.map((opt) => [opt.value, opt.name]));

    const tagRender = (props: any) => {
        const { value, closable, onClose } = props;
        return (
            <div className="ant-select-selection-item" onMouseDown={(e) => e.preventDefault()}>
                {valueToName.get(value)}
                {closable && <span className="ant-select-selection-item-remove" onClick={onClose}>×</span>}
            </div>
        );
    };

    return (
        <div className={`relative w-fit`}>
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

            <div className="relative">
                <Select
                    mode={isMultiSelect ? 'multiple' : undefined}
                    disabled={isDisabled}
                    loading={isLoading}
                    value={sanitizedValue}
                    placeholder={isLabelFloating ? '' : label}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`h-10 ${classname}`}
                    status={error ? 'error' : ''}
                    optionLabelProp="label"
                    tagRender={isMultiSelect ? tagRender : undefined}
                    dropdownRender={(menu) => (
                        <div style={{ maxHeight: 120, overflowY: "auto" }}>
                            {menu}
                        </div>
                    )}
                >
                    {options.map((opt) => (
                        <Select.Option
                            key={opt.value}
                            value={opt.value}
                            label={opt.name}
                        >
                            {renderOption ? renderOption(opt) : opt.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {helperText && (
                <div className={`text-[11px] mt-1 ${error ? 'text-errorFill' : 'text-text02'}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
};

export default DropdownInput;
