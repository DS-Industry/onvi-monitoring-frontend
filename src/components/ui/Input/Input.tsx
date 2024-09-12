import React from "react";

type InputProps = {
    type: string;
    value: string;
    changeValue: (e: any) => void;
    error?: boolean;
}

const Input: React.FC<InputProps> = ({type = "text", value = "", changeValue, error = false }: InputProps) => {
    const className = `w-full bg-background02 text-primary02 hover:text-primary02_Hover border ${error ? 'border-errorFill': 'border-primary02'} hover:border-primary02_Hover`

    return (
        <input
            type={type}
            value={value}
            onChange={changeValue}
            className={className}
         />
    )
}

export default Input;