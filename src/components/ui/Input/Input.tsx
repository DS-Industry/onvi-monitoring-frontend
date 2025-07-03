import React, { useEffect, useState, useId } from "react";
import { EyeOutlined, EyeInvisibleOutlined, UserOutlined } from "@ant-design/icons";
import AntInput from "antd/es/input";

type InputProps = {
    type?: string;
    value?: any;
    changeValue?: (e: any) => void;
    error?: boolean;
    label?: string;
    helperText?: string;
    disabled?: boolean;
    inputType?: "primary" | "secondary" | "tertiary" | "forth";
    showIcon?: boolean;
    IconComponent?: React.ReactNode;
    classname?: string;
    defaultValue?: string;
    title?: string;
    id?: string;
    placeholder?: string;
};

const Input: React.FC<InputProps> = ({
    type = "text",
    value = "",
    changeValue,
    error = false,
    label,
    helperText,
    disabled = false,
    inputType = "forth",
    showIcon = false,
    IconComponent,
    classname,
    title,
    id,
    defaultValue,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isPreFilled, setIsPreFilled] = useState(false);
    const [hasValue, setHasValue] = useState(value !== "" && value !== undefined && value !== null);
    const autoId = useId();
    const inputId = id || `input-${autoId}`;

    useEffect(() => {
        if (value && value !== "") {
            setIsPreFilled(true);
            setHasValue(true);
        } else {
            setIsPreFilled(false);
            setHasValue(false);
        }
    }, [value]);

    useEffect(() => {
        if (inputId) {
            const inputElement = document.getElementById(inputId) as HTMLInputElement;

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
    }, [inputId]);

    const isLabelFloating = isFocused || isPreFilled || hasValue;

    const handlePasswordToggle = () => {
        if (!disabled) {
            setShowPassword(!showPassword);
        }
    };

    // Custom styles to match the original design
    const getInputSizeStyles = () => {
        switch (inputType) {
            case "primary":
                return "py-2";
            case "secondary":
                return "py-2";
            case "tertiary":
                return "py-2";
            default: // forth
                return "py-2";
        }
    };

    const getBorderColor = () => {
        if (error) return "border-errorFill";
        if (isFocused) return "border-primary02";
        return "border";
    };

    const containerClassName = `relative ${classname || ""}`;

    const inputWrapperClass = `
    relative
    w-full 
    px-3 
    ${getInputSizeStyles()} 
    rounded-md 
    text-black 
    border 
    outline-none 
    ${getBorderColor()}
    ${disabled ? "hover:outline-none" : "hover:border-primary02"}
    transition-colors duration-200
  `;

    const PasswordIcon = () => (
        <div
            className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${disabled ? "cursor-default" : ""
                }`}
            onClick={handlePasswordToggle}
        >
            {!showPassword ? (
                <EyeOutlined
                    style={{
                        fontSize: "20px",
                        color: disabled ? "#d9d9d9" : isFocused ? "#8c8c8c" : "#595959",
                    }}
                />
            ) : (
                <EyeInvisibleOutlined
                    style={{
                        fontSize: "20px",
                        color: disabled ? "#d9d9d9" : "#595959",
                    }}
                />
            )}
        </div>
    );

    const CustomIcon = () => (
        <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
            {IconComponent || (
                <UserOutlined
                    style={{
                        fontSize: "20px",
                        color: disabled ? "#d9d9d9" : "#595959",
                    }}
                />
            )}
        </div>
    );

    const inputConfig = {
        type: type === "password" && showPassword ? "text" : type,
    };

    return (
        <div className={containerClassName}>
            {title && (
                <label className="text-sm text-text02">
                    {title.endsWith("*") ? (
                        <>
                            {title.substring(0, title.length - 1)}
                            <span className="text-errorFill">*</span>
                        </>
                    ) : (
                        title
                    )}
                </label>
            )}

            <div className="relative">
                {/* {label && (
                    <label
                        className={`absolute left-3 pointer-events-none transition-all duration-200 ease-in-out z-10
              ${isLabelFloating && inputType === "primary"
                                ? "text-text02 text-xs font-normal -top-0 pt-1"
                                : inputType === "primary" && !isLabelFloating
                                    ? "text-text02 top-2"
                                    : inputType === "secondary" && isLabelFloating
                                        ? "text-base invisible"
                                        : inputType === "secondary" && !isLabelFloating
                                            ? "text-text02 visible top-1"
                                            : inputType === "tertiary" && isLabelFloating
                                                ? "text-base invisible"
                                                : inputType === "tertiary" && !isLabelFloating
                                                    ? "text-text02 visible top-0"
                                                    : isLabelFloating
                                                        ? "text-base invisible"
                                                        : "text-text02 visible top-2"
                            }
              ${disabled && isLabelFloating ? "invisible" : ""}
              ${error ? "text-errorFill" : ""}`}
                    >
                        {label}
                    </label>
                )} */}
                <div className={inputWrapperClass}>
                    <AntInput
                        id={inputId}
                        value={value}
                        onChange={(e) => {
                            if (changeValue) {
                                changeValue(e);
                            }
                            setHasValue(e.target.value !== "");
                        }}
                        disabled={disabled}
                        defaultValue={defaultValue}
                        placeholder={isLabelFloating ? "" : label}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onAnimationStart={(e: any) => {
                            if (e.animationName === "onAutoFill") {
                                setIsPreFilled(true);
                            }
                        }}
                        {...inputConfig}
                        style={{
                            padding: 0,
                            border: "none",
                            boxShadow: "none",
                            backgroundColor: "transparent",
                            width: "100%",
                            // paddingTop: inputType === "primary" && isLabelFloating ? "0.5rem" : 0
                        }}
                    />
                    {type === "password" && <PasswordIcon />}
                    {showIcon && type !== "date" && type !== "password" && <CustomIcon />}
                </div>
            </div>
            {helperText && (
                <div className={`text-xs font-normal ${error ? "text-errorFill" : "text-text02"}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
};

export default Input;