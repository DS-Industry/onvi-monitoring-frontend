// components/CustomEvent.tsx
import React from "react";
import { CalendarEvent } from "./ReactBigCalendar";
import RedDot from "@icons/RedDot.svg?react";
import OrangeDot from "@icons/OrangeDot.svg?react";
import GreenDot from "@icons/GreenDot.svg?react";
import BN from "@icons/Бл.svg?react";
import OTN from "@icons/ОТП.svg?react";
import O from "@icons/О.svg?react";
import NP from "@icons/Пр.svg?react";

const CustomEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const renderEstimationIcon = () => {
    switch (event.estimation) {
      case "GROSS_VIOLATION":
        return <RedDot />;
      case "MINOR_VIOLATION":
        return <OrangeDot />;
      case "ONE_REMARK":
        return <GreenDot />;
      default:
        return null;
    }
  };

  const renderTypeWorkDayIcon = () => {
    switch (event.typeWorkDay) {
      case "MEDICAL":
        return <BN />;
      case "VACATION":
        return <OTN />;
      case "TIMEOFF":
        return <O />;
      case "TRUANCY":
        return <NP />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {renderEstimationIcon()}
      {renderTypeWorkDayIcon()}
      <span>{event.title}</span>
    </div>
  );
};

export default CustomEvent;
