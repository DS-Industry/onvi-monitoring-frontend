import React, { useEffect, useRef, useState } from "react";
import Icon from "feather-icons-react";

type Option = {
    name: any;
    value: any;
};

type SearchableDropdownProps = {
    options: Option[];
    placeholder?: string;
    value: string | number;
    onChange: (value: any) => void;
    isDisabled?: boolean;
    error?: boolean;
    errorText?: string;
    classname?: string;
    title?: string;
};

const SearchDropdownInput: React.FC<SearchableDropdownProps> = ({
    options,
    placeholder = "Select...",
    value,
    onChange,
    isDisabled = false,
    error = false,
    errorText = "",
    classname,
    title = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const filteredOptions = options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const selectedOption = options.find((option) => option.value === value);
        setSearchTerm(selectedOption ? selectedOption.name : "");
    }, [value, options]);

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
        <div ref={dropdownRef} className={`relative ${classname}`}>
            {title && <label className="text-sm text-text02">{title}</label>}
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    placeholder={placeholder}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    disabled={isDisabled}
                    className={`border w-full py-2 px-10 rounded-md focus:outline-none transition-all ${isDisabled ? "border-text03 bg-gray-100" : "border-primary02"
                        } ${error ? "border-errorFill" : "border-opacity-30"}`}
                />

                {/* Search icon */}
                <span className="absolute left-3 top-2.5">
                    <Icon icon="search" className="w-5 h-5 text-text02" />
                </span>

                {/* Clear button */}
                {searchTerm && (
                    <button
                        className="absolute right-3 top-2.5"
                        onClick={() => setSearchTerm("")}
                    >
                        <Icon icon="x-circle" className="w-5 h-5 text-text02" />
                    </button>
                )}

                {/* Dropdown menu */}
                {isOpen && filteredOptions.length > 0 && (
                    <ul className="absolute left-0 right-0 mt-2 bg-white border border-primary02 text-primary02 rounded-md shadow-lg z-10">
                        {filteredOptions.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setSearchTerm(option.name);
                                    setIsOpen(false);
                                }}
                                className={`px-2 py-1 cursor-pointer ${(value == option.value) ? "text-primary02_Hover" : "text-black"} hover:text-primary02_Hover hover:bg-background06 hover:rounded-md flex justify-between`}
                            >
                                {option.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Error Message */}
            {error && errorText && (
                <div className="text-sm text-errorFill">{errorText}</div>
            )}
        </div>
    );
};

export default SearchDropdownInput;
