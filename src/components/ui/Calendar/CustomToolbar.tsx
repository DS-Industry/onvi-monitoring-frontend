import React from "react";
import { ToolbarProps } from "react-big-calendar";
import { useTranslation } from "react-i18next";
import { CalendarEvent } from "./ReactBigCalendar";
import Button from "antd/es/button";
import Space from "antd/es/space";
import {
  LeftOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

const CustomToolbar: React.FC<ToolbarProps<CalendarEvent, object>> = ({
  label,
  onNavigate,
  onView,
  view,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-4 py-2 border-b bg-white">
      {/* Navigation Controls */}
      <Space>
        <Button size="middle" icon={<LeftOutlined />} onClick={() => onNavigate("PREV")}>
          {t("calendar.BACK")}
        </Button>
        <Button size="middle" icon={<RightOutlined />} iconPosition="end" onClick={() => onNavigate("NEXT")}>
          {t("calendar.NEXT")}
        </Button>
      </Space>

      {/* Center Label */}
      <span className="text-lg font-semibold text-center sm:text-left">{label}</span>

      {/* View Selector */}
      <Space.Compact size="middle">
        <Button
          type={view === "month" ? "primary" : "default"}
          onClick={() => onView("month")}
        >
          {t("calendar.MONTH")}
        </Button>
        <Button
          type={view === "week" ? "primary" : "default"}
          onClick={() => onView("week")}
        >
          {t("calendar.WEEK")}
        </Button>
        <Button
          type={view === "day" ? "primary" : "default"}
          onClick={() => onView("day")}
        >
          {t("calendar.DAY")}
        </Button>
        <Button
          type={view === "agenda" ? "primary" : "default"}
          icon={<UnorderedListOutlined />}
          onClick={() => onView("agenda")}
        >
          {t("calendar.AGENDA")}
        </Button>
      </Space.Compact>
    </div>
  );
};

export default CustomToolbar;
