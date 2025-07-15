import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import Button from "@ui/Button/Button";
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
    const { t } = useTranslation();

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black opacity-60" onClick={onClose}></div>
            
            {/* Modal container */}
            <div className={`bg-white p-5 rounded-2xl shadow-lg z-10 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto ${classname}`}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-text01">{t("warehouse.advanced")}</h2>
                    <div className="flex items-center gap-6">
                        <Close onClick={onClose} className="cursor-pointer w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                </div>
                {children}
                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    <Button
                        title={t("organizations.cancel")}
                        handleClick={onClose}
                        type="outline"
                    />
                    <Button
                        title={t("roles.addSel")}
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
