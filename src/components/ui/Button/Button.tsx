import React from "react";
import AddWhite from "../../../assets/icons/add-white.svg?react";
import AddBlue from "../../../assets/icons/add-blue.svg?react";
import { Spinner } from "@material-tailwind/react";

type ButtonCreateProps = {
    title: string;
    form?: boolean;
    type?: 'outline' | 'basic' | 'filled'
    icon?: boolean;
    handleClick?: () => void;
    isLoading?: boolean; 
}

const Button: React.FC<ButtonCreateProps> = ({title = "Default", type = 'basic', icon = false, form = false, handleClick, isLoading = false}: ButtonCreateProps) => {

    const typeButton = {
        basic: 'bg-primary02 hover:bg-primary02_Hover text-text04 flex items-center',
        outline: 'bg-background02 text-primary02 hover:text-primary02_Hover border border-primary02 hover:border-primary02_Hover flex items-center',
        //custom: `bg-${}`
    }
    const className = ` ${typeButton[type]} font-semibold rounded-md text-base px-5 py-2.5 mb-2 relative flex justify-center items-center`

    const IconComponent = type === "basic" ? AddWhite : AddBlue;
    const typeForm = form ? 'submit' : 'button';

    return(
        <button
            type={typeForm}
            className={className}
            onClick={() => handleClick()}>
            { icon && <IconComponent className="mr-2" />}
            {isLoading ? <Spinner className="animate-spin"/> : title}
        </button>
    );
};

export default Button;