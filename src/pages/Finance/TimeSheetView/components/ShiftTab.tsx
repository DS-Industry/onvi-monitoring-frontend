import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// services
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import {
  getDayShiftById,
  returnDayShift,
  sendDayShift,
} from "@/services/api/finance";
import useSWRMutation from "swr/mutation";

// components
import Button from "@/components/ui/Button/Button";
import { message } from "antd";

const ShiftTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const ownerId = searchParams.get("ownerId")
    ? Number(searchParams.get("ownerId"))
    : undefined;

  const { data: dayShiftData } = useSWR(
    ownerId ? [`get-shift-data`, ownerId] : null,
    () => getDayShiftById(ownerId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: sendCash, isMutating: loadingSendCash } = useSWRMutation(
    ["send-cash-oper"],
    async () => sendDayShift(ownerId!)
  );

  const { trigger: returnCash, isMutating: loadingReturnCash } = useSWRMutation(
    ["return-cash-oper"],
    async () => returnDayShift(ownerId!)
  );

  const handleSend = async () => {
    try {
      const result = await sendCash();
      if (result) {
        navigate(-1);
      }
    } catch (err) {
      message.error("");
    }
  };

  const handleReturn = async () => {
    try {
      const result = await returnCash();
      if (result) {
        navigate(-1);
      }
    } catch (err) {
      message.error("");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-3 sm:gap-5">
        <div className="flex flex-wrap gap-3">
          <div className="h-28 w-full max-w-xs sm:max-w-sm md:max-w-md px-5 py-4 rounded-lg bg-background05 space-y-3">
            <div className="text-text01 font-bold text-xl sm:text-2xl md:text-3xl">
              {dayShiftData?.timeWorkedOut || "-"}
            </div>
            <div className="text-text02/70">{t("finance.time")}</div>
          </div>
          <div className="h-28 w-full max-w-xs sm:max-w-sm md:max-w-md px-5 py-4 rounded-lg bg-background05 space-y-3">
            <div className="text-successFill font-bold text-xl sm:text-2xl md:text-3xl">
              {dayShiftData?.prize ? `+${dayShiftData?.prize} ₽` : ""}
            </div>
            <div className="text-text02/70">{t("finance.prize")}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="h-28 w-full max-w-xs sm:max-w-sm md:max-w-md px-5 py-4 rounded-lg bg-background05 space-y-3">
            <div className="text-errorFill font-bold text-xl sm:text-2xl md:text-3xl">
              {dayShiftData?.fine ? `-${dayShiftData?.fine} ₽` : ""}
            </div>
            <div className="text-text02/70">{t("finance.fine")}</div>
          </div>
          <div className="h-28 w-full max-w-xs sm:max-w-sm md:max-w-lg px-5 py-4 rounded-lg bg-background05 space-y-3">
            <div className="text-text01">{dayShiftData?.comment || "-"}</div>
            <div className="text-text02/70">{t("equipment.comment")}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-start gap-3 sm:gap-4 mt-6 sm:mt-10">
        {dayShiftData?.status === "SENT" && (
          <Button
            title={t("finance.refund")}
            type="outline"
            handleClick={handleReturn}
            isLoading={loadingReturnCash}
          />
        )}
        {dayShiftData?.status !== "SENT" && (
          <Button
            title={t("finance.send")}
            handleClick={handleSend}
            isLoading={loadingSendCash}
          />
        )}
      </div>
    </div>
  );
};

export default ShiftTab;
