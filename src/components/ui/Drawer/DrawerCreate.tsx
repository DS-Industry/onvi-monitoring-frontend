import React, {useEffect, useState} from "react";
import {useButtonCreate} from "../../context/useContext.tsx";

type DrawerCreateProps = {
    children: React.ReactNode;
}

const DrawerCreate: React.FC<DrawerCreateProps> = ({ children }: DrawerCreateProps) => {
    const { buttonOn, setButtonOn } = useButtonCreate();

    return(
        <div className="drawer drawer-end">
            <input
                id="my-drawer-4"
                type="checkbox"
                className="drawer-toggle"
                checked={buttonOn}
                onChange={() =>
                    setButtonOn(!buttonOn)
                }
            />
            <div className="drawer-side">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-base-200 text-base-content min-h-full w-2/3 p-4">
                    {children}
                </ul>
            </div>
        </div>
    );
};

export default DrawerCreate;