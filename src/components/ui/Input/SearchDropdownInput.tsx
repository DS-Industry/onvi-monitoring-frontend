import React from "react";
import { Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

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
    const formattedOptions = options.map((option) => ({
        label: option.name,
        value: option.value,
    }));

    const validOptionValues = options.map((opt) => opt.value);

    const sanitizedValue = validOptionValues.includes(value)
        ? value
        : undefined;

    return (
        <div className={`flex flex-col ${classname}`}>
            {title && <label className="text-sm text-text02 mb-1">{title}</label>}

            <Select
                showSearch
                allowClear
                value={sanitizedValue}
                disabled={isDisabled}
                placeholder={placeholder}
                onChange={onChange}
                options={formattedOptions}
                className={`w-full h-10 ${error ? "border-errorFill" : "border-primary02 border-opacity-30"}`}
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                suffixIcon={<SearchOutlined className="text-text02" />}
                styles={{
                    control: {
                        height: 40,
                        padding: "0 10px",
                        borderRadius: 6,
                        backgroundColor: isDisabled ? "#f5f5f5" : "#fff",
                    },
                }}
            />

            {error && errorText && (
                <span className="text-sm text-errorFill mt-1">{errorText}</span>
            )}
        </div>
    );
};

export default SearchDropdownInput;
