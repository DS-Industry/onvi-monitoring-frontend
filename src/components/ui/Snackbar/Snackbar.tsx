import React from "react";

type SnackbarProps = {
    message: string;
    type: "success" | "error" | "info" | "warning";
    onClose: () => void;
};

const Snackbar: React.FC<SnackbarProps> = ({ message, type, onClose }) => {
    const getColor = () => {
        switch (type) {
            case "success":
                return "bg-successFill";
            case "error":
                return "bg-errorFill";
            case "info":
                return "bg-blue-500";
            case "warning":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg z-50 text-white ${getColor()}`}
        >
            <span>{message}</span>
            <button className="ml-4 text-white font-bold" onClick={onClose}>
                ×
            </button>
        </div>
    );
};

export default Snackbar;
