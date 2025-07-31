import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// utils
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

// components
import { Controller, useForm } from "react-hook-form";
import { Select, Button, Form, message } from "antd";

import {
  UpdateDayShiftBody,
  getDayShiftById,
  returnDayShift,
  sendDayShift,
  updateDayShift,
  TypeEstimation,
} from "@/services/api/finance";

type ShiftFormData = {
  grading: {
    [parameterId: string]: number;
  };
};

const ShiftTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const shiftId = searchParams.get("id")
    ? Number(searchParams.get("id"))
    : undefined;

  const { data: dayShiftData } = useSWR(
    shiftId ? [`get-shift-data`, shiftId] : null,
    () => getDayShiftById(shiftId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: sendCash, isMutating: loadingSendCash } = useSWRMutation(
    ["send-cash-oper"],
    async () => sendDayShift(shiftId!)
  );

  const { trigger: returnCash, isMutating: loadingReturnCash } = useSWRMutation(
    ["return-cash-oper"],
    async () => returnDayShift(shiftId!)
  );

  const { trigger: updateShift, isMutating: loadingUpdate } = useSWRMutation(
    ["update-shift"],
    async (_, { arg }: { arg: UpdateDayShiftBody }) =>
      updateDayShift(arg, shiftId!)
  );

  const handleSend = async () => {
    try {
      const result = await sendCash();
      if (result) {
        message.success(t("finance.sentSuccessfully"));
        mutate([`get-shift-data`, shiftId]);
        navigate(-1);
      }
    } catch {
      message.error(t("errors.somethingWentWrong"));
    }
  };

  const handleReturn = async () => {
    try {
      const result = await returnCash();
      if (result) {
        message.success(t("finance.returnedSuccessfully"));
        mutate([`get-shift-data`, shiftId]);
        navigate(-1);
      }
    } catch {
      message.error(t("errors.somethingWentWrong"));
    }
  };

  const start = dayjs(dayShiftData?.startWorkingTime);
  const end = dayjs(dayShiftData?.endWorkingTime);

  const workedHours =
    start.isValid() && end.isValid()
      ? dayjs.duration(end.diff(start)).asHours().toFixed(2)
      : "";

  const { control, handleSubmit, reset } = useForm<ShiftFormData>({
    defaultValues: {
      grading: {},
    },
  });

  useEffect(() => {
    if (dayShiftData?.gradingParameterInfo) {
      const gradingDefaults: { [key: string]: number } = {};
      dayShiftData.gradingParameterInfo.parameters.forEach((param) => {
        if (param.estimationId) {
          gradingDefaults[param.id.toString()] = param.estimationId;
        }
      });
      reset({ grading: gradingDefaults });
    }
  }, [dayShiftData, reset]);

  const handleGradingSave = async (data: ShiftFormData) => {
    try {
      if (!dayShiftData?.gradingParameterInfo) return;

      const updatedParameters =
        dayShiftData.gradingParameterInfo.parameters.map((param) => ({
          ...param,
          estimationId: data.grading[param.id.toString()] || null,
        }));

      const payload: UpdateDayShiftBody = {
        gradingParameterInfo: {
          parameters: updatedParameters,
          allEstimations: dayShiftData.gradingParameterInfo.allEstimations,
        },
      };

      const result = await updateShift(payload);
      if (result) {
        message.success(t("routes.savedSuccessfully"));
        mutate([`get-shift-data`, shiftId]);
      }
    } catch {
      message.error(t("errors.somethingWentWrong"));
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-5">{t("finance.shiftOver")}</h2>
      <div className="border border-gray-200 rounded-xl p-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-y-6">
        <div>
          <p className="text-sm text-gray-500">
            {t("finance.totalCarsWashed")}
          </p>
          <p className="text-lg font-bold">{dayShiftData?.totalCar || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{t("finance.averageRating")}</p>
          <div
            className={`rounded-lg flex items-center justify-center text-sm font-extrabold w-24
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
        <div>
          <p className="text-sm text-gray-500">{t("finance.employeeName")}</p>
          <p className="text-lg font-bold">{dayShiftData?.workerName || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{t("finance.shiftHours")}</p>
          <div className="flex space-x-2 text-lg font-bold">
            {dayShiftData?.startWorkingTime
              ? dayjs(dayShiftData.startWorkingTime).format("HH:mm")
              : ""}
            <div>-</div>
            <div>
              {dayShiftData?.endWorkingTime
                ? dayjs(dayShiftData.endWorkingTime).format("HH:mm")
                : ""}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            {t("finance.totalHoursWorked")}
          </p>
          <div className="text-lg font-bold">
            {start.isValid() && end.isValid() ? `${workedHours} hrs` : ""}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">
          {t("finance.shiftGrading")}
        </h2>

        <div className="mt-6">
          <h3 className="font-semibold text-base mb-4">
            {t("finance.grading")}
          </h3>

          {dayShiftData?.gradingParameterInfo.parameters.map((param) => (
            <Form.Item key={param.id} label={param.name}>
              <Controller
                name={`grading.${param.id}`}
                control={control}
                defaultValue={param.estimationId ?? undefined}
                render={({ field }) => (
                  <Select
                    className="w-80 sm:w-96"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("selectOption")}
                    allowClear
                  >
                    {dayShiftData?.gradingParameterInfo.allEstimations.map(
                      (estimation) => (
                        <Select.Option
                          key={estimation.id}
                          value={estimation.id}
                        >
                          {estimation.name}
                        </Select.Option>
                      )
                    )}
                  </Select>
                )}
              />
            </Form.Item>
          ))}
        </div>

        <form onSubmit={handleSubmit(handleGradingSave)}>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => reset()}>{t("warehouse.reset")}</Button>
            <Button type="primary" htmlType="submit" loading={loadingUpdate}>
              {t("routes.save")}
            </Button>
            {dayShiftData?.status === "SENT" ? (
              <Button
                type="default"
                onClick={handleReturn}
                loading={loadingReturnCash}
              >
                {t("finance.refund")}
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleSend}
                loading={loadingSendCash}
              >
                {t("finance.send")}
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default ShiftTab;
