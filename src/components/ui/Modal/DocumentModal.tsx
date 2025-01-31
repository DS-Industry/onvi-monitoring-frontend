import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import Button from "../Button/Button";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    handleClick?: () => void;
    children: ReactNode;
    classname?: string;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, children, handleClick, classname }) => {
    const {t} = useTranslation();

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="fixed inset-0 bg-black opacity-60"
                onClick={onClose}
            ></div>
            <div className={`bg-white p-5 rounded-2xl shadow-lg z-10 ${classname}`}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-text01">{t("warehouse.advanced")}</h2>
                    <div className="flex items-center gap-6">
                        <Close onClick={onClose} className="cursor-pointer" />
                    </div>
                </div>
                {children}
                <div className="flex gap-3 mt-5">
                    <Button
                        title={"Создать товар"}
                        handleClick={onClose}
                        type="outline"
                        iconPlus={true}
                    />
                    <Button
                        title={"Добавить выбранные товары в документ"}
                        handleClick={handleClick}
                        iconPlus={true}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DocumentModal;
