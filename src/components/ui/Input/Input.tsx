import React, { useEffect, useLayoutEffect, useState } from "react";
import Icon from 'feather-icons-react';

type InputProps = {
    type?: string;
    value?: any;
    changeValue?: (e: any) => void;
    error?: boolean;
    label?: string;
    helperText?: string;
    disabled?: boolean;
    inputType?: 'primary' | 'secondary' | 'tertiary' | 'forth';
    showIcon?: boolean;
    IconComponent?: React.ReactNode;
    classname?: string;
    defaultValue?: string;
    title?: string;
    id?: string;
    placeholder?: string;
}

const Input: React.FC<InputProps> = ({ type = "text", value = "", changeValue, error = false, label, helperText, disabled = false, inputType = 'forth', showIcon = false, IconComponent, classname, title, id = "my-input", placeholder }: InputProps, defaultValue) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isPreFilled, setIsPreFilled] = useState(false);

    useLayoutEffect(() => {
        if (value && value !== "") {
            setIsPreFilled(true);
        }
    }, [value]);

    useEffect(() => {
        if (id) {
            const inputElement = document.getElementById(id) as HTMLInputElement;
    
            if (inputElement) {
                const checkAutofill = () => {
                    if (inputElement.value.trim() !== "") {
                        setIsPreFilled(true);
                    } else {
                        setIsPreFilled(false);
                    }
                };
    
                checkAutofill(); 

                const observer = new MutationObserver(() => checkAutofill());
                observer.observe(inputElement, { attributes: true, attributeFilter: ["value"] });
    
                return () => observer.disconnect();
            }
        }
    }, [id]);        
    
    const isLabelFloating = isFocused || isPreFilled || (value !== undefined && value !== null && value !== '');
    const handlePasswordToggle = () => {
        if (!disabled) {
            setShowPassword(!showPassword);
        }
    }
    const className = `w-full px-3 ${inputType == 'primary' ? "pt-3 pb-1" : (inputType == 'secondary') ? "py-1" : (inputType == 'tertiary') ? "py-0" : "py-2"} ${disabled ? "bg-disabledFill" : "bg-background02"} rounded-md caret-primary02 text-black border outline-none  ${disabled ? "outline-none" : (error ? "border-errorFill" : isFocused ? "border-primary02" : "border-primary02 border-opacity-30")} ${disabled ? "hover:outline-none" : "hover:border-primary02"}`
    const DefaultIcon = "user";

    return (
        <div className={`relative ${classname}`}>
            {title && title[title?.length - 1] === "*" ? <label className="text-sm text-text02">{title.substring(0, title.length - 1)}<label className="text-textError">*</label></label> : <label className="text-sm text-text02">{title}</label>}
            <div className="relative">
                <label
                    className={`absolute left-3 pointer-events-none transition-all duration-200 ease-in-out
                        ${inputType == 'tertiary' ? 'top-0' : ""}
                        ${disabled ? "text-text03" : (isLabelFloating && inputType == 'primary' ? "text-text02 text-[10px] font-normal" : ((inputType == 'secondary' || inputType == 'tertiary' || inputType == 'forth') && isLabelFloating) ? "text-base invisible" : "text-text02 visible")} 
                        ${inputType == 'primary' && isLabelFloating ? "-top-[0.05rem] pt-1" : (inputType == 'secondary') ? "top-1" : (inputType == 'tertiary') ? "top-0" : "top-2"}
                        ${error ? "text-errorFill" : ""}`}
                >
                    {label}
                </label>
                <input
                    type={type === "password" && showPassword ? "text" : type}
                    value={value}
                    onChange={changeValue}
                    className={`${className}`}
                    disabled={disabled}
                    defaultValue={defaultValue}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    id={id}
                    placeholder={placeholder}
                    onAnimationStart={(e) => {
                        if (e.animationName === "onAutoFill") {
                            setIsPreFilled(true);
                        }
                    }}
                />
                {type === "password" && (
                    <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={handlePasswordToggle}
                    >
                        {!showPassword ? (
                            <Icon icon="eye" size={20} className={`${disabled ? "text-text03 cursor-default" : (isFocused ? "text-text03" : "text-text02")}`} />
                        ) : (
                            <Icon icon="eye-off" size={20} className={`${disabled ? "text-text03 cursor-default" : "text-text02"}`} />
                        )}
                    </div>
                )}
                {/* {type === "date" && (
                    <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" // Ensuring icon is purely decorative
                    >
                        <Icon icon="calendar" size={20} className={`${disabled ? "text-text03" : "text-text02"}`} />
                    </div>
                )} */}
                {(showIcon && type !== "date" && type !== "password") && (
                    <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        {IconComponent || <Icon icon={DefaultIcon} size={20} className={`${disabled ? "text-text03 cursor-default" : "text-text02"}`} />}
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