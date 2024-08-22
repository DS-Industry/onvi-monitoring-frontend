import React from "react";

type ButtonCreateProps = {
    title: string;
    type: 'outline' | 'basic' | 'filled'
    handleClick: () => void;
}

const Button: React.FC<ButtonCreateProps> = ({title = "Test", type = 'basic', handleClick}: ButtonCreateProps) => {

    const typeButton = {
        basic: 'bg-primary02 hover:bg-primary02_Hover text-text04 ',
        outline: 'bg-background02 text-primary02 hover:text-primary02_Hover border border-primary02 hover:border-primary02_Hover',
        //custom: `bg-${}`
    }
    const className = ` ${typeButton[type]} font-semibold rounded-md text-base px-5 py-2.5 mb-2`

    return(
        <button
            className={className}
            onClick={() => handleClick()}>
            {title}
        </button>
    );
};

export default Button;