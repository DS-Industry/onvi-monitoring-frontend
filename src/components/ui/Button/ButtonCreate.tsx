import React from "react";

type ButtonCreateProps = {
    title: string;
    handleClick: () => void;
}

const ButtonCreate: React.FC<ButtonCreateProps> = ({title, handleClick}: ButtonCreateProps) => {
    return(
        <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => handleClick()}>
            {title}
        </button>
    );
};

export default ButtonCreate;