import React from "react";
import Close from "@icons/close.svg?react";

interface NotificationProps {
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  onClose,
}) => {
  return (
    <div className={`relative w-full text-text04 bg-[#21254F] p-4 mb-8 rounded-lg`}>
      <p className="font-semibold text-lg mb-2.5">{title}</p>
      <p className="text-sm">{message}</p>
      <button onClick={onClose} className="absolute right-0 top-0 p-4">
        <Close />
      </button>
    </div>
  );
};

export default Notification;
