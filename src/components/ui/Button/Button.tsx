import React from "react";
import { Button as AntdButton, Spin } from "antd";
import Icon from "feather-icons-react";

type ButtonCreateProps = {
    title: string;
    form?: boolean;
    type?: "outline" | "basic";
    iconPlus?: boolean;
    iconRight?: boolean;
    handleClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    classname?: string;
    iconDown?: boolean;
    iconDownload?: boolean;
    iconUp?: boolean;
    iconUpload?: boolean;
    iconArrowDiognal?: boolean;
};

const Button: React.FC<ButtonCreateProps> = ({
    title = "Default",
    type = "basic",
    iconPlus = false,
    iconRight = false,
    form = false,
    handleClick,
    isLoading = false,
    disabled = false,
    classname = "",
    iconDown = false,
    iconDownload = false,
    iconUp = false,
    iconUpload = false,
    iconArrowDiognal = false,
}: ButtonCreateProps) => {
    const typeButton = {
        basic: "bg-primary02 hover:bg-primary02_Hover text-text04 flex items-center",
        outline: "bg-background02 text-primary02 hover:text-primary02_Hover border border-primary02 hover:border-primary02_Hover flex items-center",
    };

    const className = ` ${typeButton[type]} font-normal rounded-md text-base px-[25px] py-[21px] flex justify-center items-center ${classname}`;

    const typeForm = form ? "submit" : "button";

    return (
        <AntdButton
            type={type === "outline" ? "default" : "primary"}
            className={`${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleClick}
            disabled={disabled}
            htmlType={typeForm}
        >
            {iconPlus && <Icon icon="plus" size={20} />}
            {iconDownload && <Icon icon="download" size={20} />}
            {iconUpload && <Icon icon="upload" size={20} />}
            {isLoading ? <Spin size="small" /> : title}
            {iconRight && <Icon icon="chevron-right" size={20} />}
            {iconDown && <Icon icon="chevron-down" size={20} />}
            {iconUp && <Icon icon="chevron-up" size={20} />}
            {iconArrowDiognal && <Icon icon="arrow-up-right" size={20} />}
        </AntdButton>
    );
};

export default Button;
