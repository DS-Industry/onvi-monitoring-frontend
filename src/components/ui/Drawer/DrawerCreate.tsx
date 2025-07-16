import React from "react";
import { useButtonCreate } from "@/components/context/useContext.tsx";

type DrawerCreateProps = {
    children: React.ReactNode;
    classname?: string;
    onClose?: () => void;
}

const DrawerCreate: React.FC<DrawerCreateProps> = ({ children, classname, onClose }: DrawerCreateProps) => {
    const { buttonOn, setButtonOn } = useButtonCreate();

    return (
        <div className="drawer drawer-end w-full">
            <input
                id="my-drawer-4"
                type="checkbox"
                className="drawer-toggle"
                checked={buttonOn}
                onChange={() => {
                    if (onClose) onClose();
                    setButtonOn(!buttonOn)
                }
                }
            />
            <div className="drawer-side z-[1050] fixed top-0 right-0 h-full w-full">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay bg-black/50 z-[1040] fixed inset-0" />
                <ul className={`menu bg-background02 text-base-content min-h-full w-full sm:w-3/4 md:w-1/2 ${classname} p-4 z-[1051]`}>
                    {children}
                </ul>
            </div>
        </div>
    );
};

export default DrawerCreate;