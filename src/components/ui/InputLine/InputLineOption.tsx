import React from "react";
type InputLineProps = {
    title: string;
    type: string;
    name: string;
    register?: any;
    optionals: Optional[];
    placeholder?: string;
    defaultValue?: string;
    onSelect?: (selectedOption: Optional) => void;
}

type Optional = {
    name: string;
    value: string;
}

const InputLineOption: React.FC<InputLineProps> = ({title, type, name, register, defaultValue, optionals, placeholder, onSelect}: InputLineProps) => {
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        const selectedOption = optionals.find(
            (option) => option.value === selectedValue
        );
        if (selectedOption) {
            onSelect && onSelect(selectedOption);
        }
    };
    return(
        <div className="flex flex-col mb-5">
            <label htmlFor={type} className="text-sm text-text02">
                {title}
            </label>

            <select
                id={type}
                className="border border-opacity01/30 py-2 px-3 rounded-md w-full bg-[#F7F9FC]"
                defaultValue={defaultValue}
                {...register && (register(`${name}`))}
                onChange={handleSelectChange}
            >
                {placeholder && (
                    <option disabled selected>{placeholder}</option>
                )}
                {optionals.map((optional) => (
                    <option label={optional.name} value={optional.value}>{optional.name}</option>
                ))}
            </select>
        </div>
    );
};

export default InputLineOption;