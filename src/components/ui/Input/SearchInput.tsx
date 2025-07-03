import React, { useState } from 'react';
import Icon from 'feather-icons-react';

type SearchInputProps = {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    isDisabled?: boolean;
    searchType?: 'outlined' | 'underline'; // SearchType prop
    error?: boolean;
    errorText?: string;
    classname?: string;
    title?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = 'Search...',
    value,
    onChange,
    onClear,
    isDisabled = false,
    searchType = 'underline', // Default to 'underline'
    error = false,
    errorText = '',
    classname,
    title = ""
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const getClassNames = () => {
        if (searchType === 'underline') {
            return `border-b-2 ${isDisabled ? "border-text03" : (isFocused ? "border-primary02" : error ? 'border-errorFill' : 'border-primary02 opacity-30')}
            focus:border-primary02 ${isDisabled ? "outline-none" : "hover:border-primary02"} 
            bg-background02 pl-8 pr-10 py-2 w-full outline-none transition-all duration-300`;
        } else {
            return `border border-1 ${isDisabled ? "border-text03" : (isFocused ? "border-primary02" : error ? 'border-errorFill' : 'border-primary02 opacity-30')} 
            focus:border-primary02 ${isDisabled ? "outline-none" : "hover:border-primary02"} 
            bg-background02 pl-8 pr-10 py-2 w-full outline-none rounded-md`;
        }
    };

    return (
        <div className={`min-w-40 ${classname}`}>
            <label className="text-sm text-text02">{title}</label>
            <div className="relative flex items-center w-full">
                <input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isDisabled}
                    className={getClassNames()}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />

                {/* Left search icon */}
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon icon='search' className={`w-5 h-5 ${isDisabled ? 'text-text03' : (isFocused ? 'text-text03' : 'text-text02')}`} />
                </span>

                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {value ? (
                        <button
                            onClick={() => onClear ? onClear() : onChange('')}
                            className="focus:outline-none">
                            <Icon icon='x-circle' className={`w-5 h-5 ${isFocused ? "text-text03" : "text-text02"}`} />
                        </button>
                    ) : null}
                </div>
            </div>
            {/* Error Message */}
            {error && errorText && (
                <div className="text-sm text-errorFill">
                    {errorText}
                </div>
            )}
        </div>
    );
};

export default SearchInput;
