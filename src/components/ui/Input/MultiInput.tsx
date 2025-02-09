import React, { useEffect, useRef, useState } from "react";
import Icon from "feather-icons-react";
import Check from "@/assets/icons/CheckCircle.png";

interface Option {
    id: number;
    label: string;
    color: string;
}

interface MultiInputProps {
    options: Option[];
    value?: Option[]; // Add value prop
    placeholder?: string;
    onChange: (selectedOptions: Option[]) => void;
}

const MultiInput: React.FC<MultiInputProps> = ({
    options,
    value = [], // Default to an empty array if value is not provided
    placeholder = "Название тега",
    onChange,
}) => {
    const [selectedOptions, setSelectedOptions] = useState<Option[]>(value); // Use value for initial state
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update local state if the value prop changes
    useEffect(() => {
        setSelectedOptions(value);
    }, [value]);

    const handleSelect = (option: Option) => {
        if (!selectedOptions.some((opt) => opt.id === option.id)) {
            const updatedOptions = [...selectedOptions, option];
            setSelectedOptions(updatedOptions); // Update local state
            onChange(updatedOptions); // Notify parent
        }
        setSearchQuery(""); // Clear the search query after selection
    };

    const handleRemove = (id: number) => {
        const updatedOptions = selectedOptions.filter((opt) => opt.id !== id);
        setSelectedOptions(updatedOptions); // Update local state
        onChange(updatedOptions); // Notify parent
    };

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Input Box */}
            <div className="border rounded-md px-3 py-2 w-80 flex items-center gap-2 flex-wrap bg-white">
                {selectedOptions.map((option) => (
                    <div
                        key={option.id}
                        className={`flex items-center gap-2 p-2.5 text-sm font-semibold rounded`}
                        style={{ backgroundColor: option.color, color: "#fff" }}
                    >
                        {option.label}
                        <button
                            className="text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(option.id);
                            }}
                        >
                            <Icon icon="x" className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <input
                    type="text"
                    placeholder={selectedOptions.length === 0 ? placeholder : ""}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="flex-1 outline-none text-sm text-gray-700"
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <ul className="absolute left-0 right-0 max-h-48 overflow-auto bg-white border shadow-lg w-80 z-10 mt-1 rounded-md">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <li
                                key={option.id}
                                onClick={() => {
                                    handleSelect(option);
                                    setIsOpen(false);
                                }}
                                className="cursor-pointer hover:bg-background06 flex"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        style={{ backgroundColor: option.color }}
                                        className="p-1 rounded"
                                    >
                                        <span className="text-sm font-semibold text-white">
                                            {option.label}
                                        </span>
                                    </div>
                                    {/* Align check icon at the end of the option */}
                                    <div className="flex space-x-4 ml-auto">
                                        {selectedOptions.some((opt) => opt.id === option.id) && (
                                            <img src={Check} />
                                        )}
                                        <Icon
                                            icon="more-horizontal"
                                            className="w-6 h-6 text-primary02"
                                        />
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-3 py-2 text-text02 text-sm">Нет доступных опций</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default MultiInput;
