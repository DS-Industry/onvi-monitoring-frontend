import React from "react";
import { ToolbarProps } from "react-big-calendar";
import { useTranslation } from "react-i18next";
import { CalendarEvent } from "./ReactBigCalendar";

const CustomToolbar: React.FC<ToolbarProps<CalendarEvent, object>> = ({ label, onNavigate, onView, view }) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b bg-white">
      <div className="flex items-center space-x-2">
        <button onClick={() => onNavigate("PREV")} className="px-2 py-1 border rounded">
          {t("calendar.BACK")}
        </button>
        <span className="font-semibold text-lg">{label}</span>
        <button onClick={() => onNavigate("NEXT")} className="px-2 py-1 border rounded">
          {t("calendar.NEXT")}
        </button>
        <button onClick={() => onNavigate("TODAY")} className="px-2 py-1 border rounded">
          {t("calendar.TODAY")}
        </button>
      </div>
      <div className="space-x-2">
        <button onClick={() => onView("month")} className={`px-2 py-1 border rounded ${view === "month" ? "bg-blue-100" : ""}`}>
          {t("calendar.MONTH")}
        </button>
        <button onClick={() => onView("week")} className={`px-2 py-1 border rounded ${view === "week" ? "bg-blue-100" : ""}`}>
          {t("calendar.WEEK")}
        </button>
        <button onClick={() => onView("day")} className={`px-2 py-1 border rounded ${view === "day" ? "bg-blue-100" : ""}`}>
          {t("calendar.DAY")}
        </button>
        <button onClick={() => onView("agenda")} className={`px-2 py-1 border rounded ${view === "agenda" ? "bg-blue-100" : ""}`}>
          {t("calendar.AGENDA")}
        </button>
      </div>
    </div>
  );
};

export default CustomToolbar;
