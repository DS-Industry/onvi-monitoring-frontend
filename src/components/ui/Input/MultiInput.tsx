import React, { useEffect, useMemo, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Select from 'antd/es/select';
import Input from 'antd/es/input';
import AntButton from 'antd/es/button';
import Spin from 'antd/es/spin';

const { Option } = Select;

interface OptionType {
    id: number;
    name: string;
    color: string;
}

interface MultiInputProps {
    options: OptionType[];
    value?: number[];
    placeholder?: string;
    onChange: (selectedOptions: OptionType[]) => void;
    searchValue?: string;
    setSearchValue?: (value: string) => void;
    handleChange?: () => void;
    isLoading?: boolean;
    loadingOptions?: boolean;
    disabled?: boolean;
}

const MultiInput: React.FC<MultiInputProps> = ({
    options,
    value = [],
    placeholder = "Название тега",
    onChange,
    searchValue = "",
    setSearchValue,
    handleChange,
    isLoading = false,
    loadingOptions = false,
    disabled = false
}) => {
    const { t } = useTranslation();
    const [isInputFocused, setIsInputFocused] = useState(false);

    const selectedOptions = useMemo(() => {
        return options.filter((opt) => value.includes(opt.id));
    }, [value, options]);

    const handleSelectChange = (selectedIds: number[]) => {
        const selected = options.filter((opt) => selectedIds.includes(opt.id));
        onChange(selected);
    };

    const [filterSearchValue, setFilterSearchValue] = useState("");
    const [pendingTagName, setPendingTagName] = useState<string | null>(null);

    const filteredOptions = useMemo(() => {
        return options.filter((opt) =>
            opt.name.toLowerCase().includes(filterSearchValue.toLowerCase())
        );
    }, [filterSearchValue, options]);

    useEffect(() => {
        if (pendingTagName) {
            const newlyCreatedTag = options.find(opt => opt.name.toLowerCase() === pendingTagName.toLowerCase());
            if (newlyCreatedTag) {
                onChange([...selectedOptions, newlyCreatedTag]);
                setPendingTagName(null); // Clear pending tag
            }
        }
    }, [options, pendingTagName, onChange, selectedOptions]);    

    const dropdownRender = (menu: React.ReactNode) => (
        <div>
            <div style={{ maxHeight: 150, overflowY: "auto" }}>{menu}</div>
            {handleChange && (
                <div className="flex items-center gap-2 p-2 border-t">
                    <Input
                        value={searchValue}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onChange={(e) => setSearchValue?.(e.target.value)}
                        placeholder={t("marketing.tags")}
                        size="middle"
                    />
                    <AntButton
                        type="primary"
                        icon={<PlusOutlined />}
                        loading={isLoading}
                        onClick={() => {
                            if (!handleChange || !searchValue.trim()) return;
                        
                            setPendingTagName(searchValue.trim()); 
                            handleChange(); 
                            setSearchValue?.(""); 
                        }}
                        
                    >
                        {t("roles.create")}
                    </AntButton>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-80">
            <div className="text-text02 text-sm">{t("marketing.tags")}</div>
            <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder={placeholder}
                value={selectedOptions.map((opt) => opt.id)}
                onChange={(selectedIds) => {
                    if (isInputFocused) {
                        return;
                    }
                    handleSelectChange(selectedIds);
                }}
                searchValue={filterSearchValue}
                onSearch={(val) => setFilterSearchValue?.(val)}
                dropdownRender={dropdownRender}
                filterOption={false}
                showSearch
                optionLabelProp="label"
                size="large"
                disabled={disabled}
                tagRender={({ label, value, closable, onClose }) => {
                    const option = options.find((opt) => opt.id === value);
                    return (
                        <div
                            style={{
                                backgroundColor: option?.color || "#ccc",
                                color: "#fff",
                                padding: "2px 8px",
                                borderRadius: 4,
                                marginRight: 4,
                                display: "inline-flex",
                                alignItems: "center",
                            }}
                        >
                            <span>{label}</span>
                            {closable && (
                                <span
                                    onClick={onClose}
                                    style={{
                                        marginLeft: 8,
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    ×
                                </span>
                            )}
                        </div>
                    );
                }}
            >
                {loadingOptions ? (
                    <div className="flex justify-center items-center h-40 m-auto">
                        <Spin size="large" />
                    </div>
                ) : (
                    filteredOptions.map((option) => (
                        <Option key={option.id} value={option.id} label={option.name}>
                            <div className="flex justify-between items-center">
                                <span
                                    style={{
                                        backgroundColor: option.color,
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                        color: "#fff",
                                    }}
                                >
                                    {option.name}
                                </span>
                            </div>
                        </Option>
                    ))
                )}
            </Select>
        </div>
    );
};

export default MultiInput;
