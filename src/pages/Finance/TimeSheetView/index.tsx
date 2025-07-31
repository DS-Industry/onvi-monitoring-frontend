import React, { useState, Suspense, lazy, useRef } from "react";

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
  const [activeTab, setActiveTab] = useState("shiftGrade");
  const visitedTabs = useRef(new Set(["shiftGrade"]));

  const [searchParams] = useSearchParams();

  const shiftId = searchParams.get("id")
    ? Number(searchParams.get("id"))
    : undefined;

  const posId = searchParams.get("posId")
    ? Number(searchParams.get("posId"))
    : undefined;

  const tabs = [
    { id: "shiftGrade", name: t("finance.shiftGrade") },
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

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    visitedTabs.current.add(tabId);
  };

  const renderTabContent = () => {
    return (
      <div>
        {visitedTabs.current.has("shiftGrade") && (
          <div
            style={{ display: activeTab === "shiftGrade" ? "block" : "none" }}
          >
            <ShiftTab />
          </div>
        )}
        {visitedTabs.current.has("exchange") && (
          <div style={{ display: activeTab === "exchange" ? "block" : "none" }}>
            <ExchangeTab status={dayShiftData?.status} />
          </div>
        )}
        {visitedTabs.current.has("returns") && (
          <div style={{ display: activeTab === "returns" ? "block" : "none" }}>
            <ReturnsTab status={dayShiftData?.status} />
          </div>
        )}
        {visitedTabs.current.has("cleaning") && (
          <div style={{ display: activeTab === "cleaning" ? "block" : "none" }}>
            <CleaningTab />
          </div>
        )}
        {visitedTabs.current.has("susp") && (
          <div style={{ display: activeTab === "susp" ? "block" : "none" }}>
            <SuspiciousTab />
          </div>
        )}
      </div>
    );
  };

  if (!posId || !shiftId) {
    return null;
  }

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
            onClick={() => handleTabClick(tab.id)}
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
        <div className="xl:w-[65%] py-3">{renderTabContent()}</div>
      </Suspense>
    </div>
  );
};

export default TimesheetView;
