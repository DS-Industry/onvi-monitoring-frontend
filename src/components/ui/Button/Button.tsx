import React from "react";
import { Spinner } from "@material-tailwind/react";
import Icon from 'feather-icons-react';

type ButtonCreateProps = {
    title: string;
    form?: boolean;
    type?: 'outline' | 'basic'
    iconPlus?: boolean;
    iconRight?: boolean;
    handleClick?: () => void;
    isLoading?: boolean; 
    disabled?: boolean;
    classname?: string;
    iconDown?: boolean;
    iconDownload?: boolean;
}

const Button: React.FC<ButtonCreateProps> = ({title = "Default", type = 'basic', iconPlus = false, iconRight = false, form = false, handleClick, isLoading = false, disabled = false, classname, iconDown = false, iconDownload = false}: ButtonCreateProps) => {

    const typeButton = {
        basic: `bg-primary02 hover:bg-primary02_Hover text-text04 flex items-center`,
        outline: `bg-background02 text-primary02 hover:text-primary02_Hover border border-primary02 hover:border-primary02_Hover flex items-center`,
        //custom: `bg-${}`
    }
    const className = ` ${typeButton[type]} font-semibold rounded-md text-base px-3 py-2 relative flex justify-center items-center`

    const typeForm = form ? 'submit' : 'button';

    return(
        <button
            type={typeForm}
            className={`${className} ${classname} ${ disabled ? 'opacity-20 cursor-default' : ''}`}
            onClick={handleClick}
            disabled={disabled}
        >
            {iconPlus && <Icon icon="plus" size={20} className={`mr-2 ${ type == 'basic' ? "text-white" : "text-primary02 hover:text-primary02_Hover"}`} /> }
            {iconDownload && <Icon icon="download" size={20} className={`mr-2 ${ type == 'basic' ? "text-white" : "text-primary02 hover:text-primary02_Hover"}`} /> }
            {isLoading ? <Spinner className={`animate-spin ${type == 'basic' ? "text-white" : "text-primary02"}`} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}/> : title}
            {iconRight && <Icon icon="chevron-right" size={20} className={`ml-2 ${ type == 'basic' ? "text-white" : "text-primary02 hover:text-primary02_Hover"}`} /> }
            {iconDown && <Icon icon="chevron-down" size={20} className={`ml-2 ${ type == 'basic' ? "text-white" : "text-primary02 hover:text-primary02_Hover"}`} /> }
        </button>
    );
};

export default Button;