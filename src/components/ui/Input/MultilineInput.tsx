import React, { useState } from "react";

type MultilineInputProps = {
    value?: string;
    changeValue: (e: any) => void;
    error?: boolean;
    label?: string;
    disabled?: boolean;
    rows?: number; 
    inputType?: 'primary' | 'secondary' | 'tertiary';
    title?: string;
    classname?: string;
    helperText?: string;
}

const MultilineInput: React.FC<MultilineInputProps> = ({
    value = "",
    changeValue,
    error = false,
    label,
    disabled = false,
    rows = 4,
    inputType = 'primary',
    title,
    classname,
    helperText

}) => {
    const [isFocused, setIsFocused] = useState(false);
    const isLabelFloating = isFocused || value.length > 0;

    const className = `w-full px-3 resize-none ${inputType == 'primary' ? "pt-3 pb-1" : (inputType == 'secondary') ? "py-1" : "py-0"} ${ disabled ? "bg-disabledFill" : "bg-background02" } rounded-md caret-primary02 text-black border outline-none ${ disabled ? "outline-none" : (error ? "border-errorFill" : isFocused ? "border-primary02" : "border-primary02 border-opacity-30")} ${ disabled ? "hover:outline-none" : "hover:border-primary02"}`;

    return (
        <div className={`relative min-w-40 mb-4 ${classname}`}>
            <label className="text-sm text-text02">{title}</label>
            <div className="relative">
                <label
                    className={`absolute left-3 pointer-events-none transition-all duration-200 ease-in-out
                        ${inputType == 'tertiary' ? 'top-0' : ""}
                        ${ disabled ? "text-text03" : (isLabelFloating && inputType == 'primary' ? "text-text02 text-[10px] font-normal" : ((inputType == 'secondary' || inputType == 'tertiary') && isLabelFloating) ? "text-base invisible" : "text-text03 visible")} 
                        ${inputType == 'primary' && isLabelFloating ? "-top-[0.05rem] pt-1" : (inputType == 'secondary') ? "top-1" : (inputType == 'tertiary') ? "top-0" : "top-2"}
                        ${error ? "text-errorFill" : ""}`}
                >
                    {label}
                </label> 
                <textarea
                    value={value}
                    onChange={changeValue}
                    className={className}
                    disabled={disabled}
                    rows={rows}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </div>
            {helperText && (
                <div className={`text-[11px] font-normal ${error ? 'text-errorFill' : 'text-text02'}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
};

export default MultilineInput;
