import React, { useState, Suspense, lazy } from "react";

import { useSearchParams } from "react-router-dom";

// utils
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getDayShiftById } from "@/services/api/finance";

// Lazy load tab components
const ShiftTab = lazy(() => import("./components/ShiftTab"));
const ExchangeTab = lazy(() => import("./components/ExchangeTab"));
const ReturnsTab = lazy(() => import("./components/ReturnsTab"));
const CleaningTab = lazy(() => import("./components/CleaningTab"));
const SuspiciousTab = lazy(() => import("./components/SuspiciousTab"));

import { Spin, message } from "antd";

const TimesheetView: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("change");

  const [searchParams] = useSearchParams();

  const shiftId = searchParams.get("id")
    ? Number(searchParams.get("id"))
    : undefined;

  const tabs = [
    { id: "change", name: t("finance.change") },
    { id: "exchange", name: t("finance.exchange") },
    { id: "returns", name: t("finance.returns") },
    { id: "cleaning", name: t("routes.cleaning") },
    { id: "susp", name: t("finance.susp") },
  ];

  const { data: dayShiftData, isLoading } = useSWR(
    shiftId ? [`get-shift-data`, shiftId] : null,
    () => getDayShiftById(shiftId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      onError: () => {
        message.error(t("errors.somethingWentWrong"));
      },
    }
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "change":
        return <ShiftTab />;
      case "exchange":
        return <ExchangeTab status={dayShiftData?.status} />;
      case "returns":
        return <ReturnsTab status={dayShiftData?.status} />;
      case "cleaning":
        return <CleaningTab />;
      case "susp":
        return <SuspiciousTab />;
      default:
        return <ShiftTab />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-[600px] w-full flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="">
      <div className="mt-6">
        <hr />
      </div>

      <div className="flex flex-nowrap space-x-4 border-b my-7 w-full overflow-x-scroll">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`pb-2 md:min-w-[50px] text-center ${
              activeTab === tab.id
                ? "text-primary02 border-b-2 border-primary02"
                : "text-text02"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="w-full h-[200px] flex justify-center items-center">
            <Spin />
          </div>
        }
      >
        <div className="md:w-[65%] h-fit pt-5 pb-3">{renderTabContent()}</div>
      </Suspense>
    </div>
  );
};

export default TimesheetView;
