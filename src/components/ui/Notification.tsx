import React from "react";
import Close from "@icons/close.svg?react";
import { useNavigate } from "react-router-dom";
import ShareBonus from "@/assets/ShareBonus.png";
import Employees from "@icons/Employees.png";
import Rocket from "@icons/Rocket.png";

interface NotificationProps {
  title: string;
  message: string;
  message2?: string;
  link?: string;
  linkUrl?: string;
  showBonus?: boolean;
  showEmp?: boolean;
  showRocket?: boolean;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  message2,
  link,
  linkUrl,
  showBonus,
  showEmp,
  onClose,
  showRocket
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full text-text04 bg-[#21254F] p-4 mb-8 rounded-lg flex flex-col md:flex-row items-center md:items-start">
      <div className="w-full md:w-9/12 text-center md:text-left">
        <p className="font-semibold text-lg mb-2.5">{title}</p>
        <p className="text-sm">{message}</p>
        <p className="text-sm">{message2}</p>
        {link && (
          <span 
            className="text-[#BFFA00] font-semibold text-base cursor-pointer mt-2 inline-block"
            onClick={() => linkUrl && navigate(linkUrl)}
          >
            {link}
          </span>
        )}
      </div>
      
      <div className="w-full md:w-3/12 flex justify-center relative mt-4 md:mt-0">
        {showBonus && <img src={ShareBonus} className="w-32 md:w-40 lg:w-48 bottom-0" loading="lazy" alt="Share Bonus" />}
        {showEmp && <img src={Employees} className="w-32 md:w-40 lg:w-48 bottom-0" loading="lazy" alt="Employees" />}
        {showRocket && <img src={Rocket} className="w-32 md:w-40 lg:w-48 bottom-0" loading="lazy" alt="Rocket" />}
      </div>

      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 md:top-4 md:right-4 p-2"
        >
          <Close />
        </button>
      )}
    </div>
  );
};

export default Notification;
