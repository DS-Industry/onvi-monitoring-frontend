import React from "react";

type InputLineProps = {
    title: string;
    placeholder?: string;
    defaultValue?: string;
}

const InputLineText: React.FC<InputLineProps> = ({title, placeholder, defaultValue}: InputLineProps) => {
    return(
        <div className="mb-5">
            <label className="text-sm text-text02">{title}</label>
            <input
                type="text"
                placeholder={placeholder}
                defaultValue={defaultValue}
                className="border py-2 px-3 rounded-md w-full border-opacity01"
            />
        </div>
    );
};

export default InputLineText;