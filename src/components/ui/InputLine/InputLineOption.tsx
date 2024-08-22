import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

type InputLineProps = {
    title: string;
    type: string;
    optionals: string[];
    placeholder?: string;
    defaultValue?: string;
}

const InputLineOption: React.FC<InputLineProps> = ({title, type, defaultValue, optionals, placeholder}: InputLineProps) => {
    return(
        <div className="flex flex-col mb-5">
            <label htmlFor={type} className="text-sm text-text02">
                {title}
            </label>

            <select
                id={type}
                className="border border-opacity01/30 py-2 px-3 rounded-md w-full bg-[#F7F9FC]"
                defaultValue={defaultValue}
            >
                {placeholder && (
                    <option disabled selected>{placeholder}</option>
                )}
                {optionals.map((optional) => (
                    <option label={optional}>{optional}</option>
                ))}
            </select>
        </div>
    );
};

export default InputLineOption;