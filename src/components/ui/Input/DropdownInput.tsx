import React, { useState, useRef, useEffect } from 'react';
import DropdownIcon from '@/assets/icons/dropdown.svg?react';
import Spinner from '@material-tailwind/react';
import { Check } from 'feather-icons-react';


type Option = { name: any, value: any };

type DropdownInputProps = {
    value: any;
    onChange?: (value: any) => void;
    options: Option[];
    isDisabled?: boolean;
    label?: string;
    isLoading?: boolean;
    isMultiSelect?: boolean;
    isEmptyState?: boolean;
    showMoreButton?: boolean;
    isSelectable?: boolean;
    inputType?: 'primary' | 'secondary' | 'tertiary' | 'forth';
    title?: string;
    type?: string;
    classname?: string;
    error?: boolean;
    helperText?: string;
};

const DropdownInput: React.FC<DropdownInputProps> = ({
    value,
    onChange,
    options,
    isDisabled = false,
    label,
    isLoading = false,
    isMultiSelect = false,
    isEmptyState = false,
    showMoreButton = false,
    isSelectable = false,
    inputType = 'forth',
    title,
    type,
    classname,
    error = false,
    helperText
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const isLabelFloating = isFocused || value !== undefined;
    const handleToggleDropdown = () => {
        if (!isDisabled && !isLoading) {
            setIsOpen((prevState) => !prevState);
        }
    };

    const handleSelectOption = (option: any) => {
        setSelectedOption(option);
        if (isMultiSelect) {
            const updatedValues = selectedValues.includes(option.value)
                ? selectedValues.filter(val => val !== option.value)
                : [...selectedValues, option.value];
            setSelectedValues(updatedValues);
            if (onChange)
                onChange(updatedValues.join(', '));
        } else {
            if (onChange)
                onChange(option.value);
            setIsOpen(false);
        }
    };

    const handleClearSelection = () => {
        setSelectedOption(null);
        if (onChange) {
            onChange('');  
        }
        setSelectedValues([]); 
    };

    useEffect(() => {
        if (value === '') {
            handleClearSelection();  
        }
    }, [value]);

    const className = `w-full px-3 cursor-pointer ${inputType == 'primary' ? "pt-3 pb-1" : (inputType == 'secondary') ? "py-1" :(inputType == 'tertiary') ? "py-0" : "py-2"} ${isDisabled ? "bg-disabledFill" : "bg-background02"} rounded-md caret-primary02 text-black border outline-none  ${isDisabled ? "outline-none" : ( error ? "border-errorFill" : isFocused ? "border-primary02" : "border-primary02 border-opacity-30")} ${isDisabled ? "hover:outline-none" : "hover:border-primary02"}`

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className={`relative min-w-40 ${classname}`}>
            <label className="text-sm text-text02">{title}</label>
            <div className='relative'>
                <label
                    className={`absolute left-3 pointer-events-none transition-all duration-200 ease-in-out
                        ${inputType == 'tertiary' ? 'top-0' : ""}
                        ${isDisabled ? "text-text03" : (isLabelFloating && inputType == 'primary' ? "text-text02 text-[10px] font-normal" : ((inputType == 'secondary' || inputType == 'tertiary' || inputType == 'forth') && isLabelFloating) ? "text-base invisible" : "text-text03 visible")} 
                        ${inputType == 'primary' && isLabelFloating ? "-top-[0.05rem] pt-1" : (inputType == 'secondary') ? "top-1" : (inputType == 'tertiary') ? "top-0" : "top-2"}
                        ${error ? "text-errorFill" : ""}`}
                >
                    {label}
                </label>
                <input
                    value={selectedOption ? selectedOption.name : ''}
                    onClick={handleToggleDropdown} // Toggle dropdown when clicking the input
                    disabled={isDisabled}
                    className={`${className}`}
                    readOnly
                    style={{ paddingRight: '2.5rem' }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    type={type}
                />

                {/* Right dropdown icon */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isLoading ? (
                        <Spinner className="w-5 h-5 animate-spin text-primary02" />
                    ) : (
                        <button
                            type="button"
                            onClick={handleToggleDropdown} // Make the icon clickable
                            className="focus:outline-none"
                        >
                            <DropdownIcon className={`w-5 h-5 text-gray-400 ${isOpen ? 'rotate-180' : 'rotate-0'} transition-transform`} />
                        </button>
                    )}
                </div>
            </div>
            {isOpen && !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary02 text-primary02 rounded-md shadow-lg z-10">
                    {isEmptyState ? (
                        <div className="p-4 text-center text-primary02">
                            Не найдено
                        </div>
                    ) : (
                        <ul className="py-1 max-h-32 overflow-y-auto">
                            {options.map(option => (
                                <li
                                    key={option.value}
                                    className={`px-4 py-2 cursor-pointer ${(value == option.value) ? "text-primary02_Hover" : "text-black"} hover:text-primary02_Hover hover:bg-background06 flex justify-between`}
                                    onClick={() => handleSelectOption(option)}
                                >
                                    {isMultiSelect ? (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedValues.includes(option.value)}
                                                style={{ accentColor: 'blue' }}
                                                className="mr-2 h-4 w-4 border border-gray-300 rounded-sm accent-primary02"
                                                readOnly
                                            />
                                            {option.name}
                                        </div>
                                    ) : (
                                        option.name
                                    )}

                                    {isSelectable && !isMultiSelect && (
                                        value === option.value ? (
                                            <div>
                                                <Check className="w-5 h-5 text-primary02" />
                                            </div>
                                        ) : null
                                    )}

                                </li>
                            ))}
                        </ul>
                    )}
                    {showMoreButton && (
                        <button className="w-full text-left py-2 px-4 border-t border-primary02 text-blue-500 cursor-pointer hover:bg-gray-100">
                            Show More
                        </button>
                    )}
                </div>
            )}
            {helperText && (
                <div className={`text-[11px] font-normal ${error ? 'text-errorFill' : 'text-text02'}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
};

export default DropdownInput;
