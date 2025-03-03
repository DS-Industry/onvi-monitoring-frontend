import React from "react";
import Close from "@icons/close.svg?react";
import { useNavigate } from "react-router-dom";
import ShareBonus from "@/assets/ShareBonus.png";
import Employees from "@icons/Employees.png";

interface NotificationProps {
  title: string;
  message: string;
  message2?: string;
  link?: string;
  linkUrl?: string;
  showBonus?: boolean;
  showEmp?: boolean;
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
}) => {

  const navigate = useNavigate();

  return (
    <div className={`relative w-full text-text04 bg-[#21254F] p-4 mb-8 rounded-lg flex`}>
      <div className="w-9/12">
        <p className="font-semibold text-lg mb-2.5">{title}</p>
        <p className="text-sm">{message}</p>
        <p className="text-sm">{message2}</p>
        <span className="text-[#BFFA00] font-semibold text-base cursor-pointer mt-2" onClick={() => {linkUrl && navigate(linkUrl)}}>{link}</span>     
      </div>
      <div className="w-3/12">
        {/* <SalyIamge className="h-[50%] w-40" /> */}
        {showBonus && <img src={ShareBonus} className="w-40 m-auto" />}
        {showEmp && <img src={Employees} className="w-40 m-auto absolute bottom-0" />}
        {onClose && <button onClick={onClose} className="absolute right-0 top-0 p-4">
          <Close />
        </button> }
      </div>
    </div>
  );
};

export default Notification;
