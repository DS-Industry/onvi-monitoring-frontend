import React from "react";
import Close from "@icons/close.svg?react";
import { useNavigate } from "react-router-dom";
import ShareBonus from "@/assets/ShareBonus.png";

interface NotificationProps {
  title: string;
  message: string;
  link?: string;
  linkUrl?: string;
  showBonus?: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  link,
  linkUrl,
  showBonus,
  onClose,
}) => {

  const navigate = useNavigate();

  return (
    <div className={`relative w-full text-text04 bg-[#21254F] p-4 mb-8 rounded-lg flex`}>
      <div className="w-9/12">
        <p className="font-semibold text-lg mb-2.5">{title}</p>
        <p className="text-sm">{message}</p>
        <span className="text-[#BFFA00] font-semibold text-base cursor-pointer mt-2" onClick={() => {linkUrl && navigate(linkUrl)}}>{link}</span>     
      </div>
      <div className="w-3/12">
        {/* <SalyIamge className="h-[50%] w-40" /> */}
        {showBonus && <img src={ShareBonus} className="w-40 m-auto" />}
        <button onClick={onClose} className="absolute right-0 top-0 p-4">
          <Close />
        </button>
      </div>
    </div>
  );
};

export default Notification;
