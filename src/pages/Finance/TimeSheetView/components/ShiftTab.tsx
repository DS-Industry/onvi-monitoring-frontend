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
  TypeWorkDay,
  TypeEstimation,
} from "@/services/api/finance";

type ShiftFormData = {
  typeWorkDay: TypeWorkDay | undefined;
  estimation: TypeEstimation | null;
  prize: string | number;
  fine: string | number;
  comment: string;
  hours_start: number;
  minutes_start: number;
  hours_end: number;
  minutes_end: number;

  grading?: {
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
      typeWorkDay: undefined,
      estimation: null,
      prize: "",
      fine: "",
      comment: "",
      hours_start: 0,
      minutes_start: 0,
      hours_end: 0,
      minutes_end: 0,

      grading: {},
    },
  });

  useEffect(() => {
    if (dayShiftData) {
      reset({
        typeWorkDay: dayShiftData.typeWorkDay || undefined,
        estimation: dayShiftData.estimation || null,
        prize: dayShiftData.prize ?? "",
        fine: dayShiftData.fine ?? "",
        comment: dayShiftData.comment ?? "",
        hours_start: dayjs(dayShiftData.startWorkingTime).hour(),
        minutes_start: dayjs(dayShiftData.startWorkingTime).minute(),
        hours_end: dayjs(dayShiftData.endWorkingTime).hour(),
        minutes_end: dayjs(dayShiftData.endWorkingTime).minute(),
      });
    }
  }, [dayShiftData, reset]);

  const handleModalSubmit = async (data: ShiftFormData) => {
    try {
      const start = dayjs(dayShiftData?.startWorkingTime)
        .set("hour", Number(data.hours_start))
        .set("minute", Number(data.minutes_start))
        .set("second", 0)
        .set("millisecond", 0);

      let end = dayjs(dayShiftData?.startWorkingTime)
        .set("hour", Number(data.hours_end))
        .set("minute", Number(data.minutes_end))
        .set("second", 0)
        .set("millisecond", 0);

      // Handle cross-day shifts
      if (end.isBefore(start)) {
        end = end.add(1, "day");
      }

      const totalMinutes = end.diff(start, "minutes");
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const payload: UpdateDayShiftBody = {
        startWorkingTime: start.toDate(),
        endWorkingTime: end.toDate(),
        timeWorkedOut: `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`,
        typeWorkDay: data.typeWorkDay,
        estimation: data.estimation,
        prize: data.prize ? Number(data.prize) : null,
        fine: data.fine ? Number(data.fine) : null,
        comment: data.comment,
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
      </div>
    </>
  );
};

export default ShiftTab;
