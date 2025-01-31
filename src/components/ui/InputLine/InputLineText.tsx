import React from "react";

type InputLineProps = {
    title: string;
    type: string;
    name: string;
    register?: any;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
}

const InputLineText: React.FC<InputLineProps> = ({title, type, name, register, placeholder, defaultValue, required}: InputLineProps) => {
    return(
        <div className="mb-5">
            <label className="text-sm text-text02">{title}</label>
            <input
                type={type}
                placeholder={placeholder}
                defaultValue={defaultValue}
                className="border py-2 px-3 rounded-md w-full border-opacity01"
                {...register &&(register(`${name}`, {required: required}))}
            />
        </div>
    );
};

export default InputLineText;