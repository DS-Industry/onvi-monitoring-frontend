import React from 'react';
import Close from '@icons/close.svg?react';
import { useNavigate } from 'react-router-dom';
import ShareBonus from '@/assets/ShareBonus.svg';
import Employees from '@icons/Employees.png';
import Rocket from '@icons/Rocket.png';

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
  showRocket,
}) => {
  const navigate = useNavigate();

  if (showBonus) {
    return (
      <div className="relative mb-8 w-full overflow-hidden rounded-lg bg-[#21254F] text-text04">
        <div className="px-6 py-5 pr-[42%] md:pr-[38%]">
          <p className="mb-2.5 text-lg font-semibold">{title}</p>
          <p className="text-sm leading-5">{message}</p>
          {message2 && <p className="mt-1 text-sm leading-5">{message2}</p>}
          {link && (
            <span
              className="mt-2 inline-block cursor-pointer text-base font-semibold text-primary01"
              onClick={() => linkUrl && navigate(linkUrl)}
            >
              {link}
            </span>
          )}
        </div>

        <img
          src={ShareBonus}
          className="pointer-events-none absolute inset-y-0 right-16 h-full w-auto max-w-[45%] object-contain object-right md:right-24"
          loading="lazy"
          alt=""
        />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-20 p-1 text-text04"
            aria-label="close"
          >
            <Close />
          </button>
        )}
      </div>
    );
  }

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
        {showEmp && (
          <img
            src={Employees}
            className="w-32 md:w-40 lg:w-48 bottom-0"
            loading="lazy"
            alt="Employees"
          />
        )}
        {showRocket && (
          <img
            src={Rocket}
            className="w-32 md:w-40 lg:w-48 bottom-0"
            loading="lazy"
            alt="Rocket"
          />
        )}
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
