import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  children?: React.ReactNode;
  value: Date;
  onAddEvent: (date: Date) => void;
}

const CustomSlotWrapper: React.FC<Props> = ({ children, value, onAddEvent }) => {
    const { t } = useTranslation();
  return (
    <div className="relative group w-full h-full">
      {children}
      <div
        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 z-10 transition-opacity"
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddEvent(value);
          }}
          className="text-[10px] px-1 py-0.5 bg-blue-100 border border-blue-400 rounded text-blue-800 hover:bg-blue-200"
        >
          + {t("calendar.addEvent")}
        </button>
      </div>
    </div>
  );
};

export default CustomSlotWrapper;
