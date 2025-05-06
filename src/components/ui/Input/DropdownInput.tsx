import React, { useState, useRef } from 'react';
import { Select, Spin } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import DropdownIcon from '@/assets/icons/dropdown.svg?react';

type Option = {
    name: any;
    value: any;
    render?: JSX.Element;
};

type DropdownInputProps = {
    value: any;
    onChange?: (value: any) => void;
    options: Option[];
    isDisabled?: boolean;
    label?: string;
    isLoading?: boolean;
    isMultiSelect?: boolean;
    showMoreButton?: boolean;
    isSelectable?: boolean;
    inputType?: 'primary' | 'secondary' | 'tertiary' | 'forth';
    title?: string;
    type?: string;
    classname?: string;
    error?: boolean;
    helperText?: string;
    renderOption?: (option: Option) => JSX.Element;
    classnameOptions?: string;
};

const DropdownInput: React.FC<DropdownInputProps> = ({
    value,
    onChange,
    options,
    isDisabled = false,
    label,
    isLoading = false,
    isMultiSelect = false,
    showMoreButton = false,
    inputType = 'forth',
    title,
    classname,
    error = false,
    helperText,
    renderOption,
    classnameOptions
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hasValue = value !== undefined && value !== null && value !== '' && value !== 0;
    const isLabelFloating = isFocused || hasValue;

    const handleDropdownVisibleChange = (open: boolean) => {
        if (!open) return;

        const rect = dropdownRef.current?.getBoundingClientRect();
        const spaceBelow = window.innerHeight - (rect?.bottom || 0);
        const spaceAbove = rect?.top || 0;
        setDropdownPosition(spaceBelow > spaceAbove ? 'bottom' : 'top');
    };

    const allOptions = options;

    const selectedValues = isMultiSelect
        ? Array.isArray(value)
            ? value.map((val) => {
                const opt = allOptions.find((o) => o.value === val);
                return opt ? { label: opt.name, value: opt.value } : { label: val, value: val };
            })
            : []
        : (() => {
            const opt = allOptions.find((o) => o.value === value);
            return opt ? [{ label: opt.name, value: opt.value }] : value ? [{ label: value, value: value }] : [];
        })();

    return (
        <div ref={dropdownRef} className={`relative ${classname}`}>
            {title && (
                <label className="text-sm text-text02">
                    {title.endsWith('*') ? (
                        <>
                            {title.slice(0, -1)}
                            <span className="text-textError">*</span>
                        </>
                    ) : (
                        title
                    )}
                </label>
            )}

            <div className="relative mt-1">
            {label && (
                    <label
                        className={`absolute left-3 pointer-events-none transition-all duration-200 ease-in-out z-10
              ${isLabelFloating && inputType === "primary"
                                ? "text-text02 text-xs font-normal -top-0 pt-1"
                                : inputType === "primary" && !isLabelFloating
                                    ? "text-text02 top-2"
                                    : inputType === "secondary" && isLabelFloating
                                        ? "text-base invisible"
                                        : inputType === "secondary" && !isLabelFloating
                                            ? "text-text02 visible top-1"
                                            : inputType === "tertiary" && isLabelFloating
                                                ? "text-base invisible"
                                                : inputType === "tertiary" && !isLabelFloating
                                                    ? "text-text02 visible top-0"
                                                    : isLabelFloating
                                                        ? "text-base invisible"
                                                        : "text-text02 visible top-2"
                            }
              ${isDisabled && isLabelFloating ? "invisible" : ""}
              ${error ? "text-errorFill" : ""}`}
                    >
                        {label}
                    </label>
                )}
                <Select
                    getPopupContainer={() => document.body}
                    labelInValue
                    value={isMultiSelect ? selectedValues : selectedValues.length > 0 ? selectedValues[0] : undefined}
                    onChange={(val) => {
                        if (isMultiSelect) {
                            const values = (val as { value: Option }[]).map((v) => v.value);
                            onChange?.(values);
                        } else {
                            onChange?.((val as { value: Option })?.value);
                        }
                    }}
                    mode={isMultiSelect ? 'multiple' : undefined}
                    disabled={isDisabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onDropdownVisibleChange={handleDropdownVisibleChange}
                    variant="borderless"
                    loading={isLoading}
                    dropdownStyle={{ zIndex: 2000 }}
                    popupClassName={`max-h-32 overflow-y-auto border border-primary02 border-opacity-30 ${classnameOptions}`}
                    className={`w-full ${inputType === 'primary'
                        ? 'pt-3 pb-1'
                        : inputType === 'secondary'
                            ? 'py-1'
                            : inputType === 'tertiary'
                                ? 'py-0'
                                : 'py-2'
                        } ${isDisabled ? 'bg-disabledFill' : 'bg-background02'} rounded-md text-black border ${error ? 'border-errorFill' : 'border-primary02 border-opacity-30'
                        }`}
                    suffixIcon={
                        isLoading ? (
                            <Spin size="small" />
                        ) : (
                            <DropdownIcon
                                className={`w-5 h-5 text-text02 transition-transform`}
                                style={{
                                    transform: dropdownPosition === 'bottom' ? 'rotate(0deg)' : 'rotate(180deg)'
                                }}
                            />
                        )
                    }
                    options={allOptions.map((opt) => ({
                        label: renderOption ? (
                            renderOption(opt)
                        ) : isMultiSelect ? (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedValues.some((v) => v.value === opt.value)}
                                    className="mr-2 h-4 w-4 border border-text02 rounded-sm accent-primary02"
                                    readOnly
                                />
                                {opt.name}
                            </div>
                        ) : (
                            opt.name
                        ),
                        value: opt.value
                    }))}
                    dropdownRender={(menu) => (
                        <>
                            {options.length === 0 ? (
                                <div className="p-2 flex flex-col items-center justify-center">
                                    <SmileOutlined style={{ fontSize: '24px' }} />
                                    <div>Не найдено</div>
                                </div>
                            ) : (
                                menu
                            )}
                            {showMoreButton && (
                                <div className="border-t border-primary02 text-primary02 px-4 py-2 cursor-pointer hover:bg-text02">
                                    Show More
                                </div>
                            )}
                        </>
                    )}
                />
            </div>

            {helperText && (
                <div className={`text-[11px] font-normal ${error ? 'text-errorFill' : 'text-text02'}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
};

export default DropdownInput;