import React, { useState, Suspense, lazy } from "react";

import { useSearchParams } from "react-router-dom";

// utils
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getDayShiftById } from "@/services/api/finance";
import dayjs from "dayjs";

// components
import { MailOutlined, StarOutlined } from "@ant-design/icons";
import ClockImage from "@icons/ClockImage.svg?react";

// Lazy load tab components
const ShiftTab = lazy(() => import("./components/ShiftTab"));
const ExchangeTab = lazy(() => import("./components/ExchangeTab"));
const ReturnsTab = lazy(() => import("./components/ReturnsTab"));
const CleaningTab = lazy(() => import("./components/CleaningTab"));
const SuspiciousTab = lazy(() => import("./components/SuspiciousTab"));

import { TypeEstimation } from "@/services/api/finance";
import { Spin, message } from "antd";

const TimesheetView: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("change");

  const [searchParams] = useSearchParams();

  const ownerId = searchParams.get("ownerId")
    ? Number(searchParams.get("ownerId"))
    : undefined;

  const tabs = [
    { id: "change", name: t("finance.change") },
    { id: "exchange", name: t("finance.exchange") },
    { id: "returns", name: t("finance.returns") },
    { id: "cleaning", name: t("routes.cleaning") },
    { id: "susp", name: t("finance.susp") },
  ];

  const { data: dayShiftData, isLoading } = useSWR(
    ownerId ? [`get-shift-data`, ownerId] : null,
    () => getDayShiftById(ownerId!),
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
        return <ExchangeTab />;
      case "returns":
        return <ReturnsTab />;
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-[400px] h-auto sm:h-[148px] rounded-2xl shadow-card p-4 space-y-2">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="text-text01 font-semibold">
                {t("finance.shiftOver")}
              </div>
              <div>
                <div className="text-sm text-text02 font-semibold">
                  {t("finance.curr")}
                </div>
                <div className="flex space-x-2">
                  <div>
                    {dayShiftData?.startWorkingTime
                      ? dayjs(dayShiftData.startWorkingTime).format("hh:mm A")
                      : ""}
                  </div>
                  <div>-</div>
                  <div>
                    {dayShiftData?.endWorkingTime
                      ? dayjs(dayShiftData.endWorkingTime).format("hh:mm A")
                      : ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#dbeafe] flex items-center justify-center">
              <ClockImage />
            </div>
          </div>
          <div className="w-full h-9 bg-[#f0fdf4] rounded flex space-x-2 items-center text-sm px-2 text-[#16a34a]">
            <MailOutlined className="w-[22px] h-[18px]" />
            <div>{t("finance.status")}</div>
            <div className="font-bold">
              {dayShiftData?.status ? t(`tables.${dayShiftData?.status}`) : ""}
            </div>
          </div>
        </div>

        <div className="w-full sm:w-72 rounded-2xl shadow-card p-4 space-y-2 flex flex-col justify-between">
          {/* Header */}
          <div className="flex justify-between">
            <div className="text-text01 font-semibold">
              {t("finance.grade")}
            </div>
            <div className="rounded-full bg-[#fef9c3] flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8">
              <StarOutlined className="text-[#ff9066]" />
            </div>
          </div>

          {/* Estimation Status Box */}
          <div
            className={`w-full h-14 rounded-lg flex items-center justify-center text-sm px-2 font-extrabold
                ${
                  dayShiftData?.estimation === TypeEstimation.GROSS_VIOLATION
                    ? "bg-[#fef2f2] text-[#dc2626]"
                    : dayShiftData?.estimation ===
                      TypeEstimation.MINOR_VIOLATION
                    ? "bg-[#fff7ed] text-[#ea580c]"
                    : dayShiftData?.estimation === TypeEstimation.ONE_REMARK
                    ? "bg-[#f0fdf4] text-[#16a34a]"
                    : "bg-background05 text-text01"
                }`}
          >
            {dayShiftData?.estimation
              ? t(`finance.${dayShiftData.estimation}`)
              : ""}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap space-x-4 border-b mb-6 w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`pb-2 flex-1 min-w-[120px] sm:w-60 text-center ${
              activeTab === tab.id
                ? "text-text01 border-b-4 border-primary02"
                : "text-text02"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex space-x-10">
        <Suspense
          fallback={
            <div className="w-full h-[200px] flex justify-center items-center">
              <Spin />
            </div>
          }
        >
          {renderTabContent()}
        </Suspense>
      </div>
    </div>
  );
};

export default TimesheetView;
