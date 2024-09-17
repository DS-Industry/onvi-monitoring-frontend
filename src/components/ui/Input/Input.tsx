import React, { useState } from "react";
import { Eye, EyeOff, User } from 'feather-icons-react';

type InputProps = {
    type: string;
    value: string;
    changeValue: (e: any) => void;
    error?: boolean;
    label?: string;
    helperText?: string;
    disabled: boolean;
    inputType: 'primary' | 'secondary' | 'tertiary';
    showIcon?: boolean;
    IconComponent?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ type = "text", value = "", changeValue, error = false, label, helperText, disabled = false, inputType = 'primary', showIcon = false, IconComponent }: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isLabelFloating = isFocused || value.length > 0;
    const handlePasswordToggle = () => {
        if(!disabled) {
        setShowPassword(!showPassword);
        }
    }
    const className = `w-full px-3 ${inputType == 'primary' ? "py-2" : (inputType == 'secondary') ? "py-1" : "py-0"} ${ disabled ? "bg-disabledFill" : "bg-background02" } rounded-md caret-primary02 text-black border outline-none  ${ disabled ? "outline-none" : (error ? "border-errorFill" : isFocused ? "border-primary02" : "border-primary02 border-opacity-30")} ${ disabled ? "hover:outline-none" : "hover:border-primary02"}`
    const DefaultIcon = User;

    return (
        <div className="relative w-full max-w-sm mb-4">
            <div className="relative">
            <label
                    className={`absolute left-3 pointer-events-none transition-all duration-200 ease-in-out
                        ${inputType == 'tertiary' ? 'top-0' : ""}
                        ${ disabled ? "text-text03" : (isLabelFloating && inputType == 'primary' ? "text-text02 text-[10px] font-normal" : ((inputType == 'secondary' || inputType == 'tertiary') && isFocused) ? "text-base invisible" : "text-text03 visible")} 
                        ${inputType == 'primary' && isLabelFloating ? "-top-[0.05rem]" : (inputType == 'secondary') ? "top-1" : (inputType == 'tertiary') ? "top-0" : "top-2"}
                        ${error ? "text-errorFill" : ""}`}
                >
                    {label}
                </label>
                <input
                    type={type === "password" && showPassword ? "text" : type}
                    value={value}
                    onChange={changeValue}
                    className={className}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {type === "password" && (
                    <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={handlePasswordToggle}
                    >
                        {!showPassword ? (
                            <EyeOff size={24} className={`${ disabled ? "text-text03 cursor-default" : (isFocused ? "text-text03": "text-text02")}`} /> 
                        ) : (
                            <Eye size={24} className={`${ disabled ? "text-text03 cursor-default" : "text-text02"}`} /> 
                        )}
                    </div>
                )}
                { showIcon && (
                    <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                    { IconComponent || <DefaultIcon size={24} className={`${ disabled ? "text-text03 cursor-default" : "text-text02"}`} />}
                    </div>
                )

                }
            </div>
            {helperText && (
                <div className={`text-[11px] font-normal ${error ? 'text-errorFill' : 'text-text02'}`}>
                    {helperText}
                </div>
            )}
        </div>
    )
}

export default Input;