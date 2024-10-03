import React from "react";
import { Spinner } from "@material-tailwind/react";
import { Plus, ChevronRight } from 'feather-icons-react';

type ButtonCreateProps = {
    title: string;
    form?: boolean;
    type?: 'outline' | 'basic' | 'filled'
    iconPlus?: boolean;
    iconRight?: boolean;
    handleClick?: () => void;
    isLoading?: boolean; 
    disabled?: boolean;
    classname?: string;
}

const Button: React.FC<ButtonCreateProps> = ({title = "Default", type = 'basic', iconPlus = false, iconRight = false, form = false, handleClick, isLoading = false, disabled = false, classname}: ButtonCreateProps) => {

    const typeButton = {
        basic: `bg-primary02 hover:bg-primary02_Hover text-text04 flex items-center`,
        outline: `bg-background02 text-primary02 hover:text-primary02_Hover border border-primary02 hover:border-primary02_Hover flex items-center`,
        //custom: `bg-${}`
    }
    const className = ` ${typeButton[type]} font-semibold rounded-md text-base px-5 py-2.5 mb-2 relative flex justify-center items-center`

    const typeForm = form ? 'submit' : 'button';

    return(
        <button
            type={typeForm}
            className={`${className} ${classname} ${ disabled ? 'opacity-20 cursor-default' : ''}`}
            onClick={() => handleClick()}
            disabled={disabled}
        >
            {iconPlus && <Plus size={20} className="mr-2 text-black" /> }
            {isLoading ? <Spinner className={`animate-spin ${ type == 'basic' ? "text-white" : "text-primary02"}`}/> : title}
            {iconRight && <ChevronRight size={20} className="ml-2 text-black" /> }
        </button>
    );
};

export default Button;